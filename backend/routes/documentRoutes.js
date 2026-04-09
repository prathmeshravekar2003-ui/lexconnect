const express = require('express');
const router = express.Router();
const { uploadMiddleware, uploadDocument, getDocuments, downloadDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

router.post('/upload', protect, uploadMiddleware, uploadDocument);
router.get('/:consultationId', protect, getDocuments);
router.get('/download/:id', protect, downloadDocument);

module.exports = router;
