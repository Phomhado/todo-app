module Api
  module V1
    class UsersController < ApplicationController
        skip_before_action :authorize_request, only: :create
        
        def create
            user = User.new(user_params)
            if user.save
                render json: { message: 'User created successfully', user: user.as_json(only: [:id, :name, :email]) }, status: :created
            else
                render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
            end
        end

        def show
            user = @current_user if @current_user.id.to_s == params[:id]
            if user
                render json: { user: user.as_json(only: [:id, :name, :email]) }, status: :ok
            else
                render json: { error: 'User not found' }, status: :not_found
            end
        end

        private

        def user_params
            params.require(:user).permit(:name, :email, :password)
        end
    end
  end
end
