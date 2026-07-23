import { AppError } from "../../utils/app-error.util.js";
import { CanvasDbService } from "./canvas.db.service.js";
export class CanvasService {
  constructor() {
    this.canvasDbService = new CanvasDbService();
  }
  getCanvasTypes = () => this.canvasDbService.findCanvasTypes();
  getCanvasTypeById = (id) => this.canvasDbService.findCanvasTypeById(id);
  getCategoriesForCanvas = async (canvasId) => {
    if (!(await this.getCanvasTypeById(canvasId)))
      throw new AppError("Canvas type not found", 404, "CANVAS_TYPE_NOT_FOUND");
    return this.canvasDbService.findCategoriesByCanvasId(canvasId);
  };
}
