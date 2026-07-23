import { AppError } from "../../utils/app-error.util.js";
import {
  findCanvasTypeById,
  findCanvasTypes,
  findCategoriesByCanvasId,
} from "./canvas.db.service.js";
export const getCanvasTypes = findCanvasTypes;
export const getCanvasTypeById = findCanvasTypeById;
export const getCategoriesForCanvas = async (canvasId) => {
  if (!(await findCanvasTypeById(canvasId)))
    throw new AppError("Canvas type not found", 404, "CANVAS_TYPE_NOT_FOUND");
  return findCategoriesByCanvasId(canvasId);
};
