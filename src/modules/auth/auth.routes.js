import { Router } from "express";
import { authenticationMiddleware } from "../../middleware/authentication.middleware.js";
import { authRateLimitMiddleware } from "../../middleware/auth-rate-limit.middleware.js";
import { authValidationMiddleware } from "./middleware/registration-validation.middleware.js";
import { AuthController } from "./auth.controller.js";
export const authRouter = Router();
const authController = new AuthController();
authRouter.post(
  "/register",
  authRateLimitMiddleware.authRateLimit,
  authValidationMiddleware.validateRegistration,
  authRateLimitMiddleware.emailAuthRateLimit,
  authController.registerUser,
);
authRouter.post(
  "/login",
  authRateLimitMiddleware.authRateLimit,
  authValidationMiddleware.validateLogin,
  authRateLimitMiddleware.emailAuthRateLimit,
  authController.loginUser,
);
authRouter.get(
  "/me",
  authenticationMiddleware.authenticate,
  authController.getMe,
);
