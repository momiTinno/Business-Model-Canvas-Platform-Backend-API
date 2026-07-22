import express from "express";

import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { requestLoggingMiddleware } from "./middleware/request-logging.middleware.js";
import { healthRouter } from "./modules/health/health.routes.js";

const app = express();

app.use(express.json());
app.use(requestLoggingMiddleware);
app.use("/api", healthRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
