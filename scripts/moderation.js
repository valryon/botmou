// Description:
//   Moderation tools

const {dm, message} = require('./messaging')

module.exports = robot => {
  dm(robot, '@damien', 'Coucou')
  message(robot, '#bot', 'Je me connecte !')
}
