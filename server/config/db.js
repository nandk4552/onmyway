const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `Connected to MongoDB ${mongoose.connection.host}`.bgRed.white.bold
    );
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`.bgRed.white);
  }
};

module.exports = connectDB;
