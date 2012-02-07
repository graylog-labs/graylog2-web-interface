namespace :streamalarms do

  desc "Alert all enabled users of a stream if it is above it's alarm limit."
  task :send => :environment do
    # Go through every stream that has enabled alerts.
    Stream.all_with_enabled_alerts.each do |stream_id|
      stream = Stream.find(stream_id)

      # Skip if limit or timespan is not set.
      if stream.alarm_limit.blank? or stream.alarm_timespan.blank?
        puts "Stream >#{stream.title}< has enabled alarms with users but no limit or timepspan set. Skipping."
        next
      end

      
      if ! defined?(stream.last_alarm_check)
        alarm_checkfrom=stream.alarm_timespan.minutes.ago
      else
        alarm_checkfrom = Time.at(stream.last_alarm_check)
      end
      alarm_checkto = Time.now
      check_since = alarm_checkfrom
      puts "Stream >#{stream.title}< has enabled alarms. (max #{stream.alarm_limit} msgs/#{stream.alarm_timespan} min) Checking for message count since #{check_since}"

      # Loop through all X minute intervals (stream.alarm_timespan.minutes) between alarm_checkfrom and alarm_checkto
      while alarm_checkfrom <= alarm_checkto
        alarm_checkstep = alarm_checkfrom + stream.alarm_timespan.minutes
        if alarm_checkstep > alarm_checkto
          # Mark beginning of last  two minute interval for the next run.
          puts "\tAlarm Check interval exceeds current time. Saving start of pass '#{alarm_checkfrom}' (#{alarm_checkfrom.to_i}) for next run."
          stream.last_alarm_check = alarm_checkfrom
          stream.save
          break
        end
        puts "\tCheck Interval [#{stream.alarm_timespan.minutes.to_s} seconds]: #{alarm_checkfrom} (#{alarm_checkfrom.to_i}) -> #{alarm_checkstep} (#{alarm_checkstep.to_i})"
      
        # Check if above limit.
        messages = MessageGateway.all_in_range(1, alarm_checkfrom.to_i, alarm_checkstep.to_i, :stream_id => stream.id)
        count = messages.total_result_count
        if count > stream.alarm_limit
          subscribers = AlertedStream.all_subscribers(stream)
          puts "\t\t#{count} messages: Above limit! Sending alarm to #{subscribers.count} subscribed users."

          # Build email body.
          body = "# Stream >#{stream.title}< had #{count} new messages between #{alarm_checkfrom.to_s} and #{alarm_checkstep.to_s}. Limit: #{stream.alarm_limit}\n"

          # Add description to body.
          if stream.description.blank?
            body += "# No stream description set.\n\n"
          else
            body += "# Description: #{stream.description}\n\n"
          end

          # Add a few messages for context
          body += "Last messages:\n"
          messages.each do |msg|
            body += "#{Time.at(msg.created_at)} #{msg.facility} #{msg.host} #{msg.level} #{msg.message}"
            body += " #{msg.additional_fields.inspect}" unless msg.additional_fields.empty?
            body += "\n"
          end

          # Send messages.
          subscribers.each do |subscriber|
            begin
              Pony.mail(
                :to => subscriber,
                :from => Configuration.streamalarm_from_address,
                :subject => "#{Configuration.streamalarm_subject} (Stream: #{stream.title})",
                :body => body,
                :via => Configuration.email_transport_type,
                :via_options => Configuration.email_smtp_settings # Only used when :via => :smtp
              )
              puts "\t[->] #{subscriber}"
            rescue => e
              puts "\t [!!] #{subscriber} (#{e.to_s.delete("\n")})"
            end
          end
        else
          puts "\t\t#{count} messages: Not above limit."
        end
        alarm_checkfrom += stream.alarm_timespan.minutes
	# These runs can take a while if they haven't been run for a while. Let's update the last_alarm_check on each pass in case we have to cancel and start over.
        stream.last_alarm_check = alarm_checkfrom
        stream.save
      end

    end

    Job.done(AlertedStream::JOB_TITLE)
    puts "All done."
  end
end