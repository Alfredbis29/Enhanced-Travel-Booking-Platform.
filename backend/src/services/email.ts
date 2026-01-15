// ============================================
// EMAIL SERVICE - Multiple Provider Support
// ============================================
//
// OPTION 1: MAILJET (Easiest - No phone verification!)
// - Sign up at: https://www.mailjet.com (free, email only)
// - Get API keys from: Account Settings → API Keys
// - Set on Render:
//   - MAILJET_API_KEY=your-api-key
//   - MAILJET_SECRET_KEY=your-secret-key
//   - FROM_EMAIL=kalumunabisimwa5@gmail.com
//
// OPTION 2: BREVO (If you have phone access)
// - Sign up at: https://www.brevo.com
// - Get API key from: Settings → SMTP & API
// - Set on Render:
//   - BREVO_API_KEY=xkeysib-xxxxxxxx
//   - FROM_EMAIL=kalumunabisimwa5@gmail.com
//
// ============================================

// Production frontend URL
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://enhanced-travel-booking-platform-fr.vercel.app';

// From email - use YOUR email address
const FROM_EMAIL = process.env.FROM_EMAIL || 'kalumunabisimwa5@gmail.com';
const FROM_NAME = 'Twende Travel';

// Check which email provider is configured
const USE_MAILJET = !!(process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY);
const USE_BREVO = !!process.env.BREVO_API_KEY;
export const IS_EMAIL_CONFIGURED = USE_MAILJET || USE_BREVO;

// API response types
interface MailjetResponse {
  Messages?: Array<{ Status: string; To: Array<{ MessageID: string }> }>;
  ErrorMessage?: string;
}

interface BrevoResponse {
  messageId?: string;
  message?: string;
  code?: string;
}

// Send email via Mailjet API
async function sendWithMailjet(to: string, subject: string, htmlContent: string): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const auth = Buffer.from(`${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`).toString('base64');
    
    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        Messages: [{
          From: { Email: FROM_EMAIL, Name: FROM_NAME },
          To: [{ Email: to }],
          Subject: subject,
          HTMLPart: htmlContent
        }]
      })
    });

    const data = await response.json() as MailjetResponse;
    
    if (!response.ok || data.ErrorMessage) {
      return { success: false, error: data.ErrorMessage || 'Mailjet API error' };
    }
    
    const messageId = data.Messages?.[0]?.To?.[0]?.MessageID;
    return { success: true, id: messageId };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Send email via Brevo API
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
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent
      })
    });

    const data = await response.json() as BrevoResponse;
    
    if (!response.ok) {
      return { success: false, error: data.message || data.code || 'Brevo API error' };
    }
    
    return { success: true, id: data.messageId };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Main send email function - tries available providers
async function sendEmail(to: string, subject: string, htmlContent: string): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!IS_EMAIL_CONFIGURED) {
    console.log(`📧 [DEMO MODE] Email would be sent to: ${to}`);
    console.log(`   Subject: ${subject}`);
    return { success: true, id: 'demo-mode' };
  }

  const provider = USE_MAILJET ? 'Mailjet' : 'Brevo';
  console.log(`📧 Sending email via ${provider}...`);
  console.log(`   To: ${to}`);
  console.log(`   From: ${FROM_NAME} <${FROM_EMAIL}>`);
  console.log(`   Subject: ${subject}`);

  let result;
  if (USE_MAILJET) {
    result = await sendWithMailjet(to, subject, htmlContent);
  } else {
    result = await sendWithBrevo(to, subject, htmlContent);
  }

  if (result.success) {
    console.log(`✅ Email sent successfully via ${provider}! ID: ${result.id}`);
  } else {
    console.error(`❌ Failed to send email via ${provider}: ${result.error}`);
  }

  return result;
}

// Verify email configuration
export async function verifyEmailConfig(): Promise<boolean> {
  console.log('');
  console.log('📧 Email Configuration:');
  console.log(`   - MAILJET_API_KEY: ${process.env.MAILJET_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   - MAILJET_SECRET_KEY: ${process.env.MAILJET_SECRET_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   - BREVO_API_KEY: ${process.env.BREVO_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   - FROM_EMAIL: ${FROM_EMAIL}`);
  console.log(`   - FRONTEND_URL: ${FRONTEND_URL}`);
  
  if (USE_MAILJET) {
    console.log('✅ Email service configured (Mailjet - 200 emails/day free)');
    return true;
  }
  
  if (USE_BREVO) {
    console.log('✅ Email service configured (Brevo - 300 emails/day free)');
    return true;
  }
  
  console.log('');
  console.log('⚠️  Email service NOT configured!');
  console.log('');
  console.log('   EASIEST OPTION (no phone verification):');
  console.log('   1. Sign up at: https://www.mailjet.com');
  console.log('   2. Go to: Account Settings → API Keys');
  console.log('   3. Add to Render environment:');
  console.log('      - MAILJET_API_KEY=your-api-key');
  console.log('      - MAILJET_SECRET_KEY=your-secret-key');
  console.log('      - FROM_EMAIL=kalumunabisimwa5@gmail.com');
  console.log('');
  return false;
}

// Get email configuration status
export function getEmailConfigStatus(): { configured: boolean; provider: string; fromEmail: string } {
  let provider = 'Not configured';
  if (USE_MAILJET) provider = 'Mailjet';
  else if (USE_BREVO) provider = 'Brevo';
  
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
      message: 'Email not configured. Set MAILJET_API_KEY + MAILJET_SECRET_KEY (easiest, no phone needed!) on Render.' 
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
          Provider: ${USE_MAILJET ? 'Mailjet' : 'Brevo'}<br>
          Sent at: ${new Date().toISOString()}
        </p>
      </div>
    </div>
  `;

  const result = await sendEmail(toEmail, subject, html);
  
  if (result.success) {
    return { success: true, message: `Test email sent to ${toEmail} (ID: ${result.id})` };
  }
  return { success: false, message: `Failed: ${result.error}` };
}

// Booking details type
interface BookingDetails {
  bookingReference: string;
  passengerName: string;
  passengerEmail: string;
  origin: string;
  destination: string;
  departureTime: string;
  seats: number;
  price: number;
  currency: string;
  travelMode?: string;
  providerName?: string;
}

// Send signup welcome email
export async function sendSignupWelcomeEmail(email: string, firstName: string): Promise<boolean> {
  console.log(`📧 Sending welcome email to: ${email}`);

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
            Thank you for joining Twende Travel! Your account has been created successfully.
          </p>
          
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 24px; margin: 20px 0;">
            <h3 style="color: #18181b; margin: 0 0 16px;">What you can do:</h3>
            <ul style="color: #52525b; line-height: 2; padding-left: 20px; margin: 0;">
              <li>🔍 Search trips to Nairobi, Kigali, Dar es Salaam & more</li>
              <li>🚌 Book buses, ✈️ flights, 🚂 trains & ⛴️ ferries</li>
              <li>💳 Pay with M-Pesa, MTN MoMo, or card</li>
              <li>🎫 Get instant e-tickets</li>
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
            © ${new Date().getFullYear()} Twende Travel 🌍
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmail(email, subject, html);
  return result.success;
}

// Send booking confirmation email
export async function sendBookingConfirmationEmail(booking: BookingDetails): Promise<boolean> {
  console.log(`📧 Sending booking confirmation to: ${booking.passengerEmail}`);
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
        <div style="background: linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 48px;">${travelModeEmoji}</h1>
          <h2 style="color: white; margin: 10px 0 0;">Booking Confirmed!</h2>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Reference: <strong>${booking.bookingReference}</strong></p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #18181b; margin: 0 0 20px;">Hello ${booking.passengerName}! 👋</h2>
          
          <p style="color: #52525b; line-height: 1.6; margin: 0 0 20px;">
            Your booking has been confirmed! Here are your trip details:
          </p>
          
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px dashed #e2e8f0; border-radius: 12px; padding: 24px; margin: 20px 0;">
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
            
            <div style="border-top: 2px dashed #e2e8f0; margin: 20px 0;"></div>
            
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
            
            <div style="border-top: 2px dashed #e2e8f0; margin: 20px 0;"></div>
            
            <div style="text-align: center;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">Total Amount</p>
              <p style="color: #22c55e; font-size: 32px; font-weight: bold; margin: 8px 0;">${booking.currency} ${booking.price.toLocaleString()}</p>
            </div>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>⚠️ Important:</strong> Please arrive 30 minutes before departure.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/bookings" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View My Bookings →
            </a>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px;">
          <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Twende Travel 🌍
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmail(booking.passengerEmail, subject, html);
  return result.success;
}
