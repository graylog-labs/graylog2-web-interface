require 'integration_test_helper'

class MessageTest < ActionDispatch::IntegrationTest
  fixtures :all
  Capybara.current_driver = :akephalos

  def setup
    visit root_path
    fill_in "login",    :with => "quentin"
    fill_in "password", :with => "monkey"
    page.execute_script "$('#loginform').submit();"
  end

  test "viewing messages" do
    visit messages_path

    assert page.has_content? "Messages"
  end
end
