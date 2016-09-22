var config = require('./config');
var log = require('log')(config.log);
var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile')
var crypto = require('crypto')
var _ = require('lodash')
var utils = require('./utils')

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
  d.current_week = utils.getWeek()
  d.locked = utils.should_lock()
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

