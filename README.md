# To Do App

A Rails API and Next.js frontend for a personal Kanban board with To Do, Doing, Test and Done columns. Each account sees only its own tasks. Moving a task to Done records its completion time; moving it back clears it.

This is a local project: the frontend, API, and PostgreSQL database run on your own computer. You do not need a hosted database, cloud account, or paid service. Task data stays in your local PostgreSQL database unless you configure an external database yourself. The frontend dependencies are downloaded during setup.

## Local setup

Prerequisites: Ruby 3.3.0, Bundler, PostgreSQL, and Node.js 22.12 or later.

1. Configure PostgreSQL access with `POSTGRES_USER`, `POSTGRES_PASSWORD`, and optionally `POSTGRES_HOST` and `POSTGRES_PORT`. Create a role with permission to create databases.
2. In `backend`, run `bundle install`, `bundle exec rails db:prepare`, and `bundle exec rails server -b 127.0.0.1 -p 3001`.
3. Create `frontend/.env.local` containing `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`.
4. In `frontend`, run `npm ci` and `npm run dev -- --hostname localhost`. Open http://localhost:3000.

The API accepts requests from `http://localhost:3000` by default. Set `FRONTEND_ORIGINS` to a comma-separated list if your local frontend uses a different origin. PostgreSQL is free to install and run locally; its databases and credentials are managed on your computer.

## Checks

Run `bundle exec rails test` in `backend` with PostgreSQL available. In `frontend`, run `npm test`, `npm run typecheck`, and `npm run build`.

Authentication uses a 24-hour bearer token stored in browser local storage. This setup is intended for local use, not for exposing the project to the public internet.
