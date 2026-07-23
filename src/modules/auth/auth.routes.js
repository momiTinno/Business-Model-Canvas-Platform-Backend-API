import { Router } from "express";
import { authenticationMiddleware } from "../../middleware/authentication.middleware.js";
import {
  authRateLimit,
  emailAuthRateLimit,
} from "../../middleware/auth-rate-limit.middleware.js";
import { authValidationMiddleware } from "../../middleware/auth-validation.middleware.js";
import { AuthController } from "./auth.controller.js";
export const authRouter = Router();
const authController = new AuthController();
authRouter.post(
  "/register",
  authRateLimit,
  authValidationMiddleware.validateRegistration,
  emailAuthRateLimit,
  authController.registerUser,
);
authRouter.post(
  "/login",
  authRateLimit,
  authValidationMiddleware.validateLogin,
  emailAuthRateLimit,
  authController.loginUser,
);
authRouter.get(
  "/me",
  authenticationMiddleware.authenticate,
  authController.getMe,
);
