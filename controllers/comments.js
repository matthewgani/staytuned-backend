const commentsRouter = require('express').Router()
const Comment = require('../models/comment')

const User = require('../models/user')
// const jwt = require('jsonwebtoken')
// const { userExtractor } = require('../utils/middleware')

commentsRouter.get('/', async (request, response) => {
  const comments = await Comment.find({}).populate('user',{ username: 1, name: 1 })
  response.json(comments)
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

  const user = await User.findById(body.userId)

  if (body.content === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const comment = new Comment({
    content: body.content,
    date: new Date(),
    songID: body.songID,
    user: user._id
  })

  const savedComment = await comment.save()
  user.comments = user.comments.concat(savedComment._id)
  await user.save()

  response.status(201).json(savedComment)

  // errors are automatically handled by middleware dye to the express-async-errors library
  // havent installed

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