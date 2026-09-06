import express from "express";
import * as authController from "../controllers/auth.controller.js";
import * as validations from "../middlewares/validation.middleware.js";

const router = express.Router();

router.post(
  "/register",
  validations.registerUserValidationRules,
  authController.register,
);

export default router;
