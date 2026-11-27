require "test_helper"

class TaskTest < ActiveSupport::TestCase
  test "requires a title and a supported column" do
    task = Task.new(user: users(:alice), title: " ", column: "unknown")
    assert_not task.valid?
    assert task.errors[:title].any?
    assert task.errors[:column].any?
  end

  test "tracks completion when moving into and out of done" do
    task = tasks(:one)
    task.update!(column: "done")
    completed_at = task.done_at
    assert completed_at
    task.update!(title: "Updated")
    assert_equal completed_at, task.done_at
    task.update!(column: "doing")
    assert_nil task.done_at
  end
end
