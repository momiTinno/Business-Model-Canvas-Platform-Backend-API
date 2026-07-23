import { appConfig } from "../config/app.config.js";
import { ERROR_CODE } from "../constants/error.constants.js";
import { HTTP_STATUS } from "../constants/http-status.constants.js";
import { logRedactionUtil } from "../utils/log-redaction.util.js";
export class ErrorMiddleware {
  handle = (error, request, response, next) => {
    const statusCode = error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const code = error.code ?? ERROR_CODE.INTERNAL_SERVER_ERROR;
    const message =
      statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR &&
      appConfig.nodeEnv === "production"
        ? "An unexpected error occurred"
        : error.message;
    console.error(
      logRedactionUtil.redact({ error, requestId: request.correlationId }),
    );
    response.status(statusCode).json({ success: false, message, code });
  };
}
export const errorMiddleware = new ErrorMiddleware();
