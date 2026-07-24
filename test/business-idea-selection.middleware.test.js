import assert from "node:assert/strict";
import test from "node:test";
import { businessIdeaMiddleware } from "../src/modules/business-idea/middleware/business-idea.middleware.js";

const response = {
  status: () => response,
  json: () => {},
};

test("accepts supported idea selection types", () => {
  const request = { body: { selectionType: "ORIGINAL" } };
  businessIdeaMiddleware.validateSelection(request, response, (error) => {
    assert.equal(error, undefined);
  });
  assert.deepEqual(request.validatedBody, { selectionType: "ORIGINAL" });
});

test("rejects unsupported idea selection types", () => {
  businessIdeaMiddleware.validateSelection(
    { body: { selectionType: "INVALID" } },
    response,
    (error) => {
      assert.equal(error.code, "VALIDATION_ERROR");
    },
  );
});
