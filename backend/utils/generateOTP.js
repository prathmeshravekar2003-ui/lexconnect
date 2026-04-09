const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getOTPExpiry = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

const getOTPEmailTemplate = (name, otp) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; text-align: center;">
        <h1 style="color: #e94560; font-size: 28px; margin-bottom: 8px;">⚖️ LexConnect</h1>
        <p style="color: #a0a0b0; font-size: 14px; margin-bottom: 32px;">Legal Consultation Platform</p>
        
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 32px; margin-bottom: 24px;">
          <p style="color: #ffffff; font-size: 18px; margin-bottom: 8px;">Hello ${name},</p>
          <p style="color: #a0a0b0; font-size: 14px; margin-bottom: 24px;">Your verification code is:</p>
          
          <div style="background: rgba(233, 69, 96, 0.1); border: 2px dashed #e94560; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <span style="color: #e94560; font-size: 36px; font-weight: bold; letter-spacing: 8px;">${otp}</span>
          </div>
          
          <p style="color: #a0a0b0; font-size: 13px;">This code expires in <strong style="color: #e94560;">10 minutes</strong></p>
        </div>
        
        <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;
};

module.exports = { generateOTP, getOTPExpiry, getOTPEmailTemplate };
