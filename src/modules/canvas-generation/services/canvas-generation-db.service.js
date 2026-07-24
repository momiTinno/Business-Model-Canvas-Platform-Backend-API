import { mysqlExecutor } from "../../../db/mysql/executor.js";
import {
  FIND_ACTIVE_CANVAS_GENERATION_BY_BUSINESS_IDEA_ID,
  FIND_COMPLETED_CANVAS_GENERATION_BY_BUSINESS_IDEA_ID,
} from "../queries/canvas-generation.query.js";

export class CanvasGenerationDbService {
  constructor() {
    this.dbExecutor = mysqlExecutor.execute;
  }

  findCompletedCanvasGenerationByBusinessIdeaId = async (businessIdeaId) => {
    const [rows] = await this.dbExecutor({
      query: FIND_COMPLETED_CANVAS_GENERATION_BY_BUSINESS_IDEA_ID,
      parameters: [businessIdeaId],
    });
    return rows[0] ?? null;
  };

  findActiveCanvasGenerationByBusinessIdeaId = async (businessIdeaId) => {
    const [rows] = await this.dbExecutor({
      query: FIND_ACTIVE_CANVAS_GENERATION_BY_BUSINESS_IDEA_ID,
      parameters: [businessIdeaId],
    });
    return rows[0] ?? null;
  };
}
