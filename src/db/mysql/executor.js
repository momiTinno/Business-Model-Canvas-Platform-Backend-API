import { databasePool } from "./connection.js";
export class MysqlExecutor {
  constructor() {
    this.pool = databasePool;
  }
  execute = async ({ query, parameters = [], connection = null }) =>
    (connection ?? this.pool).execute(query, parameters);
}
export const mysqlExecutor = new MysqlExecutor();
