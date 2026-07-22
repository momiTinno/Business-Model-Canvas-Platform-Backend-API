import { databasePool } from "./mysql.connection.js";

export const execute = async ({
  query,
  parameters = [],
  connection = null,
}) => {
  const executor = connection ?? databasePool;

  return executor.execute(query, parameters);
};
