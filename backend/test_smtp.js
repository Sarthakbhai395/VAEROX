const nodemailer = require('nodemailer');
require('dotenv').config();

const safeHost = process.env.SMTP_HOST || 'smtp-prod.mailrcld.com';
const safePort = parseInt(process.env.SMTP_PORT, 10) || 587;
const safeUser = process.env.SMTP_EMAIL ? process.env.SMTP_EMAIL.replace(/(.{2})(.*)(?=@)/, '$1***') : 'Not Configured';

console.log('--- Akario Mart SMTP Diagnostic Check ---');
console.log(`Target Host: ${safeHost}`);
console.log(`Target Port: ${safePort}`);
console.log(`Masked User: ${safeUser}`);

if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
  console.error('[ERROR] Missing SMTP credentials in environment variables.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: safeHost,
  port: safePort,
  secure: safePort === 465,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000
});

transporter.verify((error, success) => {
  if (error) {
    console.error('[SMTP VERIFICATION FAILED]', error.message);
    process.exit(1);
  } else {
    console.log('[SMTP VERIFICATION SUCCESS] Connection and authentication established successfully!');
    process.exit(0);
  }
});
