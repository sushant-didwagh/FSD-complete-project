const express = require('express');
const router = express.Router();
const { createRequest, getStudentMentorships, getMentorRequests, updateStatus } = require('../controllers/mentorshipController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/request', authorize('student'), createRequest);
router.get('/my', authorize('student'), getStudentMentorships);
router.get('/requests', authorize('mentor'), getMentorRequests);
router.put('/:id/status', authorize('mentor'), updateStatus);

module.exports = router;
