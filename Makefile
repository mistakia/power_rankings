IP=52.9.51.222

deploy:
	grunt production
	rsync -av --delete ./index.html deploy@$(IP):/home/deploy/power_rankings/current/index.html

update:
	node update.js
	rsync -av --delete ./data.json deploy@$(IP):/home/deploy/data.json
	cap all deploy:restart
