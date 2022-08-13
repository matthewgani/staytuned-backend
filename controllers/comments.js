const commentsRouter = require('express').Router()
const Comment = require('../models/comment')
const { userExtractor } = require('../utils/middleware')


commentsRouter.get('/', async (request, response) => {
  const comments = await Comment.find({}).populate('user',{ username: 1, name: 1 })
  response.json(comments)
})

// get a specific comment based on id
commentsRouter.get('/:id', async (request, response) => {

  const comment = await Comment.findById(request.params.id).populate('user',{ username: 1, name: 1 })

  if (comment) {
    response.json(comment)
  } else {
    response.status(404).end()
  }
})

commentsRouter.get('/songID/:id', async (request, response) => {
  const songID = request.params.id
  const comments = await Comment.find( { 'songID': songID }).populate('user',{ username: 1, name: 1 })

  response.json(comments)

})

// user can only delete a comment made by him
// we check his identity using userExtractor which uses tokenExtractor
commentsRouter.delete('/:id', userExtractor, async (request, response) => {
  // got the user from db using userExtractor
  const userid = request.user.id

  // find the comment in mongodb with id given in request params
  // params is in URL
  const comment = await Comment.findById(request.params.id)

  if (!comment) {
    // if no comment exist, we still return 204
    return response.status(204).end()
  }
  //comment.user is an object so need to convert
  if (!(comment.user.toString() === userid)) {
    return response.status(401).json({ error: 'unauthorized to delete this blog post' })
  }

  await Comment.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

// you can only post a comment if you are logged in
// we check token and user
commentsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body
  // console.log(request)
  //user is already created using userExtractor
  //userExtractor in turn uses tokenExtractor in middleware
  const user = request.user

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