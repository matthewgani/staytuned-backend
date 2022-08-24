const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
    refreshToken: user.refreshToken
  }

  //creates token with username and id, uses secret to digitally sign
  //for now expires in 1 hour
  //need to force user to relogin if expired
  // const token = jwt.sign(
  //   userForToken,
  //   process.env.SECRET,
  //   { expiresIn: 60*60 }
  // )

  const token = jwt.sign(userForToken, process.env.SECRET)

  response
    .status(200)
    .send({ token, username: user.username, name: user.name, refreshToken: user.refreshToken })
})

module.exports = loginRouter