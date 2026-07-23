import { databasePool } from "./mysql.connection.js";
export class MysqlExecutor {
  constructor(pool = databasePool) {
    this.pool = pool;
  }
  execute = async ({ query, parameters = [], connection = null }) =>
    (connection ?? this.pool).execute(query, parameters);
}
export const mysqlExecutor = new MysqlExecutor();
