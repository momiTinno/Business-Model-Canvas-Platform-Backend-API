import { environment } from "./env.config.js";

export const authConfig = Object.freeze({
  jwtSecret: environment.get("JWT_SECRET"),
  jwtExpiresIn: environment.get("JWT_EXPIRES_IN"),
  bcryptSaltRounds: Number(environment.get("BCRYPT_SALT_ROUNDS")),
  rateLimitWindowMs: Number(environment.get("AUTH_RATE_LIMIT_WINDOW_MS")),
  rateLimitMax: Number(environment.get("AUTH_RATE_LIMIT_MAX")),
});
