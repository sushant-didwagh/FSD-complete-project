require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function main() {
  try {
    const info = await transporter.sendMail({
      from: `"Student Buddy" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Test Email',
      text: 'This is a test.',
    });
    console.log("Success:", info.messageId);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

main();
