# -*- coding: utf-8 -*-
# http://unicorn.bogomips.org/Unicorn/Configurator.html documentation.
worker_processes 1 #4

# Help ensure your application will always spawn in the symlinked
# "current" directory that Capistrano sets up.
working_directory "/srv/graylog2/current"

# listen on both a Unix domain socket and a TCP port,
# we use a shorter backlog for quicker failover when busy
listen "/tmp/graylog.socket", :backlog => 1024

preload_app true
# nuke workers after 30 seconds instead of 60 seconds (the default)
timeout 30

# feel free to point this anywhere accessible on the filesystem
user 'deployer', 'deployer'
shared_path = "/srv/graylog2/shared"
pid "#{shared_path}/pids/unicorn.pid"
stderr_path "#{shared_path}/log/unicorn.stderr.log"
stdout_path "#{shared_path}/log/unicorn.stdout.log"
