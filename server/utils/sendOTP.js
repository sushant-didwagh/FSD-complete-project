const nodemailer = require('nodemailer');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); // Workaround for Windows/Network IPv6 ENETUNREACH errors

const OTP = require('../models/OTP');

/**
 * Generate a 6-digit OTP, save to DB, and send via email
 * @param {string} email - Recipient email
 */
const sendOTP = async (email) => {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Set expiry to 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Remove any existing OTP for this email
  await OTP.deleteMany({ email });

  // Save new OTP
  await OTP.create({ email, otp, expiresAt });

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Send email
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

  return otp;
};

module.exports = sendOTP;
