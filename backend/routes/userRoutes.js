const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/userController");
const { userAuth } = require("../middleware/auth");
const { body } = require("express-validator");

const validateRegister = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain uppercase, lowercase, and number'),
];

const validateLogin = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

userRouter.post("/register", validateRegister, userController.registerUser);
userRouter.post("/login", validateLogin, userController.loginUser);

module.exports = userRouter;
