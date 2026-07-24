import assert from "node:assert/strict";
import test from "node:test";
import { CanvasGenerationValidatorService } from "../src/modules/canvas-generation/services/canvas-generation-validator.service.js";

const categories = [
  { id: "category-1", name: "Problem" },
  { id: "category-2", name: "Solution" },
];
const validPayload = JSON.stringify({
  description: "A repair marketplace",
  Problem: ["Households cannot find trusted repair specialists"],
  Solution: ["Match households with vetted specialists"],
});

test("validates ordered canvas hypotheses and maps category IDs", () => {
  const validator = new CanvasGenerationValidatorService();
  const entries = validator.validate({ content: validPayload, categories });
  assert.equal(entries.length, 2);
  assert.deepEqual(
    entries.map(({ categoryId, content, sortOrder }) => ({
      categoryId,
      content,
      sortOrder,
    })),
    [
      {
        categoryId: "category-1",
        content: "Households cannot find trusted repair specialists",
        sortOrder: 0,
      },
      {
        categoryId: "category-2",
        content: "Match households with vetted specialists",
        sortOrder: 0,
      },
    ],
  );
});

test("rejects malformed, incomplete, and duplicate AI responses", () => {
  const validator = new CanvasGenerationValidatorService();
  const invalidPayloads = [
    "not json",
    JSON.stringify({
      Problem: ["A"],
      description: "Summary",
      Solution: ["B"],
    }),
    JSON.stringify({ description: "Summary", Problem: ["A"] }),
    JSON.stringify({
      description: "Summary",
      Problem: ["Duplicate"],
      Solution: [" duplicate "],
    }),
  ];
  for (const content of invalidPayloads)
    assert.throws(
      () => validator.validate({ content, categories }),
      (error) => error.code === "AI_RESPONSE_INVALID",
    );
});
