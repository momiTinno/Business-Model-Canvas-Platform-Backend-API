# Product Requirements Document
## Business Model Canvas Platform — Backend API

| | |
|---|---|
| **Product** | BMC Platform Backend (AI-assisted business idea & canvas generation) |
| **Document version** | 1.0 |
| **Date** | 22 July 2026 |
| **Methodology** | Agile / Scrum — Epics → User Stories → Acceptance Criteria |
| **Source references** | *Backend Application Development Standards* (v2.2, 22 Jul 2026); *System Prompt for BMC Generation* |
| **MVP boundary** | Ends at **generation of the AI-enhanced business idea** (and its display alongside the original) |

---

## 1. Product Overview

### 1.1 Problem statement
Founders and product teams validate ideas by turning a rough concept into structured, testable hypotheses across a canvas (Lean Canvas, Business Model Canvas, OSEC). Doing this manually is slow, inconsistent, and biased toward the assumptions the founder already holds. Most people also submit a *thin* idea description — one or two vague sentences — which produces a weak canvas regardless of how good the generator is.

### 1.2 Product vision
A backend service that takes a raw business idea, uses an LLM (via Portkey) to produce a richer, sharper version of that idea, lets the user choose between the original and the enhanced version, and then generates a canvas of falsifiable hypotheses — each hypothesis persisted as an individually addressable record so it can later be edited, validated, or invalidated.

### 1.3 Why the MVP stops at AI enhancement
The enhancement step is the highest-risk, highest-learning slice of the product:
- It proves the full vertical path — auth → persistence → Portkey → validation → response.
- It validates the riskiest assumption: *that users perceive the AI-enhanced idea as materially better than what they wrote.* If that fails, canvas generation on top of it is worth less.
- It ships something demonstrable without the transactional complexity of multi-row hypothesis persistence.

### 1.4 Product scope in this document
| Phase | Content | Status here |
|---|---|---|
| **MVP (Release 1)** | Epics 1–6 | Fully specified |
| **Release 2** | Epics 7–8 | Outlined |
| **Release 3** | Epic 9 | Outlined |

---

## 2. Users & Personas

| Persona | Description | Primary need |
|---|---|---|
| **Founder / Idea Owner** | Early-stage founder or intrapreneur with a raw idea. Primary API consumer. | Turn a rough idea into something structured and testable, fast. |
| **Product/Innovation Coach** | Runs validation workshops; uses the platform with or on behalf of clients. | Consistent, repeatable hypothesis quality across many ideas. |
| **Frontend Developer** | Consumer of this API (web/mobile client, out of scope here). | Predictable REST contract, consistent response envelope, clear error codes. |
| **Backend Engineer** | Builds and maintains this service. | A modular codebase that survives adding canvas types, DB engines, and AI providers. |

> The system is **backend-only**. There is no UI, no ORM, and no server-rendered frontend in scope.

---

## 3. Goals & Success Metrics

### 3.1 Business goals
1. Prove the AI-enhancement value hypothesis before investing in canvas generation.
2. Establish an architecture that supports additional canvas types and DB engines without rework.
3. Keep AI cost and failure modes observable and controllable from day one.

### 3.2 MVP success metrics

| # | Metric | Target |
|---|---|---|
| M1 | Enhancement requests returning a valid, persisted enhanced idea | ≥ 97% of non-provider-outage requests |
| M2 | p95 latency, `POST /api/business-ideas/:id/enhance` | ≤ 12s |
| M3 | p95 latency, all non-AI endpoints | ≤ 300 ms |
| M4 | Users selecting AI_ENHANCED when offered the choice (measured in Release 2) | ≥ 60% |
| M5 | Cross-tenant data access incidents | 0 |
| M6 | Invalid/malformed AI responses written to the database | 0 |
| M7 | Registration → first enhanced idea completion rate | ≥ 70% |

### 3.3 Non-goals for MVP
- Canvas generation, hypothesis persistence, entry CRUD.
- Version selection (`PATCH /select`) — deferred to Release 2.
- Frontend, admin console, billing, teams/collaboration, refresh tokens, email verification, password reset.
- Multi-database support (the *structure* must allow it; only MySQL is implemented).

---

## 4. Technical Constraints (non-negotiable)

Derived directly from the Backend Application Development Standards. These are **acceptance criteria on every story**, not preferences.

| Area | Constraint |
|---|---|
| Stack | Node.js, Express.js, MySQL, JWT, Portkey, raw SQL, Prettier |
| Modules | ES Modules (`"type": "module"`). No CommonJS. |
| ORM | None. Raw parameterized SQL only, via `mysql2/promise`. |
| Architecture | Route → Middleware → Controller → Service → DB Service → Executor → MySQL |
| Controllers | Thin. No SQL, no business rules, no Portkey calls, no hashing, no ownership checks. |
| DB layer | One executor per DB engine (`src/db/mysql/mysql.executor.js`). Executors never shared. |
| Queries | Generic attribute search returns **all** matches (no `LIMIT 1`). `LIMIT 1` only for deterministic single-record lookups (unique columns). |
| Method naming | Plural method → returns array; singular method → returns one object or `null`. |
| Dynamic SQL | Table/column identifiers from an application-controlled allowlist only. Never from request input. |
| IDs | Backend-generated UUIDs (`CHAR(36)`), validated before use in SQL. |
| Deletion | Soft delete via `deleted BOOLEAN NOT NULL DEFAULT FALSE`; excluded from reads by default. |
| Audit | `created_by`, `created_at`, `updated_by`, `updated_at`, `deleted` on all domain tables except `users`. |
| Transactions | Required for any workflow touching multiple tables. |
| AI | Portkey isolated behind `AI Service → Portkey Service → Portkey Client`. Prompt IDs from env. |
| AI output | Never persisted without validation. Invalid output must not create partial records. |
| Errors | `try...catch` in every async handler; all errors forwarded to centralized error middleware. No async-handler package. |
| Formatting | Prettier mandatory (`semi: true`, `singleQuote: false`, `trailingComma: "all"`, `tabWidth: 2`). |

---

## 5. MVP User Journey

```
Register → Login (JWT) → Fetch canvas types → Submit business idea
   → Request AI enhancement (Portkey) → Retrieve idea showing original + enhanced
```

Everything past that arrow — selection, canvas generation, entries — is Release 2+.

---

## 6. Data Model (MVP subset)

| Table | Purpose in MVP | Notes |
|---|---|---|
| `users` | Identity | No `created_by`/`updated_by` (no admin-created users in MVP). |
| `canvas` | Canvas type reference data | Seeded: `LEAN_CANVAS`, `BUSINESS_MODEL_CANVAS`, `OSEC_CANVAS`. |
| `categories` | Canvas → category mapping | Seeded per canvas type; read-only in MVP. |
| `business_ideas` | Core MVP entity | `original_idea` (required), `ai_enhanced_idea` (nullable), `selected_idea` (nullable, unused in MVP), `selection_type`, `canvas_id`. |
| `canvas_generations` | — | **Not created in MVP.** Deferred to Release 2 (see Open Question OQ-1). |
| `entries` | — | **Not created in MVP.** Deferred to Release 2. |

A `generation_status` column (`PENDING` / `COMPLETED` / `FAILED`) is required on `business_ideas` per §9 of the standards even though it is absent from the §11.3 column table — see OQ-2.

---

## 7. MVP API Surface

| Epic | Method | Route | Auth |
|---|---|---|---|
| 1 | GET | `/api/health` | Public |
| 2 | POST | `/api/auth/register` | Public |
| 2 | POST | `/api/auth/login` | Public |
| 2 | GET | `/api/auth/me` | Bearer |
| 3 | GET | `/api/canvas-types` | Bearer |
| 3 | GET | `/api/canvas-types/:canvasTypeId/categories` | Bearer |
| 4 | POST | `/api/business-ideas` | Bearer |
| 4 | GET | `/api/business-ideas` | Bearer |
| 4 | GET | `/api/business-ideas/:businessIdeaId` | Bearer |
| 5 | POST | `/api/business-ideas/:businessIdeaId/enhance` | Bearer |

**Standard response envelope**

```json
{ "success": true,  "data": { } }
{ "success": false, "message": "Human-readable message", "code": "ERROR_CODE" }
```

---

# 8. Epics & User Stories — MVP

Estimates use Fibonacci story points. Priority uses MoSCoW (M = Must, S = Should, C = Could).

---

## EPIC 1 — Platform Foundation & Backend Scaffolding
**Goal:** A running, formatted, environment-driven Express application with a database access layer that enforces the standards' separation of concerns, so every later story plugs into a correct skeleton.
**Value:** Removes architectural rework risk. Every other epic depends on it.
**Total:** 26 points

---

### US-1.1 — Project scaffold and code standards
> **As a** backend engineer, **I want** a scaffolded ES Module Express project with the mandated folder structure and Prettier configuration, **so that** all subsequent code lands in the correct layer by default.

**Acceptance Criteria**
- **Given** a fresh clone, **when** I run `npm run dev`, **then** the server starts on `PORT` with `node --watch --env-file=.env src/index.js`.
- `package.json` contains `"type": "module"`; no `require()` or `module.exports` appears anywhere in `src/`.
- The directory tree matches §3 of the standards: `config/`, `constants/`, `utils/`, `db/mysql/`, `middleware/`, `modules/{auth,user,business-idea,canvas,portkey}/`, `app.js`, `index.js`.
- `npm run format:check` passes with the mandated Prettier config.
- Scripts `dev`, `start`, `format`, `format:check` exist and work.

**Points:** 3 · **Priority:** M · **Depends on:** —

---

### US-1.2 — Environment configuration with startup validation
> **As a** backend engineer, **I want** all configuration read from environment variables and validated at boot, **so that** the service fails fast and loudly instead of failing at the first request.

**Acceptance Criteria**
- `.env.example` contains every variable from §18: `NODE_ENV`, `PORT`, `DB_*`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `BCRYPT_SALT_ROUNDS`, `PORTKEY_API_KEY`, `PORTKEY_VIRTUAL_KEY`, `BUSINESS_IDEA_PROMPT_ID`, `CANVAS_GENERATION_PROMPT_ID`.
- **Given** a required variable is missing or empty, **when** the app boots, **then** it exits with a non-zero code and a message naming the missing variable — and **never** prints its value.
- Config is exposed through `config/*.config.js` modules; no `process.env` access outside `config/`.
- `.env` is git-ignored; `.env.example` is committed.

**Points:** 2 · **Priority:** M · **Depends on:** US-1.1

---

### US-1.3 — MySQL connection pool and engine-specific executor
> **As a** backend engineer, **I want** a single MySQL executor that is the only code touching the driver, **so that** a second database engine can be added later without rewriting business logic.

**Acceptance Criteria**
- `mysql.connection.js` creates a pool using `DB_CONNECTION_LIMIT` and `DB_QUEUE_LIMIT`.
- `mysql.executor.js` exposes `execute({ query, parameters = [], connection = null })`, uses `connection ?? databasePool`, and returns the raw driver result.
- The executor imports no controller, returns no HTTP status, and contains no module-specific logic.
- **Given** a `connection` is passed, **when** `execute` runs, **then** the query executes on that transaction connection.
- A static check (lint rule or CI grep) fails the build if `databasePool` is imported anywhere outside `src/db/mysql/`.

**Points:** 5 · **Priority:** M · **Depends on:** US-1.2

---

### US-1.4 — Transaction handler
> **As a** backend engineer, **I want** a reusable transaction wrapper, **so that** multi-table workflows commit or roll back atomically.

**Acceptance Criteria**
- `mysql.transaction.js` exposes a helper that acquires a connection, calls `beginTransaction()`, runs the callback, then `commit()`.
- **Given** the callback throws, **when** the wrapper handles it, **then** `rollback()` runs, the connection is released, and the error is rethrown unchanged.
- The connection is released in all paths, including on rollback failure.
- Unit test proves rollback leaves zero rows written.

**Points:** 3 · **Priority:** M · **Depends on:** US-1.3
*(Built in MVP for correctness of the foundation; first consumed by Release 2 canvas generation.)*

---

### US-1.5 — Migrations and reference-data seeding
> **As a** backend engineer, **I want** versioned SQL migrations and seed data, **so that** every environment has an identical schema and identical canvas reference data.

**Acceptance Criteria**
- Migrations under `src/db/mysql/migrations/` create `users`, `canvas`, `categories`, `business_ideas` with the exact column names, types, and defaults from §11.
- All domain tables (not `users`) carry `created_by`, `created_at`, `updated_by`, `updated_at`, `deleted`.
- Seeds insert the three canvas types and the twelve Lean Canvas categories with the codes listed in §11.4.
- Migrations are idempotent and re-runnable; running twice produces no duplicates and no errors.
- Foreign keys exist: `business_ideas.user_id → users.id`, `business_ideas.canvas_id → canvas.id`, `categories.canvas_id → canvas.id`.
- Indexes exist on `users.email` (unique), `business_ideas.user_id`, `categories.canvas_id`.

**Points:** 5 · **Priority:** M · **Depends on:** US-1.3

---

### US-1.6 — Centralized error handling and response envelope
> **As a** frontend developer, **I want** every endpoint to return the same success and error shapes, **so that** I write one response handler rather than one per endpoint.

**Acceptance Criteria**
- `error.middleware.js` is registered last and returns `{ success: false, message, code }` using `error.statusCode ?? 500`.
- `not-found.middleware.js` returns 404 in the same envelope for unmatched routes.
- **Given** `NODE_ENV=production`, **when** an unhandled error occurs, **then** the response contains no stack trace and no raw database error text; the full error is logged server-side.
- `http-status.constants.js` and `error.constants.js` centralize status codes and error codes; no numeric literals inline in controllers.
- Every async handler in the codebase uses `try...catch` and calls `next(error)`. No async-handler package is installed.

**Points:** 3 · **Priority:** M · **Depends on:** US-1.1

---

### US-1.7 — UUID generation and validation middleware
> **As a** security-conscious engineer, **I want** all UUIDs generated server-side and validated before reaching SQL, **so that** malformed or hostile identifiers never reach the database layer.

**Acceptance Criteria**
- `uuid.util.js` exposes `generate()` and `isValid(value)` using one consistent UUID version across the project.
- `uuid-validation.middleware.js` validates named route params and returns 400 with code `INVALID_UUID` on failure.
- **Given** a client supplies an `id` in a request body, **when** the record is created, **then** the client value is ignored and a server-generated UUID is used.

**Points:** 2 · **Priority:** M · **Depends on:** US-1.6

---

### US-1.8 — Health check endpoint
> **As a** DevOps engineer, **I want** `GET /api/health`, **so that** orchestration can detect an unhealthy instance.

**Acceptance Criteria**
- Returns 200 with `{ success: true, data: { status: "ok", database: "connected", uptime } }`.
- **Given** the database pool cannot be reached, **when** the endpoint is called, **then** it returns 503 with `database: "disconnected"`.
- Endpoint is public and exposes no version, secret, or configuration detail beyond the above.

**Points:** 2 · **Priority:** S · **Depends on:** US-1.3

---

### US-1.9 — Request logging with correlation IDs
> **As a** backend engineer, **I want** each request tagged with a correlation ID that flows into logs and Portkey metadata, **so that** I can trace a slow or failed enhancement end to end.

**Acceptance Criteria**
- Every request receives a UUID correlation ID, echoed in the `X-Request-Id` response header.
- Logs include method, path, status, duration, correlation ID, and authenticated user ID where present.
- **Given** any log line is written, **then** it contains no password, no password hash, no JWT, and no API key.

**Points:** 1 · **Priority:** S · **Depends on:** US-1.6

---

## EPIC 2 — Identity & Access Management
**Goal:** Users can register, log in, and access protected resources with a JWT; no user can ever see another user's data.
**Value:** Gate for every other feature; ownership model originates here.
**Total:** 21 points

---

### US-2.1 — User registration
> **As a** founder, **I want** to register with my name, email, and password, **so that** I have an account that owns my ideas.

**Acceptance Criteria**
- `POST /api/auth/register` accepts `{ name, email, password }`.
- `registration-validation.middleware.js` runs before the controller and enforces: name required (1–100 chars); email syntactically valid and ≤255 chars; password meets the configured minimum policy (length + complexity, values in `app.constants.js`).
- Email is normalized to lowercase and trimmed before any lookup or insert.
- **Given** the email already exists (excluding soft-deleted rows), **when** registration is attempted, **then** 409 is returned with code `EMAIL_ALREADY_EXISTS`.
- Password is hashed with bcrypt using `BCRYPT_SALT_ROUNDS`; only the hash is stored; plaintext is never logged.
- The user `id` is a backend-generated UUID.
- 201 response returns a safe user object: `{ id, name, email, createdAt }` — never `password`.
- Hashing occurs in the service layer, not the controller.

**Points:** 5 · **Priority:** M · **Depends on:** US-1.5, US-1.7

---

### US-2.2 — User login and JWT issuance
> **As a** registered user, **I want** to log in and receive an access token, **so that** I can call protected endpoints.

**Acceptance Criteria**
- `POST /api/auth/login` accepts `{ email, password }`; `login-validation.middleware.js` validates and normalizes before the controller.
- Lookup uses a dedicated single-record query on the unique `email` column (`LIMIT 1` permitted here).
- **Given** the email does not exist **or** the password does not match, **when** login is attempted, **then** 401 is returned with an identical generic message in both cases (no user enumeration).
- **Given** the user is soft-deleted or disabled, **when** login is attempted, **then** 401 is returned.
- On success, a JWT is signed with `JWT_SECRET`, expiring per `JWT_EXPIRES_IN`, with payload limited to `{ sub, email }`.
- The payload contains no password hash, no full user record, no configuration, and no large permission object.
- 200 response returns `{ token, user: { id, name, email } }`.

**Points:** 5 · **Priority:** M · **Depends on:** US-2.1

---

### US-2.3 — Authentication middleware for protected routes
> **As a** backend engineer, **I want** one authentication middleware, **so that** protecting a route is a single consistent line.

**Acceptance Criteria**
- Middleware reads `Authorization`, requires exact `Bearer <token>` format, verifies signature and expiry, and attaches `req.user = { id, email }`.
- Missing header → 401 `MISSING_TOKEN`; malformed → 401 `INVALID_TOKEN_FORMAT`; expired → 401 `TOKEN_EXPIRED`; invalid signature → 401 `INVALID_TOKEN`.
- **Given** any protected route, **when** called without a valid token, **then** no service or database code executes.
- All routes except `/api/health`, `/api/auth/register`, `/api/auth/login` are protected.

**Points:** 3 · **Priority:** M · **Depends on:** US-2.2

---

### US-2.4 — Current user profile
> **As a** logged-in user, **I want** `GET /api/auth/me`, **so that** the client can restore session state after reload.

**Acceptance Criteria**
- Returns the authenticated user's safe object resolved from `req.user.id`, never from a client-supplied ID.
- **Given** the user was soft-deleted after the token was issued, **when** the endpoint is called, **then** 401 is returned.

**Points:** 2 · **Priority:** M · **Depends on:** US-2.3

---

### US-2.5 — User lookup query layer conforming to multi-record rules
> **As a** backend engineer, **I want** the user query layer to follow the multi-record contract, **so that** generic searches never silently discard rows.

**Acceptance Criteria**
- `FIND_USERS_BY_ATTRIBUTE(attribute)` resolves the column from a frozen allowlist, throws on an unknown attribute, and contains **no** `LIMIT 1`.
- `FIND_USER_BY_EMAIL` is a separate single-record query and may use `LIMIT 1`.
- `findUsersByAttribute()` returns an array (possibly empty); `findUserByEmail()` returns one object or `null`.
- All queries filter `deleted = FALSE`.
- Test: two users sharing a searchable non-unique attribute → both rows returned.
- SQL constants use `UPPER_SNAKE_CASE`.

**Points:** 3 · **Priority:** M · **Depends on:** US-1.3

---

### US-2.6 — Rate limiting on authentication endpoints
> **As a** security engineer, **I want** login and registration rate-limited, **so that** credential stuffing is impractical.

**Acceptance Criteria**
- Login limited per IP and per email address; configurable via environment variables.
- **Given** the limit is exceeded, **when** another request arrives, **then** 429 is returned with code `RATE_LIMIT_EXCEEDED` and a `Retry-After` header.
- Rate-limit rejections are logged with the correlation ID but without credentials.

**Points:** 3 · **Priority:** M · **Depends on:** US-2.2, US-1.9

---

## EPIC 3 — Canvas Type & Category Catalog
**Goal:** Clients can discover the supported canvas types and each type's categories from server-controlled reference data.
**Value:** Prevents arbitrary canvas names entering the system and prepares the category structure the Release 2 generator validates against.
**Total:** 8 points

---

### US-3.1 — List canvas types
> **As a** founder, **I want** to see the available canvas types, **so that** I can pick one when submitting my idea.

**Acceptance Criteria**
- `GET /api/canvas-types` returns all non-deleted rows from `canvas` as `[{ id, code, name }]`.
- Response includes Lean Canvas, Business Model Canvas, and OSEC Canvas from seed data.
- The endpoint is read-only; no create/update/delete route exists in MVP.
- The database service method is plural and returns an array (empty array, not `null`, when none exist).

**Points:** 2 · **Priority:** M · **Depends on:** US-1.5, US-2.3

---

### US-3.2 — List categories for a canvas type
> **As a** frontend developer, **I want** the categories belonging to a canvas type, **so that** I can render the correct sections per canvas.

**Acceptance Criteria**
- `GET /api/canvas-types/:canvasTypeId/categories` returns `[{ id, code, name }]` filtered by `canvas_id` and `deleted = FALSE`.
- `:canvasTypeId` passes UUID validation middleware; invalid → 400.
- **Given** the canvas type does not exist, **when** called, **then** 404 `CANVAS_TYPE_NOT_FOUND`.
- Lean Canvas returns exactly the twelve seeded categories.
- Different canvas types return different category sets — the mapping is read from `categories.canvas_id`, never hardcoded per canvas.

**Points:** 3 · **Priority:** M · **Depends on:** US-3.1

---

### US-3.3 — Canvas type existence validation for downstream use
> **As a** backend engineer, **I want** a reusable canvas-type validation service, **so that** idea creation and later canvas generation both reject unknown or inactive canvas types the same way.

**Acceptance Criteria**
- A canvas service method resolves a canvas type by UUID and returns the record or `null`.
- **Given** a soft-deleted canvas type, **when** resolved, **then** `null` is returned.
- The method is consumed by US-4.1 rather than duplicated.

**Points:** 3 · **Priority:** M · **Depends on:** US-3.1

---

## EPIC 4 — Business Idea Capture
**Goal:** A user can submit, list, and retrieve their own business ideas, scoped to a chosen canvas type.
**Value:** The persistence substrate for AI enhancement; establishes the ownership pattern.
**Total:** 16 points

---

### US-4.1 — Submit a business idea
> **As a** founder, **I want** to submit my business idea against a chosen canvas type, **so that** it is stored and ready for AI enhancement.

**Acceptance Criteria**
- `POST /api/business-ideas` accepts `{ canvasTypeId, businessIdea }`.
- `business-idea-validation.middleware.js` enforces: `canvasTypeId` is a valid UUID; `businessIdea` is a non-empty trimmed string within configured min/max length (constants, not literals).
- **Given** `canvasTypeId` does not resolve to an active canvas type, **when** submitted, **then** 400 `CANVAS_TYPE_NOT_FOUND`.
- The record stores `original_idea` = submitted text; `ai_enhanced_idea` = `NULL`; `selected_idea` = `NULL`; `selection_type` = `NULL`; `generation_status` = `PENDING`.
- `user_id`, `created_by`, and `updated_by` are set from `req.user.id`, never from the request body.
- 201 returns `{ id, canvasTypeId, originalIdea, aiEnhancedIdea: null, generationStatus, createdAt }`.
- The controller only reads validated input, calls the service, and returns the response.

**Points:** 5 · **Priority:** M · **Depends on:** US-3.3, US-2.3

---

### US-4.2 — List my business ideas
> **As a** founder, **I want** to list my ideas, **so that** I can return to one I submitted earlier.

**Acceptance Criteria**
- `GET /api/business-ideas` returns only rows where `user_id = req.user.id` and `deleted = FALSE`.
- Supports `page` and `limit` query parameters via the shared pagination utility; response includes `{ items, page, limit, total }`.
- Default sort: `created_at DESC`.
- The database service method is plural and returns an array.
- **Given** a second user's ideas exist, **when** user A lists ideas, **then** none of user B's rows appear — verified by an automated test.

**Points:** 3 · **Priority:** M · **Depends on:** US-4.1

---

### US-4.3 — Retrieve a single business idea with both versions
> **As a** founder, **I want** to retrieve one idea showing my original text and the AI-enhanced text side by side, **so that** I can compare them.

**Acceptance Criteria**
- `GET /api/business-ideas/:businessIdeaId` returns `{ id, canvasTypeId, canvasTypeName, originalIdea, aiEnhancedIdea, generationStatus, createdAt, updatedAt }`.
- `:businessIdeaId` passes UUID validation; invalid → 400.
- **Given** the idea does not exist or is soft-deleted, **when** requested, **then** 404 `BUSINESS_IDEA_NOT_FOUND`.
- **Given** the idea belongs to another user, **when** requested, **then** the same 404 is returned — existence is not disclosed.
- `aiEnhancedIdea` is `null` before enhancement and populated after; this single response satisfies the MVP "display original and AI-enhanced versions" step.

**Points:** 3 · **Priority:** M · **Depends on:** US-4.1

---

### US-4.4 — Ownership authorization middleware
> **As a** security engineer, **I want** ownership enforced by middleware or the service layer, **so that** no controller is responsible for authorization.

**Acceptance Criteria**
- A reusable business-idea ownership check loads the record and compares `user_id` against `req.user.id`.
- Applied to `GET /:id` and `POST /:id/enhance` (and, in Release 2, to select and canvas generation).
- **Given** ownership fails, **when** the request is handled, **then** it terminates before any mutating service logic runs.
- No ownership comparison exists inside any controller file — verified by code review checklist.

**Points:** 5 · **Priority:** M · **Depends on:** US-4.1

---

## EPIC 5 — AI-Enhanced Business Idea Generation *(MVP centerpiece)*
**Goal:** A user can request an AI-enhanced version of their idea, generated through Portkey, validated, and persisted — with failures handled without corrupting state.
**Value:** The core product hypothesis and the MVP's exit criterion.
**Total:** 34 points

---

### US-5.1 — Isolated Portkey client and configuration
> **As a** backend engineer, **I want** Portkey wrapped in a dedicated module, **so that** provider details never leak into controllers and the provider can be swapped or reconfigured centrally.

**Acceptance Criteria**
- `portkey.client.js` initializes the SDK from `PORTKEY_API_KEY` and `PORTKEY_VIRTUAL_KEY`; prompt IDs come from `BUSINESS_IDEA_PROMPT_ID` and `CANVAS_GENERATION_PROMPT_ID`.
- `portkey.service.js` builds request payloads, invokes prompts by ID with variables, extracts responses, and normalizes provider errors into application errors.
- `portkey-response.mapper.js` converts raw provider output into an internal shape.
- Configurable timeout and bounded retry with backoff; retries apply only to transient/network/5xx errors, never to validation failures.
- **Given** any controller or route file, **then** it contains no Portkey payload, prompt ID, or SDK import — verified by a CI grep.
- Usage metadata (tokens, latency, model, correlation ID) is captured and logged.

**Points:** 8 · **Priority:** M · **Depends on:** US-1.2, US-1.9

---

### US-5.2 — Enhance a business idea
> **As a** founder, **I want** to generate an AI-enhanced version of my idea, **so that** I get a sharper, more complete articulation than the one I wrote.

**Acceptance Criteria**
- `POST /api/business-ideas/:businessIdeaId/enhance` requires authentication and passes UUID + ownership middleware.
- The call chain is exactly Controller → `business-idea.service` → `business-idea-ai.service` → `portkey.service` → `portkey.client`.
- The original idea text is sent as a prompt variable to the `BUSINESS_IDEA_PROMPT_ID` prompt.
- On success: `ai_enhanced_idea` is populated, `generation_status` = `COMPLETED`, `updated_by` = `req.user.id`, `updated_at` refreshed.
- 200 returns `{ id, originalIdea, aiEnhancedIdea, generationStatus }`.
- **Given** the idea is not found, is soft-deleted, or belongs to another user, **then** 404 `BUSINESS_IDEA_NOT_FOUND` and no Portkey call is made.
- No business logic sits in the controller; no SQL sits in the AI service.

**Points:** 8 · **Priority:** M · **Depends on:** US-5.1, US-4.4

---

### US-5.3 — AI response validation before persistence
> **As a** backend engineer, **I want** AI output validated before it touches the database, **so that** malformed, empty, or oversized model output never becomes a record.

**Acceptance Criteria**
- Validation runs before any write and confirms: response present; content is a non-empty string after trimming; length within the configured maximum; JSON parses successfully where JSON is expected.
- **Given** validation fails, **when** the enhance flow runs, **then** no partial record is written, `generation_status` is set to `FAILED`, and 502 `AI_RESPONSE_INVALID` is returned.
- **Given** the model returns the original text unchanged, **when** validated, **then** the response is still persisted but flagged in logs for quality monitoring.
- Validation logic is unit-tested against fixtures: valid, empty, whitespace-only, oversized, malformed JSON, wrong shape.
- Raw provider output is never returned to the client unvalidated.

**Points:** 5 · **Priority:** M · **Depends on:** US-5.2

---

### US-5.4 — Provider failure and timeout handling
> **As a** founder, **I want** a clear, actionable error when enhancement fails, **so that** I know whether to retry rather than staring at a hung request.

**Acceptance Criteria**
- Provider timeout → 504 `AI_PROVIDER_TIMEOUT`; provider 5xx after retries → 502 `AI_PROVIDER_ERROR`; auth/config error → 500 `AI_CONFIGURATION_ERROR` (logged as critical).
- **Given** any failure path, **then** `generation_status` = `FAILED`, `ai_enhanced_idea` remains `NULL`, and the record stays retryable.
- Provider error text, API keys, and stack traces never appear in the client response.
- Every failure is logged with correlation ID, user ID, business idea ID, provider, and duration.

**Points:** 5 · **Priority:** M · **Depends on:** US-5.2

---

### US-5.5 — Re-enhancement rules
> **As a** founder, **I want** to regenerate the enhanced version if the first result is poor, **so that** I am not stuck with one attempt.

**Acceptance Criteria**
- **Given** `generation_status` = `FAILED`, **when** enhance is called again, **then** it proceeds normally.
- **Given** `generation_status` = `COMPLETED`, **when** enhance is called again, **then** it regenerates and overwrites `ai_enhanced_idea`, refreshing `updated_at` and `updated_by`. *(Pending confirmation — see OQ-3.)*
- **Given** an enhancement is already in flight for the same idea, **when** a second request arrives, **then** 409 `ENHANCEMENT_IN_PROGRESS` is returned and no duplicate provider call is made.
- Regeneration attempts are counted in logs for cost monitoring.

**Points:** 5 · **Priority:** S · **Depends on:** US-5.2

---

### US-5.6 — Rate limiting and cost control on AI endpoints
> **As a** product owner, **I want** AI generation rate-limited per user, **so that** provider spend stays bounded and abuse is contained.

**Acceptance Criteria**
- Per-user limits on enhancement requests over a configurable window; limits set via environment variables.
- Exceeding a limit → 429 `RATE_LIMIT_EXCEEDED` with `Retry-After`; no provider call is made.
- Token usage per request is recorded in logs, aggregatable per user and per day.
- Limits are enforced before the Portkey call, not after.

**Points:** 3 · **Priority:** M · **Depends on:** US-5.2, US-2.6

---

## EPIC 6 — Security, Quality & Release Readiness
**Goal:** The MVP is verifiably safe to expose, and the standards are enforced by automation rather than memory.
**Value:** Converts written conventions into build-time guarantees.
**Total:** 21 points

---

### US-6.1 — SQL injection defenses and identifier allowlisting
> **As a** security engineer, **I want** every query parameterized and every dynamic identifier allowlisted, **so that** no request input can alter query structure.

**Acceptance Criteria**
- All query values use `?` placeholders; no template-literal interpolation of values anywhere in `src/`.
- Dynamic table/column identifiers resolve exclusively from frozen allowlist objects; an unknown identifier throws before execution.
- `buildUpdateQuery` accepts an `allowedFields` list and throws when no valid field is supplied.
- Automated tests attempt injection payloads through every string input and confirm they are treated as literal values.
- CI fails on a detected interpolated value inside a SQL string.

**Points:** 5 · **Priority:** M · **Depends on:** US-4.1

---

### US-6.2 — Secrets and logging hygiene
> **As a** security engineer, **I want** guarantees that secrets never reach logs or responses, **so that** a leaked log file is not a breach.

**Acceptance Criteria**
- Passwords, password hashes, JWTs, `JWT_SECRET`, and Portkey keys never appear in any log line or response body.
- A log-redaction helper masks sensitive keys by name; unit-tested against a payload containing all of them.
- Production responses expose no stack traces and no raw database error messages.
- No secret is committed; `.env` is git-ignored and CI checks for accidental commits.

**Points:** 3 · **Priority:** M · **Depends on:** US-1.9

---

### US-6.3 — Request hardening
> **As a** backend engineer, **I want** sane request limits and standard protections, **so that** the service resists trivial abuse.

**Acceptance Criteria**
- JSON body size limit configured; oversized payloads → 413 `PAYLOAD_TOO_LARGE`.
- Security headers applied (e.g. Helmet defaults); CORS restricted to configured origins.
- Unknown routes return the standard 404 envelope, never an Express HTML error page.
- Input is trimmed and normalized before validation.

**Points:** 3 · **Priority:** M · **Depends on:** US-1.6

---

### US-6.4 — Automated test suite
> **As a** backend engineer, **I want** unit and integration tests for the MVP paths, **so that** regressions surface before release.

**Acceptance Criteria**
- Unit tests cover services, validators, the AI response validator, and query builders — executor and Portkey client mocked.
- Integration tests cover every MVP endpoint including auth failures, ownership failures, and validation failures.
- The full MVP journey (register → login → canvas types → submit idea → enhance → retrieve both versions) runs as one end-to-end test with Portkey stubbed.
- Cross-user access is explicitly tested on every user-owned endpoint.
- Tests run in CI on every pull request; a failing suite blocks merge.

**Points:** 8 · **Priority:** M · **Depends on:** Epics 1–5

---

### US-6.5 — Architecture conformance checks in CI
> **As a** tech lead, **I want** the standards enforced automatically, **so that** conformance does not depend on reviewer attention.

**Acceptance Criteria**
- CI fails if: `prettier --check` fails; a controller imports a query file, the executor, bcrypt, or Portkey; `databasePool` is imported outside `src/db/mysql/`; a `require(` appears in `src/`; a generic `FIND_*_BY_ATTRIBUTE` query contains `LIMIT 1`.
- A pull-request checklist mirrors the standards' Implementation Checklist.
- Documented exceptions require an explicit inline justification comment.

**Points:** 2 · **Priority:** S · **Depends on:** US-6.4

---

# 9. Release 2 & 3 — Outline

## EPIC 7 — Idea Version Selection *(Release 2)*
Users compare and commit to one version, unlocking canvas generation.
- **US-7.1** — `PATCH /api/business-ideas/:id/select` with `selectionType` ∈ {`ORIGINAL`, `AI_ENHANCED`}; `AI_ENHANCED` rejected when `ai_enhanced_idea` is `NULL`; `selected_idea` stores the exact text used, preserving it against later regeneration.
- **US-7.2** — Selection is changeable until a canvas has been generated; blocked or versioned afterwards *(see OQ-4)*.
- **US-7.3** — Ownership enforced on selection.

## EPIC 8 — Canvas Generation *(Release 2)*
The `System Prompt for BMC Generation` produces hypotheses per category, stored as individual rows.
- **US-8.1** — `canvas_generations` and `entries` tables and migrations *(blocked by OQ-1)*.
- **US-8.2** — `POST /api/business-ideas/:id/canvas-generations`; blocked when `selected_idea` is `NULL`.
- **US-8.3** — Prompt invocation with `{{canvasType}}`, `{{categoryNamesStr}}`, `{{description}}` populated from the selected idea and the canvas's category set.
- **US-8.4** — AI output validation per §16: valid JSON; `description` key present and first; every required category present; every value an array; every entry a non-empty string within length limits; unknown categories rejected; duplicates detected.
- **US-8.5** — Transactional persistence: generation record + all entries commit or roll back together; each hypothesis is one `entries` row with `sort_order` preserving prompt ordering (most critical first), `entry_insertion_type = AI`, `draft = TRUE`, `state = HYPOTHESIS`, `version = 0`.
- **US-8.6** — `GET /api/canvas-generations/:id` and `GET /api/canvas-generations/:id/entries` grouped by category.
- **US-8.7** — Partial-failure handling and regeneration semantics.

## EPIC 9 — Hypothesis Entry Management *(Release 3)*
- **US-9.1** — `POST /api/canvas-generations/:id/entries` (human-authored entries, `entry_insertion_type = HUMAN`, `draft = FALSE`).
- **US-9.2** — `PATCH /api/entries/:entryId` (edit text, promote out of draft, change `state`, reorder) with `version` increment.
- **US-9.3** — `DELETE /api/entries/:entryId` (soft delete).
- **US-9.4** — Ownership enforced on every entry operation.

---

# 10. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-1 | Performance | Non-AI endpoints p95 ≤ 300 ms at 50 concurrent users. |
| NFR-2 | Performance | Enhancement endpoint p95 ≤ 12 s including provider time; hard timeout configurable. |
| NFR-3 | Reliability | No partial writes under any failure path; multi-table workflows are transactional. |
| NFR-4 | Security | All items in §17 of the standards are satisfied and test-verified. |
| NFR-5 | Maintainability | Adding a canvas type requires seed data only — no code change. |
| NFR-6 | Portability | Adding a database engine requires a new `src/db/<engine>/` directory only; no service rewrite. |
| NFR-7 | Observability | Every request and every AI call is traceable by correlation ID. |
| NFR-8 | Data integrity | Soft-deleted records are excluded from all reads by default. |
| NFR-9 | Compatibility | API responses use a single stable envelope; breaking changes require a version bump. |
| NFR-10 | Compliance | Only the bcrypt hash of a password is ever stored or transmitted internally. |

---

# 11. Sprint Plan (indicative)

Assumes 2-week sprints and a team velocity of roughly 30–35 points.

| Sprint | Focus | Stories | Points |
|---|---|---|---|
| **1** | Foundation | US-1.1 – US-1.9 | 26 |
| **2** | Identity + catalog | US-2.1 – US-2.6, US-3.1 – US-3.3 | 29 |
| **3** | Business ideas + Portkey groundwork | US-4.1 – US-4.4, US-5.1 | 24 |
| **4** | AI enhancement | US-5.2 – US-5.6 | 26 |
| **5** | Hardening & release | US-6.1 – US-6.5 | 21 |

**MVP total: 126 points across 5 sprints (~10 weeks).**

---

# 12. Definition of Ready / Definition of Done

**Definition of Ready** — a story enters a sprint only when: the user story and acceptance criteria are written and testable; API contract (route, payload, response, error codes) is agreed; dependencies are resolved or sequenced; validation and ownership rules are stated; estimated by the team.

**Definition of Done** — a story leaves the sprint only when: all acceptance criteria pass; the layered architecture is respected (no SQL or business logic in controllers, no Portkey outside its module); unit and integration tests pass in CI; `prettier --check` passes; parameterized SQL and allowlisted identifiers verified; ownership and auth enforced where applicable; audit columns populated; no secrets in logs; API documented; peer-reviewed against the Implementation Checklist; deployed to staging.

---

# 13. Risks & Mitigations

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | LLM output quality is inconsistent, undermining the core value hypothesis | High | Prompt versioning in Portkey; log every generation for offline scoring; ship regeneration (US-5.5) |
| R2 | Provider latency or outage degrades UX | High | Timeouts, bounded retries, `FAILED` status with retryability, clear error codes |
| R3 | AI cost overrun | Medium | Per-user rate limits, token logging, cost dashboard from day one |
| R4 | Raw SQL without an ORM increases injection and maintenance risk | High | Parameterization, allowlists, CI grep checks, injection tests (US-6.1) |
| R5 | Ownership check missed on a new endpoint | High | Reusable middleware, cross-user tests mandatory in DoD |
| R6 | `canvas_generations` schema undefined in the standards | Medium (Release 2 blocker) | Resolve OQ-1 before Sprint 6 planning |
| R7 | Scope creep pulling canvas generation into MVP | Medium | MVP boundary fixed at US-5.6; Epics 7–9 explicitly deferred |
| R8 | Long-running synchronous enhancement blocks the client | Medium | Measure in Sprint 4; if p95 breaches NFR-2, move to async job + polling in Release 2 |

---

# 14. Open Questions

| ID | Question | Owner | Needed by |
|---|---|---|---|
| **OQ-1** | The standards jump from §11.4 (Categories) to §11.7 (Entries). The `canvas_generations` table schema — and any §11.5/§11.6 tables such as a canvas-category mapping table — is undefined. What are the exact columns? | Tech Lead | Sprint 6 planning |
| **OQ-2** | §9 requires a generation status on business ideas, but the §11.3 column table omits it. Confirm the column name, type, and default (`generation_status VARCHAR(30) DEFAULT 'PENDING'` assumed here). | Tech Lead | Sprint 3 |
| **OQ-3** | Should re-enhancement overwrite `ai_enhanced_idea`, or should prior versions be retained as history? Overwrite is assumed in US-5.5. | Product Owner | Sprint 4 |
| **OQ-4** | Can a user change their selection after a canvas has been generated — blocked, or does it create a new generation? | Product Owner | Release 2 |
| **OQ-5** | The API uses `/api/canvas-types` while the table is named `canvas`. Align the table name to `canvas_types`, or keep the naming split deliberately? | Tech Lead | Sprint 1 |
| **OQ-6** | JWT expiry defaults to 1h with no refresh-token mechanism specified. Is re-login acceptable for MVP? | Product Owner | Sprint 2 |
| **OQ-7** | Section 19 is absent from the standards' contents (jumps 18 → 20). Is a section missing? | Tech Lead | Sprint 1 |
| **OQ-8** | Are `state` values beyond `HYPOTHESIS` (e.g. `VALIDATED`, `INVALIDATED`) required, and what transitions are legal? | Product Owner | Release 3 |
| **OQ-9** | Concrete numeric limits are undefined: business idea min/max length, max entry length, rate-limit windows, password policy. | Product Owner | Sprint 2 |
| **OQ-10** | Should categories for Business Model Canvas and OSEC Canvas be seeded in MVP, or only Lean Canvas (the only set enumerated in the standards)? | Product Owner | Sprint 2 |

---

# 15. Traceability — Standards § → Epic

| Standards section | Covered by |
|---|---|
| §1 Project Overview, §2 Workflow | Product scope, §5 user journey |
| §3 Project Structure, §4 Module Responsibilities | US-1.1, US-1.3, US-1.6, US-6.5 |
| §5 JS & Code Conventions | US-1.1, US-6.5 |
| §6 SQL & Database Rules | US-1.3, US-1.4, US-2.5, US-6.1 |
| §7 Authentication Rules | Epic 2 |
| §8 Portkey Integration Rules | US-5.1 |
| §9 Business Idea Rules | US-4.1, US-5.2, Epic 7 |
| §10 Canvas Rules | Epic 3 |
| §11 Database Design | US-1.5 (+ OQ-1) |
| §12 Audit Column Standards | US-1.5 |
| §13 API Design | §7 API surface, Epics 2–5 |
| §14 Validation Rules | US-2.1, US-2.2, US-4.1, US-7.1 |
| §15 Ownership and Authorization | US-4.4 |
| §16 AI Response Validation | US-5.3, US-8.4 |
| §17 Security Requirements | Epic 6 |
| §18 Environment Variables | US-1.2 |
| §20 Core Development Principles | Definition of Done, US-6.5 |
