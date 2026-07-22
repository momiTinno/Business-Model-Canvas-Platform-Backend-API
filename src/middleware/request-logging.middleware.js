import { generate } from "../utils/uuid.util.js";

export const requestLoggingMiddleware = (request, response, next) => {
  const startedAt = performance.now();
  request.correlationId = request.get("X-Request-Id") || generate();
  response.set("X-Request-Id", request.correlationId);
  response.on("finish", () => {
    console.info({
      method: request.method,
      path: request.originalUrl,
      status: response.statusCode,
      durationMs: Math.round(performance.now() - startedAt),
      correlationId: request.correlationId,
      userId: request.user?.id,
    });
  });
  next();
};
