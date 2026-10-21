require("dotenv").config();
const express = require("express");
const dns = require("dns");
const { connectDB } = require("./db");
const foodRouter = require("./routes/foodRoutes");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

async function startServer() {
  await connectDB();
  app.use(foodRouter);
  app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
  });
}

startServer();
