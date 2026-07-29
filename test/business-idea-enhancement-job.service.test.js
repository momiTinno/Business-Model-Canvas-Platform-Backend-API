import assert from "node:assert/strict";
import test from "node:test";

import { BusinessIdeaEnhancementJobService } from "../src/modules/business-idea/services/business-idea-enhancement-job.service.js";

const idea = {
  id: "idea-id",
  user_id: "user-id",
  original_idea: "A trusted home-repair marketplace",
  generation_status: "PENDING",
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
    generation_status: "COMPLETED",
  });
  let claimed = false;
  service.businessIdeaDbService.claimEnhancement = async () => {
    claimed = true;
  };
  await service.process({ businessIdeaId: idea.id });
  assert.equal(claimed, false);
});
