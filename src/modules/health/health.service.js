import { HealthDbService } from "./health.db.service.js";
export class HealthService {
  constructor(healthDbService = new HealthDbService()) {
    this.healthDbService = healthDbService;
  }
  getHealthStatus = async () => {
    try {
      await this.healthDbService.checkDatabaseConnection();
      return "connected";
    } catch {
      return "disconnected";
    }
  };
}
