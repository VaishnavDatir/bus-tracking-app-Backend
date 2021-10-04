const User = require("../model/user");
const Bus = require("../model/bus");

const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// <---- USER ACTIVE STATUS ---->

exports.isActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      isActive: user.isActive,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateIsActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const newIsActive = req.body.isActive;

    user.isActive = newIsActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: "New Active Status Saved",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// <---- USER Location ---->
exports.getLocation = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const userLocation = await user.location;

    res.status(200).json({
      success: true,
      location: userLocation,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateUserLocation = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const newLat = req.body.latitude;
    const newLon = req.body.longitude;

    user.location.coordinates = [newLat, newLon];
    await user.save();

    res.status(200).json({
      success: true,
      message: "User location updated",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.setDriverOnBus = async (req, res, next) => {
  try {
    const driver = await User.findById(req.userId);

    const busId = req.body.busId;
    const bus = await Bus.findById(busId);

    await bus.activeDrivers.push(driver.id);
    await bus.save();

    driver.isActive = true;
    driver.onBus = bus;
    await driver.save();

    res.status(201).json({
      success: true,
      message: "Driver set on bus",
      data: bus,
      code: 1,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.removeDriverOnBus = async (req, res, next) => {
  try {
    const driver = await User.findById(req.userId);

    const busId = driver.onBus;
    const bus = await Bus.findById(busId);
    await bus.activeDrivers.pop(driver);
    await bus.save();

    driver.isActive = false;
    driver.onBus = null;
    await driver.save();

    res.status(201).json({
      success: true,
      message: "You are now on off-duty",
      code: 1,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
