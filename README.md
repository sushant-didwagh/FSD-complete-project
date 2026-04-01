# Student Buddy — MERN Stack Project

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Gmail account with App Password (for OTP)
- OpenAI API key

---

### ⚙️ Setup

**1. Clone the repo**
```bash
git clone <repo-url>
cd Student_Buddy_Final_Project
```

**2. Setup Backend**
```bash
cd server
cp .env.example .env
# Fill in your credentials in .env
npm install
npm run seed:admin    # Creates the first admin account
npm run dev           # Starts on http://localhost:5000
```

**3. Setup Frontend**
```bash
cd client
npm install
npm run dev           # Starts on http://localhost:5173
```

---

### 🔗 Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/login` | Login for all roles |
| `/register/student` | Student registration (OTP) |
| `/register/mentor` | Mentor registration (OTP + doc) |
| `/student/dashboard` | Student dashboard |
| `/mentor/dashboard` | Mentor dashboard |
| `/admin/panel` | Admin panel |

---

### 🧑‍💼 Default Admin
After running `npm run seed:admin`:
- **Email:** admin@studentbuddy.com
- **Password:** Admin@1234
- ⚠️ Change password after first login!

---

### 📦 Tech Stack
- **Frontend:** React 18 + Vite + Tailwind CSS v4 + React Router + Axios + Socket.io-client
- **Backend:** Node.js + Express.js + Socket.io
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcryptjs
- **File Upload:** Multer + Cloudinary
- **OTP:** Nodemailer (Gmail SMTP)
- **AI:** OpenAI GPT-3.5
