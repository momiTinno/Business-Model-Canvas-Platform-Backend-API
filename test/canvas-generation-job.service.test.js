import assert from "node:assert/strict";
import test from "node:test";

import { CanvasGenerationJobService } from "../src/modules/canvas-generation/services/canvas-generation-job.service.js";

const generation = {
  id: "generation-id",
  businessIdeaId: "idea-id",
  canvasTypeId: "canvas-id",
  selectedIdea: "A repair marketplace",
  generationStatus: "PENDING",
  createdBy: "user-id",
};

const serviceFor = () => {
  const service = new CanvasGenerationJobService();
  service.canvasGenerationDbService = {
    findCanvasGenerationForProcessing: async () => generation,
    claimCanvasGeneration: async () => true,
    updateCanvasGenerationStatus: async () => {},
    recordJobFailure: async () => {},
  };
  service.canvasService = {
    getCategoriesForCanvas: async () => [
      { id: "category-id", name: "Problem" },
    ],
    getCanvasTypeById: async () => ({ name: "Lean Canvas" }),
  };
  service.canvasGenerationAiService = {
    generate: async () =>
      JSON.stringify({
        description: "Summary",
        Problem: ["A testable hypothesis"],
      }),
  };
  service.canvasGenerationValidatorService = {
    validate: () => [
      {
        id: "entry-id",
        categoryId: "category-id",
        content: "A testable hypothesis",
        sortOrder: 0,
      },
    ],
  };
  let persistedEntries;
  service.entryDbService = {
    createEntries: async (payload) => {
      persistedEntries = payload.entries;
    },
  };
  service.mysqlTransaction = { run: async (callback) => callback({}) };
  return { service, getPersistedEntries: () => persistedEntries };
};

test("worker persists validated hypotheses transactionally", async () => {
  const { service, getPersistedEntries } = serviceFor();
  await service.process({ generationId: generation.id });
  assert.deepEqual(getPersistedEntries(), [
    {
      id: "entry-id",
      categoryId: "category-id",
      content: "A testable hypothesis",
      sortOrder: 0,
    },
  ]);
});

test("does not repeat an already completed generation", async () => {
  const { service, getPersistedEntries } = serviceFor();
  service.canvasGenerationDbService.findCanvasGenerationForProcessing =
    async () => ({
      ...generation,
      generationStatus: "COMPLETED",
    });
  await service.process({ generationId: generation.id });
  assert.equal(getPersistedEntries(), undefined);
});

test("stores a safe message after the final failed canvas attempt", async () => {
  const { service } = serviceFor();
  let failure;
  service.canvasGenerationDbService.recordJobFailure = async (payload) => {
    failure = payload;
  };
  await service.recordFailure({
    generationId: generation.id,
    errorCode: "AI_PROVIDER_ERROR",
    finalAttempt: true,
  });
  assert.deepEqual(failure, {
    id: "generation-id",
    status: "FAILED",
    errorCode: "AI_PROVIDER_ERROR",
    failureMessage: "The canvas generation could not be completed",
  });
});
