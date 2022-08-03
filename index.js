require('dotenv').config()
const cors = require('cors')


const express = require('express')
const app = express()

// converts json data of request into JS object
// attaches to body of request object
app.use(express.json())

app.use(cors())


app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

// app.get('/api/notes', (request, response) => {
//   response.json(notes)
// })

app.get('/api/notes/:id', (request, response) => {
  // const id = Number(request.params.id)
  // const note = notes.find(note => note.id === id)
  
  // if (note) {
  //   response.json(note)
  // } else {
  //   response.status(404).end()
})

app.delete('/api/notes/:id', (request, response) => {
  // const id = Number(request.params.id)
  // notes = notes.filter(note => note.id !== id)

  // response.status(204).end()
})

app.post('/api/notes', (request, response) => {
  // const note = request.body
  // console.log(note)
  // response.json(note)
})


// at the end, for non existent routes
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


app.use(unknownEndpoint)


const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)