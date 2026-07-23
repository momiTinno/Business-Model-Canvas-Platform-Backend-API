import { HTTP_STATUS } from "../../constants/http-status.constants.js";
import { CanvasService } from "./canvas.service.js";
export class CanvasController {
  constructor() {
    this.canvasService = new CanvasService();
  }
  listCanvasTypes = async (req, res, next) => {
    try {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: await this.canvasService.getCanvasTypes(),
      });
    } catch (error) {
      next(error);
    }
  };
  listCategories = async (req, res, next) => {
    try {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: await this.canvasService.getCategoriesForCanvas(
          req.params.canvasTypeId,
        ),
      });
    } catch (error) {
      next(error);
    }
  };
}
