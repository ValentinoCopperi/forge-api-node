import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { loginSchema, registerSchema } from "../dtos/auth.dto";
import { AppError } from "../../shared/errors/AppError";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async uploadAvatar(req: Request, res: Response) {
    const { file } = req;

    const userId = req.user!.sub;

    if (!file) return res.status(400).json({ message: "File is required" });

    const result = await this.authService.uploadAvatar({ userId, file });
    return res.status(200).json({ data: result });
  }

  async register(req: Request, res: Response) {
    const body = registerSchema.safeParse(req.body ?? {});

    if (!body.success) {
      const { fieldErrors, formErrors } = body.error.flatten();
      return res.status(400).json({
        errors: fieldErrors,
        ...(formErrors.length > 0 ? { formErrors } : {}),
      });
    }

    const user = await this.authService.register(body.data);

    return res.status(200).json({
      data: user,
    });
  }

  async login(req: Request, res: Response) {
    const body = loginSchema.safeParse(req.body ?? {});

    if (!body.success) {
      const { fieldErrors, formErrors } = body.error.flatten();
      return res.status(400).json({
        errors: fieldErrors,
        ...(formErrors.length > 0 ? { formErrors } : {}),
      });
    }

    const { accessToken, refreshToken } = await this.authService.login(
      body.data,
    );

    return res.status(200).json({
      accessToken,
      refreshToken,
    });
  }

  async refreshToken(req: Request, res: Response) {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw new AppError(`Refresh token is not defined`, 409);
    }

    const { accessToken } = await this.authService.refresh(refresh_token);

    return res.status(200).json({
      accessToken,
    });
  }
}
