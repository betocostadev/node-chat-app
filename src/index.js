const path = require('path') // Core node module for file paths
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
// Profanity filter
const Filter = require('bad-words')
// Message format created on utils/messages.js
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

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
  // socket.emit('message', generateMessage('Welcome to Sermocino!'))
  // socket.broadcast.emit('message', generateMessage('A new user has joined the session.'))

  socket.on('join', ({username, room}, callback) => {
    // Use the function from utils to add the user to the Users array and keep track of it.
    // socket.id = an unique identifier for a particular user connection
    // Destructuring it since we can get an error instead of the user
    const { error, user} = addUser({ id: socket.id, username, room })
    if (error) {
      return callback(error)
    }

    socket.join(user.room)
    socket.emit('message', generateMessage(`Admin`, `Hello ${user.username}, welcome to chat-room ${user.room} at Sermocino`))
    socket.broadcast.to(user.room).emit('message', generateMessage(`Admin`, `${user.username} has joined the room`))
    // Populate the room user list with the user
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    // If no error, let the client know that they were able to join
    callback()
  })

  // Messaging - Added the callback for the acknowledgement of the message
  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id)
    // Using the filter for bad-words
    const filter = new Filter()
    const allowedWords = ['pussy', 'hell']
    // const newShit = '💩'
    filter.removeWords(...allowedWords)

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }

    io.to(user.room).emit('message', generateMessage(user.username, message))
    callback()
  })

  // Get location
  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
  })


  // On user leave - Remove the user from the users array when disconnect
  // Also, remove it from the users list of the room
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message', generateMessage(`Admin`, `${user.username} has left the room.`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }

  })

})

// Log that node server is running as expected
server.listen(port, () => console.log(`Chat-app listening on port ${port}!`))