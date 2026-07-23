import { HTTP_STATUS } from "../../constants/http-status.constants.js";
import { AppError } from "../../utils/app-error.util.js";
import { AuthService } from "./auth.service.js";

export class AuthController {
  constructor(authService = new AuthService()) {
    this.authService = authService;
  }
  registerUser = async (req, res, next) => {
    try {
      const user = await this.authService.register(req.validatedBody);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: { ...user, createdAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };
  loginUser = async (req, res, next) => {
    try {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: await this.authService.login(req.validatedBody),
      });
    } catch (error) {
      next(error);
    }
  };
  getMe = async (req, res, next) => {
    try {
      const user = await this.authService.getCurrentUser(req.user.id);
      if (!user)
        throw new AppError(
          "Authentication is required",
          HTTP_STATUS.UNAUTHORIZED,
          "INVALID_TOKEN",
        );
      res.status(HTTP_STATUS.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };
}
