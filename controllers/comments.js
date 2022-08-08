const commentsRouter = require('express').Router()
const Comment = require('../models/comment')
// const User = require('../models/user')
// const jwt = require('jsonwebtoken')
// const { userExtractor } = require('../utils/middleware')

commentsRouter.get('/', async (request, response) => {
  Comment.find({}).then(notes => {
    response.json(notes)
  })
})

commentsRouter.get('/:id', async (request, response, next) => {
  Comment.findById(request.params.id)
    .then(comment => {
      if (comment) {
        response.json(comment)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

commentsRouter.delete('/:id', async (request, response, next) => {
  Comment.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

commentsRouter.post('/', async (request, response) => {
  const body = request.body

  if (body.content === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const comment = new Comment({
    content: body.content,
    date: new Date(),
    songID: body.songID,
  })

  comment.save().then(savedComment => {
    response.json(savedComment)
  })
})

commentsRouter.put('/:id', async (request, response, next) => {
  const { content, songID } = request.body

  Comment.findByIdAndUpdate(
    request.params.id,
    { content, songID },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedComment => {
      response.json(updatedComment)
    })
    .catch(error => next(error))
})

module.exports = commentsRouter