import assert from "node:assert/strict";
import test from "node:test";
import { PortkeyClient } from "../src/modules/portkey/portkey.client.js";

test("uses the Portkey SDK prompt-completions API", async () => {
  const client = new PortkeyClient();
  let receivedRequest;
  client.portkey = {
    prompts: {
      completions: {
        create: async (request) => {
          receivedRequest = request;
          return { body: { choices: [] } };
        },
      },
    },
  };

  await client.completePrompt({
    promptId: "prompt-id",
    variables: { businessIdea: "A repair marketplace" },
  });

  assert.deepEqual(receivedRequest, {
    promptID: "prompt-id",
    variables: { businessIdea: "A repair marketplace" },
  });
});
