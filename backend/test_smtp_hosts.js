const nodemailer = require('nodemailer');
const fs = require('fs');
require('dotenv').config();

const logFile = './test_out.log';
fs.writeFileSync(logFile, '=== STARTING MAILERCLOUD SENDER DOMAIN DIAGNOSTIC ===\n');

function log(msg) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

async function testFrom(fromAddress) {
  log(`\nTesting Mailercloud From: "${fromAddress}"`);
  const transporter = nodemailer.createTransport({
    host: 'smtp-prod.mailrcld.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000
  });

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: 'sb1258954@gmail.com',
      subject: 'VÆROX Invoice Diagnostic',
      text: 'Test message from VÆROX invoice system.'
    });
    log(`[SUCCESS!!!] Delivered with Message ID: ${info.messageId || info.id}`);
    return true;
  } catch (err) {
    log(`[FAILED] Error: ${err.message}`);
    return false;
  }
}

async function runAll() {
  const user = process.env.SMTP_EMAIL;

  // Test 1: no-reply@mailrcld.com
  if (await testFrom('no-reply@mailrcld.com')) return;

  // Test 2: info@mailrcld.com
  if (await testFrom('info@mailrcld.com')) return;

  // Test 3: support@mailrcld.com
  if (await testFrom('support@mailrcld.com')) return;

  // Test 4: notification@mailrcld.com
  if (await testFrom('notification@mailrcld.com')) return;
}

runAll();
