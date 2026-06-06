import { Server } from "socket.io";
import { envs } from "../../configs/env.config";

let io: Server | null = null;

export const initSocket = (httpServer: any) => {
    io = new Server(httpServer, {
        cors: {
            origin: envs.CLIENT_URL,
            methods: ["GET", "POST"],
            credentials: true,
        }
    });
}

export const getSocket = () => {

    if( !io ) throw new Error('Socket no inicializado. Llamá initSocket primero.');

    return io;

}
