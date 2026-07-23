import assert from "node:assert/strict";
import test from "node:test";
import { BusinessIdeaAiService } from "../src/modules/business-idea/business-idea-ai.service.js";

const responseWith = (content) => ({
  body: { choices: [{ message: { content } }] },
});
const serviceFor = (response) =>
  new BusinessIdeaAiService({ enhanceBusinessIdea: async () => response });

test("accepts a non-empty enhanced idea", async () => {
  assert.equal(
    await serviceFor(responseWith(" Enhanced idea ")).enhance("Original"),
    "Enhanced idea",
  );
});

test("rejects empty and whitespace-only AI responses", async () => {
  await assert.rejects(
    serviceFor(responseWith("")).enhance("Original"),
    (error) => error.code === "AI_RESPONSE_INVALID",
  );
  await assert.rejects(
    serviceFor(responseWith("   ")).enhance("Original"),
    (error) => error.code === "AI_RESPONSE_INVALID",
  );
});

test("rejects oversized and malformed AI responses", async () => {
  await assert.rejects(
    serviceFor(responseWith("a".repeat(10001))).enhance("Original"),
    (error) => error.code === "AI_RESPONSE_INVALID",
  );
  await assert.rejects(
    serviceFor({}).enhance("Original"),
    (error) => error.code === "AI_RESPONSE_INVALID",
  );
});
