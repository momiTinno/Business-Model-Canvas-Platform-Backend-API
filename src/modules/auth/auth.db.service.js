import { execute } from "../../db/mysql/mysql.executor.js";

export const findUserByEmail = async (email) => {
  const [rows] = await execute({
    query:
      "SELECT id, name, email, password_hash, disabled, created_at FROM users WHERE email = ? AND deleted = FALSE LIMIT 1",
    parameters: [email],
  });
  return rows[0] ?? null;
};

export const findUsersByAttribute = async (attribute, value) => {
  const allowedAttributes = Object.freeze({
    name: "name",
    disabled: "disabled",
  });
  const column = allowedAttributes[attribute];
  if (!column) throw new Error(`Unsupported user attribute: ${attribute}`);
  const [rows] = await execute({
    query: `SELECT id, name, email FROM users WHERE ${column} = ? AND deleted = FALSE`,
    parameters: [value],
  });
  return rows;
};

export const createUser = async ({ id, name, email, passwordHash }) => {
  await execute({
    query:
      "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
    parameters: [id, name, email, passwordHash],
  });
  return { id, name, email };
};

export const findUserById = async (id) => {
  const [rows] = await execute({
    query:
      "SELECT id, name, email, created_at FROM users WHERE id = ? AND deleted = FALSE AND disabled = FALSE LIMIT 1",
    parameters: [id],
  });
  return rows[0] ?? null;
};
