# 🔄 PROJECT_FLOW.md — Student Buddy

> All user journeys, screen flows, and feature logic documented here.
> AI tools must follow these flows exactly when building pages and features.

---

## 🌐 Global Flow

```
Landing Page (/)
│
├── Register
│   ├── /register/student  → Student Registration Form
│   └── /register/mentor   → Mentor Registration Form
│
└── Login (/login)
    ├── role = student → /student/dashboard
    ├── role = mentor  → /mentor/dashboard
    └── role = admin   → /admin/panel
```

---

## 🔐 Registration Flow (Both Roles)

```
Step 1: User fills registration form
Step 2: Clicks "Send OTP"
Step 3: OTP sent to entered email (Nodemailer)
Step 4: User enters 6-digit OTP
Step 5: OTP verified on backend
Step 6: If valid → account created → JWT issued → redirect to dashboard
Step 7: If invalid OTP → show error "Invalid or expired OTP"
```

> ⚠️ OTP expires in 10 minutes. Resend option available after 60 seconds.

---

## 🔐 Login Flow

```
Step 1: User enters email + password
Step 2: Backend validates credentials
Step 3: If valid → JWT returned → stored in localStorage
Step 4: Frontend reads role from JWT payload
Step 5: Redirect based on role (student/mentor/admin)
Step 6: If invalid → show "Invalid email or password"
```

---

## 👨‍🎓 Student Flow

### Dashboard
```
/student/dashboard
│
├── Navbar: Search Notes | Mentors | [Full Name] | Logout
│
├── Sidebar:
│   ├── My Notes           → /student/notes
│   ├── My Mentor          → /student/my-mentor
│   ├── Ask AI             → /student/ask-ai
│   └── Upload New Note    → opens upload modal
│
└── Main Area:
    ├── Hero Section       → promotional banner
    ├── Notes Section      → 5-6 note cards (filtered)
    └── Mentor Section     → 5-6 mentor cards (sorted by rating)
```

---

### Note Search & Download Flow

```
Student types in search bar
    → Debounced API call to GET /api/notes?search=keyword&subject=subject
    → Notes filtered by keyword (title/subject match)
    → Results shown as cards

Student clicks "Download":
    → Frontend checks: student's totalUploadedSize > 50MB?
        YES → trigger PDF download (GET /api/notes/:id/download)
        NO  → show modal: "Upload notes to unlock download access"
              Button: "Upload Note Now"
```

---

### Note Upload Flow

```
Student clicks "Upload New Note"
    → Modal opens with form:
        - Title (text input)
        - Subject (text input or dropdown)
        - PDF File (file input — PDF only)
    → On submit:
        → Multer picks up file
        → Cloudinary upload → returns URL
        → Note saved to DB (title, subject, pdfFile URL, fileSize, uploadedBy)
        → Student's total upload size updated
        → Success toast: "Note uploaded successfully!"
```

---

### Mentor Browse & Booking Flow

```
Student visits Mentor Section or /mentors
    → GET /api/mentors (only approved mentors)
    → Cards shown: Photo, Subject, Experience, Charges, Rating

Student clicks a Mentor Card
    → /mentor/:id → Mentor Detail Page
    → Shows: full bio, subjects, schedule availability

Student fills booking form:
    - Subject (dropdown from mentor's subjects)
    - Month
    - Time Slot (from mentor's availability)
    → POST /api/mentorship/request
    → Mentorship created with status: "pending"
    → Toast: "Request sent! Waiting for mentor approval."
```

---

### My Mentor Page Flow

```
/student/my-mentor
│
├── Current Mentors     → status = "approved"
├── Requested Mentors   → status = "pending"
└── History             → status = "completed" or "rejected"

Each card shows:
    - Mentor name, subject, schedule
    - Status badge (Pending / Approved / Completed)
    - Chat button (only if status = "approved")
```

---

### Chat Flow (Student Side)

```
Student clicks "Chat" on approved mentor card
    → /student/chat/:mentorId
    → Socket.io connection established
    → joinRoom event emitted with { userId: studentId }
    → Chat history loaded from GET /api/chat/:mentorId
    → Student types → sendMessage event → server broadcasts to mentor
    → Real-time messages appear instantly
```

---

### Ask AI Flow

```
/student/ask-ai
    → Student types a study question
    → POST /api/ai/ask { question: "..." }
    → Backend calls OpenAI API
    → Response streamed or returned
    → Displayed in chat-style UI
    → Previous Q&A shown in session history
```

---

## 👨‍🏫 Mentor Flow

### Dashboard
```
/mentor/dashboard
│
├── Navbar: Home | [Full Name] | Logout
│
├── Sidebar:
│   ├── Students     → /mentor/students
│   ├── Edit Profile → /mentor/profile
│   └── Upload Notes → /mentor/notes
│
└── Main Area:
    ├── Hero: Today's sessions list (Student Name + Time)
    └── Students Section: active student cards
```

---

### Mentor Approval Flow (Admin → Mentor)

```
Mentor registers → status: "pending" (not visible to students)
Admin reviews documents
    IF approved → isApproved: true → visible to students
    IF rejected → isApproved: false → email sent to mentor
```
### Mentor Managing Requests

```
/mentor/students
    → GET /api/mentorship/requests (mentor's incoming requests)
    → Shows: Student Name, Subject, Month, Time Slot, Status

Mentor clicks "Approve" → PUT /api/mentorship/:id/status { status: "approved" }
Mentor clicks "Reject"  → PUT /api/mentorship/:id/status { status: "rejected" }
Mentor clicks "Complete"→ PUT /api/mentorship/:id/status { status: "completed" }
```

---

### Mentor Upload Notes Flow

```
/mentor/notes
    → Same upload flow as student
    → PDF only, Multer + Cloudinary
    → Uploaded notes visible to all students
```

---

## 🛠️ Admin Flow

```
/admin/panel
│
└── Pending Mentors List
    → GET /api/admin/mentors/pending
    → Each card: Full Name, Email, Subjects, Experience, Document Proof link

Admin clicks "View Document" → opens Cloudinary PDF in new tab
Admin clicks "Approve"       → PUT /api/admin/mentors/:id/approve
                               → isApproved = true
                               → Email sent to mentor: "Your account is approved!"
Admin clicks "Reject"        → PUT /api/admin/mentors/:id/reject
                               → isApproved = false
                               → Email sent to mentor: "Your account was rejected."
```

---

## 🔒 Route Protection Flow

```
Frontend:
    Protected routes wrapped in <PrivateRoute role="student|mentor|admin" />
    If no token → redirect to /login
    If wrong role → redirect to /unauthorized

Backend:
    middleware/protect.js     → verify JWT → attach req.user
    middleware/authorize.js   → check req.user.role matches allowed roles
    Usage: router.get("/", protect, authorize("admin"), handler)
```
