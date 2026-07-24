import assert from "node:assert/strict";
import test from "node:test";
import { BusinessIdeaService } from "../src/modules/business-idea/business-idea.service.js";

const idea = {
  id: "idea-id",
  originalIdea: "Original idea",
  aiEnhancedIdea: "Enhanced idea",
};

const serviceFor = ({ completed = null, active = null } = {}) => {
  const service = new BusinessIdeaService();
  service.canvasGenerationDbService = {
    findCompletedCanvasGenerationByBusinessIdeaId: async () => completed,
    findActiveCanvasGenerationByBusinessIdeaId: async () => active,
  };
  service.businessIdeaDbService = {
    updateSelection: async (selection) => selection,
  };
  return service;
};

test("selects and persists the original idea snapshot", async () => {
  const service = serviceFor();
  assert.deepEqual(
    await service.selectVersion({
      idea,
      userId: "user-id",
      selectionType: "ORIGINAL",
    }),
    {
      id: "idea-id",
      selectedIdea: "Original idea",
      selectionType: "ORIGINAL",
    },
  );
});

test("selects an available AI-enhanced idea snapshot", async () => {
  const service = serviceFor();
  assert.deepEqual(
    await service.selectVersion({
      idea,
      userId: "user-id",
      selectionType: "AI_ENHANCED",
    }),
    {
      id: "idea-id",
      selectedIdea: "Enhanced idea",
      selectionType: "AI_ENHANCED",
    },
  );
});

test("rejects AI-enhanced selection when no enhanced idea exists", async () => {
  await assert.rejects(
    serviceFor().selectVersion({
      idea: { ...idea, aiEnhancedIdea: null },
      userId: "user-id",
      selectionType: "AI_ENHANCED",
    }),
    (error) => error.code === "AI_ENHANCED_IDEA_NOT_AVAILABLE",
  );
});

test("locks selection after a completed canvas generation", async () => {
  await assert.rejects(
    serviceFor({ completed: { id: "generation-id" } }).selectVersion({
      idea,
      userId: "user-id",
      selectionType: "ORIGINAL",
    }),
    (error) => error.code === "SELECTION_LOCKED_AFTER_GENERATION",
  );
});

test("rejects selection while a canvas generation is active", async () => {
  await assert.rejects(
    serviceFor({ active: { id: "generation-id" } }).selectVersion({
      idea,
      userId: "user-id",
      selectionType: "ORIGINAL",
    }),
    (error) => error.code === "GENERATION_IN_PROGRESS",
  );
});
