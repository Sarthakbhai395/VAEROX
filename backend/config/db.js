const mongoose = require('mongoose');

const seedDatabase = async () => {
  try {
    const User = require('../models/User');
    const Product = require('../models/Product');

    // 1. Seed Predefined Admin
    let admin = await User.findOne({ email: 'admin@gmail.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: '123456', // Hashed by the model's pre-save hook
        role: 'admin',
        isBlocked: false
      });
      console.log('Predefined admin user created successfully!');
    } else {
      console.log('Predefined admin user already exists.');
    }

    // 2. Seed Mock Products if DB is empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Seeding mock products...');
      const mockProducts = [
        {
          name: 'iPhone 15 Pro',
          description: 'Latest Apple iPhone with titanium design and A17 Pro chip.',
          price: 999,
          discount: 10,
          category: 'electronics',
          image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
          images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'],
          seller: admin._id
        },
        {
          name: 'MacBook Air M3',
          description: 'Supercharged by Apple M3 chip, thin and light laptop.',
          price: 1099,
          discount: 5,
          category: 'electronics',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
          images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'],
          seller: admin._id
        },
        {
          name: 'Leather Jacket',
          description: 'Classic premium black leather jacket for all seasons.',
          price: 150,
          discount: 20,
          category: 'fashion',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
          images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'],
          seller: admin._id
        },
        {
          name: 'Air Fryer Max',
          description: '6-in-1 digital air fryer with 5.5L capacity.',
          price: 120,
          discount: 15,
          category: 'home & kitchen',
          image: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
          images: ['https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'],
          seller: admin._id
        }
      ];
      await Product.insertMany(mockProducts);
      console.log('Mock products seeded successfully!');
    } else {
      // 3. Migrate and update existing mock products with high-quality categories and images
      console.log('Running automatic database migrations for categories and images...');
      await Product.updateMany(
        { name: 'iPhone 15 Pro' },
        { 
          category: 'electronics',
          image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
          images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080']
        }
      );
      await Product.updateMany(
        { name: 'MacBook Air M3' },
        { 
          category: 'electronics',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
          images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080']
        }
      );
      await Product.updateMany(
        { name: 'Leather Jacket' },
        { 
          category: 'fashion',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
          images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080']
        }
      );
      await Product.updateMany(
        { name: 'Air Fryer Max' },
        { 
          category: 'home & kitchen',
          image: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
          images: ['https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080']
        }
      );

      // Migrating general categories if any other records exist
      await Product.updateMany({ category: 'technology' }, { category: 'electronics' });
      await Product.updateMany({ category: 'clothing' }, { category: 'fashion' });
      await Product.updateMany({ category: 'home appliances' }, { category: 'home & kitchen' });
      console.log('Database migrations completed!');
    }
  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
};

const dns = require('dns');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  // Set Google/Cloudflare public DNS servers for Node.js SRV resolution on Windows
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (e) {
    // Ignore DNS set errors
  }

  // Attempt connecting to the user's configured MONGO_URI
  if (mongoUri && mongoUri !== 'memory' && !(mongoUri.includes('mongodb.net') && !mongoUri.includes('@'))) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
      await seedDatabase();
      return;
    } catch (error) {
      console.error(`Primary MongoDB Atlas connection attempt failed (${error.message}).`);
      if (process.env.NODE_ENV === 'production') {
        console.error('FATAL: Production database connection failed. Shutting down process to prevent ephemeral memory fallback.');
        process.exit(1);
      }
    }
  }

  // In production, forbid fallback to MongoMemoryServer
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL ERROR: MONGO_URI is missing or invalid in production. Ephemeral MongoMemoryServer fallback is forbidden in production.');
    process.exit(1);
  }

  // Fallback to MongoMemoryServer ONLY for local development
  try {
    console.log('Starting MongoMemoryServer for local development fallback...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const fallbackUri = mongoServer.getUri();
    global.__MONGO_MEMORY_SERVER__ = mongoServer;

    const conn = await mongoose.connect(fallbackUri);
    console.log(`MongoDB Connected (Memory Server): ${conn.connection.host}`);
    await seedDatabase();
  } catch (err) {
    console.error(`Fatal MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

