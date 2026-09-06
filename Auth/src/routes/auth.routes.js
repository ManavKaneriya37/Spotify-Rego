import express from "express";
import * as authController from "../controllers/auth.controller.js";
import * as validations from "../middlewares/validation.middleware.js";
import passport from "passport";

const router = express.Router();

router.post(
  "/register",
  validations.registerUserValidationRules,
  authController.register,
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authController.googleAuthCallback,
);

export default router;
