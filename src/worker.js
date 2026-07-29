import { validateEnvironment } from "./config/env.config.js";
import { OutboxPublisherService } from "./jobs/services/outbox-publisher.service.js";
import { CanvasGenerationWorker } from "./jobs/workers/canvas-generation.worker.js";
import { BusinessIdeaEnhancementWorker } from "./jobs/workers/business-idea-enhancement.worker.js";
import { redisConnection } from "./jobs/redis.connection.js";

validateEnvironment();

const outboxPublisherService = new OutboxPublisherService();
const canvasGenerationWorker = new CanvasGenerationWorker();
const businessIdeaEnhancementWorker = new BusinessIdeaEnhancementWorker();

const publishOutboxEvents = async () => {
  try {
    await outboxPublisherService.publishPendingEvents();
  } catch (error) {
    console.error("Failed to publish outbox events", {
      code: error.code ?? "OUTBOX_PUBLISH_FAILED",
    });
  }
};

await publishOutboxEvents();
const outboxInterval = setInterval(publishOutboxEvents, 5000);

const shutdown = async () => {
  clearInterval(outboxInterval);
  await canvasGenerationWorker.close();
  await businessIdeaEnhancementWorker.close();
  await outboxPublisherService.canvasGenerationQueue.close();
  await outboxPublisherService.businessIdeaEnhancementQueue.close();
  await redisConnection.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("Background task workers are running");
