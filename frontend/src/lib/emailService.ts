import emailjs from '@emailjs/browser';

// EmailJS Configuration - Set these in your Vercel environment variables
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// Check if EmailJS is configured
export const isEmailConfigured = () => {
  return !!(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);
};

// Initialize EmailJS
if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
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

export default {
  isEmailConfigured,
  sendVerificationEmail,
  sendBookingConfirmationEmail,
  sendWelcomeEmail
};

