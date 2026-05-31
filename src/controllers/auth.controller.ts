import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess } from "../utils/apiResponse";

export class AuthController {
  login = async (req: Request, res: Response) => {
    const ip = req.ip ?? "unknown";
    const data = await authService.login(req.body.email, req.body.password, ip);
    sendSuccess(res, data, "Login successful");
  };

  refresh = async (req: Request, res: Response) => {
    const data = await authService.refresh(req.body.refreshToken);
    sendSuccess(res, data, "Token refreshed");
  };

  logout = async (req: Request, res: Response) => {
    await authService.logout(req.body.refreshToken);
    sendSuccess(res, null, "Logged out");
  };

  changePassword = async (req: Request, res: Response) => {
    await authService.changePassword(
      req.user!.id,
      req.body.currentPassword,
      req.body.newPassword
    );
    sendSuccess(res, null, "Password updated");
  };

  me = async (req: Request, res: Response) => {
    const data = await authService.me(req.user!.id);
    sendSuccess(res, data);
  };
}

export const authController = new AuthController();
