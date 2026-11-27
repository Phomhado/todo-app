class User < ApplicationRecord
    has_many :tasks, dependent: :destroy
    has_secure_password

    before_validation { self.email = email.to_s.strip.downcase }

    VALID_PASSWORD_REGEX = /\A(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}\z/

    validates :name, presence: true
    validates :email, presence: true, uniqueness: { case_sensitive: false }, format: { with: URI::MailTo::EMAIL_REGEXP }
    validates :password, format:
        { with: VALID_PASSWORD_REGEX,
        message: "Must include at least one uppercase letter, one lowercase letter, and one number (min 8 characters)" 
        }, if: -> { password.present? }
end
