const fs = require("fs");

const filePath = "./sample.txt";

fs.access(filePath, fs.F_OK, (err) => {
  if (err) {
    console.log("File không tồn tại!");
    return;
  }
  console.log("File tồn tại, tiến hành các thao tác:");

  // fs.copyFile("sample.txt", "sample_copy.txt", (err) => {
  //   if (err) throw err;
  //   console.log("- Đã sao chép thành sample_copy.txt");

  // fs.rename("sample_copy.txt", "sample_renamed.txt", (err) => {
  //   if (err) throw err;
  //   console.log("- Đã đổi tên thành sample_renamed.txt");

  fs.unlink("sample_renamed.txt", (err) => {
    if (err) throw err;
    console.log("- Đã xóa file sample_renamed.txt thành công!");
    //   });
    // });
  });
});
