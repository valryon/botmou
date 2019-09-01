// Description:
//   Moderation tools

/* eslint-disable no-unused-vars */
const {dm, message} = require('./messaging')
const CHANNEL = '#moderation'
function reportMessage(robot, user, room, messageTs) {
  let link = 'https://gamedevfr.slack.com/archives/' + room + '/p' + messageTs
  let message =
    ':warning: *' +
    user +
    '* a signalé le post ' +
    link +
    ' \nMerci de jeter un oeil et de discuter avec *' +
    user +
    '* (qui a reçu un MP de confirmation) et le(s) auteur(s) du post si besoin.'

  report(robot, user, message)

  // TODO send message to reported user?
}

function report(robot, user, text) {
  // Alert moderation
  message(robot, CHANNEL, text)

  // Send message to reporting user
  dm(
    robot,
    user,
    "Bonjour, votre signalement a bien été transmis à l'équipe de modération qui reviendra vers vous rapidement. Merci."
  )
}

module.exports = robot => {
  message(robot, '#krokmou', 'Je me connecte !')

  // Watch for :warning:
  robot.hearReaction(res => {
    if (res.message.type === 'added') {
      if (res.message.reaction === 'warning') {
        var reportingUser = res.message.user.name
        var messageTs = res.message.item.ts
        var room = res.message.item.channel

        reportMessage(robot, reportingUser, room, messageTs)
      }
    }
  })

  // Listen to /report
  const REGEX = /report (\S*)/i
  robot.respond(REGEX, res => {
    let message =
      '*' +
      res.message.user.name +
      '* a envoyé un signalement : \n' +
      res.message.rawText
    report(robot, res.message.user.name, message)
  })
}
