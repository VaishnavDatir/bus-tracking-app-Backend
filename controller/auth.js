const User = require("../model/user");

const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Cannot Sign up");
      error.statusCode = 422;
      error.data = errors.array()[0]["msg"];
      throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const type = req.body.type;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name: name,
      email: email,
      password: hashedPassword,
      type: type,
      isActive: false,
    });

    const result = await user.save();

    if (result !== null) {
      console.log(`${user.name} signed up`);
      res.status(201).json({
        success: true,
        message: "User created",
        userId: result._id,
        code: 1,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.signin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  let loadedUser;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("A user with this email could not be found");
      error.statusCode = 401;
      throw error;
    }

    loadedUser = user;

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      const error = new Error("Incorrect password");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      process.env.JWT_SECRET_KEY
      // { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      token: token,
      type: loadedUser.type,
      userId: loadedUser._id.toString(),
      code: 1,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUserData = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Got user data",
      data: user,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
