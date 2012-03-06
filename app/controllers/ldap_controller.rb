require 'net/ldap'

class LdapController < ApplicationController
  filter_access_to :index

  def index

    @has_settings_tabs = true
    @ldap_settings = Setting.get_ldap_settings

    @ldap_scope_variants = [
      { :text => "Base", :value => Net::LDAP::SearchScope_BaseObject },
      { :text => "One level", :value => Net::LDAP::SearchScope_SingleLevel },
      { :text => "Subtree", :value => Net::LDAP::SearchScope_WholeSubtree },
    ]

  end

end

