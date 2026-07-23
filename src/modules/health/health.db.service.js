import { mysqlExecutor } from "../../db/mysql/mysql.executor.js";
export class HealthDbService {
  constructor(dbExecutor = mysqlExecutor.execute) {
    this.dbExecutor = dbExecutor;
  }
  checkDatabaseConnection = async () => this.dbExecutor({ query: "SELECT 1" });
}
