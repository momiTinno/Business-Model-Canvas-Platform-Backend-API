import { mysqlExecutor } from "../../../db/mysql/executor.js";
import {
  CREATE_ENTRY,
  FIND_ENTRIES_BY_CANVAS_GENERATION_ID,
} from "../queries/entry.query.js";

export class EntryDbService {
  constructor() {
    this.dbExecutor = mysqlExecutor.execute;
  }

  createEntries = async ({ connection, entries, generationId, userId }) => {
    for (const entry of entries)
      await this.dbExecutor({
        query: CREATE_ENTRY,
        parameters: [
          entry.id,
          generationId,
          entry.categoryId,
          entry.content,
          entry.sortOrder,
          userId,
          userId,
        ],
        connection,
      });
  };

  findEntriesByCanvasGenerationId = async (canvasGenerationId) => {
    const [rows] = await this.dbExecutor({
      query: FIND_ENTRIES_BY_CANVAS_GENERATION_ID,
      parameters: [canvasGenerationId],
    });
    return rows;
  };
}
