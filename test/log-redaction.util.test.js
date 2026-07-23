import assert from "node:assert/strict";
import test from "node:test";
import { logRedactionUtil } from "../src/utils/log-redaction.util.js";
test("redacts secrets recursively", () => {
  const result = logRedactionUtil.redact({
    password: "plain",
    nested: { token: "jwt" },
    safe: "value",
  });
  assert.deepEqual(result, {
    password: "[REDACTED]",
    nested: { token: "[REDACTED]" },
    safe: "value",
  });
});
