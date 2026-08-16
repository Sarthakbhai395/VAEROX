const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// GitHub repository info
const REPO = 'mr-nitin28/Akario-Mart';
const ISSUES_DIR = path.join(__dirname, '..', '.github', 'issues');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function run() {
  console.log('=== GitHub Issue Creator ===');
  
  // Get GitHub Token
  let token = process.env.GITHUB_TOKEN;
  if (!token) {
    token = await askQuestion('Please enter your GitHub Personal Access Token (PAT): ');
    token = token.trim();
  }

  if (!token) {
    console.error('Error: GitHub token is required.');
    rl.close();
    process.exit(1);
  }

  // Get issue files
  if (!fs.existsSync(ISSUES_DIR)) {
    console.error(`Error: Issues directory not found at ${ISSUES_DIR}`);
    rl.close();
    process.exit(1);
  }

  const files = fs.readdirSync(ISSUES_DIR).filter(file => file.endsWith('.md'));

  if (files.length === 0) {
    console.log('No markdown files found in .github/issues/');
    rl.close();
    process.exit(0);
  }

  console.log(`\nFound ${files.length} issues to create. Publishing to ${REPO}...\n`);

  for (const file of files) {
    const filePath = path.join(ISSUES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Parse title (first line starting with #)
    const lines = content.split('\n');
    const titleLineIndex = lines.findIndex(l => l.trim().startsWith('# '));
    if (titleLineIndex === -1) {
      console.warn(`Skipping ${file}: No title found starting with '# '`);
      continue;
    }

    const title = lines[titleLineIndex].replace('# ', '').trim();
    // Remove the title from body
    const body = lines.slice(titleLineIndex + 1).join('\n').trim();

    console.log(`Creating issue: "${title}"...`);

    try {
      const response = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'NodeJS-Fetch'
        },
        body: JSON.stringify({ title, body })
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ Success! Issue created at: ${data.html_url}\n`);
      } else {
        console.error(`❌ Failed to create issue: ${data.message}`);
        console.error(JSON.stringify(data.errors || {}));
      }
    } catch (error) {
      console.error(`❌ Network error while creating issue:`, error.message);
    }
  }

  rl.close();
}

run();
