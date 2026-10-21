require("dotenv").config();
const mongoose = require("mongoose");

const readConn = mongoose.createConnection(process.env.DB_URI_READ);
const writeConn = mongoose.createConnection(process.env.DB_URI_WRITE);

async function connectDB() {
  try {
    await readConn.asPromise();
    console.log("Connected to MongoDB Atlas (READ)");
    await writeConn.asPromise();
    console.log("Connected to MongoDB Atlas (WRITE)");
  } catch (error) {
    console.error(`Lỗi kết nối: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { readConn, writeConn, connectDB };
