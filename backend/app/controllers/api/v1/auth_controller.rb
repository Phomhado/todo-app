require 'jwt'

module Api
    module V1
        class AuthController < ApplicationController
            skip_before_action :authorize_request

            def login
                email = params[:email]
                password = params[:password]
                user = User.find_by(email: email.to_s.strip.downcase)
                if user&.authenticate(password)
                    token = JWT.encode({ user_id: user.id, exp: 24.hours.from_now.to_i }, Rails.application.secret_key_base, 'HS256')
                    render json: { 
                        message: 'Login successful',
                        token: token,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email
                        }
                    }, status: :ok
                else
                    render json: { error: 'Invalid email or password' }, status: :unauthorized
                end
            end
        end
    end
end
