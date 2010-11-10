class BlacklistedTerm < ActiveRecord::Base
  belongs_to :blacklist

  validates_presence_of :term
  validates_presence_of :blacklist_id
end
