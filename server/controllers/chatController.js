const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const Mentorship = require('../models/Mentorship');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get chat history between two users
// @route   GET /api/chat/:userId
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getChatHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const myId = req.user._id;

  // Verify they have an approved mentorship (chat gate)
  const connected = await Mentorship.findOne({
    $or: [
      { studentId: myId, mentorId: userId, status: 'approved' },
      { studentId: userId, mentorId: myId, status: 'approved' },
    ],
  });

  if (!connected) {
    res.status(403);
    throw new Error('Chat is only available between connected student-mentor pairs (approved mentorship)');
  }

  const messages = await Message.find({
    $or: [
      { sender: myId, receiver: userId },
      { sender: userId, receiver: myId },
    ],
  })
    .populate('sender', 'fullName profilePic')
    .populate('receiver', 'fullName profilePic')
    .sort({ timestamp: 1 });

  res.status(200).json({ success: true, data: messages });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Save a chat message (used by REST fallback; socket.io handles real-time)
// @route   POST /api/chat/send
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const saveMessage = asyncHandler(async (req, res) => {
  const { receiverId, message } = req.body;

  if (!receiverId || !message) {
    res.status(400);
    throw new Error('Receiver and message are required');
  }

  const newMsg = await Message.create({
    sender: req.user._id,
    receiver: receiverId,
    message: message.trim(),
  });

  const populated = await newMsg.populate('sender', 'fullName profilePic');

  res.status(201).json({ success: true, data: populated });
});

module.exports = { getChatHistory, saveMessage };
