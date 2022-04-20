const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const busSchema = new Schema({
  busType: {
    type: String,
    required: true,
  },
  busStops: [
    {
      type: Schema.Types.ObjectId,
      ref: "Stop",
    },
  ],
  busTimings: [
    {
      type: String,
      required: true,
    },
  ],
  busProvider: {
    type: String,
    required: true,
  },
  busNumber: {
    type: String,
    required: true,
  },
  activeDrivers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  sittingCap: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Bus", busSchema);
