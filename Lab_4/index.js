const express = require("express");
const path = require("path");
const hbs = require("hbs");

const app = express();
const PORT = process.env.PORT || 5000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

hbs.registerPartials(path.join(__dirname, "views", "partials"));

app.get("/", (req, res) => {
  const members = [
    { name: "Grace Hopper", role: "System Architect", active: true },
    { name: "Alan Turing", role: "Algorithm Engineer", active: true },
    { name: "Ada Lovelace", role: "Software Developer", active: false },
    { name: "John von Neumann", role: "Cloud Engineer", active: true },
  ];

  res.render("index", {
    pageTitle: "Lab 4 - Challenge Portal",
    headline: "Quản Lý Nhóm Dự Án Web",
    teamMembers: members,
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    pageTitle: "Giới thiệu bài Lab 4",
    aboutInfo: {
      title: "Về bài thực hành Lab 4 Nâng Cao",
      description:
        "Dự án minh họa việc sử dụng Template Engine Handlebars cùng ExpressJS để tạo trang web đa trang với Partials và Dynamic Data Rendering.",
      technologies: [
        "Node.js runtime",
        "Express.js Framework",
        "HBS (Handlebars) View Engine",
        "Modular Partials",
      ],
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server Challenge đang chạy tại http://localhost:${PORT}`);
});
