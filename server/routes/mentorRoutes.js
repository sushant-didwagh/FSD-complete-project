const express = require('express');
const router = express.Router();
const { getApprovedMentors, getMentorDetail, updateMentorProfile, addReview } = require('../controllers/mentorController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { uploadProfilePic } = require('../middlewares/uploadMiddleware');

router.use(protect);

router.get('/', authorize('student', 'admin'), getApprovedMentors);
router.put('/profile', authorize('mentor'), uploadProfilePic.single('profilePic'), updateMentorProfile);
router.get('/:id', getMentorDetail);
router.post('/:id/review', authorize('student'), addReview);

module.exports = router;
