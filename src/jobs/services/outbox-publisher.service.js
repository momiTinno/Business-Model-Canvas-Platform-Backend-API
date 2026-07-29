import { queueConfig } from "../../config/queue.config.js";
import { CanvasGenerationQueue } from "../queues/canvas-generation.queue.js";
import { BusinessIdeaEnhancementQueue } from "../queues/business-idea-enhancement.queue.js";
import { OutboxEventDbService } from "./outbox-event-db.service.js";

export class OutboxPublisherService {
  constructor() {
    this.outboxEventDbService = new OutboxEventDbService();
    this.canvasGenerationQueue = new CanvasGenerationQueue();
    this.businessIdeaEnhancementQueue = new BusinessIdeaEnhancementQueue();
  }

  async publishPendingEvents() {
    const events = await this.outboxEventDbService.findPublishableEvents();
    for (const event of events) await this.publishEvent(event);
    return events.length;
  }

  async publishEvent(event) {
    try {
      const payload =
        typeof event.payload === "string"
          ? JSON.parse(event.payload)
          : event.payload;
      if (event.eventType === "CANVAS_GENERATION_REQUESTED")
        await this.canvasGenerationQueue.addGeneration(payload);
      else if (event.eventType === "BUSINESS_IDEA_ENHANCEMENT_REQUESTED")
        await this.businessIdeaEnhancementQueue.addEnhancement(payload);
      else return;
      await this.outboxEventDbService.markPublished(event.id);
    } catch (error) {
      await this.outboxEventDbService.recordFailure({
        id: event.id,
        errorCode: error.code ?? "QUEUE_PUBLISH_FAILED",
        retryDelaySeconds: Math.ceil(
          queueConfig.canvasGeneration.backoffMs / 1000,
        ),
      });
    }
  }
}
