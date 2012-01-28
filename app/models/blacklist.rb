class Blacklist
  include Mongoid::Document

  embeds_many :blacklisted_terms

  field :title,    :type => String
  field :disabled, :type => Boolean, :default => false

  validates_presence_of :title

  def title_possibly_disabled
    disabled ? title + " (disabled)" : title if title
  end

  def self.find_by_id(_id)
    first(:conditions => {:_id => BSON::ObjectId(_id)})
  end

  def self.all_terms
    self.all.collect {|b|
      b.all_terms
    }.flatten
  end

  def all_terms
    blacklisted_terms.collect {|bt|
      bt.term
    }
  end
end
