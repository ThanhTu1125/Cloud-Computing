const express = require("express");
const app = express.Router();
const { FoodRead, FoodWrite } = require("../models/food");

app.get("/food", async (request, response) => {
  try {
    const foods = await FoodRead.find({});
    response.status(200).send(foods);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.post("/food", async (request, response) => {
  console.log("Content-Type:", request.headers["content-type"]);
  console.log("Body:", request.body);
  const food = new FoodWrite(request.body);

  try {
    await food.save();
    response.status(201).send(food);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.patch("/food/:id", async (request, response) => {
  try {
    const food = await FoodWrite.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true, runValidators: true },
    );
    if (!food) {
      return response.status(404).send("Không tìm thấy món ăn");
    }
    response.send(food);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.delete("/food/:id", async (request, response) => {
  try {
    const food = await FoodWrite.findByIdAndDelete(request.params.id);

    if (!food) {
      return response.status(404).send("Không tìm thấy món ăn để xóa");
    }
    response.status(200).send({ message: "Xóa thành công!" });
  } catch (error) {
    response.status(500).send(error);
  }
});

module.exports = app;
