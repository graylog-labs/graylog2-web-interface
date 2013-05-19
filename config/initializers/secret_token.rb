# Be sure to restart your server when you modify this file.

# Your secret key for verifying the integrity of signed cookies.
# If you change this key, all old signed cookies will become invalid!
# Make sure the secret is at least 30 characters and all random,
# no regular words or you'll be exposed to dictionary attacks.

Graylog2WebInterface::Application.config.secret_token = 'CHANGE ME'


# No need to change anything here.
if Graylog2WebInterface::Application.config.secret_token == 'CHANGE ME'
  raise "Generate a new secret token with `rake secret` and paste it into config/initializers/secret_token.rb"
end
