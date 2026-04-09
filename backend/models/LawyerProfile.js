const mongoose = require('mongoose');

const lawyerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: [{
    type: String,
    required: true,
    enum: [
      'Criminal Law', 'Family Law', 'Corporate Law', 'Civil Law',
      'Tax Law', 'Property Law', 'Labour Law', 'Immigration Law',
      'Intellectual Property', 'Environmental Law', 'Constitutional Law',
      'Banking Law', 'Cyber Law', 'Consumer Protection', 'Other'
    ]
  }],
  barCouncilId: {
    type: String,
    required: true,
    unique: true
  },
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  bio: {
    type: String,
    maxlength: 2000,
    default: ''
  },
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  languages: [{
    type: String,
    enum: ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi',
           'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Urdu', 'Other']
  }],
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    city: String,
    state: String,
    address: String
  },
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    slots: [{
      startTime: String, // "09:00"
      endTime: String,   // "10:00"
      isBooked: { type: Boolean, default: false }
    }]
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalConsultations: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isTopRated: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// GeoJSON 2dsphere index for location-based queries
lawyerProfileSchema.index({ 'location': '2dsphere' });
lawyerProfileSchema.index({ specialization: 1 });
lawyerProfileSchema.index({ consultationFee: 1 });
lawyerProfileSchema.index({ averageRating: -1 });
lawyerProfileSchema.index({ experience: 1 });
lawyerProfileSchema.index({ languages: 1 });

// Update top rated badge
lawyerProfileSchema.methods.updateTopRatedStatus = function() {
  this.isTopRated = this.averageRating >= 4.5 && this.totalReviews >= 5;
  return this.save();
};

module.exports = mongoose.model('LawyerProfile', lawyerProfileSchema);
