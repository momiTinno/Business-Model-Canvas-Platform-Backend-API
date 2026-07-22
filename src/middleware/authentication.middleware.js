import jwt from "jsonwebtoken";
import { authConfig } from "../config/auth.config.js";
import { ERROR_CODE } from "../constants/error.constants.js";
import { HTTP_STATUS } from "../constants/http-status.constants.js";

export const authenticate = (request, response, next) => {
  const header = request.get("Authorization");
  if (!header)
    return response.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Authentication token is required",
      code: ERROR_CODE.MISSING_TOKEN,
    });
  const match = /^Bearer (.+)$/.exec(header);
  if (!match)
    return response.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Invalid authorization format",
      code: ERROR_CODE.INVALID_TOKEN_FORMAT,
    });
  try {
    const payload = jwt.verify(match[1], authConfig.jwtSecret);
    request.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (error) {
    const code =
      error.name === "TokenExpiredError"
        ? ERROR_CODE.TOKEN_EXPIRED
        : ERROR_CODE.INVALID_TOKEN;
    return response
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ success: false, message: "Invalid authentication token", code });
  }
};
