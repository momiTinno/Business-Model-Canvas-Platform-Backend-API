import { mysqlExecutor } from "../../db/mysql/mysql.executor.js";

export class AuthDbService {
  constructor(dbExecutor = mysqlExecutor.execute) {
    this.dbExecutor = dbExecutor;
  }
  findUserByEmail = async (email) => {
    const [rows] = await this.dbExecutor({
      query:
        "SELECT id, name, email, password_hash, disabled, created_at FROM users WHERE email = ? AND deleted = FALSE LIMIT 1",
      parameters: [email],
    });
    return rows[0] ?? null;
  };
  findUserById = async (id) => {
    const [rows] = await this.dbExecutor({
      query:
        "SELECT id, name, email, created_at FROM users WHERE id = ? AND deleted = FALSE AND disabled = FALSE LIMIT 1",
      parameters: [id],
    });
    return rows[0] ?? null;
  };
  createUser = async ({ id, name, email, passwordHash }) => {
    await this.dbExecutor({
      query:
        "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
      parameters: [id, name, email, passwordHash],
    });
    return { id, name, email };
  };
}
