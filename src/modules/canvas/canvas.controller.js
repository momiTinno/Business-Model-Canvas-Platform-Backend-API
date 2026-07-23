import { HTTP_STATUS } from "../../constants/http-status.constants.js";
import { getCanvasTypes, getCategoriesForCanvas } from "./canvas.service.js";
export const listCanvasTypes = async (req, res, next) => {
  try {
    res
      .status(HTTP_STATUS.OK)
      .json({ success: true, data: await getCanvasTypes() });
  } catch (error) {
    next(error);
  }
};
export const listCategories = async (req, res, next) => {
  try {
    res
      .status(HTTP_STATUS.OK)
      .json({
        success: true,
        data: await getCategoriesForCanvas(req.params.canvasTypeId),
      });
  } catch (error) {
    next(error);
  }
};
