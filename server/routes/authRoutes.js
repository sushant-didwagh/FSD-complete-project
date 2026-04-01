const express = require('express');
const router = express.Router();
const { sendOTPHandler, verifyOTPHandler, registerStudent, registerMentor, login, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { uploadDoc } = require('../middlewares/uploadMiddleware');

router.post('/send-otp', sendOTPHandler);
router.post('/verify-otp', verifyOTPHandler);
router.post('/register/student', registerStudent);
router.post('/register/mentor', uploadDoc.single('documentProof'), registerMentor);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
