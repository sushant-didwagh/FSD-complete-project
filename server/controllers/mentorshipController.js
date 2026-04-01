const asyncHandler = require('express-async-handler');
const Mentorship = require('../models/Mentorship');
const User = require('../models/User');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Student creates a mentorship request
// @route   POST /api/mentorship/request
// @access  Private (student)
// ─────────────────────────────────────────────────────────────────────────────
const createRequest = asyncHandler(async (req, res) => {
  const { mentorId, subject, month, timeSlot } = req.body;

  if (!mentorId || !subject || !month || !timeSlot) {
    res.status(400);
    throw new Error('Mentor, subject, month, and time slot are required');
  }

  // Verify mentor exists and is approved
  const mentor = await User.findOne({ _id: mentorId, role: 'mentor', isApproved: true });
  if (!mentor) {
    res.status(404);
    throw new Error('Mentor not found or not yet approved');
  }

  // Prevent duplicate pending requests
  const existing = await Mentorship.findOne({
    studentId: req.user._id,
    mentorId,
    status: 'pending',
  });

  if (existing) {
    res.status(400);
    throw new Error('You already have a pending request with this mentor');
  }

  const mentorship = await Mentorship.create({
    studentId: req.user._id,
    mentorId,
    subject,
    month,
    timeSlot,
    status: 'pending',
  });

  res.status(201).json({
    success: true,
    message: 'Mentorship request sent successfully',
    data: mentorship,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all mentorships for the logged-in student
// @route   GET /api/mentorship/my
// @access  Private (student)
// ─────────────────────────────────────────────────────────────────────────────
const getStudentMentorships = asyncHandler(async (req, res) => {
  const mentorships = await Mentorship.find({ studentId: req.user._id })
    .populate('mentorId', 'fullName subjects rating profilePic charges education experience')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: mentorships });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get incoming requests for the logged-in mentor
// @route   GET /api/mentorship/requests
// @access  Private (mentor)
// ─────────────────────────────────────────────────────────────────────────────
const getMentorRequests = asyncHandler(async (req, res) => {
  const requests = await Mentorship.find({ mentorId: req.user._id })
    .populate('studentId', 'fullName email university admissionYear passingYear profilePic')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: requests });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mentor updates mentorship status (approve / reject / complete)
// @route   PUT /api/mentorship/:id/status
// @access  Private (mentor)
// ─────────────────────────────────────────────────────────────────────────────
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const allowed = ['approved', 'rejected', 'completed'];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${allowed.join(', ')}`);
  }

  const mentorship = await Mentorship.findById(req.params.id);

  if (!mentorship) {
    res.status(404);
    throw new Error('Mentorship request not found');
  }

  // Only the target mentor can update
  if (mentorship.mentorId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this mentorship');
  }

  mentorship.status = status;
  await mentorship.save();

  res.status(200).json({
    success: true,
    message: `Mentorship status updated to '${status}'`,
    data: mentorship,
  });
});

module.exports = { createRequest, getStudentMentorships, getMentorRequests, updateStatus };
