require 'erb'

#
# GLOBAL SETTINGS
#
BASEDIR_GRAYLOGWEB = "/opt/graylog2/graylog2-web-interface"
TEMPLATEDIR = BASEDIR_GRAYLOGWEB+"/lib/tasks"
settings = nil
VERBOSITY = false
SMTPSERVER = "smtp.example.com"
MAILFROM = "server@example.com"

#
# FUNCTIONS
#

# reads the config file
# 
# @returns hash map like
#          { "block1" => { "query" => "...", "title" => "...", ... },
#            "block2" => { "query" => "...", "title" => "...", ... } }
def readSettings
  # read file
  f = File.new(BASEDIR_GRAYLOGWEB+"/lib/tasks/shell.ini","r")
  lines = f.readlines
  f.close
  # set important vars
  settings = {}
  locsets = {}
  # for each line in config
  lines.each do |l|
    # remove comment 
    l = l.gsub(/[;#].*/,"").strip
    if l.length == 0 then next end
    # split
    key,val = l.split("=",2)
    key = key.strip
    if val != nil then val = val.strip end
    if key.starts_with?("[") # found new block
      blockname = key[1..-2]
      if settings.has_key?(blockname)
        puts "*** WARNING: redefine block {blockname}"
      end
      locsets = { "htmlformat" => false,  # set defaults
                  "enablemail" => false,
                  "mailto" => nil,
                  "title" => "unknown",
                  "query" => nil,
                  "linelimit" => 500,
                  "disabled" => false,
                  "template" => "plain"}
      settings[blockname] = locsets
      next # line finish processed
    end
    case key
      when "query"
        queryerb = ERB.new(val)
        locsets["query"] = queryerb.result(binding)
      when "sendmail"
        if val == "yes"
          locsets['enablemail'] = true
        end
      when "disabled"
        if val == "yes"
          locsets["disabled"] = true
        end
      when "limit"
        locsets['linelimit'] = val.to_i
      when "title"
        locsets['title'] = val
      when "mailto"
        locsets['mailto'] = val.split(" ")
      when "template"
        locsets['template'] = val
      else
        puts "shell.ini: ignore key "+key
    end
  end
  return settings
end

# checks commandline for jobs=job1,job2
# If set, only these jobs will be executed.
# 
# param  settings   hash-table with all settings
def readParams(settings)
  if ENV["jobs"] # found
    jobs = ENV["jobs"].split(",")
    if VERBOSITY then puts "*** jobs are explicit set: "+jobs.join(",") end
    # ignore disabled from config
    settings.each do |sets|
      sets[1]["disabled"] = true
    end
    # start jobs, which explicit sets
    jobs.each do |j|
      j = j.strip
      if settings.has_key?(j)
        if VERBOSITY then puts "*** enable job "+j.strip end
        settings[ j.strip ]["disabled"] = false
      else
        if VERBOSITY then puts "*** job '"+j+"' not exists" end
      end
    end
  end
end

# sends query to Graylog2
# 
# @params  sets   local settings for this request
# @return  hash-table with result set
def queryGraylog(sets)
  if sets["query"] == nil    # check query empthy
    puts "*** missing query!"
    return nil
  end
  if VERBOSITY then puts "Query: "+sets["query"] end
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
  fname = TEMPLATEDIR+"/shell_"+result[:operation]+"_"+sets["template"]+".erb"
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
      if VERBOSITY then puts "Count: "+q end
      sh = Shell.new(q)
      countres = sh.compute
      # go on
      o = ERB_Distribution.new(sets, countres[:result])
      n = (result[:result].length < sets["linelimit"] ? result[:result].length : sets["linelimit"])
      for i in (0...n)
        o.append( result[:result][i][:distinct], result[:result][i][:count] )
      end
    when "find"
      o = ERB_Find.new(sets)
      n = (result[:result].length < sets["linelimit"] ? result[:result].length : sets["linelimit"])
      for i in (0...n)
        # parameters: deleted, total_result_count, file, message, id, facility, host, level, created_at, line, streams
        o.append(result[:result][i].deleted, result[:result][i].total_result_count, result[:result][i].file,
                 result[:result][i].message,  result[:result][i].id, result[:result][i].facility, result[:result][i].host, 
                 result[:result][i].level, result[:result][i].created_at, result[:result][i].line, result[:result][i].streams.join(", "))
      end
    else
      puts "*** FAILED: Operation '{result[:operation]}' not implemented!"
  end
  return rhtml.result(o.get_binding)
end

# Sends text to all mail recipients.
# sets['enablemail'] will be ignore
# 
# @param sets   die lokalen Einstellungen
# @param text   der zu sendende Text
def sendmail(sets, text)
  sets["mailto"].each do |m|
    body = "From: "+MAILFROM+"
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
    if VERBOSITY then puts "---\n"+body+"---" end 
    Net::SMTP.start(SMTPSERVER) do |smtp|
      smtp.send_message body, MAILFROM, m
    end
    puts "Mail sended to "+m
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

namespace :shell do
  desc "Fuehrt einen beliebigen Analytics Shell Befehl aus und sendet Antwort ggf. als Mail."
  task :exec => :environment do

    settings = readSettings() # config-file
    if VERBOSITY then puts settings.inspect end
    readParams(settings) # commandline parameters
    
    settings.each do |sets|
      if sets[1]["disabled"] # ignore disabled block
        if VERBOSITY then puts "*** "+sets[0]+" ("+sets[1]["title"]+") is disabled!" end
      else
        if VERBOSITY then puts "*** execute "+sets[0]+" ("+sets[1]["title"]+")..." end
        res = queryGraylog(sets[1])
        out = generateoutput(sets[1],res)
        if sets[1]["enablemail"] # send mail if set
          sendmail(sets[1], out)
        else
          puts out
        end
      end
    end


    exit 0
  end
end
