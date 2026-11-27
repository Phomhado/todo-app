class Task < ApplicationRecord
    belongs_to :user

    validates :title, presence: true, length: { maximum: 255 }
    validates :column, inclusion: { in: %w[todo doing test done] }
    before_validation :sync_completion_time

    private

    def sync_completion_time
      self.done_at = column == 'done' ? (done_at || Time.current) : nil
    end
end
