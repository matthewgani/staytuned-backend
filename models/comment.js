const mongoose = require('mongoose')

// can set validation rules here like object type, object minlength etc
const commentSchema = new mongoose.Schema({
  content: String,
  date: Date,
  songID: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  likes: Number,
})

// to remove fields from returned object
commentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    // creates string id from object _id
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Comment', commentSchema)