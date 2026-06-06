/// <reference path="./shared/types/express/index.d.ts" />
import application = require("express");
import { createServer } from "http";
import { getSocket, initSocket } from "./shared/libs/sockets/socket";
import path from "path";
import { NotificationsRoutes } from "./notifications/routes/notifications.routes";
import {
  getPrismaClient,
  initPrisma,
} from "./shared/libs/prisma/prisma.connection";
import { createOrganizationModule } from "./organizations/module";
import { createProjectsModule } from "./projects/module";
import { createTaskModule } from "./tasks/module";
import express from "express";
import cors from "cors";
import { createAuthModule } from "./auth/module";
import {
  getRedisClient,
  initRedis,
} from "./shared/libs/redis/redis.connection";
import { ErrorRequestHandler } from "./shared/middleware/error-request-handler";
import { rateLimitMiddleware, tokenMiddleware } from "./auth/middlewares/auth.middleware";
import { envs } from "./shared/configs/env.config";
import { LoggerMiddleware } from "./shared/middleware/logger.middleware";
import { RequestIdMiddleware } from "./shared/middleware/request-id.middleware";
import { HealthRoutes } from "./health/routes/health.routes";
import swaggerUi from "swagger-ui-express";
import { buildOpenApiDocument } from "./shared/docs/openapi.docs";

const API_PREFIX = `/api/v1`;

function boostrap() {
  const app = application();

  app.use(express.json());
  app.use(cors({
    origin: envs.CLIENT_URL,
    credentials: true,
  }));

  const openApiDocument = buildOpenApiDocument();

  app.get("/docs/openapi.json", (_req, res) => {
    res.json(openApiDocument);
  });
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: "Maproute API docs",
  }));

  //Middleware para requests ids global
  app.use(RequestIdMiddleware);
  //Middlware aplicado globalmente
  app.use(LoggerMiddleware);

  const httpServer = createServer(app);

  initSocket(httpServer);
  initPrisma();
  initRedis();

  const io = getSocket();
  const prisma = getPrismaClient();

  const notificationsRouter = new NotificationsRoutes(io);
  const healthRouter = new HealthRoutes(prisma, getRedisClient());

  app.use(`${API_PREFIX}/health`, rateLimitMiddleware, healthRouter.getRouter());

  app.use(`${API_PREFIX}/tasks`,
    tokenMiddleware,
    rateLimitMiddleware,
    createTaskModule(prisma),
  );

  app.use(`${API_PREFIX}/organizations`,
    tokenMiddleware,
    createOrganizationModule(prisma),
  );

  app.use(`${API_PREFIX}/organizations`,
    tokenMiddleware,
    createProjectsModule(prisma),
  );

  app.use(`${API_PREFIX}/notifications`,
    tokenMiddleware,
    notificationsRouter.getRouter(),
  );

  app.use(`${API_PREFIX}/auth`, rateLimitMiddleware, createAuthModule(prisma));

  app.get("/client", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "client.html"));
  });

  //Middlware de para capturar errores global
  app.use(ErrorRequestHandler);

  httpServer.listen(envs.APP_PORT, () => {
    console.log("App listening on", envs.APP_PORT);
  });
}

boostrap();
