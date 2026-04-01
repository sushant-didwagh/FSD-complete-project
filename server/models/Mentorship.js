const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Index for fast lookups
mentorshipSchema.index({ studentId: 1, mentorId: 1 });
mentorshipSchema.index({ status: 1 });

module.exports = mongoose.model('Mentorship', mentorshipSchema);
