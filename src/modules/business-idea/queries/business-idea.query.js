export const CREATE_BUSINESS_IDEA =
  "INSERT INTO business_ideas (id, user_id, canvas_id, original_idea, generation_status, created_by, updated_by) VALUES (?, ?, ?, ?, 'NOT_REQUESTED', ?, ?)";
export const FIND_BUSINESS_IDEAS_BY_USER =
  "SELECT id, canvas_id AS canvasTypeId, original_idea AS originalIdea, ai_enhanced_idea AS aiEnhancedIdea, generation_status AS generationStatus, failure_message AS failureMessage, created_at AS createdAt FROM business_ideas WHERE user_id = ? AND deleted = FALSE ORDER BY created_at DESC LIMIT __OFFSET__, __LIMIT__";
export const COUNT_BUSINESS_IDEAS_BY_USER =
  "SELECT COUNT(*) AS total FROM business_ideas WHERE user_id = ? AND deleted = FALSE";
export const FIND_BUSINESS_IDEA_BY_ID =
  "SELECT b.id, b.user_id, b.canvas_id AS canvasTypeId, c.name AS canvasTypeName, b.original_idea AS originalIdea, b.ai_enhanced_idea AS aiEnhancedIdea, b.selected_idea AS selectedIdea, b.selection_type AS selectionType, b.generation_status AS generationStatus, b.failure_message AS failureMessage, b.created_at AS createdAt, b.updated_at AS updatedAt FROM business_ideas b JOIN canvas c ON c.id = b.canvas_id WHERE b.id = ? AND b.deleted = FALSE LIMIT 1";
export const UPDATE_ENHANCEMENT =
  "UPDATE business_ideas SET ai_enhanced_idea = ?, generation_status = ?, failure_message = NULL, updated_by = ? WHERE id = ? AND deleted = FALSE";
export const REQUEST_ENHANCEMENT =
  "UPDATE business_ideas SET ai_enhanced_idea = NULL, generation_status = 'PENDING', failure_message = NULL, updated_by = ? WHERE id = ? AND user_id = ? AND generation_status NOT IN ('PENDING', 'PROCESSING') AND deleted = FALSE";
export const CLAIM_ENHANCEMENT =
  "UPDATE business_ideas SET generation_status = 'PROCESSING', updated_by = user_id WHERE id = ? AND generation_status = 'PENDING' AND deleted = FALSE";
export const RECORD_ENHANCEMENT_JOB_FAILURE =
  "UPDATE business_ideas SET generation_status = ?, failure_message = ?, updated_by = user_id WHERE id = ? AND generation_status = 'PROCESSING' AND deleted = FALSE";
export const UPDATE_BUSINESS_IDEA_SELECTION =
  "UPDATE business_ideas SET selected_idea = ?, selection_type = ?, updated_by = ? WHERE id = ? AND user_id = ? AND deleted = FALSE";
