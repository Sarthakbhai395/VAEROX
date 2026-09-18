const fs = require('fs');

async function trigger() {
  const logFile = './test_result.log';
  fs.writeFileSync(logFile, `=== TESTING DYNAMIC EMAIL API AT ${new Date().toISOString()} ===\n`);

  try {
    const res = await fetch('http://localhost:5000/api/test-email?email=sb1258954@gmail.com&name=Sarthak%20Bhatnagar&product=V%C3%86ROX%20Atelier%20Sculpted%20Velvet%20Blazer&price=14999&size=34');
    const data = await res.json();
    fs.appendFileSync(logFile, `RESPONSE: ${JSON.stringify(data, null, 2)}\n`);
  } catch (err) {
    fs.appendFileSync(logFile, `FETCH ERROR: ${err.message}\n`);
  }
}

trigger();
