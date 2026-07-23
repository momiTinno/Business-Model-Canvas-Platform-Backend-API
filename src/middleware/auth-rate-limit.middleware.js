import { rateLimit } from "express-rate-limit";
import { authConfig } from "../config/auth.config.js";
import { ERROR_CODE } from "../constants/error.constants.js";

export const authRateLimit = rateLimit({
  windowMs: authConfig.rateLimitWindowMs,
  limit: authConfig.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (request, response) =>
    response.status(429).json({
      success: false,
      message: "Too many authentication attempts",
      code: ERROR_CODE.RATE_LIMIT_EXCEEDED,
    }),
});
