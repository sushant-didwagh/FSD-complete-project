const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// ── PDF Upload (for Notes) ──────────────────────────────────────────────────
const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'student_buddy/notes',
    resource_type: 'raw',         // PDFs must use 'raw'
    format: 'pdf',
    public_id: `note_${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`,
  }),
});

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const uploadPDF = multer({
  storage: pdfStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
});

// ── Document Proof Upload (for Mentor Registration) ─────────────────────────
const docStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'student_buddy/documents',
    resource_type: 'raw',
    public_id: `doc_${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`,
  }),
});

const docFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, or PNG files are allowed for document proof'), false);
  }
};

const uploadDoc = multer({
  storage: docStorage,
  fileFilter: docFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ── Profile Picture Upload ───────────────────────────────────────────────────
const profilePicStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'student_buddy/profile_pics',
    resource_type: 'image',
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    public_id: `profile_${Date.now()}`,
  }),
});

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for profile pictures'), false);
  }
};

const uploadProfilePic = multer({
  storage: profilePicStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { uploadPDF, uploadDoc, uploadProfilePic };
