const Message = require('../models/Message');

/**
 * Attach Socket.io chat logic to the HTTP server
 * @param {SocketIO.Server} io - The Socket.io server instance
 */
const initChatSocket = (io) => {
  // Track online users: userId → socketId
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── Join Room ────────────────────────────────────────────────────────────
    socket.on('joinRoom', ({ userId }) => {
      if (!userId) return;
      onlineUsers.set(userId, socket.id);
      socket.join(userId);
      console.log(`👤 User ${userId} joined room`);

      // Broadcast updated online list
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });

    // ── Send Message ─────────────────────────────────────────────────────────
    socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
      if (!senderId || !receiverId || !message) return;

      try {
        // Persist to DB
        const newMsg = await Message.create({
          sender: senderId,
          receiver: receiverId,
          message: message.trim(),
          timestamp: new Date(),
        });

        const populated = await newMsg.populate('sender', 'fullName profilePic');

        const payload = {
          _id: populated._id,
          sender: populated.sender,
          receiver: receiverId,
          message: populated.message,
          timestamp: populated.timestamp,
        };

        // Send to receiver's room if online
        io.to(receiverId).emit('receiveMessage', payload);

        // Send back to sender for confirmation
        io.to(senderId).emit('receiveMessage', payload);
      } catch (err) {
        console.error('Socket sendMessage error:', err.message);
        socket.emit('messageError', { message: 'Failed to send message' });
      }
    });

    // ── Typing Indicator ─────────────────────────────────────────────────────
    socket.on('typing', ({ senderId, receiverId }) => {
      io.to(receiverId).emit('userTyping', { senderId });
    });

    socket.on('stopTyping', ({ senderId, receiverId }) => {
      io.to(receiverId).emit('userStoppedTyping', { senderId });
    });

    // ── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`👋 User ${userId} disconnected`);
          break;
        }
      }
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });
};

module.exports = initChatSocket;
