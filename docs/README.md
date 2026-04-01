# 🎓 Student Buddy

> A role-based Learning + Mentorship + AI Assistant platform built with the MERN Stack.

---

## 📌 What is Student Buddy?

Student Buddy is a full-stack web platform where:
- **Students** can discover notes, book mentors, chat, and ask AI study questions
- **Mentors** can manage students, upload notes, and track sessions
- **Admins** can verify and approve mentor registrations

---

## 🧱 Tech Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Frontend    | React.js, React Router, Tailwind CSS, Axios |
| Backend     | Node.js, Express.js                     |
| Database    | MongoDB + Mongoose                      |
| Auth        | JWT (JSON Web Token) — Role-based       |
| File Upload | Multer + Cloudinary (PDF storage)       |
| Real-time   | Socket.io                               |
| OTP         | Nodemailer (Gmail SMTP)                 |
| AI          | OpenAI API                              |

---

## 👥 Roles

| Role    | Access                                          |
|---------|-------------------------------------------------|
| Student | Dashboard, Notes, Mentor booking, Chat, Ask AI  |
| Mentor  | Dashboard, Students, Upload Notes, Chat         |
| Admin   | Approve / Reject mentor registrations           |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- Cloudinary account
- Gmail account (for OTP)
- OpenAI API key

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/student-buddy.git
cd student-buddy

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Environment Setup
- Copy `.env.example` to `.env` in `/server`
- Fill all required values (see `TECH_STACK.md` for details)

### Run Development

```bash
# Run backend (from /server)
npm run dev

# Run frontend (from /client)
npm start
```

---

## 📁 Folder Structure

See `FOLDER_STRUCTURE.md` for the complete breakdown.

---

## 📖 Documentation Index

| File                  | Purpose                                      |
|-----------------------|----------------------------------------------|
| `README.md`           | Project overview and setup guide             |
| `AI_CONTEXT.md`       | Full context for AI tools (Antigravity, etc.)|
| `PROJECT_FLOW.md`     | All user flows and business logic            |
| `SCHEMA.md`           | MongoDB schemas and field definitions        |
| `API_DOCS.md`         | All API endpoints with methods and payloads  |
| `FOLDER_STRUCTURE.md` | Complete project folder breakdown            |
| `TECH_STACK.md`       | Tech details, env vars, library versions     |
| `BUSINESS_RULES.md`   | All business rules and edge cases            |
| `PROGRESS_TRACKER.md` | What is built ✅ and what is pending ⏳       |
| `CHANGELOG.md`        | All changes made across development sessions |

---

## 🏗️ Build Status

See `PROGRESS_TRACKER.md` for live status.

---

## 📜 License

MIT
