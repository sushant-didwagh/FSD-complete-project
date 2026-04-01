const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const https = require('https');
const http = require('http');

// ─────────────────────────────────────────────────────────────────────────────
// Helper — send approval/rejection email
// ─────────────────────────────────────────────────────────────────────────────
const sendStatusEmail = async (email, fullName, approved) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const subject = approved
      ? '🎉 Your Mentor Account Has Been Approved — Student Buddy'
      : '❌ Your Mentor Application Was Rejected — Student Buddy';

    const html = approved
      ? `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="color:#4f46e5;">Student Buddy</h2>
          <p>Hi <strong>${fullName}</strong>,</p>
          <p>🎉 Your mentor account has been <strong style="color:green;">approved</strong>! You can now log in and start guiding students.</p>
          <p style="color:#6b7280;font-size:14px;">Visit <a href="${process.env.CLIENT_URL}/login">Student Buddy</a> to get started.</p>
        </div>`
      : `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="color:#4f46e5;">Student Buddy</h2>
          <p>Hi <strong>${fullName}</strong>,</p>
          <p>We're sorry, your mentor application has been <strong style="color:red;">rejected</strong> after review.</p>
          <p style="color:#6b7280;font-size:14px;">If you think this is an error, please contact support.</p>
        </div>`;

    await transporter.sendMail({ from: `"Student Buddy" <${process.env.EMAIL_USER}>`, to: email, subject, html });
  } catch (err) {
    console.error('Email send error (non-fatal):', err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all pending mentor registrations
// @route   GET /api/admin/mentors/pending
// @access  Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getPendingMentors = asyncHandler(async (req, res) => {
  const mentors = await User.find({ role: 'mentor', isApproved: false })
    .select('-password')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: mentors });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Approve a mentor
// @route   PUT /api/admin/mentors/:id/approve
// @access  Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const approveMentor = asyncHandler(async (req, res) => {
  const mentor = await User.findOne({ _id: req.params.id, role: 'mentor' });

  if (!mentor) {
    res.status(404);
    throw new Error('Mentor not found');
  }

  mentor.isApproved = true;
  await mentor.save();

  sendStatusEmail(mentor.email, mentor.fullName, true);

  res.status(200).json({ success: true, message: `Mentor ${mentor.fullName} approved successfully` });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reject a mentor (delete from DB)
// @route   PUT /api/admin/mentors/:id/reject
// @access  Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const rejectMentor = asyncHandler(async (req, res) => {
  const mentor = await User.findOne({ _id: req.params.id, role: 'mentor' });

  if (!mentor) {
    res.status(404);
    throw new Error('Mentor not found');
  }

  const { email, fullName } = mentor;

  // Delete the mentor account entirely
  await User.deleteOne({ _id: mentor._id });

  sendStatusEmail(email, fullName, false);

  res.status(200).json({ success: true, message: `Mentor ${fullName} rejected and removed` });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all users overview (stats)
// @route   GET /api/admin/stats
// @access  Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getStats = asyncHandler(async (req, res) => {
  const students = await User.countDocuments({ role: 'student' });
  const mentors = await User.countDocuments({ role: 'mentor', isApproved: true });
  const pendingMentors = await User.countDocuments({ role: 'mentor', isApproved: false });
  const totalUsers = await User.countDocuments({ role: { $in: ['student', 'mentor'] } });

  res.status(200).json({
    success: true,
    data: { students, mentors, pendingMentors, totalUsers },
  });
});

// Keep backward-compatible alias
const getAllUsers = getStats;

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getAllStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' })
    .select('-password')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: students, total: students.length });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all approved mentors
// @route   GET /api/admin/mentors
// @access  Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getAllMentors = asyncHandler(async (req, res) => {
  const mentors = await User.find({ role: 'mentor', isApproved: true })
    .select('-password')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: mentors, total: mentors.length });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete any user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot delete admin users');
  }

  await User.deleteOne({ _id: user._id });

  res.status(200).json({ success: true, message: `User ${user.fullName} deleted successfully` });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    View document proof via proxy
// @route   GET /api/admin/mentors/:id/document
// @access  Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getMentorDocument = asyncHandler(async (req, res) => {
  const mentor = await User.findById(req.params.id);

  if (!mentor || !mentor.documentProof) {
    res.status(404);
    throw new Error('Document not found');
  }

  const fileUrl = mentor.documentProof;

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      return res.status(502).json({ success: false, message: 'Could not fetch file from storage' });
    }

    const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
    res.setHeader('Content-Type', isPdf ? 'application/pdf' : 'image/jpeg');
    res.setHeader('Content-Disposition', `inline; filename="document_proof_${mentor._id}${isPdf ? '.pdf' : '.jpg'}"`);

    const { Readable } = require('stream');
    Readable.fromWeb(response.body).pipe(res);
  } catch (err) {
    console.error('Proxy stream error:', err);
    res.status(500);
    throw new Error('Failed to stream file');
  }
});


module.exports = {
  getPendingMentors,
  approveMentor,
  rejectMentor,
  getStats,
  getAllUsers,
  getAllStudents,
  getAllMentors,
  deleteUser,
  getMentorDocument
};
