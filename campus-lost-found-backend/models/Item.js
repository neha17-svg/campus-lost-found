const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // lost / found
    itemName: String,
    description: String,
    location: String,
    date: String,
    contact: String,
    photo: String,

    // IMPORTANT for matching
    status: {
      type: String,
      default: "active", // active | matched
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
