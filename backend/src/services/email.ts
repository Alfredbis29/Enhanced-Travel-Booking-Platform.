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
    await transporter.verify();
    console.log('✅ Email service configured and ready');
    return true;
  } catch (error) {
    console.log('⚠️  Email service not available:', (error as Error).message);
    return false;
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

export default {
  generateVerificationToken,
  generateTokenExpiry,
  verifyEmailConfig,
  sendVerificationEmail,
  sendWelcomeEmail
};

