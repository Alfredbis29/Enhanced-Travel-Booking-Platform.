import emailjs from '@emailjs/browser';

// EmailJS Configuration - Set these in your Vercel environment variables
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// Check if EmailJS is configured
export const isEmailConfigured = () => {
  const configured = !!(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);
  console.log('📧 EmailJS Config Check:', {
    hasServiceId: !!EMAILJS_SERVICE_ID,
    hasTemplateId: !!EMAILJS_TEMPLATE_ID,
    hasPublicKey: !!EMAILJS_PUBLIC_KEY,
    isConfigured: configured
  });
  return configured;
};

// Initialize EmailJS
if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
  console.log('📧 EmailJS initialized with public key');
} else {
  console.log('⚠️ EmailJS not initialized - no public key found');
}

// Send verification email
export const sendVerificationEmail = async (
  toEmail: string,
  firstName: string,
  verificationCode: string
): Promise<boolean> => {
  if (!isEmailConfigured()) {
    console.log('📧 [Demo Mode] Verification email would be sent to:', toEmail);
    console.log('   Verification code:', verificationCode);
    return false;
  }

  const verificationLink = `${window.location.origin}/verify-email?code=${verificationCode}&email=${encodeURIComponent(toEmail)}`;

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: toEmail,
      to_name: firstName,
      subject: '✈️ Verify Your Twende Account',
      message: `
Hello ${firstName}! 👋

Welcome to Twende - East Africa's Premier Travel Booking Platform!

Please verify your email by clicking the link below:

${verificationLink}

Or enter this verification code: ${verificationCode}

This link expires in 24 hours.

If you didn't create an account with Twende, you can safely ignore this email.

Happy travels! 🌍
- The Twende Team

Built with ❤️ by AlfredoCAMP
      `.trim()
    });

    console.log('📧 Verification email sent to:', toEmail);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
};

// Send booking confirmation email
export const sendBookingConfirmationEmail = async (
  toEmail: string,
  firstName: string,
  bookingDetails: {
    bookingRef: string;
    origin: string;
    destination: string;
    departureDate: string;
    departureTime: string;
    provider: string;
    seats: number;
    totalPrice: string;
  }
): Promise<boolean> => {
  if (!isEmailConfigured()) {
    console.log('📧 [Demo Mode] Booking confirmation would be sent to:', toEmail);
    return false;
  }

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: toEmail,
      to_name: firstName,
      subject: `🎫 Booking Confirmed - ${bookingDetails.bookingRef}`,
      message: `
Hello ${firstName}! 🎉

Your booking has been confirmed! Here are your trip details:

📍 BOOKING REFERENCE: ${bookingDetails.bookingRef}

🚌 TRIP DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
From: ${bookingDetails.origin}
To: ${bookingDetails.destination}
Date: ${bookingDetails.departureDate}
Time: ${bookingDetails.departureTime}
Provider: ${bookingDetails.provider}
Seats: ${bookingDetails.seats}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 TOTAL PAID: ${bookingDetails.totalPrice}

📝 IMPORTANT:
• Arrive at the departure point 30 minutes early
• Bring a valid ID (National ID or Passport)
• Show this email or your booking reference when boarding

Need help? Contact us at support@twende.travel

Safe travels! 🌍
- The Twende Team

Built with ❤️ by AlfredoCAMP
      `.trim()
    });

    console.log('📧 Booking confirmation sent to:', toEmail);
    return true;
  } catch (error) {
    console.error('Failed to send booking confirmation:', error);
    return false;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (
  toEmail: string,
  firstName: string,
  resetToken: string
): Promise<boolean> => {
  if (!isEmailConfigured()) {
    console.log('📧 [Demo Mode] Password reset email would be sent to:', toEmail);
    console.log('   Reset token:', resetToken);
    return false;
  }

  const resetLink = `${window.location.origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(toEmail)}`;

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: toEmail,
      to_name: firstName,
      subject: '🔐 Reset Your Twende Password',
      message: `
Hello ${firstName}! 👋

We received a request to reset your Twende account password.

Click the link below to create a new password:

${resetLink}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

Need help? Contact us at support@twende.travel

- The Twende Team

Built with ❤️ by AlfredoCAMP
      `.trim()
    });

    console.log('📧 Password reset email sent to:', toEmail);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (
  toEmail: string,
  firstName: string
): Promise<boolean> => {
  if (!isEmailConfigured()) {
    console.log('📧 [Demo Mode] Welcome email would be sent to:', toEmail);
    return false;
  }

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: toEmail,
      to_name: firstName,
      subject: '🎉 Welcome to Twende - Your Account is Verified!',
      message: `
Hello ${firstName}! 🎉

Welcome aboard! Your Twende account is now fully verified and active.

You can now:
🔍 Search for trips across East Africa
🚌 Book buses, flights, trains & ferries
💳 Pay securely with M-Pesa, MTN MoMo, or card
🎫 Download your tickets instantly

Start exploring at: ${window.location.origin}

Happy travels! 🌍
- The Twende Team

Built with ❤️ by AlfredoCAMP
      `.trim()
    });

    console.log('📧 Welcome email sent to:', toEmail);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
};

// Test email function - call this from browser console: testEmail('your@email.com')
export const testEmail = async (toEmail: string): Promise<boolean> => {
  console.log('🧪 Testing email to:', toEmail);
  console.log('📧 Service ID:', EMAILJS_SERVICE_ID);
  console.log('📧 Template ID:', EMAILJS_TEMPLATE_ID);
  console.log('📧 Public Key:', EMAILJS_PUBLIC_KEY ? 'Set (' + EMAILJS_PUBLIC_KEY.substring(0, 5) + '...)' : 'NOT SET');
  
  if (!isEmailConfigured()) {
    console.error('❌ EmailJS is not configured! Add environment variables to Vercel.');
    return false;
  }

  try {
    const result = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: toEmail,
      to_name: 'Test User',
      subject: '🧪 Test Email from Twende',
      message: 'This is a test email from Twende Travel Platform. If you received this, email is working! 🎉'
    });
    console.log('✅ Email sent successfully!', result);
    return true;
  } catch (error) {
    console.error('❌ Email failed:', error);
    return false;
  }
};

// Make testEmail available globally for debugging
if (typeof window !== 'undefined') {
  (window as unknown as { testEmail: typeof testEmail }).testEmail = testEmail;
}

export default {
  isEmailConfigured,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendWelcomeEmail,
  testEmail
};

