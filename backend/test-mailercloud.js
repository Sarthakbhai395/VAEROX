const nodemailer = require('nodemailer');
require('dotenv').config();

const safeHost = process.env.SMTP_HOST || 'smtp-prod.mailrcld.com';
const safePort = parseInt(process.env.SMTP_PORT, 10) || 587;
const safeUser = process.env.SMTP_EMAIL ? process.env.SMTP_EMAIL.replace(/(.{2})(.*)(?=@)/, '$1***') : 'NOT CONFIGURED';
const testRecipient = process.env.TEST_EMAIL || process.env.SMTP_EMAIL;

// Extract clean email address without quotes or display names for strict SMTP envelope compliance
const rawFrom = (process.env.SMTP_FROM_EMAIL || process.env.SMTP_EMAIL || '').trim();
const emailMatch = rawFrom.match(/<([^>]+)>/);
const cleanFromEmail = emailMatch ? emailMatch[1].trim() : rawFrom.replace(/["']/g, '').trim();

console.log('=== AKARIO MART MAILERCLOUD SMTP DIAGNOSTIC ===');
console.log(`SMTP HOST: ${safeHost}`);
console.log(`SMTP PORT: ${safePort}`);
console.log(`SMTP USER: ${safeUser}`);
console.log(`FROM EMAIL: ${cleanFromEmail.replace(/(.{2})(.*)(?=@)/, '$1***')}`);

if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
  console.error('[DIAGNOSTIC ERROR] Missing SMTP credentials in environment variables.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: safeHost,
  port: safePort,
  secure: safePort === 465,
  requireTLS: safePort === 587,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000
});

async function runDiagnostic() {
  try {
    console.log('Testing transporter.verify()...');
    await transporter.verify();
    console.log('SMTP VERIFY: SUCCESS');

    if (testRecipient) {
      console.log(`Sending test message to: ${testRecipient.replace(/(.{2})(.*)(?=@)/, '$1***')}...`);
      const info = await transporter.sendMail({
        from: cleanFromEmail,
        sender: cleanFromEmail,
        replyTo: cleanFromEmail,
        envelope: {
          from: cleanFromEmail,
          to: [testRecipient]
        },
        to: testRecipient,
        subject: 'Akario Mart SMTP Test',
        text: 'This is a test email from Akario Mart SMTP diagnostic tool.'
      });

      console.log('SMTP SEND: SUCCESS');
      console.log('MESSAGE ID:', info.messageId || info.id || 'ACCEPTED');
      console.log('ACCEPTED:', info.accepted);
      console.log('REJECTED:', info.rejected);
      console.log('RESPONSE:', info.response);
    }
    process.exit(0);
  } catch (err) {
    console.error('SMTP DIAGNOSTIC FAILED');
    console.error('CODE:', err.code);
    console.error('RESPONSE CODE:', err.responseCode);
    console.error('COMMAND:', err.command);
    console.error('RESPONSE:', err.response);
    console.error('MESSAGE:', err.message);
    process.exit(1);
  }
}

runDiagnostic();
