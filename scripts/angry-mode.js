// Description:
//   Makes your Hubot ANGRY!!!!!
//
// Commands:
//   hubot angriness - Display the current angriness
//   hubot are you angry - Display the current angriness
//   hubot angry level - Display the current level
//   hubot tg - Stop the angry mode
//
// Author:
//   Created by Matthieu Oger.

const _ = require('lodash')
const Log = require('log')

const logger = new Log()

// -------------------------------------------------------------
// Constants.
// -------------------------------------------------------------

const BIG_FUCK = `
:fuck: :fuck: :fuck:    :fuck:        :fuck:    :fuck: :fuck: :fuck:    :fuck:        :fuck:
:fuck:                  :fuck:        :fuck:    :fuck:                  :fuck: :fuck:
:fuck: :fuck:           :fuck:        :fuck:    :fuck:                  :fuck: :fuck:
:fuck:                  :fuck:        :fuck:    :fuck:                  :fuck: :fuck:
:fuck:                  :fuck: :fuck: :fuck:    :fuck: :fuck: :fuck:    :fuck:        :fuck:
`

const ANGRY_TRIGGERS = /rage|unity|connard|tocard|saloperie|vérole|fu|merde|putain|p'tin|shit|bordel|bot|con|tg|noob|stupide|idiot|plante|crash|flash|svn|gilet|shiity pixel art|fuck/i

const ANGRY_RESPONSES = [
  ':angry:',
  ':angry: :angry: :angry:',
  ':expressionless:',
  ':no_mouth:',
  ':rage:',
  ':rage: :rage: :rage:',
  ':triumph:',
  ':sweat:',
  ':imp:',
  ':imp: :imp: :imp:',
  ':unamused:',
  ':persevere:',
  ':fuck: :krokmou-sunglasses: :fuck:',
  'TOCARD',
  'MAIS VA TE FA…',
  'FU',
  'NOOB',
  'GRMBL',
  'FUUUUUUUUUUUUUUUUUUUUU',
  'BANDE DE CRETINS',
  'VOUS ÊTES TOUS IDIOTS',
  'JE NE VOUS AIME PLUS :broken_heart:',
  "TOUT ÇA C'EST LA FAUTE DE KEVIN",
  'JE VOUS EMMERDE, ET JE RENTRE A MA MAISON',
  'SORTEZ DE CHEZ MOI',
  'JE VOUS DÉTESTE',
  '(┛◉Д◉)┛彡┻━┻',
  '┻━┻ミ＼(≧ﾛ≦＼)',
  'щ(`Д´щ;)',
  'JE RAGE QUIT',
  'JE VAIS CASSER MON CLAVIER',
  "OH TU M'ENERVES",
  'BORDEL',
  'MAIS PUTAIN MAIS PUTAIN',
  'SALOPERIE',
  'GRRRRRRRRRRRRR',
  'CA ME SAOULE',
  'MAIS MERDE MERDE MERDE',
  'MEURS MEURS MEURS',
  "C'EST TELLEMENT IDIOT",
  "C'EST TELLEMENT STUPIDE !!!!",
  '8!!!!^sqdij8QSd!!!!!!qsd!qsd!qs!d',
  'BOUARF',
  'POUDRE DE PERLIMPINPIN',
  'IMBECILES',
  'GRAAAAAAAAAAA',
  'JE VAIS RENVERSER DES TABLES',
  'CA ME GONFLE CES CONNERIES',
  "C'EST TELLEMENT TELLEMENT TELLEMENT GAAAAAAAAAH",
  'CASSE-COUILLES',
  'VOUS ÊTES RIDICULES',
  "CA N'A AUCUN SENS PUTAIN",
  'PUTAIN',
  'PUTAIN DE MERDE',
  "BIDON D'HUILE",
  'RACLURE DE BIDET',
  'VEROLES',
  'BOUGRE DE SQDQ*&çsdi2^$SDQDJQSD',
  'SHITTY PIXEL ART',
  '(jdc-jdr)',
  'jdc-jdr',
  '(Jeu de cartes, jeu de rôle)',
  'Jeu de cartes, jeu de rôle',
  BIG_FUCK
]

const CALM_RESPONSES = [
  "C'est bon je me suis calmé.",
  "C'est bon je me suis calmé…",
  'Fiouuuu',
  'Pfff',
  'Ca va !',
  "Bon, je passe pour aujourd'hui…",
  'Enfants !'
]

const DECREASE_ANGRINESS_INTERVAL = 120000 // 2min

// -------------------------------------------------------------
// Variables.
// -------------------------------------------------------------

let isAngryLevel = 0
let angriness = 0
let angrinessThreshold = 5

let becomeCalmTimeout = null

// -------------------------------------------------------------
// Module.
// -------------------------------------------------------------

function increaseAngriness(robotResponse, amount, robot) {
  angriness += amount

  if (angriness >= getNextThreshold()) {
    becomeAngry(robotResponse, isAngryLevel + 1, robot)
  }
}

function decreaseAngriness() {
  angriness -= _.random(0, 3, true)

  if (angriness <= 0) {
    becomeCalm()
  }
}

function getNextThreshold() {
  const multiplier = isAngryLevel * (isAngryLevel + 1)
  return angrinessThreshold * (multiplier <= 0 ? 1 : multiplier)
}

function becomeAngry(robotResponse, level = 1, robot) {
  if (level < 1) level = 1

  isAngryLevel = level

  // Reset in a few seconds (30s-180s).
  clearTimeout(becomeCalmTimeout)
  becomeCalmTimeout = setTimeout(
    () => becomeCalm(robotResponse),
    _.random(30000 * level, 180000)
  )

  // Trash talk every 5s<->30s.
  setRandomInterval(
    () => robotResponse.send(robotResponse.random(ANGRY_RESPONSES)),
    () => !isAngry(),
    5000 / level, // 5s min
    30000 / level // 30s max
  )

  // Start by sending a first message.
  robotResponse.reply(robotResponse.random(ANGRY_RESPONSES))
  addToLeaderboard(robot, robotResponse.message.user.name)

  // If very angry, SCREAM.
  if (level > 1) {
    const times = isAngryLevel * 8 + _.random(0, 20)
    robotResponse.send('R' + _.repeat('A', times))
  }
}

function becomeCalm(robotResponse) {
  isAngryLevel = 0
  angriness = 0
  angrinessThreshold = _.random(4, 10)

  if (robotResponse) {
    robotResponse.reply(robotResponse.random(CALM_RESPONSES))
  }
}

function isAngry() {
  return isAngryLevel > 0
}

// -------------------------------------------------------------
// Leaderboards.
// -------------------------------------------------------------

const ANGRY_LEADERBOARD = 'pixelnest.angry.leaderboard'

function addToLeaderboard(robot, name) {
  if (name === '') return

  const leaderboard = getLeaderboard(robot)
  const current = leaderboard[name]
  leaderboard[name] = (Number.isInteger(current) ? current : 0) + 1

  robot.brain.set(ANGRY_LEADERBOARD, leaderboard)
}

function getLeaderboard(robot) {
  const l = robot.brain.get(ANGRY_LEADERBOARD)
  if (!l) robot.brain.set(ANGRY_LEADERBOARD, {})

  return l || {}
}

function showLeaderboard(robot, robotResponse) {
  const leaderboard = getLeaderboard(robot)
  let result = ''

  for (var k in leaderboard) {
    if (leaderboard.hasOwnProperty(k)) {
      result += `${k} : ${leaderboard[k]}\n`
    }
  }

  if (result.trim() === '') {
    robotResponse.send("Je n'ai jamais été méchant ! :)")
    return
  }

  robotResponse.send("Ils m'ont rendu méchant :\n" + result)
}

// -------------------------------------------------------------
// Helpers.
// -------------------------------------------------------------

function isUpperCase(text) {
  if (typeof text !== 'string') return false

  return text === text.toUpperCase()
}

// Create a randomized setInterval between a minimum number (ms) and a
// a maximum number (ms).
function setRandomInterval(
  callback,
  shouldStopCallback,
  minInterval,
  maxInterval
) {
  ;(function nextInterval() {
    if (shouldStopCallback()) return

    const randomInterval = _.random(minInterval, maxInterval)

    setTimeout(() => {
      callback()
      nextInterval()
    }, randomInterval)
  })()
}

function mapToUpperCase(text) {
  if (text.includes('http://') || text.includes('https://')) return text

  return text.toUpperCase()
}

// -------------------------------------------------------------
// Exports.
// -------------------------------------------------------------

const allowed = process.env.ANGRY_MODE
if (!allowed || allowed <= 0) {
  logger.info('Angry mode disabled.')
} else {
  logger.info('Angry mode enabled!')

  module.exports = robot => {
    // Reset the angriness of the robot every 15min.
    setInterval(decreaseAngriness, DECREASE_ANGRINESS_INTERVAL)

    // Add a listener to the robot to check all messages.
    // If a sufficient number are in uppercase, become ANGRY.
    robot.listen(
      // Matcher: is the text in all caps?
      msg => msg.text && isUpperCase(msg.text),
      robotResponse => increaseAngriness(robotResponse, 1, robot)
    )

    // For certain keywords, increase angriness.
    robot.hear(ANGRY_TRIGGERS, robotResponse =>
      increaseAngriness(robotResponse, 0.2, robot)
    )

    // `hubot angriness` command:
    robot.respond(/angriness|are you angry|u mad\?*/i, res => {
      res.reply(
        `I'm currently ${Math.floor(
          (angriness / angrinessThreshold) * 100
        )}% angry!`
      )
    })

    // `hubot angry level` command:
    robot.respond(/angry level|madness/i, res => {
      res.reply(`My angry level is ${isAngryLevel}. щ(\`Д´щ;)`)
    })

    // `hubot angry leaderboard` command:
    robot.respond(/angry leaderboard/i, res => showLeaderboard(robot, res))

    // `hubot tg` command:
    robot.respond(/tg/i, res => {
      if (isAngry()) {
        res.reply(`:zipper_mouth_face:`)
        becomeCalm()
      }
    })

    // Intercept each message and put in uppercase if the robot is angry.
    robot.responseMiddleware((context, next, done) => {
      if (context.strings && isAngry()) {
        context.strings = context.strings.map(mapToUpperCase)
      }

      next()
    })
  }
}
