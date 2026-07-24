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
    updateCanvasGenerationStatus: async () => {},
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

test("requires a selected idea before generation", async () => {
  const { service } = serviceFor();
  await assert.rejects(
    service.generateCanvas({
      idea: { ...idea, selectedIdea: null },
      userId: "user-id",
    }),
    (error) => error.code === "IDEA_SELECTION_REQUIRED",
  );
});

test("persists validated hypotheses transactionally", async () => {
  const { service, getPersistedEntries } = serviceFor();
  const result = await service.generateCanvas({ idea, userId: "user-id" });
  assert.equal(result.businessIdeaId, "idea-id");
  assert.equal(result.canvasTypeId, "canvas-id");
  assert.equal(result.generationStatus, "COMPLETED");
  assert.deepEqual(getPersistedEntries(), [
    {
      id: "entry-id",
      categoryId: "category-id",
      content: "A testable hypothesis",
      sortOrder: 0,
    },
  ]);
});
