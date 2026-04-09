const express = require('express');
const router = express.Router();
const {
  createConsultation, getMyConsultations, getConsultation,
  updateConsultationStatus, getAllConsultations
} = require('../controllers/consultationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('client'), createConsultation);
router.get('/my', protect, getMyConsultations);
router.get('/admin/all', protect, authorize('admin'), getAllConsultations);
router.get('/:id', protect, getConsultation);
router.put('/:id/status', protect, updateConsultationStatus);

module.exports = router;
