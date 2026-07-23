import { APP_LIMITS } from "../constants/app.constants.js";
import { AppError } from "../utils/app-error.util.js";

export class AuthValidationMiddleware {
  validateCredentials = (request, requireName) => {
    const { name, password } = request.body ?? {};
    const email = request.body?.email?.trim().toLowerCase();
    if (
      !email ||
      email.length > APP_LIMITS.MAX_EMAIL_LENGTH ||
      !/^\S+@\S+\.\S+$/.test(email)
    )
      throw new AppError("A valid email is required", 400, "VALIDATION_ERROR");
    if (!password || password.length < APP_LIMITS.MIN_PASSWORD_LENGTH)
      throw new AppError(
        "Password does not meet the minimum policy",
        400,
        "VALIDATION_ERROR",
      );
    if (
      requireName &&
      (!name?.trim() || name.trim().length > APP_LIMITS.MAX_NAME_LENGTH)
    )
      throw new AppError("Name is required", 400, "VALIDATION_ERROR");
    request.validatedBody = {
      ...(requireName ? { name: name.trim() } : {}),
      email,
      password,
    };
  };
  validateRegistration = (req, res, next) => {
    try {
      this.validateCredentials(req, true);
      next();
    } catch (error) {
      next(error);
    }
  };
  validateLogin = (req, res, next) => {
    try {
      this.validateCredentials(req, false);
      next();
    } catch (error) {
      next(error);
    }
  };
}
export const authValidationMiddleware = new AuthValidationMiddleware();
