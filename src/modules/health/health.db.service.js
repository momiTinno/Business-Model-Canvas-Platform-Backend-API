import { mysqlExecutor } from "../../db/mysql/executor.js";
export class HealthDbService {
  constructor() {
    this.dbExecutor = mysqlExecutor.execute;
  }
  checkDatabaseConnection = async () => this.dbExecutor({ query: "SELECT 1" });
}
