import { databasePool } from "./connection.js";
export class MysqlTransaction {
  constructor() {
    this.pool = databasePool;
  }
  run = async (callback) => {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      try {
        await connection.rollback();
      } catch {}
      throw error;
    } finally {
      connection.release();
    }
  };
}
export const mysqlTransaction = new MysqlTransaction();
