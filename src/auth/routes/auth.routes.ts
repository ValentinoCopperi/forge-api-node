import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import {
  tokenMiddleware,
  uploadMiddleware,
} from "../middlewares/auth.middleware";

export class AuthRoutes {
  private router: Router;

  constructor(private readonly authController: AuthController) {
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.post(`/create`, (req, res) =>
      this.authController.register(req, res),
    );

    this.router.post(`/refresh`, (req, res) =>
      this.authController.refreshToken(req, res),
    );

    this.router.post(`/signin`, (req, res) =>
      this.authController.login(req, res),
    );

    this.router.get(`/me`, tokenMiddleware, (req, res) =>
      this.authController.getUser(req, res),
    );

    this.router.post(`/logout`, tokenMiddleware, (req, res) =>
      this.authController.logout(req, res),
    );

    this.router.post(
      "/uploadAvatar",
      tokenMiddleware,
      uploadMiddleware.single("avatar"),
      (req, res) => this.authController.uploadAvatar(req, res),
    );
  }

  getRouter() {
    return this.router;
  }
}
