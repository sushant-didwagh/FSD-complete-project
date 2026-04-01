const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all approved mentors
// @route   GET /api/mentors
// @access  Private (student)
// ─────────────────────────────────────────────────────────────────────────────
const getApprovedMentors = asyncHandler(async (req, res) => {
  const { subject, keyword } = req.query;

  const query = { role: 'mentor', isApproved: true };

  if (subject) {
    query.subjects = { $regex: subject, $options: 'i' };
  }

  if (keyword) {
    query.$or = [
      { fullName: { $regex: keyword, $options: 'i' } },
      { subjects: { $regex: keyword, $options: 'i' } },
      { education: { $regex: keyword, $options: 'i' } },
    ];
  }

  const mentors = await User.find(query)
    .select('-password -documentProof')
    .sort({ rating: -1, createdAt: -1 });

  res.status(200).json({ success: true, data: mentors });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a mentor by ID
// @route   GET /api/mentors/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getMentorDetail = asyncHandler(async (req, res) => {
  const mentor = await User.findOne({ _id: req.params.id, role: 'mentor', isApproved: true }).select(
    '-password -documentProof'
  );

  if (!mentor) {
    res.status(404);
    throw new Error('Mentor not found or not yet approved');
  }

  res.status(200).json({ success: true, data: mentor });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update mentor profile
// @route   PUT /api/mentors/profile
// @access  Private (mentor)
// ─────────────────────────────────────────────────────────────────────────────
const updateMentorProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['fullName', 'subjects', 'experience', 'university', 'address', 'education', 'charges'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Handle subjects parsing
  if (updates.subjects && typeof updates.subjects === 'string') {
    updates.subjects = updates.subjects.split(',').map((s) => s.trim()).filter(Boolean);
  }

  // Handle profile picture if uploaded
  if (req.file) {
    updates.profilePic = req.file.path;
  }

  const mentor = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');

  res.status(200).json({ success: true, message: 'Profile updated', data: mentor });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Add a review to a mentor
// @route   POST /api/mentors/:id/review
// @access  Private (student)
// ─────────────────────────────────────────────────────────────────────────────
const addReview = asyncHandler(async (req, res) => {
  const { comment, rating } = req.body;

  if (!comment || !rating) {
    res.status(400);
    throw new Error('Comment and rating are required');
  }

  const mentor = await User.findOne({ _id: req.params.id, role: 'mentor' });

  if (!mentor) {
    res.status(404);
    throw new Error('Mentor not found');
  }

  // Check if student already reviewed
  const alreadyReviewed = mentor.reviews.find(
    (r) => r.userId.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this mentor');
  }

  mentor.reviews.push({ userId: req.user._id, comment, rating: Number(rating) });

  // Recalculate average rating
  const total = mentor.reviews.reduce((sum, r) => sum + r.rating, 0);
  mentor.rating = parseFloat((total / mentor.reviews.length).toFixed(1));

  await mentor.save();

  res.status(201).json({ success: true, message: 'Review added', data: mentor.reviews });
});

module.exports = { getApprovedMentors, getMentorDetail, updateMentorProfile, addReview };
