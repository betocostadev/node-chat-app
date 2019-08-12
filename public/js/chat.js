// Call io() to connect to the server.
const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $btnMessageSend = $messageForm.querySelector('button')
const $btnShareLocation = document.querySelector('#share-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

// Templates - Mustache Lib
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMsgTemplate = document.querySelector('#location-msg-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options - Query String Lib
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// Send messages
socket.on('message', (message) => {
  // console.log(message)
  // render messages
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm A')
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

// Location message
socket.on('locationMessage', (message) => {
  // console.log(mapsUrl)
  const html = Mustache.render(locationMsgTemplate, {
    username: message.username,
    mapsUrl: message.mapsUrl,
    createdAt: moment(message.createdAt).format('h:mm A')
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

// Populate room and keep track of users:
socket.on('roomData', ({ room, users}) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault() // avoid the page refresh on submit

  // Disable send button while message wasn't sent
  $btnMessageSend.setAttribute('disabled', 'disabled')

  // Get the message field by it's name
  const messageField = e.target.elements['message-field'].value

  // We can send many arguments, 'messageField', error, etc.
  socket.emit('sendMessage', messageField, (error) => {
    // Re-enable the send button - clear it and focus on it
    $btnMessageSend.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()
    if (error) {
      console.log(error)
    } else {
      console.log('The message was delivered.')
    }
  })
})

$btnShareLocation.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser, please update.')
  }
  // Disable the button while the location is being sent
  $btnShareLocation.setAttribute('disabled', 'disabled')

  // toFixed(4) - Not for very accurate position
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', {
      latitude: position.coords.latitude.toFixed(4),
      longitude: position.coords.longitude.toFixed(4)
      // Acknowledge the coords were sent below
    }, () => {
      $btnShareLocation.removeAttribute('disabled')
      // console.log('Location shared.')
    })
  })
})

// Rooms - if error, send back for the user
socket.emit('join', { username, room}, (error) => {
  if (error) {
    alert(error) // Using only an alert. It will be redirected to the room and then, the alert
    // will pop-up. The code below will redirect to the home page
    location.href = '/'
  }
})