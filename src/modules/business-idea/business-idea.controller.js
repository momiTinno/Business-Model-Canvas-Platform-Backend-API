import { HTTP_STATUS } from "../../constants/http-status.constants.js";
import { BusinessIdeaService } from "./business-idea.service.js";
export class BusinessIdeaController {
  constructor(businessIdeaService = new BusinessIdeaService()) {
    this.businessIdeaService = businessIdeaService;
  }
  createBusinessIdea = async (req, res, next) => {
    try {
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: await this.businessIdeaService.createBusinessIdea({
          userId: req.user.id,
          ...req.validatedBody,
        }),
      });
    } catch (error) {
      next(error);
    }
  };
  listBusinessIdeas = async (req, res, next) => {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: await this.businessIdeaService.listBusinessIdeas({
          userId: req.user.id,
          page,
          limit,
        }),
      });
    } catch (error) {
      next(error);
    }
  };
  getBusinessIdea = async (req, res, next) => {
    try {
      const { user_id, ...idea } = req.businessIdea;
      res.status(HTTP_STATUS.OK).json({ success: true, data: idea });
    } catch (error) {
      next(error);
    }
  };
}
