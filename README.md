# 🧱 To Do App (Full-Stack)

A simple full-stack Kanban-style task management app, with four fixed columns:

- 📝 To Do  
- 🚧 Doing  
- 🧪 Test  
- ✅ Done

Each task includes:
- title: brief summary
- description: detailed info
- due_date: deadline
- column: current phase
- done_at: completion timestamp (optional)

---

## ⚙️ Tech Stack

### Backend
- Ruby on Rails (API-only mode)
- PostgreSQL

### Frontend
- Next.js (with TypeScript)
- TailwindCSS

---

## 🚀 Getting Started

### Clone the repository

git clone https://github.com/Phomhado/todo-app.git  
cd todo-app

### Start the backend (Rails API)

cd backend  
bundle install  
rails db:create  
rails s -p 3001

### Start the frontend (Next.js)

cd frontend  
npm install  
npm run dev

- Frontend: http://localhost:3000  
- Backend: http://localhost:3001

---

## 🗂️ Project Structure

todo-app/  
├── backend/   # Ruby on Rails API  
├── frontend/  # Next.js app  
├── README.md  
└── .gitignore  

---

## 🛠️ Features In Progress

- [x] Project structure  
- [x] Task model with essential fields  
- [x] RESTful API for tasks  
- [ ] Frontend integration  
- [ ] Authentication  
- [ ] Deployment

---
## 📄 License
MIT — use, fork, and build freely.

## ✨ Author

**Pedro Oliveira**  

