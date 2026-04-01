const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    pdfFile: {
      type: String,          // Cloudinary URL
      required: [true, 'PDF file is required'],
    },
    publicId: {
      type: String,          // Cloudinary public_id for deletion
      default: '',
    },
    originalFileName: {
      type: String,          // Original filename shown to user
      required: true,
    },
    fileSize: {
      type: Number,          // Size in MB (auto-calculated)
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Index for faster filtering by subject and uploader
noteSchema.index({ subject: 1, uploadedBy: 1 });

module.exports = mongoose.model('Note', noteSchema);
