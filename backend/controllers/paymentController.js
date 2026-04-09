const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Consultation = require('../models/Consultation');
const LawyerProfile = require('../models/LawyerProfile');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
exports.createOrder = async (req, res) => {
  try {
    const { consultationId } = req.body;

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    if (consultation.isPaid) {
      return res.status(400).json({ success: false, message: 'Already paid' });
    }

    const options = {
      amount: consultation.fee * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `consultation_${consultationId}`,
      notes: {
        consultationId: consultationId.toString(),
        clientId: req.user.id,
        lawyerId: consultation.lawyer.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      consultation: consultationId,
      client: req.user.id,
      lawyer: consultation.lawyer,
      amount: consultation.fee,
      razorpayOrderId: order.id,
      status: 'created'
    });

    res.status(200).json({
      success: true,
      order,
      payment,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update payment
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid'
      },
      { new: true }
    );

    if (payment) {
      // Update consultation
      await Consultation.findByIdAndUpdate(payment.consultation, {
        isPaid: true,
        payment: payment._id
      });

      // Update lawyer earnings
      await LawyerProfile.findOneAndUpdate(
        { user: payment.lawyer },
        { $inc: { totalEarnings: payment.amount } }
      );
    }

    res.status(200).json({ success: true, message: 'Payment verified successfully', payment });

    // Real-time notification for the lawyer
    if (req.io && payment) {
      req.io.to(payment.lawyer.toString()).emit('consultation_updated', {
        status: 'paid',
        isPaid: true,
        consultationId: payment.consultation,
        message: 'Client has completed the payment'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Razorpay webhook
// @route   POST /api/payments/webhook
exports.webhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_KEY_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === signature) {
      const event = req.body.event;
      const paymentEntity = req.body.payload.payment?.entity;

      if (event === 'payment.captured' && paymentEntity) {
        await Payment.findOneAndUpdate(
          { razorpayOrderId: paymentEntity.order_id },
          { razorpayPaymentId: paymentEntity.id, status: 'paid' }
        );
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
exports.getPaymentHistory = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'client') query.client = req.user.id;
    if (req.user.role === 'lawyer') query.lawyer = req.user.id;

    const payments = await Payment.find(query)
      .populate('consultation', 'type scheduledDate status')
      .populate('client', 'name email')
      .populate('lawyer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
