// Description:
//   Cron messages for hubot

// const _ = require('lodash')
// const Log = require('log')
// const logger = new Log()
// const CronJob = require('cron').CronJob

// // -------------------------------------------------------------
// // Constants.
// // -------------------------------------------------------------

// // Use https://crontab.guru/ for help
// // var EverySeconds = '* * * * * *'
// var Every9amWorkday = '0 9 * * 1-5'
// var Every9am01Workday = '0 9 * * 1'
// var Every4pmFriday = '0 16 * * 5'
// var Every6pmFriday = '30 18 * * 5'
// var EveryChristmasEve = '00 19 24 12 *'
// var EveryNewYear = '00 11 01 01 *'
// // var Every1030amWednesday = '30 10 * * 3'

// // -------------------------------------------------------------
// // Helpers.
// // -------------------------------------------------------------

// // Check if we're the first given day (ex: monday) of the month
// function isDayOfMonth(day, dayCount) {
//   var days = getDays(day)
//   var today = new Date()

//   // Check if current day is in array with index == dayCount
//   for (let index = 0; index < days.length; index++) {
//     const d = days[index]
//     if (d.month === today.month && d.day === today.day) {
//       return dayCount === index + 1
//     }
//   }
//   return false
// }

// // Returns an array with all given days (ex: mondays) of the current month
// // @param day [0, 6]
// function getDays(day) {
//   day = Math.min(Math.max(0, day), 6)

//   var d = new Date()
//   var month = d.getMonth()
//   var days = []

//   d.setDate(1)

//   // Get the first requested day in the month
//   while (d.getDay() !== day) {
//     d.setDate(d.getDate() + 1)
//   }

//   // Get all the other given day in the month
//   while (d.getMonth() === month) {
//     days.push(new Date(d.getTime()))
//     d.setDate(d.getDate() + 7)
//   }

//   return days
// }

// function addTimer(robot, pattern, room, message, desc, random = 0) {
//   var sendMessage = () => robot.messageRoom(room, message)
//   addTimerCallback(pattern, desc, sendMessage, random)
// }

// /* eslint-disable no-unused-vars */
// function addTimerDayOfMonth(
//   robot,
//   pattern,
//   day,
//   dayNumber,
//   room,
//   message,
//   desc,
//   random = 0
// ) {
//   var sendMessage = () => {
//     if (isDayOfMonth(day, dayNumber)) {
//       robot.messageRoom(room, message)
//     }
//   }
//   addTimerCallback(pattern, desc, sendMessage, random)
// }

// // @param random = seconds
// function addTimerCallback(pattern, desc, callback, random = 0) {
//   logger.info('Add timer: ' + desc)
//   /* eslint-disable no-new */
//   new CronJob(
//     pattern,
//     function() {
//       var wait = 0
//       if (random > 0) {
//         wait = _.random(0, random, true)
//       }

//       if (wait > 0) {
//         setTimeout(callback, wait * 1000)
//       } else {
//         callback()
//       }
//     },
//     null,
//     true,
//     'Europe/Paris'
//   )
// }

// // -------------------------------------------------------------
// // Exports.
// // -------------------------------------------------------------

// module.exports = robot => {
//   // addTimer(robot, EverySeconds, '#bot', ':krokmou:', 'Very bad test')
// }
