const generateMessage = (text) => {
  return {
    text,
    createdAt: new Date().getTime() // Will send the Unix Epoch. Using moment lib to convert
  }
}

const generateLocationMessage = (mapsUrl) => {
  return {
    mapsUrl,
    createdAt: new Date().getTime()
  }
}

module.exports = {
  generateMessage,
  generateLocationMessage
}