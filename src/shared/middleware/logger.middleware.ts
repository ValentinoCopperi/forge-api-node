import { Request, Response, NextFunction } from "express";
import { getHttpRequestLogContext } from "../helpers/http-log-context";
import { logger } from "../libs/logger/logger";

export const LoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const executeTime = new Date();

  res.on("finish", () => {
    const duration = new Date().getTime() - executeTime.getTime();

    if (res.statusCode === 200 || res.statusCode === 201) {
      logger.info({
        ...getHttpRequestLogContext(req),
        statusCode: res.statusCode,
        duration,
      });
    }
  });

  next();
};
