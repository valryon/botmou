// Description:
//   Cron messages for hubot

const Log = require('log')
const logger = new Log()
const CronJob = require('cron').CronJob

// -------------------------------------------------------------
// Constants.
// -------------------------------------------------------------

// Use https://crontab.guru/ for help
// var EverySeconds = '* * * * * *'
var Every9amWorkday = '0 9 * * 1-5'
var Every7pmFriday = '0 17 * * 5'

// -------------------------------------------------------------
// Helpers.
// -------------------------------------------------------------

function addTimer(robot, pattern, room, message, desc) {
  logger.info('Add timer: ' + desc)
  /* eslint-disable no-new */
  new CronJob(
    pattern,
    function() {
      robot.messageRoom(room, message)
    },
    null,
    true,
    'Europe/Paris'
  )
}

// -------------------------------------------------------------
// Exports.
// -------------------------------------------------------------

module.exports = robot => {
  // addTimer(robot, EverySeconds, '#general', ':krokmou:', 'Very bad test')
  addTimer(
    robot,
    Every9amWorkday,
    '#general',
    'Salut !',
    'Say hi every morning'
  )
  addTimer(
    robot,
    Every7pmFriday,
    '#general',
    "C'est le week-end :3",
    "Say it's the end of the week"
  )
}
