import { mysqlExecutor } from "../../db/mysql/mysql.executor.js";

export class BusinessIdeaDbService {
  constructor(dbExecutor = mysqlExecutor.execute) {
    this.dbExecutor = dbExecutor;
  }
  createBusinessIdea = async ({ id, userId, canvasId, originalIdea }) => {
    await this.dbExecutor({
      query:
        "INSERT INTO business_ideas (id, user_id, canvas_id, original_idea, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?)",
      parameters: [id, userId, canvasId, originalIdea, userId, userId],
    });
  };
  findBusinessIdeasByUser = async (userId, limit, offset) => {
    const [rows] = await this.dbExecutor({
      query:
        "SELECT id, canvas_id AS canvasTypeId, original_idea AS originalIdea, ai_enhanced_idea AS aiEnhancedIdea, generation_status AS generationStatus, created_at AS createdAt FROM business_ideas WHERE user_id = ? AND deleted = FALSE ORDER BY created_at DESC LIMIT ? OFFSET ?",
      parameters: [userId, limit, offset],
    });
    return rows;
  };
  countBusinessIdeasByUser = async (userId) => {
    const [rows] = await this.dbExecutor({
      query:
        "SELECT COUNT(*) AS total FROM business_ideas WHERE user_id = ? AND deleted = FALSE",
      parameters: [userId],
    });
    return rows[0].total;
  };
  findBusinessIdeaById = async (id) => {
    const [rows] = await this.dbExecutor({
      query:
        "SELECT b.id, b.user_id, b.canvas_id AS canvasTypeId, c.name AS canvasTypeName, b.original_idea AS originalIdea, b.ai_enhanced_idea AS aiEnhancedIdea, b.generation_status AS generationStatus, b.created_at AS createdAt, b.updated_at AS updatedAt FROM business_ideas b JOIN canvas c ON c.id = b.canvas_id WHERE b.id = ? AND b.deleted = FALSE LIMIT 1",
      parameters: [id],
    });
    return rows[0] ?? null;
  };
}
