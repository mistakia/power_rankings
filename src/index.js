(function() {

  var initialize = function() {
    App.api('/data').get().success(function(data) {

      console.log(data)
      App.data = data;      

      var idx = data.hashes.indexOf(App.hash)
      idx = (idx + data.weeks[data.current_week].seed) % data.teams.length

      App.data.current_team = data.teams[idx]

      View.render({
	id: '/notes.html',
	data: App.data
      })

      App.data.power_rankings[App.data.current_week].forEach(function(t) {
	if (t.note && t.id === App.data.current_team.id) {
	  var ta = document.querySelector('textarea')
	  ta.value = t.note
	  View.textarea_resize(ta)
	  return
	}
      })

    }).error(function(res) {
      console.log(res)
    })
  }

  if (App.hash)
    return initialize()
  

  var form = Elem.create({
    tag: 'form',
    id: 'form',
    parent: View.main,
    childs: [{
      tag: 'input',
      attributes: {
	type: 'text',
	placeholder: 'passphrase'
      }
    }]
  })

  form.onsubmit = function(e) {
    var input = e.target.querySelector('input')
    var value = input.value;

    var loading = function(state) {
      input.disabled = state
    }

    if (value) {
      loading(true)
      App.api('/claim').post({
	secret: value
      }).success(function(res) {
	App.hash = window.localStorage.hash = res.hash;
	initialize()
      }).error(function(err) {
	alert('error - make sure passphrase is correct')
	console.log(err)
      })
    }

    return false;
  }


})()
