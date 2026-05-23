import {
    errorResponse,
    jsonContent,
    ref,
    unauthorizedResponse,
    validationErrorResponse,
} from "./openapi-common";

/**
 * OpenAPI — rutas bajo `/api/v1/organizations`
 * (`OrganizationRoutes` + `OrganizationController`).
 */
export const organizationsOpenApiSchemas = {
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
    RemoveUserFromOrganizationBody: {
        type: "object",
        required: ["userId"],
        description:
            "`organizationId` se completa desde `{organizationId}` de la URL vía middleware.",
        properties: {
            organizationId: { type: "integer" },
            userId: { type: "integer" },
        },
    },
};

const organizationUsersPath = "/organizations/{organizationId}/users";

const organizationUserParameters = [
    {
        name: "organizationId",
        in: "path",
        required: true,
        schema: { type: "integer" },
    },
];

export const organizationsOpenApiPaths = {
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
                                        items: ref("OrganizationsListResponseItem"),
                                    },
                                },
                            },
                        },
                    },
                },
                "401": unauthorizedResponse,
            },
        },
        post: {
            tags: ["Organizations"],
            summary: "Crear organización",
            description: "Requiere JWT y rol global DIRECTOR o GERENTE.",
            operationId: "organizations_create",
            requestBody: {
                required: true,
                content: jsonContent(ref("CreateOrganizationBody")),
            },
            responses: {
                "200": {
                    description: "Organización creada",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    data: ref("CreateOrganizationResponse"),
                                },
                            },
                        },
                    },
                },
                "400": validationErrorResponse("Body inválido (Zod)"),
                "401": unauthorizedResponse,
                "403": errorResponse("Sin rol DIRECTOR ni GERENTE"),
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
                    description:
                        "Detalle con proyectos y usuarios enlazados (payload Prisma seleccionado en el repo).",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    data: {
                                        type: "object",
                                        description:
                                            "Ver `organizationFindOneSelect` en código.",
                                        additionalProperties: true,
                                    },
                                },
                            },
                        },
                    },
                },
                "400": validationErrorResponse("id inválido"),
                "401": unauthorizedResponse,
                "404": errorResponse("Organización no existe"),
            },
        },
    },
    [organizationUsersPath]: {
        post: {
            tags: ["Organizations"],
            summary: "Agregar usuario a la organización",
            operationId: "organizations_addUser",
            parameters: organizationUserParameters,
            requestBody: {
                required: true,
                content: jsonContent(ref("AddUserToOrganizationBody")),
            },
            responses: {
                "204": { description: "Usuario agregado (sin body)" },
                "400": {
                    description: "Body inválido o organizationId de path mal formado",
                    content: {
                        "application/json": {
                            schema: {
                                oneOf: [
                                    ref("ValidationErrorResponse"),
                                    ref("AppErrorBody"),
                                ],
                            },
                        },
                    },
                },
                "401": unauthorizedResponse,
                "403": errorResponse(
                    "Sin membresía en la org o sin permiso add-user para el rol organizacional",
                ),
                "404": errorResponse("Organización no existe"),
                "409": errorResponse("El usuario ya pertenece a la organización"),
            },
        },
        delete: {
            tags: ["Organizations"],
            summary: "Quitar usuario de la organización",
            description: "Requiere permiso `remove-user` en la organización.",
            operationId: "organizations_removeUser",
            parameters: organizationUserParameters,
            requestBody: {
                required: true,
                content: jsonContent(ref("RemoveUserFromOrganizationBody")),
            },
            responses: {
                "204": { description: "Usuario removido (sin body)" },
                "400": {
                    description: "Body inválido o organizationId de path mal formado",
                    content: {
                        "application/json": {
                            schema: {
                                oneOf: [
                                    ref("ValidationErrorResponse"),
                                    ref("AppErrorBody"),
                                ],
                            },
                        },
                    },
                },
                "401": unauthorizedResponse,
                "403": errorResponse(
                    "Sin membresía en la org o sin permiso remove-user",
                ),
                "404": errorResponse("Organización o membresía no encontrada"),
            },
        },
    },
};
