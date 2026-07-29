export const CREATE_OUTBOX_EVENT =
  "INSERT INTO outbox_events (id, event_type, payload) VALUES (?, ?, ?)";
export const FIND_PUBLISHABLE_OUTBOX_EVENTS =
  "SELECT id, event_type AS eventType, payload FROM outbox_events WHERE status = 'PENDING' AND available_at <= CURRENT_TIMESTAMP ORDER BY created_at ASC LIMIT 20";
export const MARK_OUTBOX_EVENT_PUBLISHED =
  "UPDATE outbox_events SET status = 'PUBLISHED', published_at = CURRENT_TIMESTAMP, last_error_code = NULL WHERE id = ? AND status = 'PENDING'";
export const RECORD_OUTBOX_EVENT_FAILURE =
  "UPDATE outbox_events SET attempts = attempts + 1, available_at = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? SECOND), last_error_code = ? WHERE id = ? AND status = 'PENDING'";
