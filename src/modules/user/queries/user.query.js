export const FIND_USER_BY_EMAIL =
  "SELECT id, name, email, password, disabled, created_at FROM users WHERE email = ? AND deleted = FALSE LIMIT 1";
export const FIND_USER_BY_ID =
  "SELECT id, name, email, created_at FROM users WHERE id = ? AND deleted = FALSE AND disabled = FALSE LIMIT 1";
export const CREATE_USER =
  "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)";
