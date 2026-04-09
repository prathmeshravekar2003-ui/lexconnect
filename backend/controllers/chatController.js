const Message = require('../models/Message');
const Consultation = require('../models/Consultation');

// @desc    Get chat messages for a consultation
// @route   GET /api/chat/:consultationId
exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Verify user is part of the consultation
    const consultation = await Consultation.findById(req.params.consultationId);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    if (
      consultation.client.toString() !== req.user.id &&
      consultation.lawyer.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const total = await Message.countDocuments({ consultation: req.params.consultationId });

    const messages = await Message.find({ consultation: req.params.consultationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit));

    // Mark messages as read
    await Message.updateMany(
      { consultation: req.params.consultationId, receiver: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      total,
      messages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get chat list (recent conversations)
// @route   GET /api/chat/conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const matchField = role === 'client' ? 'client' : 'lawyer';
    const consultations = await Consultation.find({ [matchField]: userId, status: { $in: ['accepted', 'ongoing', 'completed'] } })
      .populate('client', 'name avatar isOnline')
      .populate('lawyer', 'name avatar isOnline')
      .sort({ updatedAt: -1 });

    // Get last message and unread count for each
    const conversations = await Promise.all(
      consultations.map(async (c) => {
        const lastMessage = await Message.findOne({ consultation: c._id })
          .sort({ createdAt: -1 })
          .select('content createdAt sender messageType');

        const unreadCount = await Message.countDocuments({
          consultation: c._id,
          receiver: userId,
          isRead: false
        });

        return {
          consultation: c,
          lastMessage,
          unreadCount
        };
      })
    );

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
