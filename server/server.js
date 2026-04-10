require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const connectDB = require('./config/db');
require('./config/cloudinary'); // Initialize Cloudinary
console.log('🔍 DEBUG Cloudinary cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const mentorshipRoutes = require('./routes/mentorshipRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const aiRoutes = require('./routes/aiRoutes');

const errorHandler = require('./middlewares/errorHandler');
const initChatSocket = require('./sockets/chatSocket');

// ── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ── Express App ──────────────────────────────────────────────────────────────
const app = express();

// CORS — allow React client
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Student Buddy API is running 🚀', timestamp: new Date() });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ── HTTP Server + Socket.io ──────────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initChatSocket(io);

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Student Buddy Server running on port ${PORT}`);
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
