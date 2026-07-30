import { AppError } from "../../../utils/app-error.util.js";
import { mysqlTransaction } from "../../../db/mysql/transaction.js";
import { CanvasService } from "../../canvas/canvas.service.js";
import { EntryDbService } from "../../entry/services/entry-db.service.js";
import { CanvasGenerationAiService } from "./canvas-generation-ai.service.js";
import { CanvasGenerationDbService } from "./canvas-generation-db.service.js";
import { CanvasGenerationValidatorService } from "./canvas-generation-validator.service.js";

export class CanvasGenerationJobService {
  constructor() {
    this.canvasService = new CanvasService();
    this.canvasGenerationDbService = new CanvasGenerationDbService();
    this.canvasGenerationAiService = new CanvasGenerationAiService();
    this.canvasGenerationValidatorService =
      new CanvasGenerationValidatorService();
    this.entryDbService = new EntryDbService();
    this.mysqlTransaction = mysqlTransaction;
  }

  process = async ({ generationId }) => {
    const generation =
      await this.canvasGenerationDbService.findCanvasGenerationForProcessing(
        generationId,
      );
    if (!generation)
      throw new AppError(
        "Canvas generation not found",
        404,
        "CANVAS_GENERATION_NOT_FOUND",
      );
    if (generation.generationStatus === "COMPLETED") return;
    if (
      !(await this.canvasGenerationDbService.claimCanvasGeneration(
        generationId,
      ))
    )
      return;
    const categories = await this.canvasService.getCategoriesForCanvas(
      generation.canvasTypeId,
    );
    const canvasType = await this.canvasService.getCanvasTypeById(
      generation.canvasTypeId,
    );
    const content = await this.canvasGenerationAiService.generate({
      canvasType: canvasType.name,
      categoryNamesStr: categories.map((category) => category.name).join(", "),
      description: generation.selectedIdea,
    });
    const entries = this.canvasGenerationValidatorService.validate({
      content,
      categories,
    });
    await this.mysqlTransaction.run(async (connection) => {
      await this.entryDbService.createEntries({
        connection,
        entries,
        generationId,
        userId: generation.createdBy,
      });
      await this.canvasGenerationDbService.updateCanvasGenerationStatus({
        connection,
        id: generationId,
        userId: generation.createdBy,
        status: "COMPLETED",
      });
    });
  };

  recordFailure = async ({ generationId, errorCode, finalAttempt }) => {
    await this.canvasGenerationDbService.recordJobFailure({
      id: generationId,
      status: finalAttempt ? "FAILED" : "PENDING",
      errorCode,
      failureMessage: finalAttempt
        ? "The canvas generation could not be completed"
        : null,
    });
  };
}
