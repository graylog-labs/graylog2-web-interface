class LdapController < ApplicationController
  filter_access_to :index

  def index
    @ldap_settings = Setting.get_ldap_settings
  end

end

