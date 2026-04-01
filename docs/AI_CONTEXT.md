# 🤖 AI_CONTEXT.md — Student Buddy

> This file is the PRIMARY reference for any AI coding tool (Antigravity, GitHub Copilot, Cursor, etc.)
> working on this project. Read this file FIRST before generating any code.
> Keep this file updated after every major change.

---

## 🧠 Project Summary

**Name:** Student Buddy
**Type:** Full-Stack MERN Web Application
**Purpose:** Role-based learning and mentorship platform
**Roles:** Student | Mentor | Admin

---

## 🗂️ Documentation Files (Read These Too)

| File                  | What It Contains                             |
|-----------------------|----------------------------------------------|
| `PROJECT_FLOW.md`     | All user journeys and flows                  |
| `SCHEMA.md`           | MongoDB models and fields                    |
| `API_DOCS.md`         | All backend API endpoints                    |
| `BUSINESS_RULES.md`   | Critical rules that must not be violated     |
| `FOLDER_STRUCTURE.md` | Exact folder and file layout                 |
| `TECH_STACK.md`       | Libraries, versions, env variables           |
| `PROGRESS_TRACKER.md` | What's done and what's next                  |
| `CHANGELOG.md`        | History of changes across sessions           |

---

## ⚡ Current Status

> **Update this section every session before prompting the AI.**

```
Last Updated     : 2026-03-28
Last File Worked : client/src/App.jsx (added all routes)
Last Feature Done: Full project build — all pages, backend, socket, AI
Currently Working: Testing & verification phase
Next Task        : Run servers, test registration flow, seed admin
Blockers         : None — all credentials are set in server/.env
```

---

## 🏗️ Tech Stack (Quick Reference)

```
Frontend  : React.js + React Router + Tailwind CSS + Axios + Socket.io-client
Backend   : Node.js + Express.js
Database  : MongoDB + Mongoose
Auth      : JWT + bcrypt
Upload    : Multer + Cloudinary
Realtime  : Socket.io
OTP       : Nodemailer (Gmail SMTP)
AI        : OpenAI API (gpt-3.5-turbo or gpt-4)
```

---

## 📁 Key Folder Paths

```
/server/models/          ← All Mongoose schemas
/server/controllers/     ← Business logic per feature
/server/routes/          ← Express route definitions
/server/middlewares/     ← Auth guards, file upload, error handler
/server/utils/           ← OTP sender, Cloudinary uploader
/server/config/          ← DB connection, env config
/client/src/pages/       ← One file per page/screen
/client/src/components/  ← Reusable UI components
/client/src/context/     ← AuthContext (JWT + user state)
/client/src/routes/      ← Protected route wrappers
```

---

## 🔐 Auth Flow Summary

1. User registers → OTP sent to email → OTP verified → Account created
2. User logs in → JWT issued → Stored in localStorage
3. Every protected API request sends `Authorization: Bearer <token>`
4. Backend middleware decodes token → attaches `req.user`
5. Role check: `req.user.role` must match the route's allowed role

---

## 👤 User Roles & Their Permissions

| Permission                  | Student | Mentor | Admin |
|-----------------------------|---------|--------|-------|
| View approved mentors        | ✅      | ❌     | ❌    |
| Book a mentor               | ✅      | ❌     | ❌    |
| Upload notes                | ✅      | ✅     | ❌    |
| Download notes              | ✅*     | ✅     | ❌    |
| Chat with mentor/student    | ✅      | ✅     | ❌    |
| Ask AI                      | ✅      | ❌     | ❌    |
| Approve/reject mentors      | ❌      | ❌     | ✅    |
| View student sessions       | ❌      | ✅     | ❌    |

> ✅* = Only if total uploaded notes > 50MB

---

## 🚨 Critical Rules (Never Violate)

1. Mentors are invisible to students until Admin approves them (`isApproved: true`)
2. OTP is only sent during registration — not on login
3. Students can only download notes if their total uploaded notes exceed 50MB
4. Chat is only between a student and their connected mentor (approved mentorship)
5. JWT must include: `{ id, role, fullName }` in payload
6. All file uploads must be PDF only for notes (`mimetype === "application/pdf"`)
7. Mentor registration requires document proof upload
8. Admin is created manually (no public admin registration route)

---

## 🧩 Naming Conventions

```
Files      : camelCase      (e.g., authController.js, NoteCard.jsx)
Folders    : camelCase      (e.g., controllers/, components/)
Components : PascalCase     (e.g., MentorCard, StudentDashboard)
Variables  : camelCase      (e.g., uploadedNotesSize)
Constants  : UPPER_SNAKE    (e.g., JWT_SECRET, MAX_FILE_SIZE)
DB Models  : PascalCase     (e.g., User, Note, Mentorship)
Routes     : kebab-case     (e.g., /api/mentor-requests)
```

---

## 📝 Code Style Rules

- Use `async/await` (not `.then()/.catch()`) everywhere
- Always wrap async controllers in `try/catch`
- Return proper HTTP status codes: 200, 201, 400, 401, 403, 404, 500
- Use a global error handler middleware in Express
- All API responses must follow this structure:

```json
// Success
{ "success": true, "data": { ... }, "message": "Done" }

// Error
{ "success": false, "message": "Error description" }
```

---

## 🔄 How to Use This File With Antigravity

Before starting each session, paste this into Antigravity:

```
"Read AI_CONTEXT.md, PROGRESS_TRACKER.md, and CHANGELOG.md first.
 Then continue from where we left off. Current task: [YOUR TASK HERE]"
```

After each session, update:
- `PROGRESS_TRACKER.md` → mark completed items ✅
- `CHANGELOG.md` → add what was built
- `AI_CONTEXT.md` → update the Current Status block above
