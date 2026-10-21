// const mongoose = require("mongoose");
// const Character = require("./models/Character");

// const url =
//   "mongodb://23IT296_write:23IT296_write@ac-lxgfkyg-shard-00-00.98wvfss.mongodb.net:27017,ac-lxgfkyg-shard-00-01.98wvfss.mongodb.net:27017,ac-lxgfkyg-shard-00-02.98wvfss.mongodb.net:27017/DB_23IT296?ssl=true&replicaSet=atlas-wirk5j-shard-0&authSource=admin&appName=Cluster0";

// async function main() {
//   try {
//     console.log("Đang kết nối tới MongoDB Atlas...");
//     await mongoose.connect(url);
//     console.log("Database connected thành công!");

//     const ryu = new Character({
//       name: "Ryu",
//       ultimate: "Shinku Hadoken",
//     });

//     const doc = await ryu.save();
//     console.log("Document đã lưu thành công:");
//     console.log(doc);
//   } catch (err) {
//     console.error("Lỗi xảy ra:", err);
//   } finally {
//     await mongoose.connection.close();
//     console.log("Đã đóng kết nối.");
//   }
// }

// main();

const mongoose = require("mongoose");
const Character = require("./models/Character");

const url =
  "mongodb://23IT296_write:23IT296_write@ac-lxgfkyg-shard-00-00.98wvfss.mongodb.net:27017,ac-lxgfkyg-shard-00-01.98wvfss.mongodb.net:27017,ac-lxgfkyg-shard-00-02.98wvfss.mongodb.net:27017/DB_23IT296?ssl=true&replicaSet=atlas-wirk5j-shard-0&authSource=admin&appName=Cluster0";

async function main() {
  try {
    console.log("Đang kết nối tới MongoDB Atlas...");
    await mongoose.connect(url);
    console.log("Database connected thành công!");

    await Character.init();

    await Character.deleteMany({});
    console.log("Đã dọn dẹp (deleteMany) sạch collection Characters.");

    const ryu1 = new Character({
      name: "Ryu",
      ultimate: "Shinku Hadoken",
    });
    const doc1 = await ryu1.save();
    console.log("Lần 1 - Thêm thành công Ryu:", doc1.name);

    console.log("Lần 2 - Đang thử thêm Ryu thứ hai trùng tên...");
    const ryu2 = new Character({
      name: "Ryu",
      ultimate: "Shinku Hadoken",
    });
    await ryu2.save();
    console.log(
      "Thêm thành công lần 2 (nếu dòng này hiện là lỗi unique chưa hoạt động)",
    );
  } catch (err) {
    if (err.code === 11000) {
      console.log(
        "Đã bắt được lỗi trùng lặp (Duplicate Key Error): Không thể thêm 2 nhân vật trùng tên!",
      );
    } else {
      console.error("Lỗi khác xảy ra:", err);
    }
  } finally {
    await mongoose.connection.close();
    console.log("Đã đóng kết nối database an toàn.");
  }
}

main();
