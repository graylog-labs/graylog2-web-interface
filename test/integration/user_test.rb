require 'integration_test_helper'

class UserTest < ActionDispatch::IntegrationTest
  fixtures :all
  Capybara.current_driver = :akephalos

  test "valid user can log in" do
    visit login_path
    fill_in "login",    :with => "quentin"
    fill_in "password", :with => "monkey"
    page.execute_script "$('#loginform').submit();"

    visit users_path
    assert page.has_content? "Logged in as quentin"  
  end

  test "invalid user cannot log in" do
    visit login_path
    fill_in "login",    :with => "quentin"
    fill_in "password", :with => "invalidpassword"
    page.execute_script "$('#loginform').submit();"

    visit users_path
    assert page.has_content? "Start Graylog2"
  end

end
