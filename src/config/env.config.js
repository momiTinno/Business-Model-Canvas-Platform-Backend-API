const requiredEnvironmentVariables = Object.freeze([
  "NODE_ENV",
  "PORT",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "DB_CONNECTION_LIMIT",
  "DB_QUEUE_LIMIT",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "BCRYPT_SALT_ROUNDS",
  "AUTH_RATE_LIMIT_WINDOW_MS",
  "AUTH_RATE_LIMIT_MAX",
  "PORTKEY_API_KEY",
  "BUSINESS_IDEA_PROMPT_ID",
  "CANVAS_GENERATION_PROMPT_ID",
]);

const getEnvironmentValue = (name) => process.env[name]?.trim();

export const validateEnvironment = () => {
  const missingVariable = requiredEnvironmentVariables.find(
    (name) => !getEnvironmentValue(name),
  );

  if (missingVariable) {
    throw new Error(
      `Missing required environment variable: ${missingVariable}`,
    );
  }
};

export const environment = Object.freeze({
  get: getEnvironmentValue,
});
