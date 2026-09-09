const fs = require("fs");

fs.writeFile("sample.txt", "Hello World from Day 4!\n", (err) => {
  if (err) throw err;
  console.log("1. Đã tạo và ghi file sample.txt thành công!");

  fs.appendFile("sample.txt", "Appending new line data.\n", (err) => {
    if (err) throw err;
    console.log("2. Đã thêm nội dung vào sample.txt thành công!");
  });
});
