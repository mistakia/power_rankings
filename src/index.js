(function() {

  var show_assignment = function() {
    var idx = App.data.hashes.indexOf(App.hash)
    idx = (idx + App.data.weeks[App.data.current_week].seed) % App.data.teams.length

    App.data.current_team = App.data.teams[idx]

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
  }

  var initialize = function() {
    App.api('/data').get().success(function(data) {

      App.data = data;

      if (App.data.locked)
	return View.show_rankings()

      show_assignment()

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
