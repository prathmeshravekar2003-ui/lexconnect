const express = require('express');
const router = express.Router();
const { createReview, getLawyerReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('client'), createReview);
router.get('/lawyer/:lawyerId', getLawyerReviews);

module.exports = router;
