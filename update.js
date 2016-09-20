var jsonfile = require('jsonfile')
var _ = require('lodash')
var async = require('async')
var league = require('../')
var file = './data.json'
var pff = require('../../pff/compare')

var data = jsonfile.readFileSync(file)

async.parallel({
  teams: league.teams,
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
  });

  var rankings = _.orderBy(data.teams, 'power_ranking', 'desc');
  rankings = _.map(rankings, function(r) {
    return _.pick(r, ['id', 'name', 'power_ranking', 'oberon'])
  })
  data.power_rankings[data.current_week] = rankings

  data.teams.forEach(function(team) {
    var idx = _.findIndex(data.power_rankings[data.current_week], { 'id': team.id })
    team.power_rankings_rank = idx + 1
  })

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
  

  jsonfile.writeFileSync(file, data, {spaces: 4})
})
