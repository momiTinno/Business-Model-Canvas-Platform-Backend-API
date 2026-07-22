import { execute } from "../../db/mysql/mysql.executor.js";

export const checkDatabaseConnection = async () => {
  await execute({ query: "SELECT 1" });
};
