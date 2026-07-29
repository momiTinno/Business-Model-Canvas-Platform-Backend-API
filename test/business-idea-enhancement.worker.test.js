import assert from "node:assert/strict";
import test from "node:test";

import { BusinessIdeaEnhancementWorker } from "../src/jobs/workers/business-idea-enhancement.worker.js";

test("returns enhancement to pending before a retry", async () => {
  const worker = Object.create(BusinessIdeaEnhancementWorker.prototype);
  let failure;
  worker.businessIdeaEnhancementJobService = {
    process: async () => {
      throw new Error("provider unavailable");
    },
    recordFailure: async (payload) => {
      failure = payload;
    },
  };
  await assert.rejects(
    worker.processJob({
      data: { businessIdeaId: "idea-id" },
      attemptsMade: 0,
      opts: { attempts: 3 },
    }),
  );
  assert.deepEqual(failure, {
    businessIdeaId: "idea-id",
    finalAttempt: false,
  });
});
