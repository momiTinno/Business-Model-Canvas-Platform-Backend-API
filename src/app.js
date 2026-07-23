import express from "express";
import cors from "cors";
import helmet from "helmet";

import { appConfig } from "./config/app.config.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { requestLoggingMiddleware } from "./middleware/request-logging.middleware.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { canvasRouter } from "./modules/canvas/canvas.routes.js";
import { businessIdeaRouter } from "./modules/business-idea/business-idea.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: appConfig.corsOrigin }));
app.use(express.json({ limit: "100kb" }));
app.use(requestLoggingMiddleware.handle);
app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/canvas-types", canvasRouter);
app.use("/api/business-ideas", businessIdeaRouter);
app.use(notFoundMiddleware.handle);
app.use(errorMiddleware.handle);

export default app;
