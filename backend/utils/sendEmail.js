const { Resend } = require('resend');

const sendEmail = async (options) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: 'LexConnect <onboarding@resend.dev>', // Required for testing with Resend without a verified domain
    to: options.email,
    subject: options.subject,
    html: options.html,
  });

  if (error) {
    console.error('❌ Resend Error:', error);
    return { success: false, error };
  }

  console.log('✅ Email sent successfully via Resend:', data.id);
  return { success: true, data };
};

module.exports = sendEmail;
