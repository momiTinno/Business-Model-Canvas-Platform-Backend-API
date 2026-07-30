CREATE TABLE IF NOT EXISTS background_task_status_history (
  id CHAR(36) PRIMARY KEY,
  task_type VARCHAR(100) NOT NULL,
  resource_id CHAR(36) NOT NULL,
  status VARCHAR(30) NOT NULL,
  occurred_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_background_task_status_history_resource
    (task_type, resource_id, occurred_at)
);
