source :rubygems

gem 'rails', '~> 3.2'
gem 'json', '~> 1.5'
gem 'chronic', '~> 0.6'
gem 'pony', '~> 1.1'  # unusual version number
gem 'graylog2-declarative_authorization', '~> 0.5', :require => 'declarative_authorization'
gem 'mongoid'
gem 'tire', '~> 0.5'
gem 'bson', '~> 1.3'
#gem 'passenger'
gem 'bson_ext', '~> 1.3', :platforms => :ruby
gem 'home_run', '~> 1.0', :platforms => :ruby
gem 'SystemTimer', '~> 1.2', :require => 'system_timer', :platforms => :ruby_18
gem 'rails_autolink', '~> 1.0'
gem 'kaminari', '~> 0.12'
gem 'jquery-rails', '~> 2.1'
gem 'therubyracer', '~> 0.10'
gem 'net-ldap', '~> 0.3'

group :development, :test do
  # might be useful to generate fake data in development
  gem 'machinist_mongo', '~> 1.2.0', :require => 'machinist/mongoid'
  gem 'faker', '~> 0.9.5'
end

group :development do
  # gem 'ruby-prof', '~> 0.10.5'  # works nice with NewRelic RPM Developer Mode
  gem 'passenger'
  gem 'rake'
end

group :test do
  gem 'ci_reporter', '~> 1.6.4'
  gem 'shoulda', '~> 2.11.3'
  gem 'shoulda-activemodel', '0.0.2', :require => 'shoulda/active_model'  # fixed version - too hacky
  gem 'mocha', '~> 0.9.12'
  gem 'database_cleaner', '~> 0.6.0'
  gem 'timecop', '~> 0.3.5'
end

# Needed for the new asset pipeline
group :assets do
  gem 'sass-rails', '~> 3.2.5'
  gem 'coffee-rails', '~> 3.2.2'
  gem 'uglifier', '>= 1.0.3'
end
