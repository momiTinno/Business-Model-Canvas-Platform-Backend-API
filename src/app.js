import express from "express";

import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { requestLoggingMiddleware } from "./middleware/request-logging.middleware.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { canvasRouter } from "./modules/canvas/canvas.routes.js";

const app = express();

app.use(express.json());
app.use(requestLoggingMiddleware);
app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/canvas-types", canvasRouter);
app.use(notFoundMiddleware.handle);
app.use(errorMiddleware.handle);

export default app;
