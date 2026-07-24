CREATE TABLE IF NOT EXISTS entries (
  id CHAR(36) PRIMARY KEY,
  canvas_generation_id CHAR(36) NOT NULL,
  category_id CHAR(36) NOT NULL,
  content TEXT NOT NULL,
  sort_order INT NOT NULL,
  entry_insertion_type VARCHAR(20) NOT NULL,
  draft BOOLEAN NOT NULL DEFAULT TRUE,
  state VARCHAR(30) NOT NULL DEFAULT 'HYPOTHESIS',
  version INT NOT NULL DEFAULT 0,
  created_by CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by CHAR(36) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_entries_canvas_generation
    FOREIGN KEY (canvas_generation_id) REFERENCES canvas_generations(id),
  CONSTRAINT fk_entries_category FOREIGN KEY (category_id) REFERENCES categories(id),
  KEY idx_entries_canvas_generation_id (canvas_generation_id),
  KEY idx_entries_category_id (category_id),
  KEY idx_entries_generation_category_order
    (canvas_generation_id, category_id, sort_order)
);
