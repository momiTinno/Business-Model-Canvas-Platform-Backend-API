import { Router } from "express";
import { authenticate } from "../../middleware/authentication.middleware.js";
import { authRateLimit } from "../../middleware/auth-rate-limit.middleware.js";
import {
  validateLogin,
  validateRegistration,
} from "../../middleware/auth-validation.middleware.js";
import { getMe, loginUser, registerUser } from "./auth.controller.js";
export const authRouter = Router();
authRouter.post("/register", authRateLimit, validateRegistration, registerUser);
authRouter.post("/login", authRateLimit, validateLogin, loginUser);
authRouter.get("/me", authenticate, getMe);
