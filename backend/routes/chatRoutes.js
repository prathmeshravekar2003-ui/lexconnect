const express = require('express');
const router = express.Router();
const { getMessages, getConversations } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, getConversations);
router.get('/:consultationId', protect, getMessages);

module.exports = router;
