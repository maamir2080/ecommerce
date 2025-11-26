const mongoose = require('mongoose');

let isConnected = false;

const connectDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoUri, options);
    isConnected = true;
    
    if (!process.env.VERCEL) {
      console.log('MongoDB connected successfully');
    }
  } catch (error) {
    isConnected = false;
    console.error('MongoDB connection error:', error);
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


