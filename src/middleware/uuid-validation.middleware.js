import { ERROR_CODE } from "../constants/error.constants.js";
import { HTTP_STATUS } from "../constants/http-status.constants.js";
import { isValid } from "../utils/uuid.util.js";

export const validateUuidParam = (paramName) => (request, response, next) => {
  if (!isValid(request.params[paramName])) {
    return response.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: `${paramName} must be a valid UUID`,
      code: ERROR_CODE.INVALID_UUID,
    });
  }

  return next();
};
