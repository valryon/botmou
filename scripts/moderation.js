// Description:
//   Moderation tools

/* eslint-disable no-unused-vars */
const {dm, message} = require('./messaging')
const CHANNEL_GREETING = '#krokmou'
const CHANNEL_REPORT = '#moderation'
const EMOJI_CW = 'contentwarning'
const EMOJI_REPORT = 'report'

function sendWarningMessage(robot, user, room, messageTs) {
  let link =
    'https://gamedevfr.slack.com/archives/' +
    room +
    '/p' +
    messageTs.replace('.', '')
  let text = ':' + EMOJI_CW + ': *' + link + ' par *' + user + '*'

  // Alert moderation
  message(robot, CHANNEL_REPORT, text)
}

function sendReportMessage(robot, user, room, messageTs) {
  let link =
    'https://gamedevfr.slack.com/archives/' +
    room +
    '/p' +
    messageTs.replace('.', '')
  let text =
    ':' +
    EMOJI_REPORT +
    ': *' +
    user +
    '* a signalé le post \n' +
    link +
    ' \nMerci de jeter un oeil et de discuter avec *' +
    user +
    '* (qui a reçu un MP de confirmation) et le(s) auteur(s) du post si besoin.'

  // Alert moderation
  message(robot, CHANNEL_REPORT, text)

  // Send message to reporting user
  dm(
    robot,
    user,
    "Bonjour,\nvotre signalement a bien été transmis à l'équipe de modération qui reviendra vers vous rapidement.\nMerci."
  )
}

function cleanReport(rawText) {
  let text = rawText.replace('@Frank_Parquet report ', '')
  text = text.replace('Frank_Parquet report ', '')
  text = text.replace('report ', '')

  return text
}

function report(robot, user, text) {
  // Alert moderation
  message(robot, CHANNEL_REPORT, text)

  // Send message to reporting user
  dm(
    robot,
    user,
    "Bonjour,\nvotre message a bien été transmis à l'équipe de modération qui reviendra vers vous rapidement.\nMerci."
  )
}

module.exports = robot => {
  message(robot, CHANNEL_GREETING, 'Je me connecte !')

  // Watch for :warning:
  robot.hearReaction(res => {
    if (res.message.type === 'added') {
      console.dir(res.message.reaction)
      console.dir(res.message)

      if (
        res.message.reaction === EMOJI_CW ||
        res.message.reaction === EMOJI_REPORT
      ) {
        var reportingUser = res.message.user.name
        var messageTs = res.message.item.ts
        var room = res.message.item.channel

        if (res.message.reaction === EMOJI_CW) {
          sendWarningMessage(robot, reportingUser, room, messageTs)
        } else if (res.message.reaction === EMOJI_REPORT) {
          sendReportMessage(robot, reportingUser, room, messageTs)
        }
      }
    }
  })

  // Listen to /report
  const REGEX = /report (\S*)/i
  robot.respond(REGEX, res => {
    let text =
      '*' +
      res.message.user.name +
      '* a envoyé un signalement : \n' +
      cleanReport(res.message.rawText)
    report(robot, res.message.user.name, text)
  })
}
