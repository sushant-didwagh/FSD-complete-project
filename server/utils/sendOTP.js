const nodemailer = require('nodemailer');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); // Fix Windows/Network IPv6 issues

const OTP = require('../models/OTP');

/**
 * Create a nodemailer transporter — tries port 465 (SSL) first,
 * then port 587 (STARTTLS) as fallback.
 */
const createTransporter = async () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // Attempt 1: Port 465 with SSL (less likely to be blocked by firewalls)
  const transporter465 = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: { user, pass },
    connectionTimeout: 10000, // 10s timeout
  });

  try {
    await transporter465.verify();
    console.log('📧 Email: Connected via port 465 (SSL)');
    return transporter465;
  } catch (err) {
    console.warn('⚠️ Port 465 failed:', err.message);
  }

  // Attempt 2: Port 587 with STARTTLS
  const transporter587 = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: { user, pass },
    connectionTimeout: 10000,
  });

  try {
    await transporter587.verify();
    console.log('📧 Email: Connected via port 587 (STARTTLS)');
    return transporter587;
  } catch (err) {
    console.warn('⚠️ Port 587 failed:', err.message);
  }

  // Attempt 3: Use Gmail service shortcut (auto-detects best method)
  const transporterService = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    connectionTimeout: 10000,
  });

  try {
    await transporterService.verify();
    console.log('📧 Email: Connected via Gmail service');
    return transporterService;
  } catch (err) {
    console.warn('⚠️ Gmail service failed:', err.message);
  }

  return null; // All methods failed
};

/**
 * Generate a 6-digit OTP, save to DB, and send via email.
 * In development mode: if email sending fails, the OTP is logged
 * to the server console so registration can still proceed.
 *
 * @param {string} email - Recipient email
 */
const sendOTP = async (email) => {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Set expiry to 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Remove any existing OTP for this email
  await OTP.deleteMany({ email });

  // Save new OTP to database
  await OTP.create({ email, otp, expiresAt });

  // Try to send email
  try {
    const transporter = await createTransporter();

    if (!transporter) {
      throw new Error('All SMTP connection methods failed');
    }

    await transporter.sendMail({
      from: `"Student Buddy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Your OTP for Student Buddy Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #4f46e5; margin-bottom: 8px;">Student Buddy</h2>
          <p style="color: #374151;">Your One-Time Password for registration:</p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #4f46e5;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p style="color: #6b7280; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    console.log(`✅ OTP sent to ${email} via email`);
  } catch (err) {
    console.error('❌ Email send failed:', err.message);

    // In development mode, log OTP to console so registration still works
    if (process.env.NODE_ENV === 'development') {
      console.log('');
      console.log('═══════════════════════════════════════════════');
      console.log(`📋 DEV MODE — OTP for ${email}: ${otp}`);
      console.log('═══════════════════════════════════════════════');
      console.log('  (Email failed — use this OTP from the console)');
      console.log('');
    } else {
      // In production, re-throw so the API returns an error
      throw new Error('Failed to send OTP email. Please try again later.');
    }
  }

  return otp;
};

module.exports = sendOTP;
