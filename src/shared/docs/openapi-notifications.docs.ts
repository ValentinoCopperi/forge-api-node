import { jsonContent, ref, unauthorizedResponse } from "./openapi-common";

export const notificationsOpenApiPaths = {
    "/notifications/{socketId}": {
        post: {
            tags: ["Notifications"],
            summary: "Enviar notificación por Socket.IO",
            description:
                "Emite el evento `notification` al socket indicado. Requiere JWT a nivel de router.",
            operationId: "notifications_send",
            parameters: [
                {
                    name: "socketId",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                },
            ],
            responses: {
                "200": {
                    description: "Evento emitido",
                    content: jsonContent(ref("MessageResponse")),
                },
                "401": unauthorizedResponse,
                "500": {
                    description: "socketId ausente (AppError interno)",
                    content: jsonContent(ref("AppErrorBody")),
                },
            },
        },
    },
};
