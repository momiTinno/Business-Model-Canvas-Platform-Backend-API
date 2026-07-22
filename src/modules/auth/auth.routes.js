import { Router } from "express";
import { authenticate } from "../../middleware/authentication.middleware.js";
import {
  validateLogin,
  validateRegistration,
} from "../../middleware/auth-validation.middleware.js";
import { getMe, loginUser, registerUser } from "./auth.controller.js";
export const authRouter = Router();
authRouter.post("/register", validateRegistration, registerUser);
authRouter.post("/login", validateLogin, loginUser);
authRouter.get("/me", authenticate, getMe);
