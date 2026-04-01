# 📋 BUSINESS_RULES.md — Student Buddy

> These are the non-negotiable rules of the platform.
> Every feature must respect these rules. Never code around them.

---

## 🔐 Authentication Rules

| # | Rule |
|---|------|
| BR-01 | OTP is ONLY sent during registration — never during login |
| BR-02 | OTP expires in 10 minutes after generation |
| BR-03 | JWT payload must include: `{ id, role, fullName }` |
| BR-04 | JWT expires in 7 days |
| BR-05 | Passwords must be hashed using bcrypt (minimum 10 salt rounds) |
| BR-06 | Admin accounts are created manually — no public admin registration |
| BR-07 | A user can only be ONE role (student OR mentor OR admin) |

---

## 👨‍🏫 Mentor Visibility Rules

| # | Rule |
|---|------|
| BR-08 | Mentors are INVISIBLE to students until Admin sets `isApproved: true` |
| BR-09 | `/api/mentors` only returns users with `role: mentor` AND `isApproved: true` |
| BR-10 | Mentor cannot log in if `isApproved: false`? → NO — they CAN log in, but students just can't see them |
| BR-11 | When admin approves → send email to mentor: "Your profile is live!" |
| BR-12 | When admin rejects → send email to mentor: "Your registration was rejected." |

---

## 📄 Notes & Download Rules

| # | Rule |
|---|------|
| BR-13 | Only PDF files are accepted for note uploads (`mimetype === "application/pdf"`) |
| BR-14 | All other file types must be rejected with: "Only PDF files are allowed." |
| BR-15 | File size is auto-calculated on upload and saved to the Note document |
| BR-16 | Students CANNOT download notes unless their total uploaded size > 50MB |
| BR-17 | When download is blocked → show: "Upload notes to unlock download access" |
| BR-18 | Mentors CAN download any notes without restriction |
| BR-19 | Notes uploaded by mentors are visible to all students |
| BR-20 | Students can only delete their own notes |

---

## 📅 Mentorship Booking Rules

| # | Rule |
|---|------|
| BR-21 | A student can request the same mentor only ONCE per month per subject |
| BR-22 | Mentor must explicitly approve before the status changes from `pending` |
| BR-23 | Chat button is shown ONLY when mentorship status = `approved` |
| BR-24 | Only the mentor can change status: pending → approved/rejected, approved → completed |
| BR-25 | Completed mentorships move to History — they cannot be reopened |

---

## 💬 Chat Rules

| # | Rule |
|---|------|
| BR-26 | Chat is only allowed between a student and a mentor with an `approved` mentorship |
| BR-27 | Chat history must be persisted to MongoDB (not just in-memory Socket.io) |
| BR-28 | Messages are shown in chronological order (oldest first) |

---

## 🤖 AI Rules

| # | Rule |
|---|------|
| BR-29 | Only students can access the Ask AI feature |
| BR-30 | AI questions must be study-related (no system prompt bypass) |
| BR-31 | AI system prompt must include: "You are a student study assistant. Only answer academic and educational questions." |

---

## 🛡️ Security Rules

| # | Rule |
|---|------|
| BR-32 | All API routes (except login, register, send-otp, verify-otp) must be protected with JWT middleware |
| BR-33 | Role-based authorization must be applied: admin routes only for admin, etc. |
| BR-34 | Never expose passwords in API responses — always use `.select('-password')` |
| BR-35 | Never commit `.env` file to Git — always use `.env.example` |
| BR-36 | CORS must be configured to allow only the frontend origin in production |

---

## 🖥️ UI/UX Rules

| # | Rule |
|---|------|
| BR-37 | Every page must show a loading spinner while fetching data |
| BR-38 | Every error must show a toast notification (not just console.error) |
| BR-39 | Empty states must show friendly messages ("No notes found", "No mentors yet") |
| BR-40 | Navbar must show the user's Full Name (not email) |
| BR-41 | Profile name in navbar comes from JWT payload `fullName` — no extra API call needed |
| BR-42 | All forms must have client-side validation before submitting to the server |
