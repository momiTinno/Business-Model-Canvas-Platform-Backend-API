import assert from "node:assert/strict";
import test from "node:test";

import { authValidationMiddleware } from "../src/modules/auth/middleware/registration-validation.middleware.js";

const runMiddleware = (middleware, body) =>
  new Promise((resolve) => middleware({ body }, {}, resolve));

test("registration normalizes email and name before the controller", async () => {
  const request = {
    body: {
      name: "  Founder  ",
      email: " USER@EXAMPLE.COM ",
      password: "SecurePass123",
    },
  };
  await new Promise((resolve) =>
    authValidationMiddleware.validateRegistration(request, {}, resolve),
  );
  assert.deepEqual(request.validatedBody, {
    name: "Founder",
    email: "user@example.com",
    password: "SecurePass123",
  });
});

test("login rejects malformed credentials before controller execution", async () => {
  let error;
  await new Promise((resolve) =>
    authValidationMiddleware.validateLogin(
      { body: { email: "invalid", password: "short" } },
      {},
      (value) => {
        error = value;
        resolve();
      },
    ),
  );
  assert.equal(error.code, "VALIDATION_ERROR");
});
