import nodemailer from 'nodemailer';

// Read SMTP settings from env so different environments can configure safely
const {
  SMTP_HOST = 'smtp-relay.brevo.com',
  SMTP_PORT = '587',
  SMTP_USER,
  SMTP_PASS,
} = process.env;

// Create transporter only if credentials are available
let transporter = null;

if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
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
} else {
  console.warn('Warning: SMTP credentials are missing. Email functionality will be disabled. Set SMTP_USER and SMTP_PASS environment variables.');
  
  // Create a dummy transporter that will fail gracefully
  transporter = {
    sendMail: async (mailOptions) => {
      console.error('Email sending failed: SMTP credentials not configured');
      throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
    }
  };
}

export default transporter;