const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  request.body.refreshToken = null

  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return response.status(400).json({
      error: 'username is already in use!'
    })
  }
  // can also implement checking for username permitted char
  // and password strength

  if (!username||!password||!name) {
    return response.status(400).json({
      error: 'all fields must be filled!'
    })
  }

  if (username.length < 3 || password.length < 3) {
    return response.status(400).json({
      error: 'username and password has to be at least 3 characters long!'
    })
  }

  if (username.includes(' ') || password.includes(' ')) {
    return response.status(400).json({
      error: 'username and password may not include spaces!'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
    refreshToken: request.body.refreshToken,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.put('/:id', async (request, response) => {
  const { refreshToken } = request.body

  const updatedUser = {
    refreshToken: refreshToken
  }

  const user = await User.findByIdAndUpdate(request.params.id, updatedUser, { new: true })
  response.json(user)
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('comments', { content: 1, date: 1, songID: 1 })
  response.json(users)
})

module.exports = usersRouter