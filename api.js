var config = require('./config');
var log = require('log')(config.log);
var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile')
var moment = require('moment')
var crypto = require('crypto')
var _ = require('lodash')

var data = jsonfile.readFileSync(config.data_file)

var app = express();

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    if ('OPTIONS' === req.method) {
	res.sendStatus(200);
    } else {
	next();
    }
});

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var getWeek = function() {
  var now = moment()

  if (now.isBetween('2016-09-20', '2016-09-26', null, '[]'))
    return 3
  if (now.isBetween('2016-09-27', '2016-10-03', null, '[]'))
    return 4
  if (now.isBetween('2016-10-04', '2016-10-10', null, '[]'))
    return 5
  if (now.isBetween('2016-10-11', '2016-10-17', null, '[]'))
    return 6
  if (now.isBetween('2016-10-18', '2016-10-24', null, '[]'))
    return 7
  if (now.isBetween('2016-10-25', '2016-10-31', null, '[]'))
    return 8
  if (now.isBetween('2016-11-01', '2016-11-07', null, '[]'))
    return 9
  if (now.isBetween('2016-11-08', '2016-11-14', null, '[]'))
    return 10
  if (now.isBetween('2016-11-15', '2016-11-21', null, '[]'))
    return 11
  if (now.isBetween('2016-11-22', '2016-11-28', null, '[]'))
    return 12
  if (now.isBetween('2016-11-29', '2016-12-05', null, '[]'))
    return 13
}

var should_lock = function() {
  var now = moment()
  var day = now.day()

  if (day < 2)
    return true

  if (day > 4)
    return true

  if (day === 3 && now.hour() >= 19)
    return true

  return false
}

var getHash = function(s) {
  var hash = crypto.createHash('sha256');
  hash.update(s);
  return hash.digest('hex')
}

var authenticate = function(req, res, next) {
  var hash = getHash(req.query.secret || req.body.secret);

  var exists = data.hashes.indexOf(hash) >= 0

  if (exists)
    return next()

  res.sendStatus(401)
}

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
})

var sendData = function(req, res) {
  var d = _.cloneDeep(data)
  d.current_week = getWeek()
  d.locked = should_lock()
  res.send(d)
}

app.post('/claim', function(req, res) {
  var hash = getHash(req.body.secret)

  var exists = data.hashes.indexOf(hash) >= 0

  if (exists)
    return res.send({ hash: hash })

  if (data.hashes.length === data.teams.length)
    return res.sendStatus(401)

  data.hashes.push(hash)
  jsonfile.writeFileSync(config.data_file, data, {spaces: 4})

  res.send({ hash: hash })
})

app.get('/data', sendData)

app.post('/note', authenticate, function(req, res, next){
  var note = req.body.note

  var team = _.find(data.power_rankings[data.current_week], { 'id': req.body.team_id })
  team.note = req.body.note

  jsonfile.writeFileSync(config.data_file, data, {spaces: 4})
  next()
}, sendData);

var port = 8081
app.listen(port, function() {
    log.info('API listening on port:', port);
}).on('error', function(err) {
    log.error(err);
});

