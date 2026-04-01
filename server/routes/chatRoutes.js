const express = require('express');
const router = express.Router();
const { getChatHistory, saveMessage } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/:userId', getChatHistory);
router.post('/send', saveMessage);

module.exports = router;
