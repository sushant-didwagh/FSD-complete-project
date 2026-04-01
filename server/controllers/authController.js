const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const OTP = require('../models/OTP');
const sendOTP = require('../utils/sendOTP');
const generateToken = require('../utils/generateToken');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const sendOTPHandler = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  // Prevent sending OTP to already registered emails
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error('This email is already registered. Please login instead.');
  }

  await sendOTP(email.toLowerCase());

  res.status(200).json({ success: true, message: 'OTP sent to your email. Valid for 10 minutes.' });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const verifyOTPHandler = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error('Email and OTP are required');
  }

  const record = await OTP.findOne({ email: email.toLowerCase() });

  if (!record) {
    res.status(400);
    throw new Error('OTP expired or not found. Please request a new OTP.');
  }

  if (record.otp !== otp) {
    res.status(400);
    throw new Error('Invalid OTP. Please try again.');
  }

  if (record.expiresAt < new Date()) {
    await OTP.deleteOne({ email });
    res.status(400);
    throw new Error('OTP has expired. Please request a new one.');
  }

  // Clean up OTP after successful verification
  await OTP.deleteOne({ email: email.toLowerCase() });

  res.status(200).json({ success: true, message: 'OTP verified successfully' });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a student
// @route   POST /api/auth/register/student
// @access  Public (OTP must be verified first)
// ─────────────────────────────────────────────────────────────────────────────
const registerStudent = asyncHandler(async (req, res) => {
  const { fullName, email, password, confirmPassword, university, admissionYear, passingYear } = req.body;

  // Validate required fields
  if (!fullName || !email || !password || !confirmPassword || !university || !admissionYear || !passingYear) {
    res.status(400);
    throw new Error('All fields are required');
  }

  if (password !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // Check if email already exists
  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const student = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase(),
    password,
    role: 'student',
    university: university.trim(),
    admissionYear: Number(admissionYear),
    passingYear: Number(passingYear),
  });

  const token = generateToken(student._id, student.role, student.fullName);

  res.status(201).json({
    success: true,
    message: 'Student registered successfully',
    data: {
      _id: student._id,
      fullName: student.fullName,
      email: student.email,
      role: student.role,
      university: student.university,
      admissionYear: student.admissionYear,
      passingYear: student.passingYear,
      token,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a mentor (with document proof upload)
// @route   POST /api/auth/register/mentor
// @access  Public (OTP must be verified first)
// ─────────────────────────────────────────────────────────────────────────────
const registerMentor = asyncHandler(async (req, res) => {
  const { fullName, email, password, subjects, experience, university, address, education, charges } = req.body;

  if (!fullName || !email || !password || !subjects || !experience || !university || !address) {
    res.status(400);
    throw new Error('All fields are required');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Document proof (PDF/Image) is required for mentor registration');
  }

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  // Parse subjects — may come as comma-separated string or array
  let parsedSubjects = subjects;
  if (typeof subjects === 'string') {
    parsedSubjects = subjects.split(',').map((s) => s.trim()).filter(Boolean);
  }

  const mentor = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase(),
    password,
    role: 'mentor',
    subjects: parsedSubjects,
    experience: Number(experience),
    university: university.trim(),
    address: address.trim(),
    education: education ? education.trim() : '',
    charges: charges ? Number(charges) : 0,
    documentProof: req.file.path,   // Cloudinary URL
    isApproved: false,              // Awaiting admin approval
  });

  res.status(201).json({
    success: true,
    message: 'Mentor registered successfully. Your account is pending admin approval.',
    data: {
      _id: mentor._id,
      fullName: mentor.fullName,
      email: mentor.email,
      role: mentor.role,
      isApproved: mentor.isApproved,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login for all roles
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  // Find user and include password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Mentors awaiting approval
  if (user.role === 'mentor' && !user.isApproved) {
    res.status(403);
    throw new Error('Your mentor account is pending admin approval. Please wait for verification.');
  }

  const token = generateToken(user._id, user.role, user.fullName);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      isApproved: user.isApproved,
      token,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

module.exports = { sendOTPHandler, verifyOTPHandler, registerStudent, registerMentor, login, getMe };
