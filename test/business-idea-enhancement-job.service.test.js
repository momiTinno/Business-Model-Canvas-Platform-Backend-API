import assert from "node:assert/strict";
import test from "node:test";

import { BusinessIdeaEnhancementJobService } from "../src/modules/business-idea/services/business-idea-enhancement-job.service.js";

const idea = {
  id: "idea-id",
  user_id: "user-id",
  originalIdea: "A trusted home-repair marketplace",
  generationStatus: "PENDING",
};

const serviceFor = () => {
  const service = new BusinessIdeaEnhancementJobService();
  service.businessIdeaDbService = {
    findBusinessIdeaById: async () => idea,
    claimEnhancement: async () => true,
    updateEnhancement: async () => {},
    recordEnhancementJobFailure: async () => {},
  };
  service.businessIdeaAiService = {
    enhance: async () => "An enhanced home-repair marketplace idea",
  };
  return service;
};

test("worker persists a completed business idea enhancement", async () => {
  const service = serviceFor();
  let update;
  service.businessIdeaDbService.updateEnhancement = async (payload) => {
    update = payload;
  };
  await service.process({ businessIdeaId: idea.id });
  assert.deepEqual(update, {
    id: "idea-id",
    userId: "user-id",
    enhancedIdea: "An enhanced home-repair marketplace idea",
    status: "COMPLETED",
  });
});

test("worker does not repeat an already completed enhancement", async () => {
  const service = serviceFor();
  service.businessIdeaDbService.findBusinessIdeaById = async () => ({
    ...idea,
    generationStatus: "COMPLETED",
  });
  let claimed = false;
  service.businessIdeaDbService.claimEnhancement = async () => {
    claimed = true;
  };
  await service.process({ businessIdeaId: idea.id });
  assert.equal(claimed, false);
});

test("stores a safe message after the final failed enhancement attempt", async () => {
  const service = serviceFor();
  let failure;
  service.businessIdeaDbService.recordEnhancementJobFailure = async (
    payload,
  ) => {
    failure = payload;
  };
  await service.recordFailure({ businessIdeaId: idea.id, finalAttempt: true });
  assert.deepEqual(failure, {
    id: "idea-id",
    status: "FAILED",
    failureMessage: "The AI enhancement could not be completed",
  });
});
