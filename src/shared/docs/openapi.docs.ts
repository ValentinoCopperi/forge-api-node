import { envs } from "../configs/env.config";
import { openApiCommonSchemas, openApiSecuritySchemes } from "./openapi-common";
import { authOpenApiPaths, authOpenApiSchemas } from "./openapi-auth.docs";
import { healthOpenApiPaths, healthOpenApiSchemas } from "./openapi-health.docs";
import {
    organizationsOpenApiPaths,
    organizationsOpenApiSchemas,
} from "./openapi-organizations.docs";
import { notificationsOpenApiPaths } from "./openapi-notifications.docs";
import { projectsOpenApiPaths, projectsOpenApiSchemas } from "./openapi-projects.docs";
import { tasksOpenApiPaths, tasksOpenApiSchemas } from "./openapi-tasks.docs";

/**
 * Documento OpenAPI 3.0 unificado para los módulos montados en `index.ts`
 * bajo `/api/v1` (health, auth, organizations, projects, tasks, notifications).
 */
export function buildOpenApiDocument() {
    const baseUrl = `http://localhost:${envs.APP_PORT}/api/v1`;

    return {
        openapi: "3.0.3",
        info: {
            title: "Maproute API",
            version: "1.0.0",
            description:
                "API REST bajo `/api/v1`. La mayoría de rutas requieren `Authorization: Bearer <accessToken>`. " +
                "Excepciones: `GET /health`, `POST /auth/create`, `POST /auth/signin`, `POST /auth/refresh`.",
        },
        servers: [{ url: baseUrl }],
        tags: [
            { name: "Health" },
            { name: "Auth" },
            { name: "Organizations" },
            { name: "Projects" },
            { name: "Tasks" },
            { name: "Notifications" },
        ],
        components: {
            securitySchemes: openApiSecuritySchemes,
            schemas: {
                ...openApiCommonSchemas,
                ...healthOpenApiSchemas,
                ...authOpenApiSchemas,
                ...organizationsOpenApiSchemas,
                ...projectsOpenApiSchemas,
                ...tasksOpenApiSchemas,
            },
        },
        security: [{ bearerAuth: [] }],
        paths: {
            ...healthOpenApiPaths,
            ...authOpenApiPaths,
            ...organizationsOpenApiPaths,
            ...projectsOpenApiPaths,
            ...tasksOpenApiPaths,
            ...notificationsOpenApiPaths,
        },
    } as const;
}

/** @deprecated Usar `buildOpenApiDocument`. Mantenido por compatibilidad. */
export function buildOrganizationsOpenApiDocument() {
    return buildOpenApiDocument();
}
