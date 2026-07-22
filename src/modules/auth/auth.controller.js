import { HTTP_STATUS } from "../../constants/http-status.constants.js";
import { getCurrentUser, login, register } from "./auth.service.js";
export const registerUser = async (req, res, next) => {
  try {
    const user = await register(req.validatedBody);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: { ...user, createdAt: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
};
export const loginUser = async (req, res, next) => {
  try {
    res
      .status(HTTP_STATUS.OK)
      .json({ success: true, data: await login(req.validatedBody) });
  } catch (error) {
    next(error);
  }
};
export const getMe = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.id);
    if (!user) throw new Error("Unauthorized");
    res.status(HTTP_STATUS.OK).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
