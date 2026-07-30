import { AppError } from "../../utils/app-error.util.js";
import { mysqlTransaction } from "../../db/mysql/transaction.js";
import { CanvasService } from "../canvas/canvas.service.js";
import { EntryDbService } from "../entry/services/entry-db.service.js";
import { CanvasGenerationAiService } from "./services/canvas-generation-ai.service.js";
import { CanvasGenerationDbService } from "./services/canvas-generation-db.service.js";
import { CanvasGenerationValidatorService } from "./services/canvas-generation-validator.service.js";
import { generate } from "../../utils/uuid.util.js";
import { OutboxEventDbService } from "../../jobs/services/outbox-event-db.service.js";
import { BackgroundTaskStatusHistoryDbService } from "../../jobs/services/background-task-status-history-db.service.js";

const CANVAS_GENERATION = "CANVAS_GENERATION";

export class CanvasGenerationService {
  constructor() {
    this.canvasService = new CanvasService();
    this.canvasGenerationDbService = new CanvasGenerationDbService();
    this.canvasGenerationAiService = new CanvasGenerationAiService();
    this.canvasGenerationValidatorService =
      new CanvasGenerationValidatorService();
    this.entryDbService = new EntryDbService();
    this.outboxEventDbService = new OutboxEventDbService();
    this.mysqlTransaction = mysqlTransaction;
    this.backgroundTaskStatusHistoryDbService =
      new BackgroundTaskStatusHistoryDbService();
  }

  requestCanvasGeneration = async ({ idea, userId, correlationId = null }) => {
    if (!idea.selectedIdea)
      throw new AppError(
        "A selected idea is required before canvas generation",
        409,
        "IDEA_SELECTION_REQUIRED",
      );
    if (
      await this.canvasGenerationDbService.findActiveCanvasGenerationByBusinessIdeaId(
        idea.id,
      )
    )
      throw new AppError(
        "Canvas generation is in progress",
        409,
        "GENERATION_IN_PROGRESS",
      );
    const categories = await this.canvasService.getCategoriesForCanvas(
      idea.canvasTypeId,
    );
    if (!categories.length)
      throw new AppError(
        "Canvas categories are not configured",
        409,
        "CANVAS_CATEGORIES_NOT_CONFIGURED",
      );
    const generationId = generate();
    await this.mysqlTransaction.run(async (connection) => {
      await this.canvasGenerationDbService.createCanvasGeneration({
        connection,
        id: generationId,
        idea,
        userId,
      });
      await this.backgroundTaskStatusHistoryDbService.recordStatus({
        connection,
        taskType: CANVAS_GENERATION,
        resourceId: generationId,
        status: "PENDING",
      });
      await this.outboxEventDbService.createEvent({
        connection,
        id: generate(),
        eventType: "CANVAS_GENERATION_REQUESTED",
        payload: { generationId, correlationId },
      });
    });
    return {
      id: generationId,
      businessIdeaId: idea.id,
      canvasTypeId: idea.canvasTypeId,
      generationStatus: "PENDING",
      createdAt: new Date().toISOString(),
    };
  };

  getOwnedCanvasGeneration = async (canvasGenerationId, userId) => {
    const generation =
      await this.canvasGenerationDbService.findCanvasGenerationByIdAndUserId(
        canvasGenerationId,
        userId,
      );
    if (!generation)
      throw new AppError(
        "Canvas generation not found",
        404,
        "CANVAS_GENERATION_NOT_FOUND",
      );
    return generation;
  };

  getStatusTimeline = async (canvasGenerationId) =>
    this.backgroundTaskStatusHistoryDbService.findStatusTimeline({
      taskType: CANVAS_GENERATION,
      resourceId: canvasGenerationId,
    });

  getGroupedEntries = async (canvasGenerationId, canvasTypeId) => {
    const rows =
      await this.entryDbService.findEntriesByCanvasGenerationId(
        canvasGenerationId,
      );
    const categories = new Map(
      (await this.canvasService.getCategoriesForCanvas(canvasTypeId)).map(
        (category) => [
          category.id,
          {
            id: category.id,
            code: category.code,
            name: category.name,
            entries: [],
          },
        ],
      ),
    );
    for (const row of rows) {
      const { categoryId, categoryCode, categoryName, ...entry } = row;
      categories.get(row.categoryId).entries.push(entry);
    }
    return Array.from(categories.values());
  };
}
