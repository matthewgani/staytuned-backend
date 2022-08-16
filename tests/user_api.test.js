const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const api = supertest(app)
// const Comment = require('../models/comment')
const User = require('../models/user')
const bcrypt = require('bcrypt')

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('secret', 10)
  const user = new User({ username: 'm586', passwordHash, name:'matt' })
  await user.save()

  // await User.insertMany(helper.initialUsers)
  // users inserted have no password because it did not go through the
  // post route that uses bcrypt
})

describe('invalid users are not created', () => {
  test('with no username field', async () => {
    const newUser = {
      name: 'matt',
      password: '111111'
    }

    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(res.body.error).toBe('username or password was not given')

  })

  test('with less than 3 character password', async () => {
    const newUser = {
      username: 'heh',
      name: 'matt',
      password: 'm'
    }

    // so we cannot set a newUser into the db directly because it needs passwordhash
    // we need to send normal object through the api route
    // to create the userschema and have passwordhash

    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(res.body.error).toBe('username and password has to be at least 3 characters long')
  })


  test('non unique username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'm586',
      name: 'matt',
      password: '11222'
    }

    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(res.body.error).toBe('username must be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

})

afterAll(() => {
  mongoose.connection.close()
})