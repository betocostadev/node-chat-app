const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime() // Will send the Unix Epoch. Using moment lib to convert
  }
}

const generateLocationMessage = (username, mapsUrl) => {
  return {
    username,
    mapsUrl,
    createdAt: new Date().getTime()
  }
}

module.exports = {
  generateMessage,
  generateLocationMessage
}