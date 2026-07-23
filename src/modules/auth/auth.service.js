import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../../utils/app-error.util.js";
import { authConfig } from "../../config/auth.config.js";
import { ERROR_CODE } from "../../constants/error.constants.js";
import { HTTP_STATUS } from "../../constants/http-status.constants.js";
import { generate } from "../../utils/uuid.util.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "./auth.db.service.js";

const invalidCredentials = () =>
  new AppError(
    "Invalid email or password",
    401,
    ERROR_CODE.INVALID_CREDENTIALS,
  );
export const register = async ({ name, email, password }) => {
  if (await findUserByEmail(email))
    throw new AppError(
      "Email already exists",
      409,
      ERROR_CODE.EMAIL_ALREADY_EXISTS,
    );
  const passwordHash = await bcrypt.hash(password, authConfig.bcryptSaltRounds);
  return createUser({ id: generate(), name, email, passwordHash });
};
export const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (
    !user ||
    user.disabled ||
    !(await bcrypt.compare(password, user.password_hash))
  )
    throw invalidCredentials();
  const token = jwt.sign(
    { sub: user.id, email: user.email },
    authConfig.jwtSecret,
    { expiresIn: authConfig.jwtExpiresIn },
  );
  return { token, user: { id: user.id, name: user.name, email: user.email } };
};
export const getCurrentUser = findUserById;
