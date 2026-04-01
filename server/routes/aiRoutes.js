const express = require('express');
const router = express.Router();
const { askAI } = require('../controllers/aiController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/ask', protect, authorize('student'), askAI);

module.exports = router;
