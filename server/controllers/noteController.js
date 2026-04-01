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
// @desc    View/Stream a note PDF (proxy through backend to avoid Cloudinary 401)
// @route   GET /api/notes/:id/view
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const viewNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  const fileUrl = note.pdfFile;

  // Stream the file through our server using fetch API (supports redirects organically)
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      return res.status(502).json({ success: false, message: 'Could not fetch file from storage' });
    }

    const isPdf = note.originalFileName?.toLowerCase().endsWith('.pdf') || true;
    res.setHeader('Content-Type', isPdf ? 'application/pdf' : 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${note.originalFileName || 'note.pdf'}"`);

    const { Readable } = require('stream');
    Readable.fromWeb(response.body).pipe(res);
  } catch (err) {
    console.error('Proxy stream error:', err);
    res.status(500);
    throw new Error('Failed to stream file');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Download a note PDF (check 50MB rule, then proxy)
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

  const fileUrl = note.pdfFile;

  // Stream the file with download headers
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      return res.status(502).json({ success: false, message: 'Could not fetch file from storage' });
    }

    const isPdf = note.originalFileName?.toLowerCase().endsWith('.pdf') || true;
    res.setHeader('Content-Type', isPdf ? 'application/pdf' : 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${note.originalFileName || `${note.title}.pdf`}"`);

    const { Readable } = require('stream');
    Readable.fromWeb(response.body).pipe(res);
  } catch (err) {
    console.error('Download proxy stream error:', err);
    res.status(500);
    throw new Error('Failed to download file');
  }
});

module.exports = { uploadNote, getAllNotes, getNoteById, getMyNotes, deleteNote, canDownload, viewNote, downloadNote };
