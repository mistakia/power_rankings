IP=52.9.51.222

deploy:
	grunt production
	rsync -av --delete ./index.html deploy@$(IP):/home/deploy/power_rankings/current/index.html
