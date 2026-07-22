import { environment } from "./env.config.js";

export const authConfig = Object.freeze({
  jwtSecret: environment.get("JWT_SECRET"),
  jwtExpiresIn: environment.get("JWT_EXPIRES_IN"),
  bcryptSaltRounds: Number(environment.get("BCRYPT_SALT_ROUNDS")),
});
