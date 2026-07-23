import { mysqlExecutor } from "../../../db/mysql/executor.js";
import {
  FIND_CANVAS_TYPE_BY_ID,
  FIND_CANVAS_TYPES,
} from "../queries/canvas.query.js";
import { FIND_CATEGORIES_BY_CANVAS_ID } from "../queries/category.query.js";
export class CanvasDbService {
  constructor() {
    this.dbExecutor = mysqlExecutor.execute;
  }
  findCanvasTypes = async () => {
    const [rows] = await this.dbExecutor({
      query: FIND_CANVAS_TYPES,
    });
    return rows;
  };
  findCanvasTypeById = async (id) => {
    const [rows] = await this.dbExecutor({
      query: FIND_CANVAS_TYPE_BY_ID,
      parameters: [id],
    });
    return rows[0] ?? null;
  };
  findCategoriesByCanvasId = async (canvasId) => {
    const [rows] = await this.dbExecutor({
      query: FIND_CATEGORIES_BY_CANVAS_ID,
      parameters: [canvasId],
    });
    return rows;
  };
}
