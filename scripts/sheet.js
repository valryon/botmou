// Description:
//   Add triggers via a Google Sheets.

const Log = require('log')
const {URL} = require('url')
const {
  sample,
  partial,
  random,
  isFunction,
  isString,
  isEqual
} = require('lodash')
const {addMinutes, isAfter} = require('date-fns')
const GoogleSpreadsheet = require('google-spreadsheet')

const logger = new Log()

// -------------------------------------------------------------
// Module.
// -------------------------------------------------------------

const isBlacklisted = (function createBlacklist() {
  const blacklistRaw = process.env.SHEET_BLACKLIST

  let channelsBlacklist = []
  if (blacklistRaw && blacklistRaw.trim()) {
    channelsBlacklist = blacklistRaw
      .trim()
      .toLowerCase()
      .split(',')
  }

  return room => channelsBlacklist.some(x => room.trim().toLowerCase() === x)
})()

function getRows(cb) {
  if (!process.env.SHEET_TOKEN) {
    logger.warning('The SHEET_TOKEN environment variable is not set')
    return
  }

  const doc = new GoogleSpreadsheet(process.env.SHEET_TOKEN)

  doc.getInfo((err, info) => {
    if (err) return

    // Get the first worksheet only.
    const sheet = info.worksheets[0]

    // Get every row EXCEPT the first one (the headers).
    sheet.getRows({offset: 1}, (err, rows) => {
      if (err) return

      cb(
        rows.map(row => {
          const answers = []
          for (const [key, value] of Object.entries(row)) {
            if (isAnswerKey(key, value)) answers.push(value)
          }

          // Clean probability value.
          let probability = Number(row.probability)
          if (probability <= 0) probability = 50
          if (probability > 100) probability = 100

          const obj = {
            regex: row.regex,
            data: answers,
            pause: Number(row.pause),
            probability,
            target: row.target + '',
            room: row.channel,
            isReply: convertStringToBoolean(row.reply)
          }

          return obj
        })
      )
    })
  })
}

// Add the current timestamp to a parameter.
function getTimestampParameter() {
  return '?t=' + new Date().getTime()
}

// Add a minimum delay between two responses.
function staggerResponses(minutesBetween, callback) {
  let lastCallTime = addMinutes(new Date(), -minutesBetween)

  return msg => {
    const current = new Date()
    const threshold = addMinutes(lastCallTime, minutesBetween)

    if (isAfter(current, threshold)) {
      const success = callback(msg)

      // Set the new time only if the answer was successful.
      if (success) lastCallTime = current
    }
  }
}

// Return:
//   true  - if unsuccessful
//   false - if successful
//
// Examples:
//   → p100, draw 50 => successful, so false.
//   → p50, draw 60 => unsuccessful, so true.
//
// Note:
//   The drawn number CANNOT be 100.
//   So a probability of 100 will always be successful
//   (and thus, will return false).
function isUnsuccessfulDraw(probability) {
  // Number between 0 and 99.
  const draw = random(100)

  if (draw <= probability) return false

  return true
}

// Determines if val
function isAnswerKey(key, val) {
  if (typeof key !== 'string') return false
  if (!key.startsWith('answer')) return false

  if (typeof val !== 'string') return false
  if (val.trim() === '') return false

  return true
}

function convertStringToBoolean(val) {
  if (typeof val !== 'string') return false

  return val.trim().toLowerCase() === 'true'
}

// Answer.
// If it's a success, return true.
// Otherwise, return false (was not the target, was blacklisted, etc.)
function answer(robot, row, res) {
  let message = res.random(row.data)

  // If the message is not an URL, the `try` clause will fail.
  try {
    if (new URL(message)) {
      // Add a timestamp to force the bot to expand the content.
      message += getTimestampParameter()
    }
  } catch (e) {}

  // Stop if the room is blacklisted.
  const room = res.message.room
  if (isBlacklisted(room)) return false

  // Check if the row is supposed to target only a specific room
  // Ignore if "room" cell is empty
  const rawTargetRoom = row.room
  if (isString(rawTargetRoom)) {
    const target = rawTargetRoom.trim().toLowerCase()
    const roomData = robot.adapter.client.rtm.dataStore.getChannelGroupOrDMById(
      res.message.room
    )
    if (roomData) {
      const roomCleaned = roomData.name.trim().toLowerCase()

      // Stop if not the right channel
      if (target !== '' && !isEqual(target, roomCleaned)) return false
    }
  }

  // Get target and user.
  const rawTarget = row.target
  const rawUser = res.message.user.name
  if (isString(rawTarget) && isString(rawUser)) {
    const target = rawTarget.trim().toLowerCase()
    const user = rawUser.trim().toLowerCase()

    // Stop if the user is not the target.
    // If the target is empty, ignore this condition.
    if (target !== '' && !isEqual(target, user)) return false
  }

  // Unlucky draw?
  if (isUnsuccessfulDraw(row.probability)) return false

  // And we should have a string at this point.
  if (!isString(message)) return false

  res[row.isReply ? 'reply' : 'send'](message.replace('$USER', rawUser))
  return true
}

function makeAnswer(robot, row) {
  const action = partial(answer, robot, row)

  // Stagger?
  if (row.pause && row.pause > 0) {
    return staggerResponses(row.pause, action)
  }

  // Or just play the action instantly.
  return action
}

function createSimultaneousFunctionsPicker() {
  let stack = []

  setInterval(() => {
    const pickedCallback = sample(stack)
    stack = []

    if (isFunction(pickedCallback)) {
      pickedCallback()
    }
  }, 250)

  return cb => {
    stack.push(cb)
  }
}

// -------------------------------------------------------------
// Exports.
// -------------------------------------------------------------

module.exports = robot => {
  getRows(rows => {
    if (!Array.isArray(rows)) {
      logger.warning('getRows worked but did not receive a valid result')
      return
    }

    // If multiple answers are triggered at the same time,
    // select only one at a time.
    const picker = createSimultaneousFunctionsPicker()

    // For each row, add a new trigger.
    rows.forEach(row => {
      // Ignore row if regex is empty.
      if (!isString(row.regex)) return
      if (row.regex.trim() === '') return

      const answer = makeAnswer(robot, row)

      robot.hear(new RegExp(row.regex, 'i'), res => picker(() => answer(res)))
    })
  })

  robot.respond(/(refresh|reload) sheet$/i, res => {
    res.reply('Ok! Should be back in a few seconds.')
    setTimeout(() => process.exit(0), 500)
  })
}
