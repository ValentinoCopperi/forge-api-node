import { Router } from "express";
import { DefaultEventsMap, Server } from "socket.io";
import { AppError } from "../../shared/errors/AppError";


type IoServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

export class NotificationsRoutes {


    private router: Router;
    private io: IoServer;


    constructor(
        io_: IoServer
    ) {
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

            if (!socketId) throw new AppError('SocketId is required', 500 );


            this.io.to(socketId).emit('notification', {
                message: `Hello user ${socketId}!`
            })

            res.status(200).json({ message: 'Notificación enviada' })

        })

    }

    getRouter() { return this.router }


}
