/* global Request, window, CONFIG */
(function(root, factory) {

  root.App = factory(root);

})(this, function() {

  'use strict';

  return {
    hash: window.localStorage.hash,
    secret: window.localStorage.secret,
    api: function(path) {
      path = CONFIG.api + path;
      return {
	get: function(params) {
	  params = params || {};
	  return Request.get(path, params);
	},
	put: function(params) {
	  return Request.put(path, params);
	},
	post: function(params) {
	  return Request.post(path, params);
	},
	del: function(params) {
	  params = params || {};
	  return Request.del(path, params);
	}
      };
    },
    submit: function(e) {
      var input = e.target.querySelector('input[type="text"]')
      var textarea = e.target.querySelector('textarea')
      var note = textarea.value;
      var passphrase = input.value;

      if (!passphrase)
	alert('missing passphrase')

      if (note && passphrase) {      
	App.api('/note').post({
	  secret: passphrase,
	  note: note,
	  team_id: App.data.current_team.id
	}).success(function(res) {
	  alert('saved')
	  console.log(res)
	}).error(function(err) {
	  alert('unable to save - make sure passphrase is correct')	  
	  console.log(err)
	})
      }

      return false;
    }
  };
});
