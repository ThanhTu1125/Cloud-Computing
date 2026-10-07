const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const { engine } = require("express-handlebars");
const { BookRead, BookWrite } = require("./database");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình Handlebars với các helper tiện ích
app.engine(
  "handlebars",
  engine({
    helpers: {
      formatCurrency: (value) => {
        if (value === null || value === undefined || isNaN(value)) return "0 đ";
        return Number(value).toLocaleString("vi-VN") + " đ";
      },
      addOne: (index) => Number(index) + 1,
      eq: (a, b) => a === b,
      gt: (a, b) => a > b,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", "./views");

// Khởi tạo kho lưu trữ Session trên MongoDB Atlas
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

// Route trang chủ (Luồng ĐỌC)
app.get("/", async (req, res) => {
  // Lấy các thông báo lỗi / thành công và dữ liệu form từ session
  const errorMessage = req.session.errorMessage || null;
  const successMessage = req.session.successMessage || null;
  const formData = req.session.formData || {};

  // Xóa flash message khỏi session sau khi lấy ra
  delete req.session.errorMessage;
  delete req.session.successMessage;
  delete req.session.formData;

  let books = [];
  let dbError = null;

  try {
    req.session.testData = "Đã truy cập trang chủ";
    books = await BookRead.find({}).lean();
  } catch (error) {
    console.error("Lỗi khi đọc dữ liệu từ Cloud (tài khoản ĐỌC):", error);
    dbError = "Không thể kết nối hoặc đọc dữ liệu từ Cloud (Tài khoản ĐỌC): " + (error.message || "Lỗi máy chủ");
  }

  // Thống kê nhanh hiển thị trên Dashboard
  const totalBooks = books.length;
  const totalValue = books.reduce((sum, b) => sum + (Number(b.giaGoc) || 0), 0);
  const totalValueAfterTax = books.reduce((sum, b) => sum + (Number(b.giaSauThue) || 0), 0);

  // Đảm bảo session được cập nhật rồi render view
  req.session.save((saveErr) => {
    if (saveErr) console.error("Lỗi lưu session:", saveErr);
    res.render("home", {
      books,
      errorMessage: errorMessage || dbError,
      successMessage,
      formData,
      totalBooks,
      totalValue,
      totalValueAfterTax,
      vatRate: 10,
    });
  });
});

// Route thêm sách (Luồng GHI)
app.post("/api/books", async (req, res) => {
  const isApiRequest =
    req.xhr ||
    (req.headers.accept && req.headers.accept.includes("application/json") && !req.headers.accept.includes("text/html")) ||
    req.is("json");

  const { maSanPham, tenSach, giaGoc } = req.body;
  const inputData = { maSanPham, tenSach, giaGoc };

  // Helper phản hồi lỗi (phân biệt request qua API JSON hoặc Form HTML)
  const respondError = (statusCode, message) => {
    if (isApiRequest) {
      return res.status(statusCode).json({ success: false, error: message });
    }
    req.session.errorMessage = message;
    req.session.formData = inputData;
    return req.session.save((err) => {
      if (err) console.error("Lỗi lưu session:", err);
      res.redirect("/");
    });
  };

  // Helper phản hồi thành công
  const respondSuccess = (message, book) => {
    if (isApiRequest) {
      return res.status(201).json({ success: true, message, book });
    }
    req.session.successMessage = message;
    delete req.session.formData;
    return req.session.save((err) => {
      if (err) console.error("Lỗi lưu session:", err);
      res.redirect("/");
    });
  };

  try {
    const cleanMaSP = String(maSanPham || "").trim();
    const cleanTenSach = String(tenSach || "").trim();
    const cleanGiaGoc = Number(giaGoc);

    // 1. Kiểm tra để trống các trường dữ liệu
    if (!cleanMaSP || !cleanTenSach || giaGoc === undefined || giaGoc === "") {
      return respondError(400, "Vui lòng nhập đầy đủ tất cả các trường: Mã sản phẩm, Tên sách và Giá gốc.");
    }

    // 2. Kiểm tra quy định Mã SP bắt buộc bắt đầu bằng 296
    if (!cleanMaSP.startsWith("296")) {
      return respondError(403, "Từ chối thêm sách: Mã sản phẩm bắt buộc phải bắt đầu bằng 296 (Quy định MSSV 23IT296).");
    }

    // 3. Kiểm tra tính hợp lệ của giá gốc
    if (isNaN(cleanGiaGoc) || cleanGiaGoc <= 0) {
      return respondError(400, "Giá gốc không hợp lệ: Giá phải là số dương lớn hơn 0 VNĐ.");
    }

    // 4. Kiểm tra trùng lặp mã sản phẩm trong CSDL
    const existingBook = await BookRead.findOne({ maSanPham: cleanMaSP });
    if (existingBook) {
      return respondError(409, `Mã sản phẩm "${cleanMaSP}" đã tồn tại trong hệ thống (Sách: "${existingBook.tenSach}"). Vui lòng chọn mã khác.`);
    }

    // 5. Tính toán thuế VAT 10%
    const vatRate = 10;
    const giaSauThue = Math.round(cleanGiaGoc + (cleanGiaGoc * vatRate) / 100);

    const newBook = new BookWrite({
      maSanPham: cleanMaSP,
      tenSach: cleanTenSach,
      giaGoc: cleanGiaGoc,
      giaSauThue,
      vat: `${vatRate}%`,
    });

    await newBook.save();
    return respondSuccess(`Thêm sách "${cleanTenSach}" (Mã SP: ${cleanMaSP}) thành công vào Cloud Database!`, newBook);
  } catch (error) {
    console.error("Lỗi khi ghi dữ liệu:", error);
    return respondError(500, `Lỗi khi lưu dữ liệu lên Cloud Database (Tài khoản GHI): ${error.message || "Lỗi hệ thống"}`);
  }
});

// Xử lý 404
app.use((req, res) => {
  res.redirect("/");
});

// Xử lý lỗi toàn cục (Global Error Handler)
app.use((err, req, res, next) => {
  console.error("Lỗi chưa được xử lý:", err);
  res.status(500).render("home", {
    errorMessage: "Lỗi máy chủ nội bộ: " + (err.message || "Đã xảy ra lỗi không mong muốn."),
    books: [],
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
