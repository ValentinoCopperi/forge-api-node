import { envs } from "../configs/env.config";


/**
 * OpenAPI 3.0 — rutas HTTP expuestas bajo `/api/v1/organizations`
 * alineadas con `OrganizationRoutes` + `OrganizationController`.
 */
export function buildOrganizationsOpenApiDocument() {

    const baseUrl = `http://localhost:${envs.APP_PORT}/api/v1`;

    return {
        openapi: "3.0.3",
        info: {
            title: "Organizations API",
            version: "1.0.0",
            description:
                "Rutas de organizaciones (`OrganizationController`). " +
                "POST `/organizations` además exige rol de aplicación DIRECTOR o GERENTE (`roleMiddleware`). " +
                "POST `/organizations/{organizationId}/users` exige membresía y permiso `add-user` en la org.",
        },
        servers: [
            { url: baseUrl },
        ],
        tags: [
            { name: "Organizations" },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                CreateOrganizationBody: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: { type: "string", minLength: 3 },
                        description: { type: "string" },
                    },
                },
                CreateOrganizationResponse: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        name: { type: "string" },
                        description: { type: "string", nullable: true },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                OrganizationsListResponseItem: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        name: { type: "string" },
                        description: { type: "string", nullable: true },
                        updatedAt: { type: "string", format: "date-time" },
                        _count: {
                            type: "object",
                            properties: {
                                organizationUsers: { type: "integer" },
                                projects: { type: "integer" },
                            },
                        },
                    },
                },
                AddUserToOrganizationBody: {
                    type: "object",
                    required: ["userId", "role"],
                    description:
                        "Tras los middlewares, `organizationId` se completa desde `{organizationId}` de la URL. " +
                        "Podés incluir también `organizationId` en JSON (debe coincidir con la ruta).",
                    properties: {
                        organizationId: { type: "integer" },
                        userId: { type: "integer" },
                        role: {
                            type: "string",
                            enum: ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
                        },
                    },
                },
                FieldErrors: {
                    type: "object",
                    additionalProperties: {
                        type: "array",
                        items: { type: "string" },
                    },
                },
                ValidationErrorResponse: {
                    type: "object",
                    properties: {
                        errors: { $ref: "#/components/schemas/FieldErrors" },
                    },
                },
                AppErrorBody: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
        paths: {
            "/organizations": {
                get: {
                    tags: ["Organizations"],
                    summary: "Listar organizaciones",
                    operationId: "organizations_findAll",
                    responses: {
                        "200": {
                            description: "Lista de organizaciones.",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            data: {
                                                type: "array",
                                                items: {
                                                    $ref: "#/components/schemas/OrganizationsListResponseItem",
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        "401": {
                            description: "No autenticado",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/AppErrorBody" },
                                },
                            },
                        },
                    },
                },
                post: {
                    tags: ["Organizations"],
                    summary: "Crear organización",
                    description: "Requiere JWT y rol global DIRECTOR o GERENTE.",
                    operationId: "organizations_create",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/CreateOrganizationBody",
                                },
                            },
                        },
                    },
                    responses: {
                        "200": {
                            description: "Organización creada",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            data: {
                                                $ref: "#/components/schemas/CreateOrganizationResponse",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "Body inválido (Zod)",
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/ValidationErrorResponse",
                                    },
                                },
                            },
                        },
                        "401": {
                            description: "No autenticado",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/AppErrorBody" },
                                },
                            },
                        },
                        "403": {
                            description: "Sin rol DIRECTOR ni GERENTE",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/AppErrorBody" },
                                },
                            },
                        },
                    },
                },
            },
            "/organizations/{id}": {
                get: {
                    tags: ["Organizations"],
                    summary: "Obtener una organización por id",
                    operationId: "organizations_findOne",
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "integer" },
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Detalle con proyectos y usuarios enlazados (payload Prisma seleccionado en el repo).",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            data: {
                                                type: "object",
                                                description: "Ver `organizationFindOneSelect` en código.",
                                                additionalProperties: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "id inválido",
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/ValidationErrorResponse",
                                    },
                                },
                            },
                        },
                        "401": {
                            description: "No autenticado",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/AppErrorBody" },
                                },
                            },
                        },
                        "404": {
                            description: "Organización no existe",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/AppErrorBody" },
                                },
                            },
                        },
                    },
                },
            },
            "/organizations/{organizationId}/users": {
                post: {
                    tags: ["Organizations"],
                    summary: "Agregar usuario a la organización",
                    operationId: "organizations_addUser",
                    parameters: [
                        {
                            name: "organizationId",
                            in: "path",
                            required: true,
                            schema: { type: "integer" },
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/AddUserToOrganizationBody",
                                },
                            },
                        },
                    },
                    responses: {
                        "204": {
                            description: "Usuario agregado (sin body)",
                        },
                        "400": {
                            description: "Body inválido o organizationId de path mal formado",
                            content: {
                                "application/json": {
                                    schema: {
                                        oneOf: [
                                            { $ref: "#/components/schemas/ValidationErrorResponse" },
                                            { $ref: "#/components/schemas/AppErrorBody" },
                                        ],
                                    },
                                },
                            },
                        },
                        "401": {
                            description: "No autenticado",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/AppErrorBody" },
                                },
                            },
                        },
                        "403": {
                            description: "Sin membrecía en la org o sin permiso add-user para el rol organizacional",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/AppErrorBody" },
                                },
                            },
                        },
                        "404": {
                            description: "Organización no existe (AppError desde el servicio en otros flujos)",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/AppErrorBody" },
                                },
                            },
                        },
                        "409": {
                            description: "El usuario ya pertenece a la organización",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/AppErrorBody" },
                                },
                            },
                        },
                    },
                },
            },
        },
    } as const;
}
