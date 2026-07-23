import { mysqlExecutor } from "../../../db/mysql/executor.js";
import {
  CREATE_USER,
  FIND_USER_BY_EMAIL,
  FIND_USER_BY_ID,
} from "../queries/user.query.js";

export class UserDbService {
  constructor() {
    this.dbExecutor = mysqlExecutor.execute;
  }
  findUserByEmail = async (email) => {
    const [rows] = await this.dbExecutor({
      query: FIND_USER_BY_EMAIL,
      parameters: [email],
    });
    return rows[0] ?? null;
  };
  findUserById = async (id) => {
    const [rows] = await this.dbExecutor({
      query: FIND_USER_BY_ID,
      parameters: [id],
    });
    return rows[0] ?? null;
  };
  createUser = async ({ id, name, email, passwordHash }) => {
    await this.dbExecutor({
      query: CREATE_USER,
      parameters: [id, name, email, passwordHash],
    });
    return { id, name, email };
  };
}
