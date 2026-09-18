const fs = require('fs');
require('dotenv').config();

const logFile = './test_out.log';
fs.writeFileSync(logFile, '=== TESTING MAILERCLOUD REST API BODY FORMATS ===\n');

function log(msg) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

async function testCloudApiFormat(bodyObj) {
  const apiKey = process.env.MAILRCLD_API_KEY || 'vkFUj-145b64e450a8688ec31561652af07dff-44b5357210bdd6df3c14728e85c0609f';
  const url = 'https://cloudapi.mailercloud.com/v1/send';
  log(`\nTesting cloudapi.mailercloud.com with body: ${JSON.stringify(bodyObj).substring(0, 80)}...`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'Authorization': apiKey
      },
      body: JSON.stringify(bodyObj)
    });

    const resText = await response.text();
    log(`HTTP STATUS: ${response.status}`);
    log(`RESPONSE BODY: ${resText}`);
  } catch (err) {
    log(`FETCH ERROR: ${err.message}`);
  }
}

async function runAll() {
  const fromEmail = process.env.SMTP_EMAIL || 'sarthakbhatnagar2005@gmail.com';
  const toEmail = 'sb1258954@gmail.com';

  // Format 1
  await testCloudApiFormat({
    from: { name: 'VÆROX Smart Living', email: fromEmail },
    to: [{ name: 'Sarthak Bhatnagar', email: toEmail }],
    subject: 'VÆROX Invoice Test 1',
    html: '<h1>Test Invoice 1</h1>'
  });

  // Format 2
  await testCloudApiFormat({
    from: fromEmail,
    to: [toEmail],
    subject: 'VÆROX Invoice Test 2',
    html: '<h1>Test Invoice 2</h1>'
  });

  // Format 3
  await testCloudApiFormat({
    sender: { name: 'VÆROX Smart Living', email: fromEmail },
    recipients: [{ name: 'Sarthak Bhatnagar', email: toEmail }],
    subject: 'VÆROX Invoice Test 3',
    html: '<h1>Test Invoice 3</h1>'
  });
}

runAll();
