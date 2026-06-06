import { JwtPayload, UserWithRole } from "../types/auth.types";
import { AuthRepository } from "../repositories/auth.repository";
import { AppError } from "../../shared/errors/AppError";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { StorageService } from "../../shared/libs/storage/storage.service";
import { envs } from "../../shared/configs/env.config";

interface I_AuthService {
  register(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<UserWithRole>;
  login(data: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string; refreshToken: string }>;
  refresh(refreshToken: string): Promise<{ accessToken: string }>;
  uploadAvatar(data: {
    userId: number;
    file: Express.Multer.File;
  }): Promise<UserWithRole>;
  getUser(userId: number): Promise<UserWithRole>;
}

export class AuthService implements I_AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly storageService: StorageService,
  ) {}

  async uploadAvatar(data: {
    userId: number;
    file: Express.Multer.File;
  }): Promise<UserWithRole> {
    const { userId, file } = data;

    const user = await this.authRepository.findById(userId);

    if (!user) throw new AppError(`User with ID ${userId} not found`, 404);

    const { id, avatarUrl } = user;

    if (avatarUrl) {
      const key = avatarUrl.split(`${envs.S3_BUCKET}/`)[1];
      await this.storageService.deleteFile(key);
    }

    const key = this.storageService.createKey(file.originalname, id);

    const url = await this.storageService.uploadFile(file, key);

    return await this.authRepository.updateAvatar(userId, url);
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<UserWithRole> {
    const { name, email, password } = data;

    if (await this.authRepository.findByEmail(email))
      throw new AppError(`${email} is already used`, 409);

    const hashedPassword = bcrypt.hashSync(password, 10);

    return await this.authRepository.createUser({
      name,
      email,
      passwordHash: hashedPassword,
    });
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = data;

    const user = await this.authRepository.findByEmailWithPassword(email);
    if (!user) throw new AppError("User not found", 401);

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new AppError("Invalid credentials", 401);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.userRoles.map((r) => r.role),
    };

    const accessToken = jwt.sign(payload, envs.JWT_SECRET, {
      expiresIn: "45m",
    });
    const refreshToken = jwt.sign(payload, envs.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const token = jwt.verify(refreshToken, envs.JWT_REFRESH_SECRET);

    const { sub, email, roles } = token as never as JwtPayload;

    const payload = {
      sub,
      email,
      roles,
    };

    const newAcessToken = jwt.sign(payload, envs.JWT_SECRET, {
      expiresIn: "15m",
    });

    return { accessToken: newAcessToken };
  }

  async getUser(userId: number): Promise<UserWithRole> {
    const user = await this.authRepository.findById(userId);
    if (!user) throw new AppError(`User with ID ${userId} not found`, 404);
    return user;
  }
}
