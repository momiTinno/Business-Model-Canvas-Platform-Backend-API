import { Router } from "express";
import { authenticationMiddleware } from "../../middleware/authentication.middleware.js";
import {
  authRateLimit,
  emailAuthRateLimit,
} from "../../middleware/auth-rate-limit.middleware.js";
import {
  validateLogin,
  validateRegistration,
} from "../../middleware/auth-validation.middleware.js";
import { AuthController } from "./auth.controller.js";
export const authRouter = Router();
const authController = new AuthController();
authRouter.post(
  "/register",
  authRateLimit,
  validateRegistration,
  emailAuthRateLimit,
  authController.registerUser,
);
authRouter.post(
  "/login",
  authRateLimit,
  validateLogin,
  emailAuthRateLimit,
  authController.loginUser,
);
authRouter.get(
  "/me",
  authenticationMiddleware.authenticate,
  authController.getMe,
);
