import assert from "node:assert/strict";
import test from "node:test";

import { validateUuidParam } from "../src/middleware/uuid-validation.middleware.js";

test("rejects invalid canvas UUID route parameters", () => {
  let responseBody;
  const response = {
    status: () => response,
    json: (body) => {
      responseBody = body;
    },
  };
  validateUuidParam("canvasTypeId")(
    { params: { canvasTypeId: "invalid" } },
    response,
    () => assert.fail("next must not run"),
  );
  assert.equal(responseBody.code, "INVALID_UUID");
});
