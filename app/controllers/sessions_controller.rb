class SessionsController < ApplicationController

  skip_before_filter :login_required, :except => :destroy

  layout "login"

  def show
    render :action => :new
  end

  def new
  end

  def create
    logout_keeping_session!

    if ::Configuration.ldap_config
      user = ldap_auth(params[:login], params[:password])
    end

    if !user
      user = User.authenticate(params[:login], params[:password])
    end

    if user
      # Protects against session fixation attacks, causes request forgery
      # protection if user resubmits an earlier form using back
      # button. Uncomment if you understand the tradeoffs.
      # reset_session
      self.current_user = user
      new_cookie_flag = (params[:remember_me] == "1")
      handle_remember_cookie!(new_cookie_flag)
      redirect_to (current_user.reader? ? streams_path : root_path)
      flash[:notice] = "Logged in successfully"
    else
      note_failed_signin
      @login       = params[:login]
      @remember_me = params[:remember_me]
      render :action => 'new'
    end
  end

  def destroy
    logout_killing_session!
    flash[:notice] = "You have been logged out."
    redirect_back_or_default(root_path)
  end

protected
  # Track failed login attempts
  def note_failed_signin
    flash[:error] = "Couldn't log you in as '#{params[:login]}'"
    Rails.logger.warn "Failed login for '#{params[:login]}' from #{request.remote_ip} at #{Time.now.utc}"
  end
end

private

  def ldap_auth login, password
    require 'net/ldap'

    @ldap = Net::LDAP.new :host => ::Configuration.ldap_config(:host),
                          :port => ::Configuration.ldap_config(:port, 389),
                          :auth => {
                            :method => :simple,
                            :username => ::Configuration.ldap_config(:bind_dn),
                            :password => ::Configuration.ldap_config(:bind_password)
                          }

    # try to bind as user
    def rebind login, password, fltr
      complite_filter = "(#{::Configuration.ldap_config(:username_attr)}=#{login})"
      if fltr
        complite_filter = "(&#{fltr}#{complite_filter})"
      end

      Rails.logger.info "LDAP: #{complite_filter}"
      @ldap.bind_as(
                  :base => ::Configuration.ldap_config(:base_dn),
                  :scope => ::Configuration.ldap_config(:search_scope),
                  :filter => complite_filter,
                  :password => password
           )
    end

    begin

      if rebind_result = rebind(login, password, ::Configuration.ldap_config(:filter_admins))
        role = 'admin'
      elsif rebind_result = rebind(login, password, ::Configuration.ldap_config(:filter_readers))
        role = 'reader'
      else
        return
      end

    rescue Net::LDAP::LdapError => e
      Rails.logger.error "LDAP: #{e}"
      return
    end

    email = ::Configuration.ldap_config(:email_attr) ? rebind_result[0][ ::Configuration.ldap_config(:email_attr) ][0] : nil
    name = ::Configuration.ldap_config(:name_attr) ? rebind_result[0][ ::Configuration.ldap_config(:name_attr) ][0] : nil

    if u = User.find_by_login(login)

      # refresh user profile from LDAP
      u.email = email ? email : nil
      u.name = name ? name : nil
      u.role = role
      u.ldap_autocreated = true
      u.save ? u : nil

    else

      User.new( :login => login,
                    :email => email ? email : nil,
                    :name => name ? name : nil,
                    :role => role,
                    :ldap_autocreated => true
                  )
    end

  end

