# Portkey SDK migration

## Summary

The backend migrated from a hand-written HTTP `fetch` client to the official Portkey Node.js SDK, `portkey-ai`.

## What changed

- Added `portkey-ai` as a production dependency.
- `src/modules/portkey/portkey.client.js` now creates `new Portkey({ apiKey })`.
- Prompt execution now calls `portkey.prompts.completions.create({ promptID, variables })`.
- `PortkeyService`, business-idea enhancement, canvas generation, response mapping, validation, and public REST endpoints remain unchanged.

## Configuration

The migration retains the current local environment contract:

```env
PORTKEY_API_KEY=your-portkey-api-key
BUSINESS_IDEA_PROMPT_ID=your-business-idea-prompt-id
CANVAS_GENERATION_PROMPT_ID=your-canvas-generation-prompt-id
```

No Portkey virtual key is added or required by application code.

## Validation

- Unit test verifies the SDK client sends `promptID` and `variables` to `prompts.completions.create`.
- Existing business-idea and canvas-generation tests continue to validate response mapping and AI output handling.
- A live smoke test verifies both saved Portkey prompts using the configured IDs after the SDK migration.

## Rollback

Revert this migration branch or replace only `PortkeyClient.completePrompt` with the prior direct HTTP client. No database migration or public API contract changes are involved.
