# 📡 API_DOCS.md — Student Buddy

> All backend API endpoints. Use these exact routes in Express and Axios calls.
> Base URL: `http://localhost:5000/api`

---

## 🔐 Auth Routes — `/api/auth`

### POST `/api/auth/send-otp`
Send OTP to email during registration.
```json
// Request Body
{ "email": "student@gmail.com" }

// Response 200
{ "success": true, "message": "OTP sent to email" }
```

---

### POST `/api/auth/verify-otp`
Verify OTP entered by user.
```json
// Request Body
{ "email": "student@gmail.com", "otp": "482910" }

// Response 200
{ "success": true, "message": "OTP verified" }

// Response 400
{ "success": false, "message": "Invalid or expired OTP" }
```

---

### POST `/api/auth/register/student`
Register a new student (after OTP verified).
```json
// Request Body
{
  "fullName": "Rahul Sharma",
  "email": "rahul@gmail.com",
  "password": "Test@1234",
  "university": "Pune University",
  "admissionYear": 2022,
  "passingYear": 2026
}

// Response 201
{ "success": true, "token": "jwt_token_here", "user": { "id", "fullName", "role" } }
```

---

### POST `/api/auth/register/mentor`
Register a new mentor (multipart/form-data for document upload).
```
// Form Data
fullName, email, password, subjects (JSON array), experience,
university, address, documentProof (file: PDF or image)

// Response 201
{ "success": true, "message": "Registration submitted. Awaiting admin approval." }
```

---

### POST `/api/auth/login`
Login for all roles.
```json
// Request Body
{ "email": "user@gmail.com", "password": "Test@1234" }

// Response 200
{
  "success": true,
  "token": "jwt_token_here",
  "user": { "id", "fullName", "role", "isApproved" }
}

// Response 401
{ "success": false, "message": "Invalid email or password" }
```

---

### GET `/api/auth/me` 🔒 Protected
Get current logged-in user profile.
```json
// Headers: Authorization: Bearer <token>

// Response 200
{ "success": true, "data": { ...userObject } }
```

---

## 📄 Notes Routes — `/api/notes`

### POST `/api/notes/upload` 🔒 Student | Mentor
Upload a new note (multipart/form-data).
```
// Form Data
title     : "Physics Chapter 3"
subject   : "Physics"
pdfFile   : [file — PDF only]

// Response 201
{ "success": true, "data": { noteObject } }

// Response 400 (wrong file type)
{ "success": false, "message": "Only PDF files are allowed." }
```

---

### GET `/api/notes` 🔒 Student | Mentor
Get all notes with optional filters.
```
// Query Params
?search=physics
?subject=Math
?page=1&limit=10

// Response 200
{ "success": true, "data": [ ...notes ], "total": 50 }
```

---

### GET `/api/notes/:id` 🔒 Protected
Get a single note by ID.
```json
// Response 200
{ "success": true, "data": { noteObject } }
```

---

### GET `/api/notes/:id/download` 🔒 Student
Download a note PDF. Checks 50MB upload rule.
```json
// Response 200 → returns Cloudinary PDF URL for download

// Response 403 (upload rule not met)
{
  "success": false,
  "message": "Upload notes to unlock download access",
  "uploadedSize": 12.5,
  "required": 50
}
```

---

### DELETE `/api/notes/:id` 🔒 Owner only
Delete own note.
```json
// Response 200
{ "success": true, "message": "Note deleted" }
```

---

## 👨‍🏫 Mentor Routes — `/api/mentors`

### GET `/api/mentors` 🔒 Student
Get all approved mentors (sorted by rating).
```
// Query Params
?subject=Math
?page=1&limit=6

// Response 200
{ "success": true, "data": [ ...mentors ] }
```

---

### GET `/api/mentors/:id` 🔒 Student
Get single mentor detail.
```json
// Response 200
{ "success": true, "data": { mentorObject } }
```

---

### PUT `/api/mentors/profile` 🔒 Mentor
Update mentor's own profile.
```json
// Request Body (any updatable fields)
{ "subjects": ["Math", "Physics"], "charges": 2000, "address": "Pune" }

// Response 200
{ "success": true, "data": { updatedUser } }
```

---

## 📅 Mentorship Routes — `/api/mentorship`

### POST `/api/mentorship/request` 🔒 Student
Student sends booking request to a mentor.
```json
// Request Body
{
  "mentorId": "mentor_object_id",
  "subject": "Mathematics",
  "month": "April 2025",
  "timeSlot": "Mon/Wed 6–7 PM"
}

// Response 201
{ "success": true, "data": { mentorshipObject } }
```

---

### GET `/api/mentorship/my` 🔒 Student
Get student's all mentorship records.
```json
// Response 200
{
  "success": true,
  "data": {
    "current": [...],   // status = approved
    "requested": [...], // status = pending
    "history": [...]    // status = completed or rejected
  }
}
```

---

### GET `/api/mentorship/requests` 🔒 Mentor
Get all incoming requests for mentor.
```json
// Response 200
{ "success": true, "data": [ ...mentorships ] }
```

---

### PUT `/api/mentorship/:id/status` 🔒 Mentor
Update mentorship status.
```json
// Request Body
{ "status": "approved" }  // or "rejected" or "completed"

// Response 200
{ "success": true, "data": { updatedMentorship } }
```

---

## 🛠️ Admin Routes — `/api/admin`

### GET `/api/admin/mentors/pending` 🔒 Admin
Get all pending mentor registrations.
```json
// Response 200
{ "success": true, "data": [ ...pendingMentors ] }
```

---

### PUT `/api/admin/mentors/:id/approve` 🔒 Admin
Approve a mentor account.
```json
// Response 200
{ "success": true, "message": "Mentor approved" }
```

---

### PUT `/api/admin/mentors/:id/reject` 🔒 Admin
Reject a mentor account.
```json
// Response 200
{ "success": true, "message": "Mentor rejected" }
```

---

## 💬 Chat Routes — `/api/chat`

### GET `/api/chat/:userId` 🔒 Student | Mentor
Get full chat history with a specific user.
```json
// Response 200
{ "success": true, "data": [ ...messages ] }
```

### POST `/api/chat/send` 🔒 Student | Mentor
Save a message to DB (also emit via Socket.io).
```json
// Request Body
{ "receiverId": "user_id", "message": "Hello!" }

// Response 201
{ "success": true, "data": { messageObject } }
```

---

## 🤖 AI Route — `/api/ai`

### POST `/api/ai/ask` 🔒 Student
Ask AI a study question.
```json
// Request Body
{ "question": "Explain Newton's second law of motion" }

// Response 200
{ "success": true, "answer": "Newton's second law states that..." }
```

---

## ⚠️ Standard Error Responses

| Status | Meaning                         |
|--------|---------------------------------|
| 400    | Bad request / validation error  |
| 401    | Not authenticated (no/bad token)|
| 403    | Forbidden (wrong role)          |
| 404    | Resource not found              |
| 500    | Internal server error           |

```json
// All errors follow this format:
{ "success": false, "message": "Human-readable error message" }
```