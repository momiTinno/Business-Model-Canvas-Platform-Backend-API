import { HTTP_STATUS } from "../../constants/http-status.constants.js";

import { getHealthStatus } from "./health.service.js";

export const getHealth = async (request, response, next) => {
  try {
    const database = await getHealthStatus();
    const statusCode =
      database === "connected"
        ? HTTP_STATUS.OK
        : HTTP_STATUS.SERVICE_UNAVAILABLE;

    return response.status(statusCode).json({
      success: true,
      data: { status: "ok", database, uptime: process.uptime() },
    });
  } catch (error) {
    return next(error);
  }
};
