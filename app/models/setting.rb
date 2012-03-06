class Setting
  include Mongoid::Document

  field :user_id, :type => BSON::ObjectId
  field :setting_type, :type => Integer
  field :value, :type => Object

  TYPE_MESSAGE_LENGTH = 1
  TYPE_MESSAGE_LENGTH_STANDARD = 150

  TYPE_MESSAGE_COUNT_INTERVAL = 2
  TYPE_MESSAGE_COUNT_INTERVAL_STANDARD = 10

  TYPE_MESSAGE_MAX_COUNT = 3
  TYPE_MESSAGE_MAX_COUNT_STANDARD = 100

  TYPE_RETENTION_TIME_DAYS = 5
  TYPE_RETENTION_TIME_DAYS_STANDARD = 60

  TYPE_RETENTION_FREQ_MINUTES = 6
  TYPE_RETENTION_FREQ_MINUTES_STANDARD = 30
  
  TYPE_ADDITIONAL_COLUMNS = 7
  TYPE_ADDITIONAL_COLUMNS_STANDARD = []

  TYPE_LDAP = 8
  TYPE_LDAP_DEFAULT = {
    :enabled        => false,
    :server         => 'ldap.domain.tld',
    :port           => 389,
    :base_dn        => 'ou=People,dc=domain,dc=tld',
    :search_scope   => 2,
    :bind_dn        => 'cn=Graylog2Web,ou=People,dc=domain,dc=tld',
    :bind_password  => 'secret',
    :username_attr  => 'uid',
    :email_attr     => 'mail',
    :name_attr      => 'displayName',
    :filter_admins  => '(&(objectClass=User)(memberOf=cn=graylog-admins,ou=Groups,dc=domain,dc=tld))',
    :filter_readers => '(&(objectClass=User)(memberOf=cn=graylog-readers,ou=Groups,dc=domain,dc=tld))',
  }

  def self.retentiontime_types
    [ TYPE_RETENTION_TIME_DAYS, TYPE_RETENTION_FREQ_MINUTES ]
  end

  def self.get_message_length current_user
    setting = Setting.where(:user_id => current_user.id, :setting_type => TYPE_MESSAGE_LENGTH).first
    return TYPE_MESSAGE_LENGTH_STANDARD if setting.blank?
    return setting.value
  end

  def self.get_message_count_interval current_user
    setting = Setting.where(:user_id => current_user.id, :setting_type => TYPE_MESSAGE_COUNT_INTERVAL).first
    return TYPE_MESSAGE_COUNT_INTERVAL_STANDARD if setting.blank?
    return setting.value
  end

  def self.get_message_max_count current_user
    setting = Setting.where(:user_id => current_user.id, :setting_type => TYPE_MESSAGE_MAX_COUNT).first
    return TYPE_MESSAGE_MAX_COUNT_STANDARD if setting.blank?
    return setting.value
  end

  def self.get_retention_time_days current_user
    setting = Setting.where(:user_id => current_user.id, :setting_type => TYPE_RETENTION_TIME_DAYS).first
    return TYPE_RETENTION_TIME_DAYS_STANDARD if setting.blank?
    return setting.value
  end
  
  def self.get_retention_frequency_minutes current_user
    setting = Setting.where(:user_id => current_user.id, :setting_type => TYPE_RETENTION_FREQ_MINUTES).first
    return TYPE_RETENTION_FREQ_MINUTES_STANDARD if setting.blank?
    return setting.value
  end
  
  def self.get_additional_columns current_user
    setting = Setting.where(:user_id => current_user.id, :setting_type => TYPE_ADDITIONAL_COLUMNS).first
    return TYPE_ADDITIONAL_COLUMNS_STANDARD if setting.blank?
    return setting.value
  end

  def self.get_ldap_settings
    setting = Setting.where(:setting_type => TYPE_LDAP).first
    return TYPE_LDAP_DEFAULT if setting.blank?
    # with keys symbolize
    return setting.value.inject({}){|tmp,(k,v)| tmp[k.to_sym] = v; tmp}
  end

end
