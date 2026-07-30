import assert from "node:assert/strict";
import test from "node:test";

import { CanvasGenerationService } from "../src/modules/canvas-generation/canvas-generation.service.js";

const idea = {
  id: "idea-id",
  canvasTypeId: "canvas-id",
  selectedIdea: "Selected marketplace idea",
};

const serviceFor = () => {
  const service = new CanvasGenerationService();
  service.canvasGenerationDbService = {
    findActiveCanvasGenerationByBusinessIdeaId: async () => null,
    createCanvasGeneration: async () => {},
  };
  service.canvasService = {
    getCategoriesForCanvas: async () => [
      { id: "category-id", name: "Problem" },
    ],
  };
  let outboxEvent;
  service.outboxEventDbService = {
    createEvent: async (event) => {
      outboxEvent = event;
    },
  };
  service.backgroundTaskStatusHistoryDbService = {
    recordStatus: async () => {},
  };
  service.mysqlTransaction = { run: async (callback) => callback({}) };
  return { service, getOutboxEvent: () => outboxEvent };
};

test("requires a selected idea before queueing generation", async () => {
  const { service } = serviceFor();
  await assert.rejects(
    service.requestCanvasGeneration({
      idea: { ...idea, selectedIdea: null },
      userId: "user-id",
    }),
    (error) => error.code === "IDEA_SELECTION_REQUIRED",
  );
});

test("persists a pending generation and outbox event transactionally", async () => {
  const { service, getOutboxEvent } = serviceFor();
  const result = await service.requestCanvasGeneration({
    idea,
    userId: "user-id",
    correlationId: "request-id",
  });
  assert.equal(result.businessIdeaId, "idea-id");
  assert.equal(result.canvasTypeId, "canvas-id");
  assert.equal(result.generationStatus, "PENDING");
  assert.equal(getOutboxEvent().eventType, "CANVAS_GENERATION_REQUESTED");
  assert.deepEqual(getOutboxEvent().payload, {
    generationId: result.id,
    correlationId: "request-id",
  });
});
