(function(root, factory) {

  root.View = factory(root);

})(this, function() {

  'use strict';

  return {
    main: document.querySelector('main'),
    textarea_resize: function(elem) {
      elem.style.height = '5px';
      elem.style.height = (elem.scrollHeight)+"px";
    },
    active: function(s) {
      var set = function(e, state) {
	e.classList.toggle('active', state)
      }

      Elem.each(document.querySelectorAll('.active'), function(e) {
	set(e, false)
      })

      Elem.each(document.querySelectorAll('.menu .' + s), function(e) {
	set(e, true)
      })
      Elem.each(document.querySelectorAll('.menu-body.' + s), function(e) {
	set(e, true)
      })
    },
    tmpl: function(id) {
      return document.getElementById(id).innerHTML;
    },
    render: function(opts) {
      opts = opts || {}
      var html = '';
      if (opts.id) html = this.tmpl(opts.id);
      if (opts.data) html = doT.template(html)(opts.data);
      this.main.innerHTML = html;      
    },
    show_rankings: function() {
      App.data.tiers = [[], [], [], [], [], []];

      App.data.power_rankings[App.data.current_week].forEach(function(t, i) {
	t.rank = i + 1
	App.data.tiers[t.tier - 1].push(t);
      })

      this.render({
	id: '/rankings.html',
	data: App.data
      })
    }
  }
});
