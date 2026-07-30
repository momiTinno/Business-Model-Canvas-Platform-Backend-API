# Background Tasks

## Purpose

Canvas generation and business-idea enhancement are asynchronous. The API stores a durable request and the background worker performs the Portkey call and persistence. This prevents long-running AI work from holding an HTTP request open.

## Architecture

```text
POST canvas generation
  -> MySQL transaction: canvas_generations(PENDING) + outbox_events(PENDING)
  -> API responds 202 Accepted
  -> Outbox publisher adds BullMQ job to Redis
  -> Worker claims the job and marks it PROCESSING
  -> Portkey SDK generates canvas hypotheses
  -> MySQL transaction: persist entries + mark generation COMPLETED

POST business-idea enhancement
  -> MySQL transaction: business_ideas(PENDING) + outbox_events(PENDING)
  -> API responds 202 Accepted
  -> Worker claims the job and marks it PROCESSING
  -> Portkey SDK enhances the idea and marks it COMPLETED
```

If the queue is unavailable when the API receives a request, the outbox event remains in MySQL. The worker retries publishing pending outbox events every five seconds.

## Required services

Run MySQL and Redis before starting the application. For local Redis:

```bash
redis-server
```

Add the following values to the local `.env` file:

```env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
QUEUE_CANVAS_GENERATION_CONCURRENCY=2
QUEUE_BUSINESS_IDEA_ENHANCEMENT_CONCURRENCY=2
QUEUE_JOB_ATTEMPTS=3
QUEUE_BACKOFF_MS=5000
```

Apply migration `src/db/mysql/migration/005_create_outbox_events.sql` using the same migration procedure used for the existing schema.

## Local operation

Run the API in one terminal:

```bash
npm run dev
```

This terminal logs every incoming request, including the method, path, response status, correlation ID, and authenticated user ID.

Run the queue worker in a second terminal:

```bash
npm run worker:dev
```

This terminal logs structured `processing`, `completed`, and `failed` lifecycle events for both `business-idea-enhancement` and `canvas-generation` jobs.

The API and worker must use the same MySQL and Redis configuration.

## API behavior

`POST /api/business-ideas/enhance` is the recommended create-and-enhance command. It accepts the normal idea body, stores the original idea, queues the enhancement in the same transaction, and returns `202 Accepted`:

```json
{
  "canvasTypeId": "canvas-type-uuid",
  "businessIdea": "A detailed business idea"
}
```

`POST /api/business-ideas/:businessIdeaId/enhance` remains available when an idea was created earlier. `POST /api/business-ideas/:businessIdeaId/canvas-generations` queues a canvas after `PATCH /api/business-ideas/:businessIdeaId/select` stores the selected version.

Every queued operation returns `202 Accepted`:

```json
{
  "success": true,
  "data": {
    "id": "generation-uuid",
    "generationStatus": "PENDING"
  }
}
```

Poll generation progress with `GET /api/canvas-generations/:canvasGenerationId`. Retrieve the completed hypotheses with `GET /api/canvas-generations/:canvasGenerationId/entries`.

Poll enhancement progress with `GET /api/business-ideas/:businessIdeaId`. Enhancement status changes from `PENDING` to `PROCESSING`, then `COMPLETED` or `FAILED`. On its final failure, `failureMessage` is `The AI enhancement could not be completed`. Canvas-generation status follows the same pattern, and its resource exposes `failureMessage` on a final failure.

## Reliability rules

- The outbox event and `PENDING` generation record are created in one MySQL transaction.
- The queue job ID is the generation UUID, which prevents duplicate queued work for the same generation.
- Jobs retry with exponential backoff according to `QUEUE_JOB_ATTEMPTS` and `QUEUE_BACKOFF_MS`.
- During retry, a generation returns to `PENDING`; its final failed attempt changes it to `FAILED` and stores a safe error code.
- The worker treats an already `COMPLETED` generation as a no-op, making repeat delivery safe.
- Job payloads contain only IDs and correlation metadata; they never contain JWTs, passwords, or Portkey credentials.

## Changes introduced

- Added BullMQ and ioredis dependencies.
- Added Redis queue configuration, queue, outbox publisher, and worker classes.
- Added MySQL migration `005_create_outbox_events.sql`.
- Changed canvas-generation creation from synchronous AI execution to queued execution.
- Added `worker` and `worker:dev` npm scripts.
- Added tests for outbox publication, queued generation persistence, retry status, and idempotent completion.
- Added a dedicated queue and worker for business-idea enhancement.
- Added migration `006_normalize_business_idea_enhancement_status.sql` so previously unenhanced ideas start as `NOT_REQUESTED`.
- Added `POST /api/business-ideas/enhance` to create and queue an idea enhancement in one request.
- Added migration `007_add_background_task_failure_messages.sql` and safe final-failure messages for both task types.
- Added worker lifecycle logs for request/worker terminal monitoring.

## Verification performed

- Automated tests, architecture checks, and formatting checks pass.
- A local API-and-worker smoke test verified `202 Accepted` with `PENDING`, followed by `COMPLETED` and persisted entries across all 12 Lean Canvas categories.
