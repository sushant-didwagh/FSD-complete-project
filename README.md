# 🎓 Student Buddy — Full-Stack MERN Mentorship Platform

> A role-based learning and mentorship platform for Students, Mentors, and Admins.  
> Built with React, Node.js, Express, MongoDB, Socket.io, and Google Gemini AI.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [System Requirements](#-system-requirements)
- [External Services Required](#-external-services-required)
- [Project Structure](#-project-structure)
- [Running with Docker (Recommended)](#-running-with-docker-recommended)
- [Running without Docker (Local Dev)](#-running-without-docker-local-dev)
- [Environment Variables](#-environment-variables)
- [Default Admin Account](#-default-admin-account)
- [App Routes](#-app-routes)
- [User Roles & Permissions](#-user-roles--permissions)

---

## 📖 Project Overview

**Student Buddy** is a full-stack MERN web application where:
- **Students** can browse mentors, book sessions, upload/download notes, chat in real-time, and ask an AI assistant.
- **Mentors** can manage their profile, view their students, upload notes, and chat.
- **Admins** can approve or reject mentor registrations.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS v4 + React Router v6 |
| **HTTP Client** | Axios (with JWT interceptor) |
| **Real-time** | Socket.io (client + server) |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB 7 + Mongoose 9 |
| **Authentication** | JWT + bcryptjs |
| **File Upload** | Multer + Cloudinary (PDF notes, profile pics, documents) |
| **OTP / Email** | Nodemailer (Gmail SMTP) |
| **AI Assistant** | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| **Containerization** | Docker + Docker Compose |

---

## 💻 System Requirements

### Required Software

| Software | Minimum Version | Download |
|----------|----------------|---------|
| **Node.js** | v18 or higher | [nodejs.org](https://nodejs.org) |
| **npm** | v9 or higher | Comes with Node.js |
| **Docker Desktop** | Latest | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |
| **Git** | Any | [git-scm.com](https://git-scm.com) |

> ✅ **You do NOT need to install MongoDB locally** — Docker runs it as a container.

### Verify your setup

```bash
node --version      # Should show v18+
npm --version       # Should show v9+
docker --version    # Should show Docker version
```

---

## 🌐 External Services Required

You need accounts on these free services before running the project:

### 1. Cloudinary (File Storage)
- Sign up free at [cloudinary.com](https://cloudinary.com)
- Go to your **Dashboard** and copy:
  - `Cloud Name`
  - `API Key`
  - `API Secret`

### 2. Gmail (OTP Emails)
- Use any Gmail account
- Enable **2-Step Verification** on your Google account
- Go to **Google Account → Security → App Passwords**
- Create an App Password for "Mail" → copy the 16-character password
- Use this as `EMAIL_PASS` (NOT your real Gmail password)

### 3. Google Gemini AI (Student AI Assistant)
- Go to [aistudio.google.com](https://aistudio.google.com)
- Click **"Get API Key"** → Create a key (free)
- Copy the API key

---

## 📁 Project Structure

```
FSD-complete-project/
├── client/                   ← React frontend (Vite)
│   ├── src/
│   │   ├── pages/            ← All page components
│   │   ├── components/       ← Reusable UI components
│   │   ├── context/          ← AuthContext (JWT + user state)
│   │   ├── routes/           ← PrivateRoute guards
│   │   └── utils/            ← Axios instance
│   └── package.json
├── server/                   ← Node.js backend (Express)
│   ├── config/               ← DB, Cloudinary, Gemini config
│   ├── controllers/          ← Business logic
│   ├── middlewares/          ← Auth, upload, error handler
│   ├── models/               ← Mongoose schemas
│   ├── routes/               ← Express route definitions
│   ├── sockets/              ← Socket.io chat logic
│   ├── utils/                ← Token generator, OTP sender
│   ├── scripts/              ← seedAdmin.js
│   ├── Dockerfile            ← Backend Docker image
│   ├── .env.example          ← Template for local dev env
│   └── package.json
├── docker-compose.yml        ← Main Docker Compose (backend + MongoDB)
├── docker-compose.prod.yml   ← Production overrides
├── .env.docker.example       ← Template for Docker env
├── .env.docker               ← Your Docker secrets (gitignored)
└── docs/                     ← Project documentation
```

---

## 🐳 Running with Docker (Recommended)

This is the **recommended way** to run the project. Docker automatically handles MongoDB — no local installation needed.

### Prerequisites
- Docker Desktop installed and **running**

### Step 1 — Clone the repository

```bash
git clone <repo-url>
cd FSD-complete-project
```

### Step 2 — Create your Docker environment file

```bash
# Copy the template
copy .env.docker.example .env.docker     # Windows
cp .env.docker.example .env.docker       # Mac/Linux
```

Open `.env.docker` and fill in your real values:

```env
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=StudentBuddy2026!    # Keep this or choose your own

PORT=5000
NODE_ENV=production

JWT_SECRET=any_long_random_string_minimum_32_characters
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password

GEMINI_API_KEY=your_gemini_api_key

CLIENT_URL=http://localhost:5173
```

### Step 3 — Install frontend dependencies

```bash
cd client
npm install
cd ..
```

### Step 4 — Start Backend + MongoDB with Docker

Open **Terminal 1** — from the project root:

```bash
docker compose up --build
```

Wait until you see both of these lines:
```
student_buddy_backend  | ✅ MongoDB Connected: mongo
student_buddy_backend  | 🚀 Student Buddy Server running on port 5000
```

### Step 5 — Seed the Admin account (first time only)

Open **Terminal 2** — from the project root:

```bash
docker compose exec backend node scripts/seedAdmin.js
```

### Step 6 — Start the Frontend

In **Terminal 2** — from the project root:

```bash
cd client
npm run dev
```

### Step 7 — Open the App

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:5000 |
| **Health Check** | http://localhost:5000/api/health |

---

## 🛠️ Running without Docker (Local Dev)

Use this only if you want hot-reload development and have MongoDB installed locally, or use Docker only for MongoDB.

### Option A — Docker for MongoDB only

**Terminal 1 — Start only MongoDB:**
```bash
docker compose up mongo
```

**Update `server/.env`:**
```
MONGO_URI=mongodb://admin:StudentBuddy2026!@localhost:27017/student_buddy?authSource=admin
```

**Terminal 2 — Start backend:**
```bash
cd server
npm install
npm run dev
```

**Terminal 3 — Start frontend:**
```bash
cd client
npm install
npm run dev
```

### Option B — Local MongoDB installed

```bash
# server/.env
MONGO_URI=mongodb://localhost:27017/student_buddy
```

Then follow same steps as Option A but skip `docker compose up mongo`.

---

## 🔐 Environment Variables

### `.env.docker` (for Docker — project root)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_ROOT_USER` | MongoDB container username | `admin` |
| `MONGO_ROOT_PASSWORD` | MongoDB container password | `StudentBuddy2026!` |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment | `production` |
| `JWT_SECRET` | Secret for signing JWT tokens | Any long random string |
| `JWT_EXPIRE` | JWT expiry duration | `7d` |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard | `mycloud` |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard | `123456789` |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard | `abc123xyz` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Your Gmail address | `you@gmail.com` |
| `EMAIL_PASS` | Gmail 16-char App Password | `abcd efgh ijkl mnop` |
| `GEMINI_API_KEY` | Google Gemini AI key | `AIza...` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

> ⚠️ `MONGO_URI` is **NOT needed** in `.env.docker` — Docker Compose builds it automatically.

---

## 🧑‍💼 Default Admin Account

After running the seed script:

| Field | Value |
|-------|-------|
| **Email** | `admin@studentbuddy.com` |
| **Password** | `Admin@1234` |

> ⚠️ Change this password after your first login!

---

## 🗺️ App Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Login for all roles |
| `/register/student` | Public | Student registration with OTP |
| `/register/mentor` | Public | Mentor registration with OTP + document |
| `/student/dashboard` | Student | Student home dashboard |
| `/student/notes` | Student | Browse and upload notes |
| `/student/mentor` | Student | View and book mentors |
| `/student/chat` | Student | Real-time chat with mentor |
| `/student/ask-ai` | Student | AI study assistant (Gemini) |
| `/mentor/dashboard` | Mentor | Mentor home dashboard |
| `/mentor/notes` | Mentor | Upload notes for students |
| `/mentor/students` | Mentor | View connected students |
| `/mentor/edit-profile` | Mentor | Edit mentor profile |
| `/mentor/chat` | Mentor | Real-time chat with student |
| `/admin/panel` | Admin | Approve / reject mentor registrations |

---

## 👤 User Roles & Permissions

| Feature | Student | Mentor | Admin |
|---------|---------|--------|-------|
| View approved mentors | ✅ | ❌ | ❌ |
| Book a mentor | ✅ | ❌ | ❌ |
| Upload notes | ✅ | ✅ | ❌ |
| Download notes | ✅* | ✅ | ❌ |
| Real-time chat | ✅ | ✅ | ❌ |
| Ask AI assistant | ✅ | ❌ | ❌ |
| Approve/reject mentors | ❌ | ❌ | ✅ |

> ✅* Students can only download notes if their total uploaded notes exceed **50MB**.

---

## 🐳 Docker Commands Reference

```bash
# Start all services (first time or after changes)
docker compose up --build

# Start all services (subsequent runs)
docker compose up

# Start in background (detached)
docker compose up -d

# Stop all containers
docker compose down

# Stop and delete all data (⚠️ deletes MongoDB data)
docker compose down -v

# View backend logs
docker compose logs -f backend

# Seed admin account
docker compose exec backend node scripts/seedAdmin.js

# Production mode
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```
