import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
};

// Check if SMTP is configured
export const IS_SMTP_CONFIGURED = !!(EMAIL_CONFIG.auth.user && EMAIL_CONFIG.auth.pass);

// Create transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Generate verification token
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate token expiry (24 hours from now)
export function generateTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry;
}

// Verify email configuration
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      console.log('⚠️  Email service not configured (SMTP_USER/SMTP_PASS missing)');
      console.log('   Email verification will work in demo mode');
      return false;
    }
    console.log(`📧 Testing SMTP connection to ${EMAIL_CONFIG.host}:${EMAIL_CONFIG.port}...`);
    console.log(`   SMTP_USER: ${EMAIL_CONFIG.auth.user}`);
    console.log(`   SMTP_PASS: ${EMAIL_CONFIG.auth.pass ? '****' + EMAIL_CONFIG.auth.pass.slice(-4) : 'NOT SET'}`);
    await transporter.verify();
    console.log('✅ Email service configured and ready');
    return true;
  } catch (error) {
    console.log('❌ Email service connection FAILED:', (error as Error).message);
    return false;
  }
}

// Get email configuration status (for debugging)
export function getEmailConfigStatus(): { configured: boolean; host: string; port: number; user: string; hasPassword: boolean } {
  return {
    configured: IS_SMTP_CONFIGURED,
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    user: EMAIL_CONFIG.auth.user || 'NOT SET',
    hasPassword: !!EMAIL_CONFIG.auth.pass
  };
}

// Send test email
export async function sendTestEmail(toEmail: string): Promise<{ success: boolean; message: string }> {
  if (!IS_SMTP_CONFIGURED) {
    return { success: false, message: 'SMTP not configured. Set SMTP_USER and SMTP_PASS environment variables.' };
  }

  try {
    await transporter.sendMail({
      from: `"Twende Travel" <${EMAIL_CONFIG.auth.user}>`,
      to: toEmail,
      subject: '🧪 Test Email from Twende Travel',
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #f4f4f5;">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px;">
            <h1 style="color: #22c55e; margin: 0;">✅ Email Works!</h1>
            <p style="color: #52525b; margin-top: 20px;">
              This is a test email from your Twende Travel platform.
              If you received this, your email configuration is working correctly!
            </p>
            <p style="color: #a1a1aa; font-size: 12px; margin-top: 30px;">
              Sent at: ${new Date().toISOString()}
            </p>
          </div>
        </div>
      `,
      text: `Test email from Twende Travel. Your email configuration is working! Sent at: ${new Date().toISOString()}`
    });
    return { success: true, message: `Test email sent to ${toEmail}` };
  } catch (error) {
    return { success: false, message: `Failed to send: ${(error as Error).message}` };
  }
}

// Send verification email
export async function sendVerificationEmail(
  email: string,
  firstName: string,
  verificationToken: string
): Promise<boolean> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: `"Twende Travel" <${EMAIL_CONFIG.auth.user || 'noreply@twende.travel'}>`,
    to: email,
    subject: '✈️ Verify Your Twende Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 32px;">🌍 Twende</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">East Africa Travel Booking Platform</p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #18181b; margin: 0 0 20px;">Hello ${firstName}! 👋</h2>
            
            <p style="color: #52525b; line-height: 1.6; margin: 0 0 20px;">
              Welcome to Twende! We're excited to have you on board. To complete your registration and start booking amazing trips across East Africa, please verify your email address.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                ✓ Verify My Email
              </a>
            </div>
            
            <p style="color: #71717a; font-size: 14px; margin: 20px 0;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color: #0ea5e9; font-size: 12px; word-break: break-all; background: #f4f4f5; padding: 12px; border-radius: 8px;">
              ${verificationLink}
            </p>
            
            <div style="border-top: 1px solid #e4e4e7; margin-top: 30px; padding-top: 20px;">
              <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                This link expires in 24 hours. If you didn't create an account with Twende, you can safely ignore this email.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px;">
            <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Twende Travel. Built with ❤️ by AlfredoCAMP
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hello ${firstName}!

Welcome to Twende! To complete your registration, please verify your email address by clicking the link below:

${verificationLink}

This link expires in 24 hours.

If you didn't create an account with Twende, you can safely ignore this email.

- The Twende Team
    `
  };

  try {
    // Check if email is configured
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      console.log(`📧 [DEMO MODE] Verification email would be sent to: ${email}`);
      console.log(`   Verification link: ${verificationLink}`);
      return true; // Return true in demo mode
    }

    await transporter.sendMail(mailOptions);
    console.log(`📧 Verification email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

// Send welcome email after verification
export async function sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  const mailOptions = {
    from: `"Twende Travel" <${EMAIL_CONFIG.auth.user || 'noreply@twende.travel'}>`,
    to: email,
    subject: '🎉 Welcome to Twende - Your Account is Verified!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 48px;">🎉</h1>
            <h2 style="color: white; margin: 10px 0 0;">You're All Set!</h2>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #18181b; margin: 0 0 20px;">Welcome aboard, ${firstName}! 🚀</h2>
            
            <p style="color: #52525b; line-height: 1.6; margin: 0 0 20px;">
              Your email has been verified and your Twende account is now fully activated. You can now:
            </p>
            
            <ul style="color: #52525b; line-height: 2;">
              <li>🔍 Search for trips across East Africa</li>
              <li>🚌 Book buses, flights, trains & ferries</li>
              <li>💳 Pay securely with M-Pesa, MTN MoMo, or card</li>
              <li>🎫 Download your tickets instantly</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Start Exploring →
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px;">
            <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Twende Travel. Built with ❤️ by AlfredoCAMP
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      console.log(`📧 [DEMO MODE] Welcome email would be sent to: ${email}`);
      return true;
    }

    await transporter.sendMail(mailOptions);
    console.log(`📧 Welcome email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

// Booking confirmation data interface
interface BookingDetails {
  bookingReference: string;
  passengerName: string;
  passengerEmail: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime?: string;
  seats: number;
  price: number;
  currency: string;
  travelMode?: string;
  providerName?: string;
}

// Send booking confirmation email
export async function sendBookingConfirmationEmail(booking: BookingDetails): Promise<boolean> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const departureDate = new Date(booking.departureTime);
  const formattedDate = departureDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = departureDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const travelModeEmoji = {
    'bus': '🚌',
    'flight': '✈️',
    'train': '🚂',
    'ferry': '⛴️',
    'shuttle': '🚐'
  }[booking.travelMode?.toLowerCase() || 'bus'] || '🎫';

  const mailOptions = {
    from: `"Twende Travel" <${EMAIL_CONFIG.auth.user || 'noreply@twende.travel'}>`,
    to: booking.passengerEmail,
    subject: `${travelModeEmoji} Booking Confirmed! ${booking.origin} → ${booking.destination} | Ref: ${booking.bookingReference}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 48px;">${travelModeEmoji}</h1>
            <h2 style="color: white; margin: 10px 0 0;">Booking Confirmed!</h2>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Reference: <strong>${booking.bookingReference}</strong></p>
          </div>
          
          <!-- Ticket Card -->
          <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #18181b; margin: 0 0 20px;">Hello ${booking.passengerName}! 👋</h2>
            
            <p style="color: #52525b; line-height: 1.6; margin: 0 0 20px;">
              Your booking has been confirmed! Here are your trip details:
            </p>
            
            <!-- Trip Details Card -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px dashed #e2e8f0; border-radius: 12px; padding: 24px; margin: 20px 0;">
              <!-- Route -->
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <div style="text-align: center; flex: 1;">
                  <p style="color: #0ea5e9; font-size: 12px; margin: 0; text-transform: uppercase;">From</p>
                  <p style="color: #18181b; font-size: 20px; font-weight: bold; margin: 4px 0;">${booking.origin}</p>
                </div>
                <div style="color: #94a3b8; font-size: 24px; padding: 0 20px;">→</div>
                <div style="text-align: center; flex: 1;">
                  <p style="color: #22c55e; font-size: 12px; margin: 0; text-transform: uppercase;">To</p>
                  <p style="color: #18181b; font-size: 20px; font-weight: bold; margin: 4px 0;">${booking.destination}</p>
                </div>
              </div>
              
              <!-- Divider -->
              <div style="border-top: 2px dashed #e2e8f0; margin: 20px 0;"></div>
              
              <!-- Details Grid -->
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #64748b; font-size: 12px;">📅 Date</span><br>
                    <span style="color: #18181b; font-weight: 600;">${formattedDate}</span>
                  </td>
                  <td style="padding: 8px 0; text-align: right;">
                    <span style="color: #64748b; font-size: 12px;">🕐 Time</span><br>
                    <span style="color: #18181b; font-weight: 600;">${formattedTime}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #64748b; font-size: 12px;">👥 Passengers</span><br>
                    <span style="color: #18181b; font-weight: 600;">${booking.seats} seat(s)</span>
                  </td>
                  <td style="padding: 8px 0; text-align: right;">
                    <span style="color: #64748b; font-size: 12px;">🏢 Provider</span><br>
                    <span style="color: #18181b; font-weight: 600;">${booking.providerName || 'Twende Travel'}</span>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <div style="border-top: 2px dashed #e2e8f0; margin: 20px 0;"></div>
              
              <!-- Total Price -->
              <div style="text-align: center;">
                <p style="color: #64748b; font-size: 12px; margin: 0;">Total Amount</p>
                <p style="color: #22c55e; font-size: 32px; font-weight: bold; margin: 8px 0;">${booking.currency} ${booking.price.toLocaleString()}</p>
              </div>
            </div>
            
            <!-- Important Info -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>⚠️ Important:</strong> Please arrive at least 30 minutes before departure. Show this email or your booking reference at check-in.
              </p>
            </div>
            
            <!-- View Booking Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}/bookings" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                View My Bookings →
              </a>
            </div>
            
            <div style="border-top: 1px solid #e4e4e7; margin-top: 30px; padding-top: 20px;">
              <p style="color: #a1a1aa; font-size: 12px; margin: 0; text-align: center;">
                Need help? Contact us at support@twende.travel
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding: 20px;">
            <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Twende Travel. Safe travels! 🌍
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
BOOKING CONFIRMED! ${travelModeEmoji}
Reference: ${booking.bookingReference}

Hello ${booking.passengerName}!

Your booking has been confirmed. Here are your trip details:

FROM: ${booking.origin}
TO: ${booking.destination}
DATE: ${formattedDate}
TIME: ${formattedTime}
PASSENGERS: ${booking.seats} seat(s)
PROVIDER: ${booking.providerName || 'Twende Travel'}
TOTAL: ${booking.currency} ${booking.price.toLocaleString()}

IMPORTANT: Please arrive at least 30 minutes before departure. Show this email or your booking reference at check-in.

View your bookings at: ${frontendUrl}/bookings

Safe travels!
- The Twende Team
    `
  };

  try {
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      console.log(`📧 [DEMO MODE] Booking confirmation would be sent to: ${booking.passengerEmail}`);
      console.log(`   Booking Reference: ${booking.bookingReference}`);
      return true;
    }

    await transporter.sendMail(mailOptions);
    console.log(`📧 Booking confirmation sent to: ${booking.passengerEmail} (Ref: ${booking.bookingReference})`);
    return true;
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
    return false;
  }
}

// Send signup welcome email (immediate, no verification required)
export async function sendSignupWelcomeEmail(email: string, firstName: string): Promise<boolean> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  const mailOptions = {
    from: `"Twende Travel" <${EMAIL_CONFIG.auth.user || 'noreply@twende.travel'}>`,
    to: email,
    subject: '🎉 Welcome to Twende Travel - Start Your Journey!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 48px;">🎉</h1>
            <h2 style="color: white; margin: 10px 0 0;">Welcome to Twende!</h2>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #18181b; margin: 0 0 20px;">Hello ${firstName}! 👋</h2>
            
            <p style="color: #52525b; line-height: 1.6; margin: 0 0 20px;">
              Thank you for joining Twende Travel! Your account has been created successfully. You're now ready to explore and book amazing trips across East Africa.
            </p>
            
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 24px; margin: 20px 0;">
              <h3 style="color: #18181b; margin: 0 0 16px;">What you can do now:</h3>
              <ul style="color: #52525b; line-height: 2; padding-left: 20px; margin: 0;">
                <li>🔍 Search for trips to Nairobi, Kigali, Dar es Salaam & more</li>
                <li>🚌 Book buses, ✈️ flights, 🚂 trains & ⛴️ ferries</li>
                <li>💳 Pay securely with M-Pesa, MTN MoMo, or card</li>
                <li>🎫 Get instant e-tickets sent to your email</li>
                <li>🤖 Use AI-powered search to find the best trips</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}/search" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                🔍 Search Trips Now
              </a>
            </div>
            
            <div style="border-top: 1px solid #e4e4e7; margin-top: 30px; padding-top: 20px;">
              <p style="color: #a1a1aa; font-size: 12px; margin: 0; text-align: center;">
                Questions? Contact us at support@twende.travel
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px;">
            <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Twende Travel. Your journey starts here! 🌍
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to Twende Travel, ${firstName}! 🎉

Thank you for joining us! Your account has been created successfully.

What you can do now:
- Search for trips to Nairobi, Kigali, Dar es Salaam & more
- Book buses, flights, trains & ferries
- Pay securely with M-Pesa, MTN MoMo, or card
- Get instant e-tickets sent to your email

Start searching: ${frontendUrl}/search

Questions? Contact us at support@twende.travel

Your journey starts here!
- The Twende Team
    `
  };

  try {
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      console.log(`📧 [DEMO MODE] Welcome email would be sent to: ${email}`);
      return true;
    }

    await transporter.sendMail(mailOptions);
    console.log(`📧 Welcome email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

export default {
  generateVerificationToken,
  generateTokenExpiry,
  verifyEmailConfig,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendSignupWelcomeEmail,
  sendBookingConfirmationEmail,
  IS_SMTP_CONFIGURED
};

