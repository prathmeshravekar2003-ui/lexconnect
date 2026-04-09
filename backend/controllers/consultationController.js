const Consultation = require('../models/Consultation');
const LawyerProfile = require('../models/LawyerProfile');
const { v4: uuidv4 } = require('uuid');

// @desc    Create consultation (book lawyer)
// @route   POST /api/consultations
exports.createConsultation = async (req, res) => {
  try {
    const { lawyerId, type, problemDescription, scheduledDate, scheduledSlot } = req.body;

    const lawyerProfile = await LawyerProfile.findOne({ user: lawyerId });
    if (!lawyerProfile) {
      return res.status(404).json({ success: false, message: 'Lawyer not found' });
    }

    const consultation = await Consultation.create({
      client: req.user.id,
      lawyer: lawyerId,
      lawyerProfile: lawyerProfile._id,
      type,
      problemDescription,
      scheduledDate: scheduledDate || new Date(),
      scheduledSlot,
      fee: lawyerProfile.consultationFee,
      roomId: uuidv4()
    });

    res.status(201).json({ success: true, consultation });

    // Real-time notification for the lawyer
    if (req.io) {
      req.io.to(lawyerId).emit('new_consultation', {
        message: 'You have a new consultation request',
        consultation
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get client consultations
// @route   GET /api/consultations/my
exports.getMyConsultations = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'client') {
      query.client = req.user.id;
    } else if (req.user.role === 'lawyer') {
      query.lawyer = req.user.id;
    }

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Consultation.countDocuments(query);

    const consultations = await Consultation.find(query)
      .populate('client', 'name email avatar')
      .populate('lawyer', 'name email avatar')
      .populate('lawyerProfile', 'specialization consultationFee averageRating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: consultations.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      consultations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get consultation by ID
// @route   GET /api/consultations/:id
exports.getConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('client', 'name email avatar isOnline')
      .populate('lawyer', 'name email avatar isOnline')
      .populate('lawyerProfile', 'specialization consultationFee')
      .populate('payment');

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    // Only allow client/lawyer involved or admin
    if (
      consultation.client._id.toString() !== req.user.id &&
      consultation.lawyer._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update consultation status (accept/reject/complete)
// @route   PUT /api/consultations/:id/status
exports.updateConsultationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    // Only the lawyer can accept/reject, both can complete
    if (['accepted', 'rejected'].includes(status) && consultation.lawyer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the assigned lawyer can accept/reject' });
    }

    consultation.status = status;

    if (status === 'ongoing') {
      consultation.startedAt = new Date();
    }
    if (status === 'completed') {
      consultation.completedAt = new Date();
      // Update lawyer's total consultations
      await LawyerProfile.findOneAndUpdate(
        { user: consultation.lawyer },
        { $inc: { totalConsultations: 1 } }
      );
    }

    await consultation.save();

    res.status(200).json({ success: true, consultation });

    // Real-time notification for the other party
    if (req.io) {
      const targetUserId = req.user.id === consultation.client.toString() 
        ? consultation.lawyer.toString() 
        : consultation.client.toString();
        
      req.io.to(targetUserId).emit('consultation_updated', {
        status,
        consultationId: consultation._id,
        message: `Consultation status updated to ${status}`
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all consultations (Admin)
// @route   GET /api/consultations/admin/all
exports.getAllConsultations = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Consultation.countDocuments(query);

    const consultations = await Consultation.find(query)
      .populate('client', 'name email')
      .populate('lawyer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
