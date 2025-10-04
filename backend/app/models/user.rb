class User < ApplicationRecord
    has_many :tasks, dependent: :destroy
    has_secure_password

    VALID_PASSWORD_REGEX = /\A(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}\z/

    validates :name, presence: true
    validates :email, presence: true, uniqueness: true
    validates :password, format:
        { with: VALID_PASSWORD_REGEX,
        message: "Must include at least one uppercase letter, one lowercase letter, and one number (min 8 characters)" 
        }, if: -> { password.present? }
end
