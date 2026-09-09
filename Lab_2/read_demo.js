const fs = require("fs");

fs.readFile("sample.txt", (err, data) => {
  if (err) {
    return console.error("Lỗi khi đọc file:", err);
  }
  console.log("--- Nội dung đọc bất đồng bộ ---");
  console.log(data.toString());
});

try {
  const dataSync = fs.readFileSync("sample.txt");
  console.log("--- Nội dung đọc đồng bộ ---");
  console.log(dataSync.toString());
} catch (err) {
  console.error("Lỗi đọc đồng bộ:", err);
}
