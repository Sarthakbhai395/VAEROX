const dotenv = require('dotenv');
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
dotenv.config();

console.log('--- TESTING CONFIGURATION ---');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'MISSING');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'MISSING');
console.log('IMAGEKIT_PUBLIC_KEY:', process.env.IMAGEKIT_PUBLIC_KEY ? 'Loaded' : 'MISSING');
console.log('IMAGEKIT_PRIVATE_KEY:', process.env.IMAGEKIT_PRIVATE_KEY ? 'Loaded' : 'MISSING');
console.log('IMAGEKIT_URL_ENDPOINT:', process.env.IMAGEKIT_URL_ENDPOINT ? 'Loaded' : 'MISSING');

async function testMongo() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('SUCCESS: Connected to MongoDB Atlas!');
    console.log('Host:', mongoose.connection.host);
    console.log('Database Name:', mongoose.connection.name);
    await mongoose.disconnect();
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
  }
}

function testImageKit() {
  try {
    const { getImageKit } = require('../utils/imagekit');
    const ik = getImageKit();
    console.log('SUCCESS: ImageKit initialized successfully!');
  } catch (err) {
    console.error('ImageKit Error:', err.message);
  }
}

(async () => {
  await testMongo();
  testImageKit();
  process.exit(0);
})();
