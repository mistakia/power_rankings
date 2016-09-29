var jsonfile = require('jsonfile')
var _ = require('lodash')
var async = require('async')
var request = require('request')
var utils = require('./utils')
var league = require('../')
var file = './data.json'
var pff = require('../../pff/compare')
var kmeans = require('node-kmeans')
var moment = require('moment')
var argv = require('yargs').argv;

var data = jsonfile.readFileSync(file)
var current_week = argv.week || utils.getWeek()

var server = function(cb) {
  request({
    url: 'http://52.9.51.222:8081/data',
    method: 'GET',
    json: true
  }, function(err, res, body) {
    cb(err, body)
  })
}

async.parallel({
  teams: league.teams,
  server: server,
  pff: function(cb) {
    pff.load(false, cb)
  }
}, function(err, results) {
  if (err) console.log(err)

  data.teams = results.teams

  data.teams.forEach(function(team) {
    var r = team.record;
    team.win_pct = r.wins / (r.losses + r.ties + r.wins)
    team.oberon = (team.avg_score * 6) + ((team.high_score + team.low_score) * 2)
    team.oberon += (team.win_pct * 400)
    team.oberon = team.oberon / 10

    team.season = pff.calculate(team.players, results.pff);

  })

  var ob_max = _.max(_.map(data.teams, 'oberon'))
  var ob_min = _.min(_.map(data.teams, 'oberon'))

  var pff_max = _.max(_.map(data.teams, 'season.season_total'))
  var pff_min = _.min(_.map(data.teams, 'season.season_total'))

  data.teams.forEach(function(team) {
    team.ob_normalized = (team.oberon - ob_min) / (ob_max - ob_min)
    team.pff_normalized = (team.season.season_total - pff_min) / (pff_max - pff_min)
    team.power_ranking = team.ob_normalized + (1.45 * team.pff_normalized)

    team.schedule.forEach(function(m, i) {
      var op = _.find(data.teams, ['id', parseInt(m.opponent, 10)])
      m.opponent_name = op.name

      if (op.schedule[i].score)
	m.opponent_score = op.schedule[i].score
      else
	m.opponent_projected_score = Math.round(op.season.weeks[(i+1)].total_points)

      if (!m.score)
	m.projected_score = Math.round(team.season.weeks[(i+1)].total_points)

      if (m.score) {
	if (m.opponent_score < m.score) {
	  m.result = 'Win'
	} else if (m.opponent_score > m.score) {
	  m.result = 'Loss'
	} else {
	  m.result = 'Tie'
	}
      } else {
	if (m.opponent_projected_score < m.projected_score) {
	  m.result = 'Win'
	  team.record.projected_wins++
	} else if (m.opponent_projected_score > m.projected_score) {
	  m.result = 'Loss'
	  team.record.projected_losses++
	} else {
	  m.result = 'Tie'
	  team.record.projected_ties++
	}
      }
    });

    var r = team.record

    team.record.projected_display = (r.wins + r.projected_wins) + '-'
    team.record.projected_display += (r.losses + r.projected_losses) + '-'
    team.record.projected_display += (r.ties + r.projected_ties)
  });

  var rankings = _.orderBy(data.teams, 'power_ranking', 'desc');
  rankings = _.map(rankings, function(r) {
    var o = _.pick(r, ['id', 'name', 'power_ranking', 'oberon', 'total_points'])
    o.projected = _.get(r, 'record.projected_display')
    o.record = _.get(r, 'record.display')
    o.projected_points = _.get(r, 'season.season_total')
    return o
  })
  var vectors = []
  for (var i = 0 ; i < rankings.length ; i++) {
    vectors[i] = [ rankings[i]['power_ranking'] ]
  }
  kmeans.clusterize(vectors, {k: 6}, function(err, res) {
    if (err) console.error(err);

    var tiers = _.orderBy(res, 'centroid[0]', 'desc')

    tiers.forEach(function(tier, i) {
      tier.clusterInd.forEach(function(c) {
	rankings[c].tier = (i + 1)
      });
    });

    data.power_rankings[current_week] = rankings

    var pff_rankings = _.orderBy(results.teams, 'pff_normalized', 'desc')

    console.log('\n============ PFF Rankings  ============')
    pff_rankings.forEach(function(t) {
      console.log(t.pff_normalized + ' - ' + t.name)
    })

    var ob_rankings = _.orderBy(results.teams, 'ob_normalized', 'desc')

    console.log('\n============ Oberon Rankings  ============')
    ob_rankings.forEach(function(t) {
      console.log(t.ob_normalized + ' - ' + t.name)
    })

    console.log('\n============ Overall Rankings  ============')
    rankings.forEach(function(t) {
      console.log(t.power_ranking + ' - ' + t.name)
    })

    if (!_.isUndefined(results.server.power_rankings[current_week])) {
      results.server.power_rankings[current_week].forEach(function(t) {
	if (t.note) {
	  data.power_rankings[current_week].forEach(function(s) {
	    if (s.id === t.id)
	      return s.note = t.note
	  })
	}
      });
    }

    data.hashes = results.server.hashes
    data.updated = moment().format('dddd, MMMM Do YYYY, h:mm:ss a')

    jsonfile.writeFileSync(file, data, {spaces: 4})
  });
})
