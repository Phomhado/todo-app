class ApplicationController < ActionController::API
    before_action :authorize_request

    private

    def authorize_request
        header = request.headers['Authorization']
        token = header.to_s.match(/\ABearer (\S+)\z/i)&.captures&.first

        begin
            decoded = JWT.decode(token, Rails.application.secret_key_base, true, algorithm: 'HS256')[0]
            @current_user = User.find(decoded['user_id'])
            rescue JWT::DecodeError, ActiveRecord::RecordNotFound
            render json: { errors: 'Unauthorized' }, status: :unauthorized
        end
    end
end
