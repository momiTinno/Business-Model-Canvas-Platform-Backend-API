import assert from "node:assert/strict";
import test from "node:test";
import { BusinessIdeaService } from "../src/modules/business-idea/business-idea.service.js";

test("lists only the current user's paginated ideas", async () => {
  const service = new BusinessIdeaService(
    {
      findBusinessIdeasByUser: async (userId, limit, offset) => [
        { userId, limit, offset },
      ],
      countBusinessIdeasByUser: async () => 1,
    },
    {},
  );
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
  const service = new BusinessIdeaService(
    { findBusinessIdeaById: async () => ({ id: "idea", user_id: "user-b" }) },
    {},
  );
  await assert.rejects(
    service.getOwnedBusinessIdea("idea", "user-a"),
    (error) => error.code === "BUSINESS_IDEA_NOT_FOUND",
  );
});
