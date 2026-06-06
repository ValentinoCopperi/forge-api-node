import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  APP_PORT: z.coerce.number().default(3000),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),

  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_PORT: z.coerce.number(),

  PG_ADMIN_PORT: z.coerce.number(),
  PGADMIN_DEFAULT_EMAIL: z.string().email(),
  PGADMIN_DEFAULT_PASSWORD: z.string(),

  MINIO_PORT: z.coerce.number(),
  MINIO_CONSOLE_PORT: z.coerce.number(),
  MINIO_ROOT_USER: z.string(),
  MINIO_ROOT_PASSWORD: z.string(),

  S3_ENDPOINT: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_BUCKET: z.string(),
  S3_REGION: z.string(),

  REDIS_PORT: z.coerce.number(),
  REDIS_HOST: z.string(),

  MAX_IP_REQUEST: z.coerce.number().default(5),
});

const parseEnvs = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  return result.data;
};

export const envs = parseEnvs();

export type EnvConfig = z.infer<typeof envSchema>;