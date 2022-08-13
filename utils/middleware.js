const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.name)
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  } else {
    return response.status(400).send({ error: error.message })
  }

  // next(error)
}

const tokenExtractor = (request, response, next) => {

  const authorization = request.get('authorization')
  // bearer <token>
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token =  authorization.substring(7)
    // console.log(request.token)
    // adds token to request.token
  }
  // else dont set, will make request.token = null

  next()
}

const userExtractor = async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const user = await User.findById(decodedToken.id)
    if (user) {
      request.user = user
    }
    next()
  } catch (error) {
    // need to use try catch here to send it to errorhandler above
    // makes it so that it doesnt crash no matter the token
    next(error)
  }
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}