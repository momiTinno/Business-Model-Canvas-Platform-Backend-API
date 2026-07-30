export const CREATE_BACKGROUND_TASK_STATUS_HISTORY =
  "INSERT INTO background_task_status_history (id, task_type, resource_id, status) VALUES (?, ?, ?, ?)";
export const FIND_BACKGROUND_TASK_STATUS_HISTORY =
  "SELECT status, occurred_at AS occurredAt FROM background_task_status_history WHERE task_type = ? AND resource_id = ? ORDER BY occurred_at ASC";
