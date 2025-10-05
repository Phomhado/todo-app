class ApplicationController < ActionController::API
  before_action :authorize_request

  private

  def authorize_request
    header = request.headers["Authorization"]
    return render json: { errors: "Missing Token" }, status: :unauthorized if header.blank?

    token = header.split(" ").last

    begin
      decoded = JWT.decode(
        token,
        Rails.application.secrets.secret_key_base,
        true,
        { algorithm: "HS256", verify_expiration: false }
      )[0]

      @current_user = User.find(decoded['user_id'])


    rescue JWT::ExpiredSignature
      render json: { errors: 'Token has expired' }, status: :unauthorized

    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      render json: { errors: 'Unauthorized' }, status: :unauthorized
    end
  end
end