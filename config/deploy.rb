require_relative 'aws_creds'

# Set the location of your SSH key.  You can give a list of files, but
# the first key given will be the one used to upload your chef files to
# each server.
set :ssh_options, {
  :user => 'deploy', # overrides user setting above
  :forward_agent => true,
  :auth_methods => %w(publickey)
}

# Set the location of your cookbooks/data bags/roles for Chef
set :chef_cookbooks_path, 'kitchen/cookbooks'
set :chef_data_bags_path, 'kitchen/data_bags'
set :chef_roles_path, 'kitchen/roles'

set :application, 'power_rankings'
set :repo_url, 'git@github.com:mistakia/power_rankings.git'

set :deploy_to, '/home/deploy/power_rankings'
set :pty, false

set :default_env, { 'NODE_ENV' => 'production' }
set :keep_releases, 2

set :use_sudo, true

namespace :forever do
  desc 'Install forever globally'
  task :setup do
    on roles(:all), in: :parallel do
      execute "sudo npm install -g forever"
    end
  end

  desc 'Stop node script'
  task :stop do
    on roles(:all), in: :parallel do
      execute "sudo forever stop #{current_path}/api.js --killSignal=SIGTERM; true"
    end
  end

  desc 'Start node script'
  task :start do
    on roles(:all), in: :parallel do |host|
      execute "sudo NODE_ENV=production forever start -s #{current_path}/api.js"
    end
  end

  desc 'Clean forever logs'
  task :cleanlogs do
    on roles(:all), in: :parallel do
      execute "sudo forever cleanlogs"
    end
  end
end

namespace :npm do
  desc 'Symlink app npm modules to shared path'
  task :symlink do
    on roles(:all), in: :parallel do
      execute "mkdir -p #{shared_path}/node_modules"
      execute "rm -rf #{release_path}/node_modules && ln -s #{shared_path}/node_modules/ #{release_path}/node_modules"
    end
  end

  desc 'Install app npm modules'
  task :install do
    on roles(:all), in: :parallel do
      execute "cd #{release_path}/ && sudo npm install --production"
    end
  end
end

namespace :deploy do
  after :updated, 'npm:symlink'
  after :updated, 'npm:install'

  desc 'Restart node script'
  after :publishing, :restart do
    invoke 'forever:stop'
    invoke 'forever:cleanlogs'
    sleep 3
    invoke 'forever:start'
  end
end
