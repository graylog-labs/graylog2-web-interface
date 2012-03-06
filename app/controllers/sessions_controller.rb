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

    @ldap_settings = Setting::get_ldap_settings

    if @ldap_settings[:enabled]
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

    @ldap = Net::LDAP.new :host => @ldap_settings[:server],
                          :port => @ldap_settings[:port],
                          :auth => {
                            :method => :simple,
                            :username => @ldap_settings[:bind_dn],
                            :password => @ldap_settings[:bind_password]
                         }

    # try to bind as user
    def rebind login, password, fltr
      complite_filter = "(&#{fltr}(#{@ldap_settings[:username_attr]}=#{login}))"
      Rails.logger.info "LDAP: #{complite_filter}"
      @ldap.bind_as(
                  :base => @ldap_settings[:base_dn],
                  :scope => @ldap_settings[:search_scope],
                  :filter => complite_filter,
                  :password => password
           )
    end

    begin

      if rebind_result = rebind(login, password, @ldap_settings[:filter_admins])
        role = 'admin'
      elsif rebind_result = rebind(login, password, @ldap_settings[:filter_readers])
        role = 'reader'
      else
        return
      end

    rescue Net::LDAP::LdapError => e
      Rails.logger.error "LDAP: #{e}"
      return
    end

    email = rebind_result[0][ @ldap_settings[:email_attr] ][0]
    name = rebind_result[0][ @ldap_settings[:name_attr] ][0]

    if u = User.find_by_login(login)

      # refresh user profile from LDAP
      u.email = email
      u.name = name
      u.role = role
      u.ldap_autocreated = true
      u.save ? u : nil

    else

      User.new( :login => login,
                    :email => email,
                    :name => name,
                    :role => role,
                    :ldap_autocreated => true
                  )
    end

  end

