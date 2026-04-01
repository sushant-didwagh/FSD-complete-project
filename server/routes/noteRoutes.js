const express = require('express');
const router = express.Router();
const {
  uploadNote,
  getAllNotes,
  getNoteById,
  getMyNotes,
  deleteNote,
  canDownload,
  viewNote,
  downloadNote,
} = require('../controllers/noteController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { uploadPDF } = require('../middlewares/uploadMiddleware');

// All notes routes require authentication
router.use(protect);

// Specific routes BEFORE parameterized /:id routes
router.get('/my', getMyNotes);
router.get('/can-download', canDownload);
router.post('/upload', authorize('student', 'mentor'), uploadPDF.single('pdfFile'), uploadNote);
router.get('/', getAllNotes);

// Parameterized routes
router.get('/:id/view', viewNote);
router.get('/:id/download', downloadNote);
router.get('/:id', getNoteById);
router.delete('/:id', authorize('student', 'mentor'), deleteNote);

module.exports = router;
