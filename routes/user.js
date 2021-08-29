const express = require("express");

const router = express.Router();
const userController = require("../controller/user");

const isAuth = require("../middleware/is-auth");

// <---- USER ACTIVE STATUS ---->
router.get("/isActive", isAuth, userController.isActive);
router.post("/updateIsActive", isAuth, userController.updateIsActive);

// <---- USER Location ---->
router.get("/getLocation", isAuth, userController.getLocation);
router.post("/updateLocation", isAuth, userController.updateUserLocation);

// <---- Drive-BUS ---->
router.post("/setDriverOnBus", isAuth, userController.setDriverOnBus);
router.get("/removeDriverOnBus", isAuth, userController.removeDriverOnBus);

module.exports = router;
