var moment = require('moment')

var should_lock = function() {
  var now = moment().utc().utcOffset(-4)
  var day = now.day()

  if (day > 4)
    return true

  if (day === 4 && (now.hour() > 20 || (now.hour() === 20 && now.minute() > 30))) {
    return true
  }

  return false
}

var getWeek = function() {
  var now = moment().utc().utcOffset(-4)

  if (now.isBetween('2016-09-20', '2016-09-26', 'day', '[]'))
    return 3
  if (now.isBetween('2016-09-27', '2016-10-03', 'day', '[]'))
    return 4
  if (now.isBetween('2016-10-04', '2016-10-09', 'day', '[]'))
    return 5
  if (now.isBetween('2016-10-10', '2016-10-16', 'day', '[]'))
    return 6
  if (now.isBetween('2016-10-17', '2016-10-23', 'day', '[]'))
    return 7
  if (now.isBetween('2016-10-24', '2016-10-30', 'day', '[]'))
    return 8
  if (now.isBetween('2016-10-31', '2016-11-06', 'day', '[]'))
    return 9
  if (now.isBetween('2016-11-07', '2016-11-13', 'day', '[]'))
    return 10
  if (now.isBetween('2016-11-14', '2016-11-20', 'day', '[]'))
    return 11
  if (now.isBetween('2016-11-21', '2016-11-27', 'day', '[]'))
    return 12
  if (now.isBetween('2016-11-28', '2016-12-04', 'day', '[]'))
    return 13
}

module.exports = {
  getWeek: getWeek,
  should_lock: should_lock
};
