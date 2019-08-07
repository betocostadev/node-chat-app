const path = require('path') // Core node module for file paths
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
// Profanity filter
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app) // Reqng http and creating the serv. to pass to socketio
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

// app.get('/', (req, res) => res.send('Hello!')) // Test the server
app.use('/', express.static(publicDirectoryPath))

// Use socket.io methods
// socket.emit = single client
// io.emit = all clients
// broadcast = all clients except the sender
io.on('connection', (socket) => {
  console.log('New WebSocket connection')
  socket.emit('message', 'Welcome to Sermocino!')
  socket.broadcast.emit('message', 'A new user has joined the session.')

  // Messaging - Added the callback for the acknowledgement of the message
  socket.on('sendMessage', (message, callback) => {
    // Using the filter for bad-words
    const filter = new Filter()
    const allowedWords = ['pussy', 'hell']
    // const newShit = '💩'
    filter.removeWords(...allowedWords)

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }

    io.emit('message', message)
    callback()
  })

  // Get location
  socket.on('sendLocation', (coords, callback) => {
    io.emit('locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
    callback()
  })


  // On user leave
  socket.on('disconnect', () => {
    io.emit('message', 'A user has left the session.')
  })

})

// Log that node server is running as expected
server.listen(port, () => console.log(`Chat-app listening on port ${port}!`))