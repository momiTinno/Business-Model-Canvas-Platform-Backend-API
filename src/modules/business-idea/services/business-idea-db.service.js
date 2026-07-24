import { mysqlExecutor } from "../../../db/mysql/executor.js";
import {
  COUNT_BUSINESS_IDEAS_BY_USER,
  CREATE_BUSINESS_IDEA,
  FIND_BUSINESS_IDEA_BY_ID,
  FIND_BUSINESS_IDEAS_BY_USER,
  UPDATE_BUSINESS_IDEA_SELECTION,
  UPDATE_ENHANCEMENT,
} from "../queries/business-idea.query.js";

export class BusinessIdeaDbService {
  constructor() {
    this.dbExecutor = mysqlExecutor.execute;
  }
  createBusinessIdea = async ({ id, userId, canvasId, originalIdea }) => {
    await this.dbExecutor({
      query: CREATE_BUSINESS_IDEA,
      parameters: [id, userId, canvasId, originalIdea, userId, userId],
    });
  };
  findBusinessIdeasByUser = async (userId, limit, offset) => {
    const safeLimit = Math.min(Math.max(Number(limit), 1), 100);
    const safeOffset = Math.max(Number(offset), 0);
    const [rows] = await this.dbExecutor({
      query: FIND_BUSINESS_IDEAS_BY_USER.replace(
        "__OFFSET__",
        String(safeOffset),
      ).replace("__LIMIT__", String(safeLimit)),
      parameters: [userId],
    });
    return rows;
  };
  countBusinessIdeasByUser = async (userId) => {
    const [rows] = await this.dbExecutor({
      query: COUNT_BUSINESS_IDEAS_BY_USER,
      parameters: [userId],
    });
    return rows[0].total;
  };
  findBusinessIdeaById = async (id) => {
    const [rows] = await this.dbExecutor({
      query: FIND_BUSINESS_IDEA_BY_ID,
      parameters: [id],
    });
    return rows[0] ?? null;
  };
  updateEnhancement = async ({ id, userId, enhancedIdea, status }) => {
    await this.dbExecutor({
      query: UPDATE_ENHANCEMENT,
      parameters: [enhancedIdea, status, userId, id],
    });
  };

  updateSelection = async ({ id, userId, selectedIdea, selectionType }) => {
    await this.dbExecutor({
      query: UPDATE_BUSINESS_IDEA_SELECTION,
      parameters: [selectedIdea, selectionType, userId, id, userId],
    });
  };
}
