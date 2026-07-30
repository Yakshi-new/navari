const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    // Fix Windows ISP DNS blocking SRV lookup for mongodb+srv:// URIs
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch (dnsErr) {
      // Ignore if setServers fails in restrictive environments
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
