import { HealthDbService } from "./health.db.service.js";
export class HealthService {
  constructor() {
    this.healthDbService = new HealthDbService();
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
