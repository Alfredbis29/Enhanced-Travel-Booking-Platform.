import { Resend } from 'resend';

// ============================================
// EMAIL CONFIGURATION - TWO OPTIONS
// ============================================
//
// OPTION 1: BREVO (Recommended - No domain needed!)
// - Sign up at: https://www.brevo.com
// - Get API key from: Settings → SMTP & API → API Keys
// - Set on Render:
//   - BREVO_API_KEY=xkeysib-xxxxxxxx
//   - FROM_EMAIL=Twende Travel <your-gmail@gmail.com>
//
// OPTION 2: RESEND (Requires domain verification)
// - Sign up at: https://resend.com
// - Verify domain at: https://resend.com/domains
// - Set on Render:
//   - RESEND_API_KEY=re_xxxxxxxxx
//   - FROM_EMAIL=Twende Travel <bookings@yourdomain.com>
//
// ============================================

// Production frontend URL
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://enhanced-travel-booking-platform-fr.vercel.app';

// From email address
const FROM_EMAIL = process.env.FROM_EMAIL || 'Twende Travel <noreply@twendetravel.com>';

// Check which email provider is configured
const USE_BREVO = !!process.env.BREVO_API_KEY;
const USE_RESEND = !!process.env.RESEND_API_KEY;
export const IS_EMAIL_CONFIGURED = USE_BREVO || USE_RESEND;

// Initialize Resend if using it
const resend = USE_RESEND ? new Resend(process.env.RESEND_API_KEY) : null;

// Brevo API response type
interface BrevoResponse {
  messageId?: string;
  message?: string;
}

// Brevo API helper
async function sendWithBrevo(to: string, subject: string, htmlContent: string): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { 
          name: FROM_EMAIL.split('<')[0].trim() || 'Twende Travel',
          email: FROM_EMAIL.match(/<(.+)>/)?.[1] || process.env.FROM_EMAIL || 'noreply@twendetravel.com'
        },
        to: [{ email: to }],
        subject,
        htmlContent
      })
    });

    const data = await response.json() as BrevoResponse;
    
    if (!response.ok) {
      return { success: false, error: data.message || 'Brevo API error' };
    }
    
    return { success: true, id: data.messageId };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Verify email configuration
export async function verifyEmailConfig(): Promise<boolean> {
  console.log('📧 Email Configuration:');
  console.log(`   - BREVO_API_KEY: ${process.env.BREVO_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   - RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   - FROM_EMAIL: ${FROM_EMAIL}`);
  console.log(`   - FRONTEND_URL: ${FRONTEND_URL}`);
  
  if (USE_BREVO) {
    console.log('✅ Email service configured (Brevo - No domain needed!)');
    return true;
  }
  
  if (USE_RESEND) {
    if (FROM_EMAIL.includes('onboarding@resend.dev')) {
      console.log('⚠️  Using Resend TEST MODE - emails only go to your own email');
    }
    console.log('✅ Email service configured (Resend)');
    return true;
  }
  
  console.log('');
  console.log('⚠️  Email service not configured!');
  console.log('   EASIEST OPTION (no domain needed):');
  console.log('   1. Sign up at: https://www.brevo.com');
  console.log('   2. Get API key from: Settings → SMTP & API');
  console.log('   3. Set on Render:');
  console.log('      - BREVO_API_KEY=xkeysib-xxxxxxxx');
  console.log('      - FROM_EMAIL=Twende Travel <kalumunabisimwa5@gmail.com>');
  return false;
}

// Get email configuration status
export function getEmailConfigStatus(): { configured: boolean; provider: string; fromEmail: string } {
  let provider = 'Not configured';
  if (USE_BREVO) provider = 'Brevo (no domain needed)';
  else if (USE_RESEND) provider = 'Resend';
  
  return {
    configured: IS_EMAIL_CONFIGURED,
    provider,
    fromEmail: FROM_EMAIL
  };
}

// Send test email
export async function sendTestEmail(toEmail: string): Promise<{ success: boolean; message: string }> {
  if (!IS_EMAIL_CONFIGURED) {
    return { 
      success: false, 
      message: 'Email not configured. Set BREVO_API_KEY (easiest) or RESEND_API_KEY on Render.' 
    };
  }

  const subject = '🧪 Test Email from Twende Travel';
  const html = `
    <div style="font-family: sans-serif; padding: 20px; background: #f4f4f5;">
      <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px;">
        <h1 style="color: #22c55e; margin: 0;">✅ Email Works!</h1>
        <p style="color: #52525b; margin-top: 20px;">
          This is a test email from your Twende Travel platform.
          If you received this, your email configuration is working correctly!
        </p>
        <p style="color: #a1a1aa; font-size: 12px; margin-top: 30px;">
          Provider: ${USE_BREVO ? 'Brevo' : 'Resend'}<br>
          Sent at: ${new Date().toISOString()}
        </p>
      </div>
    </div>
  `;

  try {
    // Use Brevo if configured (preferred - no domain needed)
    if (USE_BREVO) {
      const result = await sendWithBrevo(toEmail, subject, html);
      if (result.success) {
        return { success: true, message: `Test email sent to ${toEmail} via Brevo (ID: ${result.id})` };
      }
      return { success: false, message: `Brevo error: ${result.error}` };
    }

    // Fall back to Resend
    if (resend) {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject,
        html
      });

      if (error) {
        return { success: false, message: `Resend error: ${error.message}` };
      }
      return { success: true, message: `Test email sent to ${toEmail} via Resend (ID: ${data?.id})` };
    }

    return { success: false, message: 'No email provider configured' };
  } catch (error) {
    return { success: false, message: `Error: ${(error as Error).message}` };
  }
}

// Send signup welcome email
export async function sendSignupWelcomeEmail(email: string, firstName: string): Promise<boolean> {
  console.log(`📧 Attempting to send welcome email to: ${email}`);
  console.log(`   FROM: ${FROM_EMAIL}`);
  console.log(`   Provider: ${USE_BREVO ? 'Brevo' : USE_RESEND ? 'Resend' : 'None'}`);

  if (!IS_EMAIL_CONFIGURED) {
    console.log(`📧 [DEMO MODE] Welcome email would be sent to: ${email}`);
    return true;
  }

  const subject = '🎉 Welcome to Twende Travel - Start Your Journey!';
  const html = `
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
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/search" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              🔍 Search Trips Now
            </a>
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
  `;

  try {
    // Use Brevo if configured (preferred - no domain needed)
    if (USE_BREVO) {
      const result = await sendWithBrevo(email, subject, html);
      if (result.success) {
        console.log(`📧 Welcome email sent to: ${email} via Brevo`);
        return true;
      }
      console.error('Failed to send welcome email via Brevo:', result.error);
      return false;
    }

    // Fall back to Resend
    if (resend) {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject,
        html
      });

      if (error) {
        console.error('Failed to send welcome email via Resend:', error.message);
        return false;
      }
      console.log(`📧 Welcome email sent to: ${email} via Resend`);
      return true;
    }

    console.error('No email provider configured');
    return false;
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
  console.log(`📧 Attempting to send booking confirmation to: ${booking.passengerEmail}`);
  console.log(`   FROM: ${FROM_EMAIL}`);
  console.log(`   Provider: ${USE_BREVO ? 'Brevo' : USE_RESEND ? 'Resend' : 'None'}`);
  console.log(`   Booking Reference: ${booking.bookingReference}`);
  
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

  if (!IS_EMAIL_CONFIGURED) {
    console.log(`📧 [DEMO MODE] Booking confirmation would be sent to: ${booking.passengerEmail}`);
    console.log(`   Booking Reference: ${booking.bookingReference}`);
    return true;
  }

  const subject = `${travelModeEmoji} Booking Confirmed! ${booking.origin} → ${booking.destination} | Ref: ${booking.bookingReference}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="text-align: center; padding: 10px;">
                  <p style="color: #0ea5e9; font-size: 12px; margin: 0; text-transform: uppercase;">From</p>
                  <p style="color: #18181b; font-size: 20px; font-weight: bold; margin: 4px 0;">${booking.origin}</p>
                </td>
                <td style="text-align: center; color: #94a3b8; font-size: 24px;">→</td>
                <td style="text-align: center; padding: 10px;">
                  <p style="color: #22c55e; font-size: 12px; margin: 0; text-transform: uppercase;">To</p>
                  <p style="color: #18181b; font-size: 20px; font-weight: bold; margin: 4px 0;">${booking.destination}</p>
                </td>
              </tr>
            </table>
            
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
            <a href="${FRONTEND_URL}/bookings" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View My Bookings →
            </a>
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
  `;

  try {
    // Use Brevo if configured (preferred - no domain needed)
    if (USE_BREVO) {
      const result = await sendWithBrevo(booking.passengerEmail, subject, html);
      if (result.success) {
        console.log(`📧 Booking confirmation sent to: ${booking.passengerEmail} via Brevo (Ref: ${booking.bookingReference})`);
        return true;
      }
      console.error('Failed to send booking confirmation via Brevo:', result.error);
      return false;
    }

    // Fall back to Resend
    if (resend) {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: booking.passengerEmail,
        subject,
        html
      });

      if (error) {
        console.error('Failed to send booking confirmation via Resend:', error.message);
        return false;
      }
      console.log(`📧 Booking confirmation sent to: ${booking.passengerEmail} via Resend (Ref: ${booking.bookingReference})`);
      return true;
    }

    console.error('No email provider configured');
    return false;
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
    return false;
  }
}

export default {
  verifyEmailConfig,
  getEmailConfigStatus,
  sendTestEmail,
  sendSignupWelcomeEmail,
  sendBookingConfirmationEmail,
  IS_EMAIL_CONFIGURED
};
