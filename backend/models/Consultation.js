const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
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
  lawyerProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LawyerProfile'
  },
  type: {
    type: String,
    enum: ['instant', 'scheduled'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'ongoing', 'completed', 'cancelled'],
    default: 'pending'
  },
  problemDescription: {
    type: String,
    required: [true, 'Problem description is required'],
    maxlength: 5000
  },
  scheduledDate: Date,
  scheduledSlot: {
    startTime: String,
    endTime: String
  },
  fee: {
    type: Number,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  roomId: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  startedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

consultationSchema.index({ client: 1 });
consultationSchema.index({ lawyer: 1 });
consultationSchema.index({ status: 1 });

module.exports = mongoose.model('Consultation', consultationSchema);
