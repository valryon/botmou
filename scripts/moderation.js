// Description:
//   Moderation tools

/* eslint-disable no-unused-vars */
const {dm, message} = require('./messaging')

const CHANNEL = '#bot'

module.exports = robot => {
  message(robot, '#bot', 'Je me connecte !')
}
