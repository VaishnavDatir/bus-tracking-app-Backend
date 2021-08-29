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
      .withMessage("Please enter a valid stop name")
      .custom(async (value, { req }) => {
        const stopDoc = await Stop.findOne({
          stopName: new RegExp("^" + value + "$", "i"),
        });
        if (stopDoc) {
          return Promise.reject("Stop already exists!");
        }
      }),
  ],
  busController.createStop
);

router.get("/allstops", isAuth, busController.getAllStops);

// <---- BUS ---->
router.post("/createbusroute", isAuth, busController.createBusRoute);
router.get("/allbuses", isAuth, busController.getAllBuses);

module.exports = router;
