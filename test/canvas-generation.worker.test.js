import assert from "node:assert/strict";
import test from "node:test";

import { CanvasGenerationWorker } from "../src/jobs/workers/canvas-generation.worker.js";

test("records pending status before a retry and rethrows the job error", async () => {
  const worker = Object.create(CanvasGenerationWorker.prototype);
  let failure;
  worker.canvasGenerationJobService = {
    process: async () => {
      const error = new Error("provider unavailable");
      error.code = "AI_PROVIDER_ERROR";
      throw error;
    },
    recordFailure: async (payload) => {
      failure = payload;
    },
  };
  await assert.rejects(
    worker.processJob({
      data: { generationId: "generation-id" },
      attemptsMade: 0,
      opts: { attempts: 3 },
    }),
    (error) => error.code === "AI_PROVIDER_ERROR",
  );
  assert.deepEqual(failure, {
    generationId: "generation-id",
    errorCode: "AI_PROVIDER_ERROR",
    finalAttempt: false,
  });
});
