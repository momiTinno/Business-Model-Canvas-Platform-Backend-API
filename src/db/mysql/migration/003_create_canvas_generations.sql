CREATE TABLE IF NOT EXISTS canvas_generations (
  id CHAR(36) PRIMARY KEY,
  business_idea_id CHAR(36) NOT NULL,
  canvas_id CHAR(36) NOT NULL,
  selected_idea_snapshot TEXT NOT NULL,
  generation_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  error_code VARCHAR(100) NULL,
  created_by CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by CHAR(36) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_canvas_generations_business_idea
    FOREIGN KEY (business_idea_id) REFERENCES business_ideas(id),
  CONSTRAINT fk_canvas_generations_canvas FOREIGN KEY (canvas_id) REFERENCES canvas(id),
  KEY idx_canvas_generations_business_idea_id (business_idea_id),
  KEY idx_canvas_generations_canvas_id (canvas_id),
  KEY idx_canvas_generations_business_idea_status
    (business_idea_id, generation_status)
);
