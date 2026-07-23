import { ERROR_CODE } from "../constants/error.constants.js";
import { HTTP_STATUS } from "../constants/http-status.constants.js";
export class NotFoundMiddleware {
  handle = (request, response) =>
    response.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: `Route ${request.method} ${request.originalUrl} was not found`,
      code: ERROR_CODE.NOT_FOUND,
    });
}
export const notFoundMiddleware = new NotFoundMiddleware();
