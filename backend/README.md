# Backend Documentation

## Overview
This directory contains the backend API for the Todo App, built with Ruby on Rails. It provides endpoints for user authentication, user management, and task management, using JWT for secure authentication.

## Architecture
- **Language:** Ruby 3.3.0
- **Framework:** Rails 7.1.5
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** bcrypt

### Folder Structure (Key Parts)
- `app/controllers/api/v1/` — API controllers for version 1
- `app/models/` — Data models (User, Task)
- `config/routes.rb` — API route definitions

## API Endpoints
All endpoints are prefixed with `/api/v1/`.

### Authentication
- `POST /api/v1/login`
  - **Body:** `{ email, password }`
  - **Response:** JWT token and user info on success

### Users
- `POST /api/v1/users`
  - **Body:** `{ name, email, password }`
  - **Response:** Created user info or validation errors
- `GET /api/v1/users/:id`
  - **Response:** User info or not found error

### Tasks
- `GET /api/v1/tasks`
  - **Response:** List of tasks for the authenticated user
- `POST /api/v1/tasks`
  - **Body:** `{ title, description, due_date, column, done_at }`
  - **Response:** Created task or validation errors
- `GET /api/v1/tasks/:id`
  - **Response:** Task details or not found error
- `PUT/PATCH /api/v1/tasks/:id`
  - **Body:** Any updatable task fields
  - **Response:** Updated task or errors
- `DELETE /api/v1/tasks/:id`
  - **Response:** No content on success or error message

## Models

### User
- **Fields:** `name`, `email`, `password_digest`
- **Validations:**
  - Name: presence
  - Email: presence, uniqueness
  - Password: min 8 chars, at least one uppercase, one lowercase, one number
- **Associations:**
  - Has many tasks
- **Authentication:** Uses `has_secure_password` (bcrypt)

### Task
- **Fields:** `title`, `description`, `due_date`, `column`, `done_at`, `user_id`
- **Associations:**
  - Belongs to user

## Authentication
- Uses JWT for stateless authentication.
- On login, a JWT is issued containing the user ID and expiry (24h).
- Most endpoints require the token in the `Authorization` header.

## Error Handling
- Standard JSON error responses, e.g.:
  - `{ error: 'Invalid email or password' }` (401)
  - `{ errors: [...] }` for validation issues (422)
  - `{ error: 'Task not found' }` (404)

## Notes
- Only users with valid JWT tokens can access task endpoints.
- User creation and login are public endpoints.
- The backend is designed to be used with a separate frontend client.
