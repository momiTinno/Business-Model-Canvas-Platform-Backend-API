import { execute } from "../../db/mysql/mysql.executor.js";

export const findCanvasTypes = async () => {
  const [rows] = await execute({
    query:
      "SELECT id, code, name FROM canvas WHERE deleted = FALSE ORDER BY name",
  });
  return rows;
};
export const findCanvasTypeById = async (id) => {
  const [rows] = await execute({
    query:
      "SELECT id, code, name FROM canvas WHERE id = ? AND deleted = FALSE LIMIT 1",
    parameters: [id],
  });
  return rows[0] ?? null;
};
export const findCategoriesByCanvasId = async (canvasId) => {
  const [rows] = await execute({
    query:
      "SELECT id, code, name FROM categories WHERE canvas_id = ? AND deleted = FALSE ORDER BY name",
    parameters: [canvasId],
  });
  return rows;
};
