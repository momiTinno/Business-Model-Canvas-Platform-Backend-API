import { Router } from "express";
import { authenticationMiddleware } from "../../middleware/authentication.middleware.js";
import { authValidationMiddleware } from "./middleware/registration-validation.middleware.js";
import { AuthController } from "./auth.controller.js";
export const authRouter = Router();
const authController = new AuthController();
authRouter.post(
  "/register",
  authValidationMiddleware.validateRegistration,
  authController.registerUser,
);
authRouter.post(
  "/login",
  authValidationMiddleware.validateLogin,
  authController.loginUser,
);
authRouter.get(
  "/me",
  authenticationMiddleware.authenticate,
  authController.getMe,
);
