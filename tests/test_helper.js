const Comment = require('../models/comment')
const User = require('../models/user')


// date, user and likes will be initialized by POST
const initialComments = [
  {
    content: 'I love this song!',
    songID: 'X1233355',
    likes: 0
  },
  {
    content: 'Weird lyrics',
    songID: 'X121212',
    likes: 15,
  },
]

const initialUsers = [
  {
    username: 'm586',
    name: 'matt',
    password: '112222'
  },
  {
    username: '5586',
    name: 'tam',
    password: '1123329'
  }
]

const nonExistingId = async () => {
  const comment = new Comment({ content: 'willremovethissoon', songID: 'fakeID', likes:16 })
  await comment.save()
  await comment.remove()

  return comment._id.toString()
}

const commentsInDb = async () => {
  const comments = await Comment.find({})
  return comments.map(comment => comment.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const validToken = null

module.exports = {
  initialComments, initialUsers, nonExistingId, commentsInDb, usersInDb, validToken
}