import { execute } from "../../db/mysql/mysql.executor.js";
export class HealthDbService {
  constructor(dbExecutor = execute) {
    this.dbExecutor = dbExecutor;
  }
  checkDatabaseConnection = async () => this.dbExecutor({ query: "SELECT 1" });
}
