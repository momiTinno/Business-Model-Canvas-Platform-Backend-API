# Project Workflow Guide

## Purpose

This guide explains how code moves through the Business Model Canvas Platform Backend API and which layer owns each responsibility. Follow it for every new feature, fix, and refactor.

## Request lifecycle

```text
Client / Postman
  ↓
Express app
  ↓
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
DB Service / AI Service
  ↓
MySQL Executor / Portkey SDK
  ↓
Standard JSON response
```

Canvas generation is a representative example:

```text
POST /api/business-ideas/:businessIdeaId/canvas-generations
  ↓
CanvasGenerationRouter
  ↓
AuthenticationMiddleware
  ↓
UUID validation + business-idea ownership middleware
  ↓
CanvasGenerationController
  ↓
CanvasGenerationService
  ├─ CanvasService
  ├─ CanvasGenerationAiService
  │   └─ PortkeyService
  │       └─ PortkeyClient and official Portkey SDK
  ├─ CanvasGenerationValidatorService
  ├─ CanvasGenerationDbService
  └─ EntryDbService + MySQL transaction
  ↓
canvas_generations + entries tables
```

## Startup and application registration

`src/index.js` validates environment variables before loading the app and starting the server.

`src/app.js` registers, in order:

1. Helmet, CORS, and JSON parsing.
2. Correlation-ID request logging.
3. Feature routers.
4. Not-found middleware.
5. Central error middleware.

All success responses use:

```json
{ "success": true, "data": {} }
```

All error responses use:

```json
{ "success": false, "message": "Human-readable message", "code": "ERROR_CODE" }
```

## Layer responsibilities

### Routes

Routes define only the HTTP method, URL, middleware sequence, and controller method.

```js
router.post(
  "/business-ideas/:businessIdeaId/canvas-generations",
  uuidValidationMiddleware.validateParam("businessIdeaId"),
  businessIdeaMiddleware.loadOwnedBusinessIdea,
  canvasGenerationController.createCanvasGeneration,
);
```

Routes contain no SQL, business rules, or Portkey calls.

### Middleware

Middleware validates or protects a request before controller execution.

- Authentication middleware verifies `Bearer <JWT>` and adds `req.user`.
- UUID middleware rejects malformed IDs before any database query.
- Ownership middleware loads a resource and confirms it belongs to `req.user.id`.

User-owned resources return a `404` when requested by another user, avoiding disclosure that the resource exists.

### Controllers

Controllers are thin. They read validated input, call a service, send a response, and forward errors.

```js
constructor() {
  this.canvasGenerationService = new CanvasGenerationService();
}

createCanvasGeneration = async (req, res, next) => {
  try {
    const data = await this.canvasGenerationService.generateCanvas({
      idea: req.businessIdea,
      userId: req.user.id,
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
```

Controllers must not contain SQL, password hashing, JWT verification, ownership comparisons, or Portkey SDK calls.

### Services

Services own business rules and coordinate lower-level services.

Examples:

- `BusinessIdeaService` creates ideas, checks ownership, selects an idea version, and locks selection after completed generation.
- `CanvasGenerationService` checks selection and categories, prevents concurrent generation, calls AI, validates results, and persists them atomically.

Classes use direct zero-argument construction:

```js
constructor() {
  this.businessIdeaDbService = new BusinessIdeaDbService();
}
```

Do not use constructor dependency injection in production code. Tests may replace instance properties after construction with stubs.

### DB services and queries

SQL constants belong in the owning module's `queries/` directory. DB services execute those constants through the shared MySQL executor.

```text
modules/entry/queries/entry.query.js
  ↓
modules/entry/services/entry-db.service.js
  ↓
db/mysql/executor.js
```

Rules:

- Use `?` placeholders for all request values.
- Dynamic identifiers must come only from an application-controlled allowlist.
- Singular methods return one record or `null`.
- Plural methods return arrays.
- Normal reads exclude `deleted = FALSE` rows.

### Transactions

Use the MySQL transaction wrapper whenever a workflow writes to more than one table.

```text
Begin transaction
  ├─ Insert generated entries
  └─ Mark canvas generation COMPLETED
Commit

Error
  └─ Roll back every write
```

Canvas generation writes `canvas_generations` and `entries` atomically. A failed AI response must not leave partial entries.

## Portkey SDK workflow

The project uses the official `portkey-ai` Node SDK while retaining Portkey Prompt IDs.

```text
BusinessIdeaAiService / CanvasGenerationAiService
  ↓
PortkeyService
  ↓
PortkeyClient
  ↓
portkey.prompts.completions.create({ promptID, variables })
```

Required configuration:

```env
PORTKEY_API_KEY=your-portkey-api-key
BUSINESS_IDEA_PROMPT_ID=your-business-idea-prompt-id
CANVAS_GENERATION_PROMPT_ID=your-canvas-generation-prompt-id
```

No Portkey virtual key is used by application code.

## Git workflow

```text
develop
  ↓
feature/* or fix/*
  ↓ pull request
develop
  ↓
release/*
  ↓ pull request
main
```

Rules:

1. Never work directly on `main` or `develop`.
2. Create an isolated branch from the latest `develop`.
3. Keep Conventional Commits small and logical.
4. Feature and fix pull requests target `develop` only.
5. Only tested `release/*` branches target `main`.
6. Never commit `.env` or local-only PRD files.

## Definition of done

Before opening a pull request, run:

```bash
npm test
npm run architecture:check
npm run format:check
```

Also verify:

- Success, validation, and error paths are tested.
- Cross-user ownership is tested on every owned resource.
- Multi-table writes have transaction and rollback coverage.
- No secret, JWT, password, raw database error, or raw provider response reaches logs or clients.
- The implementation follows the Route → Middleware → Controller → Service → DB Service structure.
