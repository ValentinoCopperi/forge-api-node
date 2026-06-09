import { Router } from "express";
import { DefaultEventsMap, Server } from "socket.io";
import { z } from "zod";
import { AppError } from "../../shared/errors/AppError";

type IoServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

const sendNotificationDto = z.object({
    message: z.string().min(1),
});

export class NotificationsRoutes {

    private router: Router;
    private io: IoServer;

    constructor(io_: IoServer) {
        this.router = Router();
        this.io = io_
        this.initRoutes();
    }

    initRoutes() {

        this.io.on('connection', (socket) => {
            console.log('Cliente conectado:', socket.id)

            socket.on('disconnect', () => {
                console.log('Cliente desconectado:', socket.id)
            })
        })

        this.router.post(`/:socketId`, (req, res) => {
            const { socketId } = req.params;

            if (!socketId) throw new AppError('SocketId is required', 500);

            const parsed = sendNotificationDto.safeParse(req.body ?? {});

            if (!parsed.success) {
                return res.status(400).json({
                    errors: parsed.error.flatten().fieldErrors,
                });
            }

            this.io.to(socketId).emit('notification', {
                message: parsed.data.message,
            })

            res.status(200).json({ message: 'Notificación enviada' })
        })
    }

    getRouter() { return this.router }
}
