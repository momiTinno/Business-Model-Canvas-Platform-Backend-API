export const FIND_COMPLETED_CANVAS_GENERATION_BY_BUSINESS_IDEA_ID =
  "SELECT id FROM canvas_generations WHERE business_idea_id = ? AND generation_status = 'COMPLETED' AND deleted = FALSE LIMIT 1";
export const FIND_ACTIVE_CANVAS_GENERATION_BY_BUSINESS_IDEA_ID =
  "SELECT id FROM canvas_generations WHERE business_idea_id = ? AND generation_status IN ('PENDING', 'PROCESSING') AND deleted = FALSE LIMIT 1";
