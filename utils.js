var moment = require('moment')

var should_lock = function() {
  var now = moment()
  var day = now.day()

  if (day < 2)
    return true

  if (day > 4)
    return true

  if (day === 4 && now.hour() >= 18)
    return true

  return false
}

var getWeek = function() {
  var now = moment()

  if (now.isBetween('2016-09-20', '2016-09-26', 'day', '[]'))
    return 3
  if (now.isBetween('2016-09-27', '2016-10-03', 'day', '[]'))
    return 4
  if (now.isBetween('2016-10-04', '2016-10-10', 'day', '[]'))
    return 5
  if (now.isBetween('2016-10-11', '2016-10-17', 'day', '[]'))
    return 6
  if (now.isBetween('2016-10-18', '2016-10-24', 'day', '[]'))
    return 7
  if (now.isBetween('2016-10-25', '2016-10-31', 'day', '[]'))
    return 8
  if (now.isBetween('2016-11-01', '2016-11-07', 'day', '[]'))
    return 9
  if (now.isBetween('2016-11-08', '2016-11-14', 'day', '[]'))
    return 10
  if (now.isBetween('2016-11-15', '2016-11-21', 'day', '[]'))
    return 11
  if (now.isBetween('2016-11-22', '2016-11-28', 'day', '[]'))
    return 12
  if (now.isBetween('2016-11-29', '2016-12-05', 'day', '[]'))
    return 13
}

module.exports = {
  getWeek: getWeek,
  should_lock: should_lock
};
