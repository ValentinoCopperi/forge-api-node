import {
    errorResponse,
    jsonContent,
    ref,
    unauthorizedResponse,
    validationErrorResponse,
} from "./openapi-common";

export const authOpenApiSchemas = {
    RegisterBody: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
            name: { type: "string", minLength: 1 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
        },
    },
    LoginBody: {
        type: "object",
        required: ["email", "password"],
        properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
        },
    },
    RefreshTokenBody: {
        type: "object",
        required: ["refresh_token"],
        properties: {
            refresh_token: { type: "string" },
        },
    },
    AuthTokensResponse: {
        type: "object",
        properties: {
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
        },
    },
    AccessTokenResponse: {
        type: "object",
        properties: {
            accessToken: { type: "string" },
        },
    },
    UserWithRole: {
        type: "object",
        properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string" },
            avatarUrl: { type: "string", nullable: true },
            userRoles: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        role: {
                            type: "string",
                            enum: ["DIRECTOR", "GERENTE", "EMPLEADO"],
                        },
                    },
                },
            },
        },
    },
};

export const authOpenApiPaths = {
    "/auth/create": {
        post: {
            tags: ["Auth"],
            summary: "Registrar usuario",
            operationId: "auth_register",
            security: [],
            requestBody: {
                required: true,
                content: jsonContent(ref("RegisterBody")),
            },
            responses: {
                "200": {
                    description: "Usuario creado",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    data: ref("UserWithRole"),
                                },
                            },
                        },
                    },
                },
                "400": validationErrorResponse("Body inválido (Zod)"),
                "409": errorResponse("El email ya está registrado"),
            },
        },
    },
    "/auth/signin": {
        post: {
            tags: ["Auth"],
            summary: "Iniciar sesión",
            operationId: "auth_login",
            security: [],
            requestBody: {
                required: true,
                content: jsonContent(ref("LoginBody")),
            },
            responses: {
                "200": {
                    description: "Tokens JWT",
                    content: jsonContent(ref("AuthTokensResponse")),
                },
                "400": validationErrorResponse("Body inválido (Zod)"),
                "401": errorResponse("Usuario no encontrado o credenciales inválidas"),
            },
        },
    },
    "/auth/refresh": {
        post: {
            tags: ["Auth"],
            summary: "Renovar access token",
            operationId: "auth_refresh",
            security: [],
            requestBody: {
                required: true,
                content: jsonContent(ref("RefreshTokenBody")),
            },
            responses: {
                "200": {
                    description: "Nuevo access token",
                    content: jsonContent(ref("AccessTokenResponse")),
                },
                "409": errorResponse("refresh_token no enviado"),
            },
        },
    },
    "/auth/me": {
        get: {
            tags: ["Auth"],
            summary: "Obtener usuario autenticado",
            description: "Requiere JWT. Devuelve el perfil del usuario asociado al token.",
            operationId: "auth_getUser",
            responses: {
                "200": {
                    description: "Usuario actual",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    data: ref("UserWithRole"),
                                },
                            },
                        },
                    },
                },
                "401": unauthorizedResponse,
                "404": errorResponse("Usuario no encontrado"),
            },
        },
    },
    "/auth/uploadAvatar": {
        post: {
            tags: ["Auth"],
            summary: "Subir avatar",
            description: "Requiere JWT. Campo multipart `avatar`.",
            operationId: "auth_uploadAvatar",
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            required: ["avatar"],
                            properties: {
                                avatar: { type: "string", format: "binary" },
                            },
                        },
                    },
                },
            },
            responses: {
                "200": {
                    description: "Usuario actualizado con nueva URL de avatar",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    data: ref("UserWithRole"),
                                },
                            },
                        },
                    },
                },
                "400": {
                    description: "Archivo no enviado",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: { type: "string" },
                                },
                            },
                        },
                    },
                },
                "401": unauthorizedResponse,
                "404": errorResponse("Usuario no encontrado"),
            },
        },
    },
};
