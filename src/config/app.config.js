import { environment } from "./env.config.js";

export const appConfig = Object.freeze({
  nodeEnv: environment.get("NODE_ENV"),
  port: Number(environment.get("PORT")),
});
