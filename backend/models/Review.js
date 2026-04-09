const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    maxlength: 1000,
    default: ''
  }
}, {
  timestamps: true
});

// One review per client per lawyer
reviewSchema.index({ client: 1, lawyer: 1 }, { unique: true });
reviewSchema.index({ lawyer: 1 });

// After saving a review, recalculate lawyer's average rating
reviewSchema.statics.calcAverageRating = async function(lawyerId) {
  const LawyerProfile = require('./LawyerProfile');
  
  const stats = await this.aggregate([
    { $match: { lawyer: lawyerId } },
    {
      $group: {
        _id: '$lawyer',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    const profile = await LawyerProfile.findOne({ user: lawyerId });
    if (profile) {
      profile.averageRating = Math.round(stats[0].avgRating * 10) / 10;
      profile.totalReviews = stats[0].count;
      profile.isTopRated = profile.averageRating >= 4.5 && profile.totalReviews >= 5;
      await profile.save();
    }
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.lawyer);
});

module.exports = mongoose.model('Review', reviewSchema);
