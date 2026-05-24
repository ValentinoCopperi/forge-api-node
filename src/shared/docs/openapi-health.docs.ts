export const healthOpenApiPaths = {
    "/health": {
        get: {
            tags: ["Health"],
            summary: "Estado de la aplicación",
            description:
                "Comprueba conectividad con PostgreSQL y Redis. No requiere JWT (solo rate limit).",
            operationId: "health_check",
            security: [],
            responses: {
                "200": {
                    description: "Servicios operativos.",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/HealthCheckResponse" },
                        },
                    },
                },
                "500": {
                    description: "Base de datos o Redis no disponibles.",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/HealthCheckResponse" },
                        },
                    },
                },
            },
        },
    },
};

export const healthOpenApiSchemas = {
    HealthCheckResponse: {
        type: "object",
        properties: {
            status: { type: "string", enum: ["ok", "error"] },
            server: { type: "string", enum: ["ok"] },
            database: { type: "string", enum: ["ok", "error"] },
            redis: { type: "string", enum: ["ok", "error"] },
            timestamp: { type: "string", format: "date-time" },
        },
    },
};
