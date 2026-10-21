const mongoose = require("mongoose");
const { readConn, writeConn } = require("../db");

const FoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  calories: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) throw new Error("Negative calories aren't real.");
    },
  },
});

const FoodRead = readConn.model("Food", FoodSchema);
const FoodWrite = writeConn.model("Food", FoodSchema);

module.exports = { FoodRead, FoodWrite };
