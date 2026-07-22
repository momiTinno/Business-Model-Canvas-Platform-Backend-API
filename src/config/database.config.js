import { environment } from "./env.config.js";

export const databaseConfig = Object.freeze({
  host: environment.get("DB_HOST"),
  port: Number(environment.get("DB_PORT")),
  database: environment.get("DB_NAME"),
  user: environment.get("DB_USER"),
  password: environment.get("DB_PASSWORD"),
  waitForConnections: true,
  connectionLimit: Number(environment.get("DB_CONNECTION_LIMIT")),
  queueLimit: Number(environment.get("DB_QUEUE_LIMIT")),
});
