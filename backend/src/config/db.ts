import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Node.js DNS bug with IPv6 and mongodb+srv on Windows/Jio
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.warn('MONGODB_URI is not set in environment variables.');
    return;
  }
  
  const connectWithRetry = async () => {
    try {
      await mongoose.connect(mongoURI);
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection failed, retrying in 5 seconds...', error);
      setTimeout(connectWithRetry, 5000);
    }
  };

  connectWithRetry();
};
