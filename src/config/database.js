const mongoose = require('mongoose');

let isConnected = false;

const connectDatabase = async () => {
  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    
    if (!mongoUri || !mongoUri.includes('mongodb')) {
      throw new Error('Invalid MONGODB_URI: Connection string is missing or invalid');
    }
    
    const options = {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true,
    };

    await mongoose.connect(mongoUri, options);
    isConnected = true;
    
    if (!process.env.VERCEL) {
      console.log('MongoDB connected successfully');
    }
  } catch (error) {
    isConnected = false;
    console.error('MongoDB connection error:', error.message);
    
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase
};


