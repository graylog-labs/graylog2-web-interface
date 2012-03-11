require 'digest/sha1'
require 'net/ldap'

class User
  include Mongoid::Document
  include Authentication
  include Authentication::ByPassword
  include Authentication::ByCookieToken

  validates_presence_of     :login
  validates_length_of       :login,    :within => 3..40
  validates_uniqueness_of   :login
  validates_format_of       :login,    :with => Authentication.login_regex, :message => Authentication.bad_login_message

  validates_format_of       :name,     :with => Authentication.name_regex,  :message => Authentication.bad_name_message, :allow_nil => true
  validates_length_of       :name,     :maximum => 100

  validates_presence_of     :email
  validates_length_of       :email,    :within => 6..100 #r@a.wk

  STANDARD_ROLE = :admin

  # HACK HACK HACK -- how to do attr_accessible from here?
  # prevents a user from submitting a crafted form that bypasses activation
  # anything else you want your user to change should be added here.
  attr_accessible :login, :email, :name, :password, :password_confirmation, :role, :stream_ids, :ldap_autocreated

  field :login, :type => String
  field :email, :type => String
  field :name, :type => String
  field :password, :type => String
  field :role, :type => String
  field :crypted_password, :type => String
  field :salt, :type => String
  field :remember_token, :type => String
  field :remember_token_expires_at
  field :last_version_check, :type => Integer
  field :ldap_autocreated, :type =>  Boolean, :default => false

  index :login,          :background => true, :unique => true
  index :remember_token, :background => true, :unique => true

  has_and_belongs_to_many :streams, :inverse_of => :users
  has_and_belongs_to_many :favorite_streams,   :class_name => "Stream", :inverse_of => :favorited_streams
  has_and_belongs_to_many :subscribed_streams, :class_name => "Stream", :inverse_of => :subscribers
  references_many :alerted_streams

  # Authenticates a user by their login name and unencrypted password.  Returns the user or nil.
  #
  # uff.  this is really an authorization, not authentication routine.
  # We really need a Dispatch Chain here or something.
  # This will also let us return a human error message.
  #
  def self.authenticate(login, password)
    return nil if login.blank? || password.blank?
    u = find_by_login(login.downcase) # need to get the salt
    u && !u.ldap_autocreated && u.authenticated?(password) ? u : ( ::Configuration.ldap_config ? ldap_auth(u, login, password) : nil )
  end

  def self.find_by_id(_id)
    find(:first, :conditions => {:_id => BSON::ObjectId(_id)})
  end

  def self.find_by_remember_token(token)
    find(:first, :conditions => {:remember_token => token})
  end

  def self.find_by_login(login)
    find(:first, :conditions => {:login => login})
  end

  alias :super_password_required? :password_required?
  def password_required?
    !ldap_autocreated && super_password_required?
  end

  def login=(value)
    write_attribute :login, (value ? value.downcase : nil)
  end

  def display_name
    self.name.blank? ? self.login : self.name
  end

  def email=(value)
    write_attribute :email, (value ? value.downcase : nil)
  end

  def reader?
    role == "reader"
  end

  def roles
    role_symbols
  end

  def role_symbols
    [(role.blank? ? STANDARD_ROLE : role.to_sym)]
  end

  def valid_roles
    [:admin, :reader]
  end

  private

  # try to bind as user
  def self.ldap_rebind login, password, fltr
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


  def self.ldap_auth user_instance, login, password

    @ldap = Net::LDAP.new :host => ::Configuration.ldap_config(:host),
      :port => ::Configuration.ldap_config(:port, 389),
      :auth => {
      :method => :simple,
      :username => ::Configuration.ldap_config(:bind_dn),
      :password => ::Configuration.ldap_config(:bind_password)
    }

    # check auth by ldap
    begin
      if rebind_result = ldap_rebind(login, password, ::Configuration.ldap_config(:filter_admins))
        role = 'admin'
      elsif rebind_result = ldap_rebind(login, password, ::Configuration.ldap_config(:filter_readers))
        role = 'reader'
      else
        return
      end
    rescue Net::LDAP::LdapError => e
      Rails.logger.error "LDAP: #{e}"
      return
    end

    # this attributes may be not configured
    email = ::Configuration.ldap_config(:email_attr) ? rebind_result[0][ ::Configuration.ldap_config(:email_attr) ][0] : nil
    name = ::Configuration.ldap_config(:name_attr) ? rebind_result[0][ ::Configuration.ldap_config(:name_attr) ][0] : nil

    if user_instance

      # refresh user profile from LDAP
      user_instance.email = email
      user_instance.name = name
      user_instance.role = role
      user_instance.ldap_autocreated = true
      user_instance.save ? user_instance : nil

    else

      User.new( :login => login,
               :email => email,
               :name => name,
               :role => role,
               :ldap_autocreated => true
              )
    end

  end

end
