require('dotenv').config()
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

const commentSchema = new mongoose.Schema({
  content: String,
  date: Date,
})

const Comment = mongoose.model('Comment', commentSchema)

mongoose
  .connect(url)
  .then((result) => {
    console.log('connected')

    const comment = new Comment({
      content: 'HTML is Easy',
      date: new Date(),
    })

    return comment.save()
  })
  .then(() => {
    console.log('comment saved!')
    return mongoose.connection.close()
  })
  .catch((err) => console.log(err))


/*
Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})

Note.find({ important: true }).then(result => {
  // ...
})
*/