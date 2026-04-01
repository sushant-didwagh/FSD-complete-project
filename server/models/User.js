const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // ── Common Fields ──────────────────────────────────────
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'mentor', 'admin'],
      required: [true, 'Role is required'],
    },
    profilePic: {
      type: String,
      default: '',
    },

    // ── Student Fields ──────────────────────────────────────
    university: { type: String, trim: true },
    admissionYear: { type: Number },
    passingYear: { type: Number },

    // ── Mentor Fields ───────────────────────────────────────
    subjects: [{ type: String, trim: true }],
    experience: { type: Number },          // years
    address: { type: String, trim: true },
    documentProof: { type: String },       // Cloudinary URL
    isApproved: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: [reviewSchema],
    charges: { type: Number, default: 0 }, // per session charge
    education: { type: String, trim: true },
  },
  { timestamps: true }
);

// ── Hash password before saving ──────────────────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Compare password method ──────────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
