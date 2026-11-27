require "test_helper"

class Api::V1::TasksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:alice)
    @task = tasks(:one)
  end

  test "should show task for current user" do
    get api_v1_task_url(@task), headers: auth_headers(@user)

    assert_response :success

    body = JSON.parse(response.body)
    assert_equal @task.id, body["id"]
    assert_equal @task.title, body["title"]
  end

  test "should return 404 when task not found" do
    get api_v1_task_url(-1), headers: auth_headers(@user)

    assert_response :not_found

    body = JSON.parse(response.body)
    assert_equal "Task not found or not authorized", body["error"]
  end

  test "rejects requests without a valid bearer token" do
    get api_v1_tasks_url
    assert_response :unauthorized
    get api_v1_tasks_url, headers: { "Authorization" => "Bearer invalid" }
    assert_response :unauthorized
  end

  test "does not expose or modify another user's task" do
    get api_v1_task_url(@task), headers: auth_headers(users(:bob))
    assert_response :not_found
    patch api_v1_task_url(@task), params: { task: { title: "Changed" } }, headers: auth_headers(users(:bob))
    assert_response :not_found
    assert_equal "Buy groceries", @task.reload.title
  end

  test "rejects invalid task data" do
    post api_v1_tasks_url, params: { task: { title: "", column: "invalid" } }, headers: auth_headers(@user)
    assert_response :unprocessable_entity
  end

  private

  def auth_headers(user)
    token = JWT.encode({ user_id: user.id }, jwt_secret, "HS256")
    { "Authorization" => "Bearer #{token}" }
  end

  def jwt_secret
    Rails.application.secrets.secret_key_base || Rails.application.secret_key_base
  end
end
