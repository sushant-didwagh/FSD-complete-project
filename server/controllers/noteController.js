const asyncHandler = require('express-async-handler');
const Note = require('../models/Note');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const https = require('https');
const http = require('http');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Upload a note (PDF)
// @route   POST /api/notes/upload
// @access  Private (student, mentor)
// ─────────────────────────────────────────────────────────────────────────────
const uploadNote = asyncHandler(async (req, res) => {
  const { title, subject } = req.body;

  if (!title || !subject) {
    res.status(400);
    throw new Error('Title and subject are required');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('PDF file is required. Only PDF files are allowed.');
  }

  // Cloudinary returns size in bytes via req.file.size
  const fileSizeBytes = req.file.size || 0;
  const fileSizeMB = parseFloat((fileSizeBytes / (1024 * 1024)).toFixed(4));

  const note = await Note.create({
    title: title.trim(),
    subject: subject.trim(),
    pdfFile: req.file.path,               // Cloudinary URL
    publicId: req.file.filename,          // Cloudinary public_id for signed URL
    originalFileName: req.file.originalname,
    fileSize: fileSizeMB,
    uploadedBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Note uploaded successfully',
    data: note,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all notes (with optional filters)
// @route   GET /api/notes
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getAllNotes = asyncHandler(async (req, res) => {
  const { subject, keyword, page = 1, limit = 20 } = req.query;

  const query = {};

  if (subject) {
    query.subject = { $regex: subject, $options: 'i' };
  }

  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { subject: { $regex: keyword, $options: 'i' } },
    ];
  }

  const total = await Note.countDocuments(query);
  const notes = await Note.find(query)
    .populate('uploadedBy', 'fullName role profilePic')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    data: notes,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a single note by ID
// @route   GET /api/notes/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id).populate('uploadedBy', 'fullName role profilePic');

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  res.status(200).json({ success: true, data: note });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all notes uploaded by the logged-in user
// @route   GET /api/notes/my
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getMyNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });

  // Calculate total upload size
  const totalSizeMB = notes.reduce((sum, n) => sum + (n.fileSize || 0), 0);

  res.status(200).json({
    success: true,
    data: notes,
    totalSizeMB: parseFloat(totalSizeMB.toFixed(4)),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a note (owner only)
// @route   DELETE /api/notes/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  if (note.uploadedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You are not authorized to delete this note');
  }

  // Also delete from Cloudinary if we have public_id
  if (note.publicId) {
    try {
      await cloudinary.uploader.destroy(note.publicId, { resource_type: 'raw' });
    } catch (e) {
      console.error('Cloudinary delete error (non-fatal):', e.message);
    }
  }

  await note.deleteOne();

  res.status(200).json({ success: true, message: 'Note deleted successfully' });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Check if student can download (>50MB uploaded)
// @route   GET /api/notes/can-download
// @access  Private (student)
// ─────────────────────────────────────────────────────────────────────────────
const canDownload = asyncHandler(async (req, res) => {
  const notes = await Note.find({ uploadedBy: req.user._id });
  const totalSizeMB = notes.reduce((sum, n) => sum + (n.fileSize || 0), 0);

  // Mentors can always download; students need >50MB uploaded
  const allowed = req.user.role === 'mentor' || req.user.role === 'admin' || totalSizeMB >= 50;

  res.status(200).json({
    success: true,
    canDownload: allowed,
    totalSizeMB: parseFloat(totalSizeMB.toFixed(4)),
    message: allowed
      ? 'You can download notes'
      : `Upload more notes to unlock downloads. Currently ${totalSizeMB.toFixed(2)}MB / 50MB needed.`,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Helper to build a proper Cloudinary URL (with attachment flag if needed)
// ─────────────────────────────────────────────────────────────────────────────
const getCloudinaryUrl = (note, isAttachment = false) => {
  let publicId = note.publicId;

  // Fallback to extract public_id from the pdfFile URL if not clearly defined
  if (!publicId && note.pdfFile) {
    const match = note.pdfFile.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/);
    if (match) publicId = match[1];
  }

  if (!publicId) {
    return note.pdfFile; // Return raw string if we can't extract ID
  }

  // Use Cloudinary SDK to generate a safe, signed URL
  const options = {
    resource_type: 'raw',
    type: 'upload',
    secure: true,
  };

  if (isAttachment) {
    options.flags = `attachment:${note.originalFileName ? note.originalFileName.replace(/\.pdf$/, '') : 'note'}`;
  }

  // We only sign it if Strict Deliveries is turned on, but signing it is always safe.
  options.sign_url = true;

  return cloudinary.url(publicId, options);
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get secure view URL for a note PDF
// @route   GET /api/notes/:id/view
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const viewNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  const url = getCloudinaryUrl(note, false);
  res.status(200).json({ success: true, url });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get secure download URL for a note PDF
// @route   GET /api/notes/:id/download
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const downloadNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  // Check download permission
  const userNotes = await Note.find({ uploadedBy: req.user._id });
  const totalSizeMB = userNotes.reduce((sum, n) => sum + (n.fileSize || 0), 0);
  const allowed = req.user.role === 'mentor' || req.user.role === 'admin' || totalSizeMB >= 50;

  if (!allowed) {
    res.status(403);
    throw new Error(
      `Download locked. Upload ${(50 - totalSizeMB).toFixed(1)} MB more to unlock downloads.`
    );
  }

  const url = getCloudinaryUrl(note, true);
  res.status(200).json({ success: true, url });
});

module.exports = { uploadNote, getAllNotes, getNoteById, getMyNotes, deleteNote, canDownload, viewNote, downloadNote };
