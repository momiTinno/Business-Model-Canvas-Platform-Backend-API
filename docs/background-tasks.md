# Background Tasks

## Purpose

Canvas generation is now asynchronous. The API stores a durable generation request and the background worker performs the Portkey call and entry persistence. This prevents long-running AI work from holding an HTTP request open.

## Architecture

```text
POST canvas generation
  -> MySQL transaction: canvas_generations(PENDING) + outbox_events(PENDING)
  -> API responds 202 Accepted
  -> Outbox publisher adds BullMQ job to Redis
  -> Worker claims the job and marks it PROCESSING
  -> Portkey SDK generates canvas hypotheses
  -> MySQL transaction: persist entries + mark generation COMPLETED
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
QUEUE_JOB_ATTEMPTS=3
QUEUE_BACKOFF_MS=5000
```

Apply migration `src/db/mysql/migration/005_create_outbox_events.sql` using the same migration procedure used for the existing schema.

## Local operation

Run the API in one terminal:

```bash
npm run dev
```

Run the queue worker in a second terminal:

```bash
npm run worker:dev
```

The API and worker must use the same MySQL and Redis configuration.

## API behavior

`POST /api/business-ideas/:businessIdeaId/canvas-generations` now returns `202 Accepted`:

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

## Verification performed

- Automated tests, architecture checks, and formatting checks pass.
- A local API-and-worker smoke test verified `202 Accepted` with `PENDING`, followed by `COMPLETED` and persisted entries across all 12 Lean Canvas categories.
