import assert from "node:assert/strict";
import test from "node:test";
import { BusinessIdeaService } from "../src/modules/business-idea/business-idea.service.js";

test("queues a business idea enhancement through the transactional outbox", async () => {
  const service = new BusinessIdeaService();
  let outboxEvent;
  service.businessIdeaDbService = {
    requestEnhancement: async () => true,
  };
  service.outboxEventDbService = {
    createEvent: async (event) => {
      outboxEvent = event;
    },
  };
  service.mysqlTransaction = { run: async (callback) => callback({}) };
  const result = await service.requestBusinessIdeaEnhancement({
    idea: {
      id: "idea-id",
      originalIdea: "A home-repair marketplace",
      aiEnhancedIdea: "A stale enhancement",
    },
    userId: "user-id",
    correlationId: "request-id",
  });
  assert.equal(result.generationStatus, "PENDING");
  assert.equal(result.aiEnhancedIdea, null);
  assert.equal(outboxEvent.eventType, "BUSINESS_IDEA_ENHANCEMENT_REQUESTED");
  assert.deepEqual(outboxEvent.payload, {
    businessIdeaId: "idea-id",
    correlationId: "request-id",
  });
});

test("creates and queues a business idea enhancement in one transaction", async () => {
  const service = new BusinessIdeaService();
  let createdIdea;
  let outboxEvent;
  service.canvasService = { getCanvasTypeById: async () => ({ id: "canvas" }) };
  service.businessIdeaDbService = {
    createBusinessIdea: async (payload) => {
      createdIdea = payload;
    },
    requestEnhancement: async () => true,
  };
  service.outboxEventDbService = {
    createEvent: async (event) => {
      outboxEvent = event;
    },
  };
  service.mysqlTransaction = { run: async (callback) => callback({}) };
  const result = await service.createAndRequestBusinessIdeaEnhancement({
    userId: "user-id",
    canvasTypeId: "canvas-id",
    businessIdea: "A home-repair marketplace",
    correlationId: "request-id",
  });
  assert.equal(result.generationStatus, "PENDING");
  assert.equal(createdIdea.id, result.id);
  assert.equal(createdIdea.originalIdea, "A home-repair marketplace");
  assert.deepEqual(outboxEvent.payload, {
    businessIdeaId: result.id,
    correlationId: "request-id",
  });
});

test("lists only the current user's paginated ideas", async () => {
  const service = new BusinessIdeaService();
  service.businessIdeaDbService = {
    findBusinessIdeasByUser: async (userId, limit, offset) => [
      { userId, limit, offset },
    ],
    countBusinessIdeasByUser: async () => 1,
  };
  assert.deepEqual(
    await service.listBusinessIdeas({ userId: "user-a", page: 2, limit: 10 }),
    {
      items: [{ userId: "user-a", limit: 10, offset: 10 }],
      page: 2,
      limit: 10,
      total: 1,
    },
  );
});

test("does not disclose an idea owned by another user", async () => {
  const service = new BusinessIdeaService();
  service.businessIdeaDbService = {
    findBusinessIdeaById: async () => ({ id: "idea", user_id: "user-b" }),
  };
  await assert.rejects(
    service.getOwnedBusinessIdea("idea", "user-a"),
    (error) => error.code === "BUSINESS_IDEA_NOT_FOUND",
  );
});
