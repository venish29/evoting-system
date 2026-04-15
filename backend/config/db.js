// config/db.js — Mongoose connection (used by server.js directly via MONGO_URI)

const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;
