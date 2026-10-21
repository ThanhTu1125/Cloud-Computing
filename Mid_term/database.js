const mongoose = require("mongoose");
require("dotenv").config();

const readConnection = mongoose.createConnection(process.env.DB_URI_READ);
readConnection.on("connected", () => console.log("Đã kết nối tài khoản ĐỌC."));

const writeConnection = mongoose.createConnection(process.env.DB_URI_WRITE);
writeConnection.on("connected", () => console.log("Đã kết nối tài khoản GHI."));

const bookSchema = new mongoose.Schema({
  maSanPham: { type: String, required: true },
  tenSach: { type: String, required: true },
  giaGoc: { type: Number, required: true },
  giaSauThue: { type: Number },
  vat: { type: String },
});

const BookRead = readConnection.model("Book", bookSchema, "Books");
const BookWrite = writeConnection.model("Book", bookSchema, "Books");

module.exports = { BookRead, BookWrite };
