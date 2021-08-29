const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stopSchema = new Schema({
  stopName: {
    type: String,
    required: true,
  },
  stopLocation: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
    },
  },
  stopCity: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Stop", stopSchema);
