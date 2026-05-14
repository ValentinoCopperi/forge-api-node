import { Request, Response, NextFunction } from "express";
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
        request_id: req.request_id,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
      });
    }
  });

  next();
};
