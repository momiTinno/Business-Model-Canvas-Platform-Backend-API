const requiredEnvironmentVariables = Object.freeze([
  "NODE_ENV",
  "PORT",
  "CORS_ORIGIN",
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
  "REDIS_HOST",
  "REDIS_PORT",
  "REDIS_DB",
  "QUEUE_CANVAS_GENERATION_CONCURRENCY",
  "QUEUE_JOB_ATTEMPTS",
  "QUEUE_BACKOFF_MS",
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
