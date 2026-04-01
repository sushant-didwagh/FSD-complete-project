# 🗄️ SCHEMA.md — Student Buddy

> All MongoDB Mongoose schemas defined here.
> Use these EXACT field names in models, controllers, and API responses.

---

## 📁 User Model (`/server/models/User.js`)

```js
{
  // Common Fields (all roles)
  fullName     : { type: String, required: true, trim: true },
  email        : { type: String, required: true, unique: true, lowercase: true },
  password     : { type: String, required: true },            // bcrypt hashed
  role         : { type: String, enum: ['student', 'mentor', 'admin'], required: true },
  profilePic   : { type: String, default: '' },               // Cloudinary URL

  // Student-only Fields
  university   : { type: String },
  admissionYear: { type: Number },
  passingYear  : { type: Number },

  // Mentor-only Fields
  subjects     : [{ type: String }],                          // e.g. ["Math", "Physics"]
  experience   : { type: Number },                            // years
  address      : { type: String },
  documentProof: { type: String },                            // Cloudinary URL (PDF/Image)
  isApproved   : { type: Boolean, default: false },           // Admin sets this
  charges      : { type: Number, default: 0 },                // per month fee
  rating       : { type: Number, default: 0 },
  reviews      : [
    {
      userId   : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      comment  : { type: String },
      rating   : { type: Number, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now }
    }
  ],

  createdAt    : { type: Date, default: Date.now }
}
```

---

## 📁 Note Model (`/server/models/Note.js`)

```js
{
  title            : { type: String, required: true, trim: true },
  subject          : { type: String, required: true },
  pdfFile          : { type: String, required: true },        // Cloudinary URL (PDF upload required)
  originalFileName : { type: String },                        // e.g. "physics_notes.pdf"
  fileSize         : { type: Number, required: true },        // in MB (auto-calculated)
  uploadedBy       : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt        : { type: Date, default: Date.now }
}
```

> ⚠️ `pdfFile` is ALWAYS set from a real file upload (Multer → Cloudinary).
> Never allow manual URL input for this field.
> Accept only `mimetype === "application/pdf"`. Reject all others.

---

## 📁 Mentorship Model (`/server/models/Mentorship.js`)

```js
{
  studentId : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId  : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject   : { type: String, required: true },
  month     : { type: String, required: true },               // e.g. "April 2025"
  timeSlot  : { type: String, required: true },               // e.g. "Mon/Wed 6-7 PM"
  status    : {
    type    : String,
    enum    : ['pending', 'approved', 'completed', 'rejected'],
    default : 'pending'
  },
  createdAt : { type: Date, default: Date.now }
}
```

---

## 📁 Message Model (`/server/models/Message.js`)

```js
{
  sender    : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver  : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message   : { type: String, required: true },
  timestamp : { type: Date, default: Date.now }
}
```

---

## 📁 OTP Model (`/server/models/OTP.js`)

```js
{
  email     : { type: String, required: true },
  otp       : { type: String, required: true },               // 6-digit string
  expiresAt : { type: Date, required: true },                 // Date.now() + 10 min
  createdAt : { type: Date, default: Date.now, expires: 600 } // TTL index: auto-delete after 10 min
}
```

---

## 🔗 Relationships Summary

```
User (student)  ─── uploads ──→  Note
User (student)  ─── requests ─→  Mentorship ←── assigned ─── User (mentor)
User (student)  ─── sends ────→  Message ←─── receives ───── User (mentor)
User (mentor)   ─── uploads ──→  Note
```

---

## 📊 Indexes to Add

```js
// User
userSchema.index({ email: 1 })
userSchema.index({ role: 1, isApproved: 1 })   // fast mentor listing

// Note
noteSchema.index({ subject: 1 })
noteSchema.index({ uploadedBy: 1 })

// Mentorship
mentorshipSchema.index({ studentId: 1, status: 1 })
mentorshipSchema.index({ mentorId: 1, status: 1 })

// Message
messageSchema.index({ sender: 1, receiver: 1 })
messageSchema.index({ timestamp: -1 })

// OTP (TTL)
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 })
```
