const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const { engine } = require("express-handlebars"); // Thêm thư viện Handlebars
const { BookRead, BookWrite } = require("./database");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

// Khởi tạo kho lưu trữ Session
const store = new MongoDBStore({
  uri: process.env.DB_URI_WRITE,
  collection: "sessions",
});
store.on("error", (error) => console.error("Lỗi khi lưu Session:", error));

app.use(
  session({
    secret: "mat_khau_bao_mat_296",
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
    store: store,
    resave: false,
    saveUninitialized: false,
  }),
);

app.get("/", async (req, res) => {
  try {
    req.session.testData = "Đã truy cập trang chủ";

    const books = await BookRead.find({}).lean();
    res.render("home", { books });
  } catch (error) {
    res.status(500).send("Lỗi khi đọc dữ liệu");
  }
});

// Giữ nguyên API POST để phục vụ việc thêm sách
app.post("/api/books", async (req, res) => {
  try {
    const { maSanPham, tenSach, giaGoc } = req.body;

    if (!maSanPham.startsWith("296")) {
      return res
        .status(403)
        .json({ error: "Từ chối: Mã SP phải bắt đầu bằng 296." });
    }

    const vatRate = 10;
    const giaSauThue = Number(giaGoc) + (Number(giaGoc) * vatRate) / 100;

    const newBook = new BookWrite({
      maSanPham,
      tenSach,
      giaGoc,
      giaSauThue,
      vat: `${vatRate}%`,
    });

    await newBook.save();
    res.redirect("/"); // Xử lý xong quay lại trang chủ
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi ghi dữ liệu" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
