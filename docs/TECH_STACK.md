# ⚙️ TECH_STACK.md — Student Buddy

> All libraries, versions, and environment variable templates.

---

## 📦 Backend Dependencies (`server/package.json`)

```json
{
  "dependencies": {
    "express"          : "^4.18.2",
    "mongoose"         : "^7.6.0",
    "bcryptjs"         : "^2.4.3",
    "jsonwebtoken"     : "^9.0.2",
    "dotenv"           : "^16.3.1",
    "cors"             : "^2.8.5",
    "multer"           : "^1.4.5-lts.1",
    "cloudinary"       : "^1.41.0",
    "multer-storage-cloudinary": "^4.0.0",
    "nodemailer"       : "^6.9.7",
    "socket.io"        : "^4.6.1",
    "openai"           : "^4.20.0",
    "express-async-handler": "^1.2.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 📦 Frontend Dependencies (`client/package.json`)

```json
{
  "dependencies": {
    "react"               : "^18.2.0",
    "react-dom"           : "^18.2.0",
    "react-router-dom"    : "^6.18.0",
    "axios"               : "^1.6.0",
    "socket.io-client"    : "^4.6.1",
    "react-hot-toast"     : "^2.4.1",
    "react-icons"         : "^4.11.0"
  },
  "devDependencies": {
    "tailwindcss"         : "^3.3.5",
    "autoprefixer"        : "^10.4.16",
    "postcss"             : "^8.4.31"
  }
}
```

---

## 🔧 Environment Variables

### Server `.env`

```env
# ── Server ──────────────────────────────
PORT=5000
NODE_ENV=development

# ── MongoDB ─────────────────────────────
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/student-buddy

# ── JWT ─────────────────────────────────
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

# ── Cloudinary ──────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Nodemailer (Gmail) ──────────────────
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_gmail_app_password

# ── OpenAI ──────────────────────────────
OPENAI_API_KEY=sk-your_openai_key_here

# ── CORS ────────────────────────────────
CLIENT_URL=http://localhost:3000
```

### Client `.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 🗂️ Key Config Snippets

### `server/config/db.js`
```js
const mongoose = require('mongoose');
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};
module.exports = connectDB;
```

### `server/config/cloudinary.js`
```js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key   : process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder        : 'student-buddy/notes',
    resource_type : 'raw',
    allowed_formats: ['pdf'],
  },
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder         : 'student-buddy/docs',
    resource_type  : 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
});

module.exports = { cloudinary, pdfStorage, imageStorage };
```

### `server/middlewares/uploadMiddleware.js`
```js
const multer = require('multer');
const { pdfStorage, imageStorage } = require('../config/cloudinary');

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed.'), false);
  }
};

exports.uploadPDF  = multer({ storage: pdfStorage, fileFilter: pdfFilter });
exports.uploadDocs = multer({ storage: imageStorage });
```

### `server/utils/generateToken.js`
```js
const jwt = require('jsonwebtoken');
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, fullName: user.fullName },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};
module.exports = generateToken;
```

### `client/src/utils/axiosInstance.js`
```js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosInstance;
```

---

## 📌 Notes on Gmail OTP Setup

1. Go to Google Account → Security → 2-Step Verification → Enable
2. Go to App Passwords → Generate a new password for "Mail"
3. Use that 16-character password as `EMAIL_PASS` in `.env`
4. Do NOT use your regular Gmail password
