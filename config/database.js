const mongoose = require("mongoose");

const connectDatabase = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured in the environment");
  }

  const connection = await mongoose.connect(process.env.MONGO_URI);

  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
};

module.exports = connectDatabase;
