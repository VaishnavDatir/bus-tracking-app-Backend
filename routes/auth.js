const express = require("express");
const { body } = require("express-validator");

const User = require("../model/user");

const router = express.Router();
const authController = require("../controller/auth");
const isAuth = require("../middleware/is-auth");

router.post(
  "/signupuser",
  [
    body("name").trim().not().isEmpty().withMessage("Please enter your name"),

    body("email")
      .trim()
      .not()
      .isEmpty()
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail({ gmail_remove_dots: false }),

    body("password")
      .trim()
      .not()
      .isEmpty()
      .isLength({ min: 5 })
      .withMessage("Please enter a password of atleast 5 characters"),
  ],
  authController.signup
);

router.post("/signin", authController.signin);

module.exports = router;
