// Description:
//   Send public & private messages

function message(robot, room, message) {
  robot.messageRoom(room, message)
}

function dm(robot, user, message) {
  if (!user.startsWith('@')) {
    user = '@' + user
  }

  robot.messageRoom(user, message)
}

module.exports = {
  dm,
  message
}
