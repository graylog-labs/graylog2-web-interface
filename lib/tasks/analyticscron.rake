require 'erb'
require 'syslog'

#
# GLOBAL SETTINGS
# can overwrite via config/anlyticscron.yml
#

$global = { "GRAYLOG_BASEDIR" => File.expand_path('../../..', __FILE__), # sets Graylog basedir
            "TEMPLATEDIR" => "<GRAYLOG>/app/views/analyticscron", # sets defaults
            "VERBOSITY" => false,
            "SMTPSERVER" => nil,
            "MAILFROM" => nil }

#
# FUNCTIONS
#

# reads the config file
# 
# @returns hash map like
#          { "block1" => { "query" => "...", "title" => "...", ... },
#            "block2" => { "query" => "...", "title" => "...", ... } }
def readSettings
  defaultsets = { "format" => "plain",  # set defaults
                  "sendmail" => false,
                  "mailto" => nil,
                  "title" => "unknown",
                  "query" => nil,
                  "limit" => 500,
                  "disabled" => false,
                  "template" => nil}
  settings = open($global["GRAYLOG_BASEDIR"]+"/config/analyticscron.yml") { |f| YAML.load(f) }
  settings.each do |sets| 
    if sets[0] == "global" # overwrites global settings
      sets[1].each do |glob|
        $global[glob[0]] = glob[1]
      end
    else
      defaultsets.each do |default| # checks settings section
        if not sets[1].has_key?(default[0]) # check if not exists -> set default value
          sets[1][default[0]] = default[1]
        end
        if default[0] == "query" # converts erb in query
          queryerb = ERB.new( sets[1][default[0]] )
          sets[1][default[0]] = queryerb.result(binding)
        end
      end
    end
  end
  # removes 'global' block from settings
  if settings.has_key?("global") then settings.delete("global") end
  # replaces pattern in TEMPLATEDIR
  $global["TEMPLATEDIR"] = $global["TEMPLATEDIR"].sub("<GRAYLOG>",$global["GRAYLOG_BASEDIR"])
  return settings
end

# checks commandline for jobs=job1,job2
# If set, only these jobs will be executed.
# 
# @param  settings   hash-table with all settings
def readParams(settings)
  if ENV["jobs"] # found param
    jobs = ENV["jobs"].split(",")
    if $global["VERBOSITY"] then puts "*** jobs are explicit set: "+jobs.join(",") end
    # ignore disabled from config
    settings.each do |sets|
      sets[1]["disabled"] = true
    end
    # start jobs, which explicit sets via jobs=job1,job2
    jobs.each do |j|
      j = j.strip
      if settings.has_key?(j)
        if $global["VERBOSITY"] then puts "*** enable job "+j.strip end
        settings[ j.strip ]["disabled"] = false
      else
        if $global["VERBOSITY"] then puts "*** job '"+j+"' not exists" end
      end
    end
  end
end

# sends query to Graylog2
# 
# @params  sets   local settings for this request
# @return  hash-table with result set
def queryGraylog(sets)
  if sets["query"] == nil    # check query empty
    puts "*** missing query!"
    return nil
  end
  if $global["VERBOSITY"] then puts "Query: "+sets["query"] end
  sh = Shell.new(sets["query"])
  result = sh.compute
  return result
end

# creates a pretty formatted text
# 
# @params sets     local settings
# @params result   hash-table with result set
# @return string   pretty formatted text
def generateoutput(sets, result)
  # load template from file
  tmpl = sets["template"]
  if tmpl == nil then tmpl = result[:operation] end
  fname = $global["TEMPLATEDIR"]+"/"+tmpl+"."+sets["format"]+".erb"
  if $global["VERBOSITY"] then puts "use template: "+fname end
  f = File.new(fname,"r")
  template = f.read
  f.close
  # creates template-class
  rhtml = ERB.new(template)
  # operation -> specific class
  case result[:operation]
    when "count"
      o = ERB_Count.new(sets, result[:result])
    when "distribution"
      # counts
      q = sets["query"].gsub(/distribution[ ]*\([ ]*{.*}[ ]*,?[ ]*/,"count(")
      if $global["VERBOSITY"] then puts "Count: "+q end
      sh = Shell.new(q)
      countres = sh.compute
      # go on
      o = ERB_Distribution.new(sets, countres[:result])
      n = (result[:result].length < sets["limit"] ? result[:result].length : sets["limit"])
      for i in (0...n)
        o.append( result[:result][i][:distinct], result[:result][i][:count] )
      end
    when "find"
      o = ERB_Find.new(sets)
      n = (result[:result].length < sets["limit"] ? result[:result].length : sets["limit"])
      for i in (0...n)
        # parameters: deleted, total_result_count, file, message, id, facility, host, level, created_at, line, streams
        o.append(result[:result][i].deleted, result[:result][i].total_result_count, result[:result][i].file,
                 result[:result][i].message,  result[:result][i].id, result[:result][i].facility, result[:result][i].host, 
                 result[:result][i].level, result[:result][i].created_at, result[:result][i].line, result[:result][i].streams.join(", "))
      end
    else
      puts "*** FAILED: Operation '#{result[:operation]}' not implemented!"
  end
  return rhtml.result(o.get_binding)
end

# Sends text to all mail recipients.
# sets['sendmail'] will be ignore
# 
# @param block  name of this set block
# @param sets   local settings
# @param text   this text will be send
def sendmail(blockname, sets, text)
  if $global["SMTPSERVER"] == nil
    puts "Cant send mail! No SMTP server defined."
    return
  end
  if $global["MAILFROM"] == nil
    puts "Cant send mail! No 'mail from' defined."
    return
  end
  sets["mailto"].each do |m|
    body = "From: "+$global["MAILFROM"]+"
To: "+m+"
Subject: "+sets["title"]+"
X-Sender: graylog2
"
    if text.downcase.include?("<html>")
      body << "Content-Type: text/html\n"
    else
      body << "Content-Type: text/plain\n"
    end
    body << "\n"
    body << text
    if $global["VERBOSITY"] then puts "---\n"+body+"---" end 
    Net::SMTP.start($global["SMTPSERVER"]) do |smtp|
      smtp.send_message body, $global["MAILFROM"], m
    end
    syslog("Report "+blockname+" ("+sets["title"]+") sent to "+m+".")
  end
end

# sends data to the syslog
#
# @param text     message to log
def syslog(text)
  script_name = "analyticscron.rake"
  syslog_option = Syslog::LOG_PID | Syslog::LOG_CONS
  syslog_facility = Syslog::LOG_LOCAL7 # Syslog::LOG_DAEMON
  Syslog.open(script_name, syslog_option, syslog_facility) do |s|
    s.notice(text)
  end
end

#
# DATA-CLASSES
# holts data for the templates
#

# super class with all common functions
class ERB_Super
  def initialize(sets)
    @sets = sets
  end
  
  def get_binding
    binding
  end
end

# class for find operation
class ERB_Find < ERB_Super
  def initialize(sets)
    super sets
    @lines = []
  end

  def append( deleted, total_result_count, file, message, id, facility, host, level, created_at, line, streams )
    @lines << { "deleted" => deleted,
                "total_result_count" => total_result_count,
                "file" => file, 
                "message" => message, 
                "id" => id, 
                "facility" => facility, 
                "host" => host, 
                "level" => level, 
                "created_at" => created_at, 
                "line" => line, 
                "streams" => streams }
  end
end

# class for count operation
class ERB_Count < ERB_Super
  def initialize(sets,count)
    super sets
    @count = count
  end
end

# class for distribution operation
class ERB_Distribution < ERB_Super
  def initialize(sets, allcount)
    super sets
    @allcount = allcount
    @lines = []
  end
  
  def append(distinct, count)
    @lines << { "distinct" => distinct, "count" => count }
  end
end

#
# EXECUTE TASK
#

namespace :analyticscron do
  desc "This job executes any command on analytics shell and sends result as mail."
  task :exec => :environment do
    settings = readSettings() # config-file
    if $global["VERBOSITY"]
      puts "-- global --\n"+$global.inspect
      puts "-- settings --\n"+settings.inspect 
    end
    
    readParams(settings) # commandline parameters
    
    settings.each do |sets|
      if sets[1]["disabled"] or sets[0] == "global" # ignore disabled block
        if $global["VERBOSITY"] then puts "*** "+sets[0]+" ("+sets[1]["title"]+") is disabled!" end
      else
        if $global["VERBOSITY"] then puts "*** execute "+sets[0]+" ("+sets[1]["title"]+")..." end
        res = queryGraylog(sets[1])
        out = generateoutput(sets[1],res)
        if sets[1]["sendmail"] # send mail if set
          sendmail(sets[0], sets[1], out)
        else
          puts out
        end
      end
    end


    exit 0
  end
end
