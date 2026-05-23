import {
    errorResponse,
    jsonContent,
    ref,
    unauthorizedResponse,
    validationErrorResponse,
} from "./openapi-common";

export const projectsOpenApiSchemas = {
    CreateProjectBody: {
        type: "object",
        required: ["name", "managerId", "organizationId"],
        properties: {
            name: { type: "string", minLength: 3 },
            description: { type: "string" },
            managerId: { type: "integer" },
            organizationId: { type: "integer" },
        },
    },
    ProjectCreateResponse: {
        type: "object",
        properties: {
            id: { type: "integer" },
            name: { type: "string" },
            description: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            deletedAt: { type: "string", format: "date-time", nullable: true },
            status: {
                type: "string",
                enum: [
                    "ACTIVE",
                    "INACTIVE",
                    "ARCHIVED",
                    "DELETED",
                    "PAUSED",
                    "CANCELLED",
                    "COMPLETED",
                ],
            },
            manager: { $ref: "#/components/schemas/ProjectUserSummary" },
            createdByUser: { $ref: "#/components/schemas/ProjectUserSummary" },
        },
    },
    ProjectUserSummary: {
        type: "object",
        properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string" },
            avatarUrl: { type: "string", nullable: true },
        },
    },
};

export const projectsOpenApiPaths = {
    "/projects": {
        post: {
            tags: ["Projects"],
            summary: "Crear proyecto",
            description:
                "Requiere JWT. El body incluye `organizationId`; el middleware valida permiso `add-project` en esa organización.",
            operationId: "projects_create",
            requestBody: {
                required: true,
                content: jsonContent(ref("CreateProjectBody")),
            },
            responses: {
                "201": {
                    description: "Proyecto creado y vinculado a la organización",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    data: ref("ProjectCreateResponse"),
                                },
                            },
                        },
                    },
                },
                "400": validationErrorResponse("Body inválido (Zod)"),
                "401": unauthorizedResponse,
                "403": errorResponse("Sin permiso add-project en la organización"),
            },
        },
    },
};
