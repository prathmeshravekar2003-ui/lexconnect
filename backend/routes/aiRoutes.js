const express = require('express');
const router = express.Router();
const { getChatResponse } = require('../controllers/aiController');

// All routes are prefixed with /api/ai
router.post('/chat', getChatResponse);

module.exports = router;
