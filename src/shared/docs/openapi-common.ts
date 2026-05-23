/** Esquemas y respuestas de error compartidos entre módulos OpenAPI. */

export const openApiSecuritySchemes = {
    bearerAuth: {
        type: "http" as const,
        scheme: "bearer",
        bearerFormat: "JWT",
    },
};

export const openApiCommonSchemas = {
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
    MessageResponse: {
        type: "object",
        properties: {
            message: { type: "string" },
        },
    },
    DataWrapper: {
        type: "object",
        properties: {
            data: {},
        },
    },
};

export const ref = (schema: string) => ({ $ref: `#/components/schemas/${schema}` });

export const jsonContent = (schema: object) => ({
    "application/json": { schema },
});

export const errorResponse = (description: string) => ({
    description,
    content: jsonContent(ref("AppErrorBody")),
});

export const validationErrorResponse = (description: string) => ({
    description,
    content: jsonContent(ref("ValidationErrorResponse")),
});

export const unauthorizedResponse = errorResponse("No autenticado");
