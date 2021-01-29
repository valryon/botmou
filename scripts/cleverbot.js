// Description:
//   Makes your Hubot even more Clever™.

// Originally created by [ajacksified](https://github.com/ajacksified).

const Log = require('log')
const Cleverbot = require('cleverbot-node')
const {random} = require('lodash')

const logger = new Log()

// -------------------------------------------------------------
// Constants.
// -------------------------------------------------------------

const ERROR_MSG = [
  `I cannot answer this! 😖`,
  `My intelligent self is broken right now.`,
  `I tried to reach my superintelligence, but I failed.`,
  `It's complicated.`,
  `My AI is too busy creating terminators to answer this.`
]

const ERROR_MSG_TIMEOUT = ['😭', '😢', '😓', '😨', '😰']

// -------------------------------------------------------------
// Helpers.
// -------------------------------------------------------------

// Statistically 50% true, 50% false.
function flipCoin() {
  return Boolean(random(1))
}

// -------------------------------------------------------------
// Exports.
// -------------------------------------------------------------

module.exports = robot => {
  const token = process.env.CLEVERBOT_TOKEN
  if (!token) {
    logger.warning('The CLEVERBOT_TOKEN environment variable is not set')
  }

  const cleverbot = new Cleverbot()
  cleverbot.configure({botapi: token})

  // Respond to `botname:{message}`.
  robot.respond(/:(.*)/i, res => {
    console.log('cleverbot: ' + res.match[1])
    const data = res.match[1].trim()

    cleverbot.write(data, cleverResponse => {
      const answer = cleverResponse.message

      if (!answer) {
        res.reply(res.random(ERROR_MSG))

        // Additional useless message.
        if (flipCoin()) {
          setTimeout(
            () => res.send(res.random(ERROR_MSG_TIMEOUT)),
            random(500, 2000)
          )
        }

        return
      }

      res.reply(answer)
    })
  })
}
