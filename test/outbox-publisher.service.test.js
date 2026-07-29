import assert from "node:assert/strict";
import test from "node:test";

import { OutboxPublisherService } from "../src/jobs/services/outbox-publisher.service.js";

test("publishes an outbox event using the generation ID as the queue job ID", async () => {
  const service = Object.create(OutboxPublisherService.prototype);
  let queued;
  let publishedId;
  service.canvasGenerationQueue = {
    addGeneration: async (payload) => {
      queued = payload;
    },
  };
  service.outboxEventDbService = {
    markPublished: async (id) => {
      publishedId = id;
    },
    recordFailure: async () => {},
  };
  await service.publishEvent({
    id: "event-id",
    eventType: "CANVAS_GENERATION_REQUESTED",
    payload: JSON.stringify({ generationId: "generation-id" }),
  });
  assert.deepEqual(queued, { generationId: "generation-id" });
  assert.equal(publishedId, "event-id");
});

test("publishes a business idea enhancement outbox event", async () => {
  const service = Object.create(OutboxPublisherService.prototype);
  let queued;
  service.businessIdeaEnhancementQueue = {
    addEnhancement: async (payload) => {
      queued = payload;
    },
  };
  service.outboxEventDbService = {
    markPublished: async () => {},
    recordFailure: async () => {},
  };
  await service.publishEvent({
    id: "event-id",
    eventType: "BUSINESS_IDEA_ENHANCEMENT_REQUESTED",
    payload: JSON.stringify({ businessIdeaId: "idea-id" }),
  });
  assert.deepEqual(queued, { businessIdeaId: "idea-id" });
});
