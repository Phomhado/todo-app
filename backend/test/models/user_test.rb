require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "has many tasks" do
    user = users(:alice)

    assert_equal 2, user.tasks.size
    assert_equal [tasks(:one), tasks(:two)], user.tasks.order(:id)
  end
end
