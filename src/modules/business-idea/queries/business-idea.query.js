export const CREATE_BUSINESS_IDEA =
  "INSERT INTO business_ideas (id, user_id, canvas_id, original_idea, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?)";
export const FIND_BUSINESS_IDEAS_BY_USER =
  "SELECT id, canvas_id AS canvasTypeId, original_idea AS originalIdea, ai_enhanced_idea AS aiEnhancedIdea, generation_status AS generationStatus, created_at AS createdAt FROM business_ideas WHERE user_id = ? AND deleted = FALSE ORDER BY created_at DESC LIMIT __OFFSET__, __LIMIT__";
export const COUNT_BUSINESS_IDEAS_BY_USER =
  "SELECT COUNT(*) AS total FROM business_ideas WHERE user_id = ? AND deleted = FALSE";
export const FIND_BUSINESS_IDEA_BY_ID =
  "SELECT b.id, b.user_id, b.canvas_id AS canvasTypeId, c.name AS canvasTypeName, b.original_idea AS originalIdea, b.ai_enhanced_idea AS aiEnhancedIdea, b.generation_status AS generationStatus, b.created_at AS createdAt, b.updated_at AS updatedAt FROM business_ideas b JOIN canvas c ON c.id = b.canvas_id WHERE b.id = ? AND b.deleted = FALSE LIMIT 1";
export const UPDATE_ENHANCEMENT =
  "UPDATE business_ideas SET ai_enhanced_idea = ?, generation_status = ?, updated_by = ? WHERE id = ? AND deleted = FALSE";
