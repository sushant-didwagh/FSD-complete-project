# 📁 FOLDER_STRUCTURE.md — Student Buddy

> The exact folder and file layout for the entire project.
> AI tools must create files in these exact locations.

---

```
student-buddy/
│
├── 📄 README.md
├── 📄 .gitignore
│
├── 📁 docs/                          ← All documentation files live here
│   ├── AI_CONTEXT.md
│   ├── PROJECT_FLOW.md
│   ├── SCHEMA.md
│   ├── API_DOCS.md
│   ├── FOLDER_STRUCTURE.md
│   ├── TECH_STACK.md
│   ├── BUSINESS_RULES.md
│   ├── PROGRESS_TRACKER.md
│   └── CHANGELOG.md
│
├── 📁 server/                        ← Node.js + Express backend
│   ├── 📄 server.js                  ← Entry point (Express app + Socket.io)
│   ├── 📄 .env                       ← Environment variables (never commit)
│   ├── 📄 .env.example               ← Template for env variables
│   ├── 📄 package.json
│   │
│   ├── 📁 config/
│   │   ├── db.js                     ← MongoDB connection
│   │   └── cloudinary.js             ← Cloudinary setup
│   │
│   ├── 📁 models/
│   │   ├── User.js                   ← User schema (all roles)
│   │   ├── Note.js                   ← Note schema (PDF upload)
│   │   ├── Mentorship.js             ← Booking/mentorship schema
│   │   ├── Message.js                ← Chat message schema
│   │   └── OTP.js                    ← OTP schema (TTL auto-delete)
│   │
│   ├── 📁 controllers/
│   │   ├── authController.js         ← register, login, OTP logic
│   │   ├── noteController.js         ← upload, list, download, delete
│   │   ├── mentorController.js       ← list mentors, get profile, update
│   │   ├── mentorshipController.js   ← request, approve, reject, complete
│   │   ├── adminController.js        ← pending list, approve, reject
│   │   ├── chatController.js         ← get history, save message
│   │   └── aiController.js           ← OpenAI API call
│   │
│   ├── 📁 routes/
│   │   ├── authRoutes.js
│   │   ├── noteRoutes.js
│   │   ├── mentorRoutes.js
│   │   ├── mentorshipRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── chatRoutes.js
│   │   └── aiRoutes.js
│   │
│   ├── 📁 middlewares/
│   │   ├── protect.js                ← JWT verification → req.user
│   │   ├── authorize.js              ← Role-based access control
│   │   ├── uploadMiddleware.js       ← Multer config (PDF + images)
│   │   └── errorHandler.js           ← Global error handler
│   │
│   ├── 📁 utils/
│   │   ├── sendOTP.js                ← Nodemailer OTP email
│   │   ├── sendEmail.js              ← Generic email utility
│   │   ├── uploadToCloudinary.js     ← Cloudinary upload helper
│   │   └── generateToken.js         ← JWT sign utility
│   │
│   └── 📁 sockets/
│       └── chatSocket.js             ← Socket.io event handlers
│
└── 📁 client/                        ← React.js frontend
    ├── 📄 package.json
    ├── 📄 tailwind.config.js
    ├── 📄 .env                       ← REACT_APP_ variables
    │
    └── 📁 src/
        ├── 📄 App.jsx                ← Root component + route setup
        ├── 📄 index.js               ← ReactDOM render
        │
        ├── 📁 context/
        │   └── AuthContext.jsx       ← JWT + user state (login, logout, user)
        │
        ├── 📁 routes/
        │   ├── PrivateRoute.jsx      ← Protect routes by auth + role
        │   └── RoleRoute.jsx         ← Redirect if wrong role
        │
        ├── 📁 pages/
        │   ├── 📁 public/
        │   │   ├── LandingPage.jsx
        │   │   ├── LoginPage.jsx
        │   │   ├── StudentRegister.jsx
        │   │   └── MentorRegister.jsx
        │   │
        │   ├── 📁 student/
        │   │   ├── StudentDashboard.jsx
        │   │   ├── MyNotes.jsx
        │   │   ├── MyMentor.jsx
        │   │   ├── MentorDetail.jsx
        │   │   ├── ChatPage.jsx
        │   │   └── AskAI.jsx
        │   │
        │   ├── 📁 mentor/
        │   │   ├── MentorDashboard.jsx
        │   │   ├── MentorStudents.jsx
        │   │   ├── MentorNotes.jsx
        │   │   ├── MentorProfile.jsx
        │   │   └── ChatPage.jsx
        │   │
        │   └── 📁 admin/
        │       └── AdminPanel.jsx
        │
        ├── 📁 components/
        │   ├── 📁 shared/
        │   │   ├── Navbar.jsx
        │   │   ├── Sidebar.jsx
        │   │   ├── Footer.jsx
        │   │   ├── Loader.jsx
        │   │   ├── Toast.jsx
        │   │   └── Modal.jsx
        │   │
        │   ├── 📁 notes/
        │   │   ├── NoteCard.jsx
        │   │   ├── NoteUploadModal.jsx
        │   │   └── NoteFilter.jsx
        │   │
        │   ├── 📁 mentors/
        │   │   ├── MentorCard.jsx
        │   │   └── BookingForm.jsx
        │   │
        │   ├── 📁 chat/
        │   │   ├── ChatWindow.jsx
        │   │   └── MessageBubble.jsx
        │   │
        │   └── 📁 admin/
        │       └── MentorApprovalCard.jsx
        │
        ├── 📁 hooks/
        │   ├── useAuth.js            ← Access AuthContext easily
        │   ├── useSocket.js          ← Socket.io connection hook
        │   └── useNotes.js           ← Note fetch + filter logic
        │
        ├── 📁 services/              ← All Axios API call functions
        │   ├── authService.js
        │   ├── noteService.js
        │   ├── mentorService.js
        │   ├── mentorshipService.js
        │   ├── chatService.js
        │   └── aiService.js
        │
        └── 📁 utils/
            ├── axiosInstance.js      ← Axios with base URL + auth header
            ├── formatDate.js
            └── calculateFileSize.js
```

---

## 📌 Key File Responsibilities

| File                          | Responsibility                                    |
|-------------------------------|---------------------------------------------------|
| `server/server.js`            | Start Express, Socket.io, connect MongoDB         |
| `middlewares/protect.js`      | Verify JWT, attach req.user                       |
| `middlewares/authorize.js`    | Check req.user.role against allowed roles         |
| `middlewares/uploadMiddleware.js` | Multer: accept PDF + images, reject others   |
| `utils/sendOTP.js`            | Generate 6-digit OTP, email it via Nodemailer     |
| `sockets/chatSocket.js`       | Handle joinRoom, sendMessage socket events        |
| `context/AuthContext.jsx`     | Store JWT + user in state, expose login/logout    |
| `routes/PrivateRoute.jsx`     | Redirect to /login if no token                    |
| `services/axiosInstance.js`   | Auto-attach Authorization header to all requests  |
