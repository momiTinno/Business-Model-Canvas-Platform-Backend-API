import { mysqlExecutor } from "../../../db/mysql/executor.js";
import {
  CREATE_CANVAS_GENERATION,
  FIND_ACTIVE_CANVAS_GENERATION_BY_BUSINESS_IDEA_ID,
  FIND_CANVAS_GENERATION_BY_ID_AND_USER_ID,
  FIND_COMPLETED_CANVAS_GENERATION_BY_BUSINESS_IDEA_ID,
  FIND_CANVAS_GENERATION_FOR_PROCESSING,
  CLAIM_CANVAS_GENERATION,
  RECORD_CANVAS_GENERATION_JOB_FAILURE,
  UPDATE_CANVAS_GENERATION_STATUS,
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

  createCanvasGeneration = async ({ connection = null, id, idea, userId }) => {
    await this.dbExecutor({
      query: CREATE_CANVAS_GENERATION,
      parameters: [
        id,
        idea.id,
        idea.canvasTypeId,
        idea.selectedIdea,
        userId,
        userId,
      ],
      connection,
    });
  };

  findCanvasGenerationForProcessing = async (id) => {
    const [rows] = await this.dbExecutor({
      query: FIND_CANVAS_GENERATION_FOR_PROCESSING,
      parameters: [id],
    });
    return rows[0] ?? null;
  };

  claimCanvasGeneration = async (id) => {
    const [result] = await this.dbExecutor({
      query: CLAIM_CANVAS_GENERATION,
      parameters: [id],
    });
    return result.affectedRows === 1;
  };

  recordJobFailure = async ({
    id,
    status,
    errorCode,
    failureMessage = null,
  }) => {
    await this.dbExecutor({
      query: RECORD_CANVAS_GENERATION_JOB_FAILURE,
      parameters: [status, errorCode, failureMessage, id],
    });
  };

  updateCanvasGenerationStatus = async ({
    connection = null,
    id,
    userId,
    status,
    errorCode = null,
    failureMessage = null,
  }) => {
    await this.dbExecutor({
      query: UPDATE_CANVAS_GENERATION_STATUS,
      parameters: [status, errorCode, failureMessage, userId, id],
      connection,
    });
  };

  findCanvasGenerationByIdAndUserId = async (id, userId) => {
    const [rows] = await this.dbExecutor({
      query: FIND_CANVAS_GENERATION_BY_ID_AND_USER_ID,
      parameters: [id, userId],
    });
    return rows[0] ?? null;
  };
}
