const mongoose = require("mongoose");
require("dotenv").config();

// Khởi tạo luồng kết nối Đọc
const readConnection = mongoose.createConnection(process.env.DB_URI_READ);
readConnection.on("connected", () => console.log("Đã kết nối tài khoản ĐỌC."));

// Khởi tạo luồng kết nối Ghi
const writeConnection = mongoose.createConnection(process.env.DB_URI_WRITE);
writeConnection.on("connected", () => console.log("Đã kết nối tài khoản GHI."));

// Định nghĩa Schema (Cấu trúc dữ liệu Sách)
const bookSchema = new mongoose.Schema({
  maSanPham: { type: String, required: true },
  tenSach: { type: String, required: true },
  giaGoc: { type: Number, required: true },
  giaSauThue: { type: Number }, // Tính trước khi lưu xuống Cloud
  vat: { type: String },
});

const BookRead = readConnection.model("Book", bookSchema, "Books");
const BookWrite = writeConnection.model("Book", bookSchema, "Books");

module.exports = { BookRead, BookWrite };
