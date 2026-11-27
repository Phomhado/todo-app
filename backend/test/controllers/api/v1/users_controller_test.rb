require "test_helper"

class Api::V1::UsersControllerTest < ActionDispatch::IntegrationTest
  test "registration never exposes password digest" do
    post api_v1_users_url, params: { user: { name: "New User", email: "new@example.com", password: "Password1" } }
    assert_response :created
    assert_not JSON.parse(response.body).fetch("user").key?("password_digest")
  end

  test "user details require authentication" do
    get api_v1_user_url(users(:alice))
    assert_response :unauthorized
  end

  test "users cannot read another user's details" do
    token = JWT.encode({ user_id: users(:alice).id }, Rails.application.secret_key_base, "HS256")
    get api_v1_user_url(users(:bob)), headers: { "Authorization" => "Bearer #{token}" }
    assert_response :not_found
  end
end
