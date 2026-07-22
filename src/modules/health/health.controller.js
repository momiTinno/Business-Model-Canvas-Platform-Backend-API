import { HTTP_STATUS } from "../../constants/http-status.constants.js";
import { databasePool } from "../../db/mysql/mysql.connection.js";

export const getHealth = async (request, response, next) => {
  try {
    await databasePool.query("SELECT 1");
    return response.status(HTTP_STATUS.OK).json({
      success: true,
      data: { status: "ok", database: "connected", uptime: process.uptime() },
    });
  } catch (error) {
    return response.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      success: true,
      data: {
        status: "ok",
        database: "disconnected",
        uptime: process.uptime(),
      },
    });
  }
};
