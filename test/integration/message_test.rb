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

  test "viewing around messages" do
    visit messages_path
save_and_open_page
    assert page.has_content? "Messages"
  end
end
