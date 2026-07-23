import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authConfig } from "../../config/auth.config.js";
import { ERROR_CODE } from "../../constants/error.constants.js";
import { AppError } from "../../utils/app-error.util.js";
import { generate } from "../../utils/uuid.util.js";
import { AuthDbService } from "./auth.db.service.js";
export class AuthService {
  constructor() {
    this.authDbService = new AuthDbService();
  }
  register = async ({ name, email, password }) => {
    if (await this.authDbService.findUserByEmail(email))
      throw new AppError(
        "Email already exists",
        409,
        ERROR_CODE.EMAIL_ALREADY_EXISTS,
      );
    const passwordHash = await bcrypt.hash(
      password,
      authConfig.bcryptSaltRounds,
    );
    return this.authDbService.createUser({
      id: generate(),
      name,
      email,
      passwordHash,
    });
  };
  login = async ({ email, password }) => {
    const user = await this.authDbService.findUserByEmail(email);
    if (
      !user ||
      user.disabled ||
      !(await bcrypt.compare(password, user.password_hash))
    )
      throw new AppError(
        "Invalid email or password",
        401,
        ERROR_CODE.INVALID_CREDENTIALS,
      );
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn },
    );
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  };
  getCurrentUser = (id) => this.authDbService.findUserById(id);
}
