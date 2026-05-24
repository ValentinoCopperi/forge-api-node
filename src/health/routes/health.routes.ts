import { Router } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import Redis from "ioredis";

export class HealthRoutes {
  private router: Router;
  private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
  private redis: Redis;

  constructor(
    prisma_c: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    redis_c: Redis,
  ) {
    this.router = Router();
    this.prisma = prisma_c;
    this.redis = redis_c;
    this.initRoutes();
  }

  initRoutes() {
    this.router.get("/", async (req, res, _next) => {
      const results = await Promise.allSettled([
        this.prisma.$queryRaw`SELECT 1`,
        this.redis.ping(),
      ]);

      const [db, redis] = results;

      const databaseOk = db.status === "fulfilled";
      const redisOk = redis.status === "fulfilled";

      const hasErrors = !databaseOk || !redisOk;

      return res.status(hasErrors ? 500 : 200).json({
        status: hasErrors ? `error` : `ok`,
        server: "ok",
        database: databaseOk ? "ok" : "error",
        redis: redisOk ? "ok" : "error",
        timestamp: new Date().toISOString(),
      });
    });
  }

  getRouter() {
    return this.router;
  }
}
