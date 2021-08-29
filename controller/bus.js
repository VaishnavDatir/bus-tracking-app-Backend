const Stop = require("../model/stop");
const Bus = require("../model/bus");

const { validationResult } = require("express-validator");

exports.createStop = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Cannot create new stop");
      error.statusCode = 422;
      error.data = errors.array()[0];
      throw error;
    }

    const stopName = req.body.stopName;
    const stopCity = req.body.stopCity;
    const stopLocationLat = req.body.stopLocationLat;
    const stopLocationLong = req.body.stopLocationLong;

    const stop = new Stop({
      stopName: stopName,
      stopCity: stopCity,
    });

    const result = await stop.save();
    result.stopLocation.coordinates = [stopLocationLat, stopLocationLong];
    await result.save();

    res.status(201).json({
      success: true,
      message: "New Stop Created",
      code: 1,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getAllStops = async (req, res, next) => {
  try {
    const search = req.query.search;
    let stops;
    if (search == null || search == "") {
      stops = await Stop.find();
    } else {
      stops = await Stop.find({
        $or: [
          // { stopName: new RegExp("/^" + search + "$", "i") },
          { stopName: new RegExp(search, "i") },
          { stopCity: new RegExp(search, "i") },
        ],
      });
    }

    res.status(200).json({
      success: true,
      totalStops: stops.length,
      data: stops,
      code: 1,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createBusRoute = async (req, res, next) => {
  try {
    const busNumber = req.body.busNumber;
    const busType = req.body.busType;
    const busProvider = req.body.busProvider;
    const busTimings = req.body.busTimings;
    const busStops = req.body.busStops;

    const newBus = new Bus({
      busNumber: busNumber,
      busType: busType,
      busProvider: busProvider,
      busTimings: busTimings,
      busStops: busStops,
      isActive: false,
    });

    const result = await newBus.save();

    res.status(201).json({
      success: true,
      data: result,
      code: 1,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getAllBuses = async (req, res, next) => {
  try {
    const search = req.query.search;
    let buses;

    if (search == null || search == "") {
      buses = await Bus.find().populate("busStops");
    } else {
      buses = await Bus.find({
        $or: [
          // { stopName: new RegExp("/^" + search + "$", "i") },
          { busNumber: new RegExp(search, "i") },
          { busProvider: new RegExp(search, "i") },
          { busType: new RegExp(search, "i") },
        ],
      }).populate("busStops");
    }

    res.status(200).json({
      success: true,
      totalBus: buses.length,
      data: buses,
      code: 1,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
