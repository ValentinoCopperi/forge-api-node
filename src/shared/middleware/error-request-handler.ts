import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { getHttpRequestLogContext } from "../helpers/http-log-context";
import { logger } from "../libs/logger/logger";

/*
Express detecta que es un error handler por la firma de 4 parámetros — (err, req, res, next). Si le sacás el err y dejás solo 3, Express lo trata como middleware normal y nunca lo invoca para errores.
*/

export const ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const ctx = getHttpRequestLogContext(req);
  const stack = err instanceof Error ? err.stack : undefined;

  if (err instanceof AppError) {
    logger.error({
      ...ctx,
      error: err.message,
      status: err.statusCode,
      stack,
    });
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error({
    ...ctx,
    error: err instanceof Error ? err.message : String(err),
    stack,
  });
  return res.status(500).json({ error: "Internal server error" });
};
