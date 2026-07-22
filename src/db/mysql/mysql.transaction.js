import { databasePool } from "./mysql.connection.js";

export const createTransactionHandler = (pool) => async (callback) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();

    return result;
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // The workflow error is more useful to callers than a rollback failure.
    }

    throw error;
  } finally {
    connection.release();
  }
};

export const runInTransaction = createTransactionHandler(databasePool);
