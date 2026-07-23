import { HTTP_STATUS } from "../../constants/http-status.constants.js";
import { HealthService } from "./health.service.js";
export class HealthController {
  constructor() {
    this.healthService = new HealthService();
  }
  getHealth = async (req, res, next) => {
    try {
      const database = await this.healthService.getHealthStatus();
      res
        .status(
          database === "connected"
            ? HTTP_STATUS.OK
            : HTTP_STATUS.SERVICE_UNAVAILABLE,
        )
        .json({
          success: true,
          data: { status: "ok", database, uptime: process.uptime() },
        });
    } catch (error) {
      next(error);
    }
  };
}
