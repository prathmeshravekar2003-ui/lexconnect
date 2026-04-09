const express = require('express');
const router = express.Router();
const {
  createOrUpdateProfile, getMyProfile, getLawyerProfile,
  searchLawyers, updateAvailability, getEarnings
} = require('../controllers/lawyerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', searchLawyers);
router.get('/profile/me', protect, authorize('lawyer'), getMyProfile);
router.post('/profile', protect, authorize('lawyer'), createOrUpdateProfile);
router.put('/availability', protect, authorize('lawyer'), updateAvailability);
router.get('/earnings', protect, authorize('lawyer'), getEarnings);
router.get('/:id', getLawyerProfile);

module.exports = router;
