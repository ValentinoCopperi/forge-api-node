import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types';
import { Role } from '@prisma/client';
import multer from 'multer'
import { getRedisClient } from '../../shared/libs/redis/redis.connection';
import { envs } from '../../shared/configs/env.config';
import { AppError } from '../../shared/errors/AppError';




export const tokenMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1]

    if (!token) throw new AppError("Unauthorized - Token not found", 401);


    try {
        const payload = jwt.verify(token, envs.JWT_SECRET) as never as JwtPayload
        req.user = payload
        next()
    } catch {
        throw new AppError("Unauthorized - Invalid token", 401);
    }

}

export const roleMiddleware = (roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {


        if (!req.user) throw new AppError("Unauthorized - User not found", 401);

        const roles_request = req.user.roles;

        const hasRole = roles.some(r => roles_request.includes(r))

        if (!hasRole) throw new AppError(`Forbidden. ${roles.map(r => r + " ")} are the only ones allowed`, 403);

        next();

    }
}

const MAX_IP_REQUEST = envs.MAX_IP_REQUEST;

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    const redisClient = getRedisClient();

    const ip = req.ip;


    const ip_requests_count = await redisClient.get(`requests_${ip}`);

    if (ip_requests_count) {

        const parsed_ip_count = parseInt(ip_requests_count);

        if (parsed_ip_count < Number(MAX_IP_REQUEST)) {


            await redisClient.incr(`requests_${ip}`)

            return next();

        } else {

            throw new AppError("Too many requests", 429);

        }

    }

    await redisClient.set(`requests_${ip}`, 1, 'EX', 20);

    next();


}


export const uploadMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
})