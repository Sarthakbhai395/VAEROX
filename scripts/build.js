const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building VÆROX frontend for production deployment...');
execSync('npm install --prefix frontend && npm run build --prefix frontend', { stdio: 'inherit' });

const distPath = path.join(__dirname, '..', 'frontend', 'dist');
const publicPath = path.join(__dirname, '..', 'public');

if (fs.existsSync(distPath)) {
  if (fs.existsSync(publicPath)) {
    fs.rmSync(publicPath, { recursive: true, force: true });
  }
  fs.cpSync(distPath, publicPath, { recursive: true });
  console.log('Successfully copied frontend build output to public/');
}
