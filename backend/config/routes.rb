Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :tasks
      resources :users, only: [:create, :show]
      post "/login", to: "auth#login"
    end
  end
end
