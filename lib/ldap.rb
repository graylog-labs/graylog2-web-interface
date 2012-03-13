require 'net/ldap'

class LDAP < Net::LDAP
  # try to bind as user
  def try_rebind login, password, fltr
    complite_filter = "(#{::Configuration.ldap_config(:username_attr)}=#{login})"
    if fltr
      complite_filter = "(&#{fltr}#{complite_filter})"
    end

    Rails.logger.info "LDAP #{complite_filter}"

    begin
      bind_as(
        :base => ::Configuration.ldap_config(:base_dn),
        :scope => ::Configuration.ldap_config(:search_scope),
        :filter => complite_filter,
        :password => password
      )
    rescue Net::LDAP::LdapError => e
      Rails.logger.error "LDAP #{e}"
    end
  end

end
