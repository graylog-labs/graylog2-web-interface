class AlertedStream
  include Mongoid::Document

  belongs_to :user
  belongs_to :stream

  JOB_TITLE = "streamalarm_check"

  def self.alerted?(stream_id, user_id)
    self.where(user_id: user_id, stream_id: stream_id).count > 0
  end

  def self.all_subscribers(stream)
    emails = Array.new
    subscribers = Array.new

    if stream.alarm_force
      User.all.each do |u|
        next if u.email.blank?
        emails << u.email
      end
    else
      self.where(:stream_id => stream.id).each do |s|
        next if s.user.blank? or s.user.email.blank?
        emails << s.user.email
      end
    end

    return emails
  end

end
