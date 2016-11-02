var request = require('request')
var jsonfile = require('jsonfile')
var utils = require('./utils')
var _ = require('lodash')

var file = './data.json'

var server = function(cb) {
  request({
    url: 'http://52.9.51.222:8081/data',
    method: 'GET',
    json: true
  }, function(err, res, body) {
    cb(err, body)
  })
}

server(function(err, data) {
  if (err)
    return console.log(err)

  var shifted = data.hashes.shift()
  data.hashes.push(shifted)
  jsonfile.writeFileSync(file, data, {spaces: 4})
})
