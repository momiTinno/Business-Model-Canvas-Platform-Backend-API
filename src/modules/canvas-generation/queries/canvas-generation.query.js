export const FIND_COMPLETED_CANVAS_GENERATION_BY_BUSINESS_IDEA_ID =
  "SELECT id FROM canvas_generations WHERE business_idea_id = ? AND generation_status = 'COMPLETED' AND deleted = FALSE LIMIT 1";
export const FIND_ACTIVE_CANVAS_GENERATION_BY_BUSINESS_IDEA_ID =
  "SELECT id FROM canvas_generations WHERE business_idea_id = ? AND generation_status IN ('PENDING', 'PROCESSING') AND deleted = FALSE LIMIT 1";
export const CREATE_CANVAS_GENERATION =
  "INSERT INTO canvas_generations (id, business_idea_id, canvas_id, selected_idea_snapshot, generation_status, created_by, updated_by) VALUES (?, ?, ?, ?, 'PENDING', ?, ?)";
export const UPDATE_CANVAS_GENERATION_STATUS =
  "UPDATE canvas_generations SET generation_status = ?, error_code = ?, updated_by = ? WHERE id = ? AND deleted = FALSE";
export const FIND_CANVAS_GENERATION_BY_ID_AND_USER_ID =
  "SELECT g.id, g.business_idea_id AS businessIdeaId, g.canvas_id AS canvasTypeId, c.name AS canvasTypeName, g.selected_idea_snapshot AS selectedIdeaSnapshot, g.generation_status AS generationStatus, g.error_code AS errorCode, g.created_at AS createdAt, g.updated_at AS updatedAt FROM canvas_generations g JOIN business_ideas b ON b.id = g.business_idea_id JOIN canvas c ON c.id = g.canvas_id WHERE g.id = ? AND b.user_id = ? AND g.deleted = FALSE AND b.deleted = FALSE LIMIT 1";
