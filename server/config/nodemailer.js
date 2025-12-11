import nodemailer from 'nodemailer';

// Read SMTP settings from env so different environments can configure safely
const {
  SMTP_HOST = 'smtp-relay.brevo.com',
  SMTP_PORT = '587',
  SMTP_USER,
  SMTP_PASS,
} = process.env;

if (!SMTP_USER || !SMTP_PASS) {
  throw new Error('SMTP credentials are missing. Set SMTP_USER and SMTP_PASS.');
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465, // Brevo uses 587 (STARTTLS) by default
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    // Allow dev environments with intercepted certificates; safe for Brevo
    rejectUnauthorized: false,
  },
});

// Surface configuration issues early instead of failing on first send
transporter.verify().catch((err) => {
  console.error('Failed to initialize SMTP transporter:', err.message);
});

export default transporter;