require "test_helper"
require "capybara/rails"
require "akephalos"
 
module ActionController
  class IntegrationTest
    include Capybara
  end
end