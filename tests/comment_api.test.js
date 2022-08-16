const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Comment = require('../models/comment')

beforeEach(async () => {
  await Comment.deleteMany({})

  // this doesnt go through post api
  // so these comments dont have user and date
  // just for testing
  await Comment.insertMany(helper.initialComments)

  const createUser = {
    'username': 'guest12',
    'name': 'mr matt',
    'password':'216'
  }
  await api
    .post('/api/users')
    .send(createUser)

  // log in to get the token
  const login = {
    'username': 'guest12',
    'password': '216'
  }

  const res = await api
    .post('/api/login')
    .send(login)

  helper.validToken = res.body.token

})

describe('when there are initial saved comments', () => {
  test('comments are returned as json', async () => {
    await api
      .get('/api/comments')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all comments are returned', async() => {
    const response = await api.get('/api/comments')
    expect(response.body).toHaveLength(helper.initialComments.length)
  })

  test('comment post has an id created by Db', async () => {
    const comments = await helper.commentsInDb()
    expect(comments[0].id).toBeDefined()
  })

})

describe('viewing a specific comment', () => {
  test('succeeds with a valid id', async () => {
    const commentsAtStart = await helper.commentsInDb()

    const commentToView = commentsAtStart[0]

    const resultComment = await api
      .get(`/api/comments/${commentToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const processedNoteToView = JSON.parse(JSON.stringify(commentToView))

    expect(resultComment.body).toEqual(processedNoteToView)
  })

  test('fails with statuscode 404 if comment does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/comments/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '5a3d5da5903445'

    await api
      .get(`/api/comments/${invalidId}`)
      .expect(400)
  })
})


describe('addition of a new comment post', () => {

  test('posting creates a new comment post', async () => {
    const newComment = {
      content: 'this is a new comment!',
      songID: 'X121212',
      likes: 16,
    }

    const token = 'bearer '.concat(helper.validToken)

    await api
      .post('/api/comments')
      .set('Authorization', token)
      .send(newComment)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const comments = await helper.commentsInDb()

    const contents = comments.map(n => n.content)
    expect(contents).toContain(
      'this is a new comment!'
    )
    expect(comments).toHaveLength(helper.initialComments.length + 1)
  })
  test('posting a comment with no likes property defaults likes to 0', async () => {
    const newComment = {
      content: 'this is a new comment!',
      songID: 'X121212',
    }

    const token = 'bearer '.concat(helper.validToken)

    await api
      .post('/api/comments')
      .set('Authorization', token)
      .send(newComment)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const comments = await helper.commentsInDb()

    const contents = comments.map(n => n.content)
    expect(contents).toContain(
      'this is a new comment!'
    )


    const specificComment = comments.filter((n => n.content === 'this is a new comment!'))
    expect(specificComment[0].likes).toEqual(0)

    expect(comments).toHaveLength(helper.initialComments.length + 1)
  })

  test('posting comment with no content returns 400', async () => {
    const newComment = {
      songID: 'X121212',
    }
    const token = 'bearer '.concat(helper.validToken)

    await api
      .post('/api/comments')
      .set('Authorization', token)
      .send(newComment)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  })

  test('posting comment with no token returns 401', async () => {
    const newComment = {
      content: 'this is a new comment!',
      songID: 'X121212',
    }

    // no setting of Authorization header so no token
    await api
      .post('/api/comments')
      .send(newComment)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })
})

describe('deleting a comment post', () => {
  test('deleting a valid post', async () => {

    // adding a new post
    const newComment = {
      content: 'this is a new comment!',
      songID: 'X121212',
      likes: 16,
    }

    const token = 'bearer '.concat(helper.validToken)

    const res = await api
      .post('/api/comments')
      .set('Authorization', token)
      .send(newComment)
      .expect(201)
      .expect('Content-Type', /application\/json/)


    let commentId = res.body.id

    const commentsAtStart = await helper.commentsInDb()
    let commentToDelete = await Comment.findById(commentId)


    await api
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', token)
      .expect(204)

    const commentsAtEnd = await helper.commentsInDb()

    expect(commentsAtEnd).toHaveLength(commentsAtStart.length - 1)

    const contents = commentsAtEnd.map(r => r.content)
    expect(contents).not.toContain(commentToDelete.content)

  })
})

describe('updating a comment post', () => {
  test('updating a valid comment\'s likes', async () => {

    const newComment = {
      content: 'this is a new comment!',
      songID: 'X121212',
      likes: 16,
    }

    const token = 'bearer '.concat(helper.validToken)

    const res = await api
      .post('/api/comments')
      .set('Authorization', token)
      .send(newComment)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    let commentId = res.body.id


    const commentToUpdate = await Comment.findById(commentId)

    const updatedComment = {
      likes: commentToUpdate.likes + 15
    }

    await api
      .put(`/api/comments/${commentId}`)
      .send(updatedComment)
      .expect(200)

    const commentWithUpdatedLikes = await Comment.findById(commentId)
    expect(commentWithUpdatedLikes.likes).toEqual(commentToUpdate.likes + 15)
  })
})

test('getting all comments for a certain songID', async () => {
  const newComment = {
    content: 'this is a new comment!',
    songID: 'X121212',
    likes: 16,
  }

  const token = 'bearer '.concat(helper.validToken)

  await api
    .post('/api/comments')
    .set('Authorization', token)
    .send(newComment)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const res = await api
    .get(`/api/comments/songID/${newComment.songID}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)


  const comments = res.body.map(n => n.content)
  expect(comments).toContain('this is a new comment!')
})


afterAll(() => {
  mongoose.connection.close()
})