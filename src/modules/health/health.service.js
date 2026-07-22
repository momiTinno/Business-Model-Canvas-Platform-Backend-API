import { checkDatabaseConnection } from "./health.db.service.js";

export const getHealthStatus = async () => {
  try {
    await checkDatabaseConnection();
    return "connected";
  } catch {
    return "disconnected";
  }
};
