const express = require("express");
const { body } = require("express-validator");

const Stop = require("../model/stop");

const router = express.Router();
const busController = require("../controller/bus");

const isAuth = require("../middleware/is-auth");

// <---- STOPS ---->
router.post(
  "/createstop",
  isAuth,
  [
    body("stopName")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter a valid stop name"),

    body("stopCity")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter a valid stop city"),
  ],
  busController.createStop
);

router.get("/allstops", busController.getAllStops);

// <---- BUS ---->
router.post("/createbusroute", isAuth, busController.createBusRoute);
router.get("/allbuses", busController.getAllBuses);
router.post(
  "/searchBusFromSourceToDestination",
  busController.searchBusFromSourceToDestination
);
router.get("/busDetail/:busId", isAuth, busController.getBusDetail);
router.post("/updateBus/:busId", isAuth, busController.updateBusDetails);
router.get("/deleteBus/:busId", isAuth, busController.deleteBus);

module.exports = router;
