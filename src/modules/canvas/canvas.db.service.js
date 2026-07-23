import { mysqlExecutor } from "../../db/mysql/mysql.executor.js";
export class CanvasDbService {
  constructor() {
    this.dbExecutor = mysqlExecutor.execute;
  }
  findCanvasTypes = async () => {
    const [rows] = await this.dbExecutor({
      query:
        "SELECT id, code, name FROM canvas WHERE deleted = FALSE ORDER BY name",
    });
    return rows;
  };
  findCanvasTypeById = async (id) => {
    const [rows] = await this.dbExecutor({
      query:
        "SELECT id, code, name FROM canvas WHERE id = ? AND deleted = FALSE LIMIT 1",
      parameters: [id],
    });
    return rows[0] ?? null;
  };
  findCategoriesByCanvasId = async (canvasId) => {
    const [rows] = await this.dbExecutor({
      query:
        "SELECT id, code, name FROM categories WHERE canvas_id = ? AND deleted = FALSE ORDER BY name",
      parameters: [canvasId],
    });
    return rows;
  };
}
