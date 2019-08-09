// An array to store the users and their correct rooms
const users = []

// Add users
const addUser = ({ id, username, room}) => {
  // Clean the data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  // Validate the data
  if (!username || !room) {
    return {
      error: 'User name and room name are required.'
    }
  }

  // Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username
  })

  // Validade user name
  if (existingUser) {
    return {
      error: 'This user name is already in use'
    }
  }

  // Store user
  const user = { id, username, room}
  users.push(user)
  return { user }
}

// Remove users
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id)

  if (index !== -1) {
    // Will return an array for us, that's why the [0]
    return users.splice(index, 1)[0]
  }
}

// Get user
const getUser = (id) => {
  return users.find((user) => user.id === id)
}

// Get users in selected room
const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room)
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}