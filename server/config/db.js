const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS resolvers to prevent Windows SRV lookup failures with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (dnsErr) {
  // Ignore if custom DNS cannot be set
}

const connectDB = async () => {
  const primaryURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resumeiq';
  const localFallbackURI = 'mongodb://127.0.0.1:27017/resumeiq';

  try {
    const conn = await mongoose.connect(primaryURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] Failed to connect using primary URI (${primaryURI.split('@')[1] || primaryURI}): ${error.message}`);

    // If primary was an external or Atlas cluster and failed, attempt fallback to local MongoDB
    if (primaryURI !== localFallbackURI) {
      console.log(`[Database] Attempting connection to local MongoDB fallback (${localFallbackURI})...`);
      try {
        const localConn = await mongoose.connect(localFallbackURI, {
          serverSelectionTimeoutMS: 4000,
        });
        console.log(`[Database] Connected to local MongoDB: ${localConn.connection.host}/${localConn.connection.name}`);
        return localConn;
      } catch (localError) {
        console.error(`[Database Error] Local MongoDB fallback also failed: ${localError.message}`);
      }
    }

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
