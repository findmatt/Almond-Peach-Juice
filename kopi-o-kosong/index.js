// Start of botpress
const { Botpress } = require('botpress')
const bot = new Botpress({ botfile: require('./botfile.js') })
bot.start()
// end of botpress

module.exports = require('./src/index')