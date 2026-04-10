# 📝 CHANGELOG.md — Student Buddy

> Log every significant change made across development sessions.
> This helps AI tools understand what has changed and avoid rewriting existing work.
> Format: `[DATE] — Session N — Description`

---

## How to Use

After each development session, add an entry at the TOP of this file:

```
## [DATE] — Session N

### ✅ Added
- [What new feature/file was created]

### 🔄 Modified
- [What existing file/feature was changed and why]

### 🐛 Fixed
- [What bug was fixed]

### ❌ Removed
- [What was deleted and why]

### 📌 Notes for Next Session
- [What to do next / any blockers]
```

---

## Template Entry

```
## [DD-MM-YYYY] — Session 1

### ✅ Added
- Initial project setup
- server/server.js — Express app with CORS, JSON middleware
- server/config/db.js — MongoDB connection
- server/models/User.js — Full user schema for all roles

### 🔄 Modified
- Nothing yet

### 🐛 Fixed
- Nothing yet

### ❌ Removed
- Nothing yet

### 📌 Notes for Next Session
- Build OTP model and send-otp route next
- Gmail App Password needs to be configured in .env
```

---

> ⬇️ Add new entries below this line (newest at top)

---

## 01-04-2026 — Session 2

### ✅ Added
- `server/Dockerfile` — Multi-stage production Dockerfile (node:20-alpine, non-root user, dumb-init, health check)
- `server/.dockerignore` — Excludes `.env`, `node_modules`, logs, git from Docker image
- `docker-compose.yml` — Full stack: backend + MongoDB 7 container wired via internal Docker DNS (`mongo:27017`), named volumes for data persistence, health checks
- `docker-compose.prod.yml` — Production overrides: always-restart, MongoDB port closed externally, JSON log rotation
- `.env.docker.example` — Template for all Docker env vars (safe to commit)
- `.gitignore` (root) — Prevents `.env.docker` from being committed

### 📌 Notes for Next Session
- Copy `.env.docker.example` → `.env.docker` and fill in real values before running
- Dev:  `docker compose up --build`
- Prod: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build`
- Seed admin inside Docker: `docker compose exec backend node scripts/seedAdmin.js`
- MongoDB data persists in Docker volume `student_buddy_mongo_data`
- Frontend deployment (Vercel) still pending

---

## 28-03-2026 — Session 1


### ✅ Added
**Backend (Complete)**
- `server/server.js` — Express + CORS + Socket.io + all route mounting
- `server/config/db.js` — MongoDB connection (Atlas)
- `server/config/cloudinary.js` — Cloudinary v2 config
- `server/config/openai.js` — OpenAI client instance (user added)
- `server/middlewares/authMiddleware.js` — JWT protect + role authorize
- `server/middlewares/errorHandler.js` — Global error handler
- `server/middlewares/uploadMiddleware.js` — Multer + Cloudinary (PDF, doc, profilePic)
- `server/utils/generateToken.js` — JWT token generator
- `server/utils/sendOTP.js` — Nodemailer OTP sender with styled HTML email
- `server/models/User.js` — Unified user schema (student/mentor/admin) with bcrypt
- `server/models/OTP.js` — OTP with TTL index
- `server/models/Note.js` — Note with Cloudinary URL + fileSize
- `server/models/Mentorship.js` — Booking with status enum
- `server/models/Message.js` — Chat message schema
- All controllers: auth, note, mentor, mentorship, admin, chat, AI
- All routes: auth, notes, mentors, mentorship, admin, chat, AI
- `server/sockets/chatSocket.js` — Socket.io with joinRoom, sendMessage, typing
- `server/scripts/seedAdmin.js` — Admin seed script
- `server/.env` + `.env.example` — All credentials configured

**Frontend (Complete)**
- Vite + React scaffold with Tailwind CSS v4
- `client/index.html` — Inter font, SEO meta tags, 🎓 favicon
- `client/src/index.css` — Full design system (glass cards, buttons, badges, animations)
- `client/src/context/AuthContext.jsx` — Auth state with localStorage persistence
- `client/src/utils/axiosInstance.js` — Axios with JWT interceptor + 401 handler
- `client/src/routes/PrivateRoute.jsx` — Role-based route guard
- All pages: Landing, Login, RegisterStudent, RegisterMentor
- Student pages: Dashboard (with booking modal), MyNotes, MyMentor, MentorDetail, AskAI, Chat
- Mentor pages: Dashboard, Notes, Students, EditProfile
- Admin page: AdminPanel (with stats + pending approval list)
- Components: Navbar, Sidebar, Footer, NoteCard, MentorCard
- `client/src/App.jsx` — All routes wired with PrivateRoute guards

### 🔄 Modified
- `server/controllers/aiController.js` — Switched to use `config/openai.js`
- `server/routes/mentorRoutes.js` — Fixed route ordering (PUT /profile before /:id)

### 📌 Notes for Next Session
- Run `npm run seed:admin` in server/ to create admin account
- Run `npm run dev` in server/ to start backend on :5000
- Run `npm run dev` in client/ to start frontend on :5173
- Test full flow: Landing → Register (OTP) → Login → Dashboard
- Phase 9 (Polish) remaining: loading states, toasts already in ✅

---

<!-- ADD NEW ENTRIES HERE — NEWEST FIRST -->
