const sensitiveKeys = new Set([
  "password",
  "passwordHash",
  "password_hash",
  "token",
  "authorization",
  "jwt",
  "jwtSecret",
  "apiKey",
  "PORTKEY_API_KEY",
]);
export class LogRedactionUtil {
  redact = (value) => {
    if (Array.isArray(value)) return value.map(this.redact);
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          key,
          sensitiveKeys.has(key) ? "[REDACTED]" : this.redact(item),
        ]),
      );
    return value;
  };
}
export const logRedactionUtil = new LogRedactionUtil();
