const Review = require('../models/Review');
const Consultation = require('../models/Consultation');

// @desc    Create review
// @route   POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { consultationId, rating, reviewText } = req.body;

    // Find the consultation
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    // Only the client of this consultation can review
    if (consultation.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the client can review' });
    }

    // Must be completed and paid
    if (consultation.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Consultation must be completed first' });
    }

    if (!consultation.isPaid) {
      return res.status(400).json({ success: false, message: 'Payment must be completed first' });
    }

    // Check for existing review
    const existingReview = await Review.findOne({ client: req.user.id, lawyer: consultation.lawyer });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this lawyer' });
    }

    const review = await Review.create({
      client: req.user.id,
      lawyer: consultation.lawyer,
      consultation: consultationId,
      rating,
      reviewText
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a lawyer
// @route   GET /api/reviews/lawyer/:lawyerId
exports.getLawyerReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Review.countDocuments({ lawyer: req.params.lawyerId });

    const reviews = await Review.find({ lawyer: req.params.lawyerId })
      .populate('client', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
