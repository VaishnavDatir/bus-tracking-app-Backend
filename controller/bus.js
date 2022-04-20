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

    const stopDoc = await Stop.findOne({
      stopName: new RegExp("^" + req.body.stopName + "$", "i"),
      stopCity: new RegExp("^" + req.body.stopCity + "$", "i"),
    });

    if (stopDoc) {
      const error = new Error("Cannot create new stop");
      error.statusCode = 422;
      error.data = "Stop with same name and same city already exists";
      throw error;
    }

    const stopName = req.body.stopName.trim();
    const stopCity = req.body.stopCity.trim();
    const stopLocationLat = req.body.stopLocationLat;
    const stopLocationLong = req.body.stopLocationLong;

    const stop = new Stop({
      stopName: stopName.charAt(0).toUpperCase() + stopName.slice(1),
      stopCity: stopCity.charAt(0).toUpperCase() + stopCity.slice(1),
    });

    const result = await stop.save();
    result.stopLocation.coordinates = [stopLocationLat, stopLocationLong];
    await result.save();

    res.status(201).json({
      success: true,
      message: stopName + " has been successfully added to list",
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
      stops = await Stop.find().sort({ stopCity: 1, stopName: 1 });
    } else {
      stops = await Stop.find({
        $or: [
          // { stopName: new RegExp("/^" + search + "$", "i") },
          { stopName: new RegExp(search, "i") },
          { stopCity: new RegExp(search, "i") },
        ],
      }).sort({ stopCity: 1, stopName: 1 });
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
    const sittingCap = req.body.sittingCap;

    const newBus = new Bus({
      busNumber: busNumber,
      busType: busType,
      busProvider: busProvider,
      busTimings: busTimings,
      busStops: busStops,
      sittingCap: sittingCap,
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
      buses = await Bus.find()
        .sort({ busProvider: 1, busType: 1, busNumber: 1 })
        .lean();
    } else {
      buses = await Bus.find({
        $or: [
          // { stopName: new RegExp("/^" + search + "$", "i") },
          { busNumber: new RegExp(search, "i") },
          { busProvider: new RegExp(search, "i") },
          { busType: new RegExp(search, "i") },
        ],
      }).lean();
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

exports.searchBusFromSourceToDestination = async (req, res, next) => {
  try {
    const sourceID = req.body.sourceID;
    const destinationID = req.body.destinationID;

    if (
      sourceID == "" ||
      sourceID.isEmpty ||
      destinationID == "" ||
      destinationID.isEmpty
    ) {
      const error = new Error("Cannot find bus");
      error.statusCode = 422;
      error.data = "Please specify source and destination stop";
      throw error;
    }

    const busDoc = await Bus.find({
      busStops: { $all: [sourceID, destinationID] },
    }); /* .populate("busStops") */

    res.json({
      success: true,
      totalBus: busDoc.length,
      data: busDoc,
      code: 1,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getBusDetail = async (req, res, next) => {
  try {
    const busId = req.params.busId;

    const selectedBus = await Bus.findById(busId).populate("busStops").lean();

    if (!selectedBus) {
      const error = new Error("Could not find this bus.");
      error.statusCode = 404;
      error.code = -2;
      throw error;
    }

    res.json({
      success: true,
      busDetailData: selectedBus,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateBusDetails = async (req, res, next) => {
  try {
    const busId = req.params.busId;

    const busDoc = await Bus.findById(busId);

    if (!busDoc) {
      const error = new Error("Could not find this bus.");
      error.statusCode = 404;
      throw error;
    }

    const busNumber = req.body.busNumber;
    const busType = req.body.busType;
    const busProvider = req.body.busProvider;
    const busTimings = req.body.busTimings;
    const busStops = req.body.busStops;
    const sittingCap = req.body.sittingCap;

    busDoc.busNumber = busNumber;
    busDoc.busType = busType;
    busDoc.busProvider = busProvider;
    busDoc.busTimings = busTimings;
    busDoc.busStops = busStops;
    busDoc.isActive = false;
    busDoc.sittingCap = sittingCap;

    const updateBus = await busDoc.save();

    res.json({
      success: true,
      message: "Bus Data updated!",
      data: updateBus,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deleteBus = async (req, res, next) => {
  try {
    const busId = req.params.busId;

    await Bus.findByIdAndRemove(busId);

    res.json({
      success: true,
      message: "Bus deleted",
      code: 0,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
