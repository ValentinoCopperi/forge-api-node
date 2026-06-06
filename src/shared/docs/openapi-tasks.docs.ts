import {
    errorResponse,
    jsonContent,
    ref,
    unauthorizedResponse,
    validationErrorResponse,
} from "./openapi-common";

const taskUserSummary = {
    type: "object",
    properties: {
        id: { type: "integer" },
        name: { type: "string" },
        email: { type: "string" },
        avatarUrl: { type: "string", nullable: true },
    },
};

const taskStatusEnum = ["PENDING", "IN_PROGRESS", "DONE"];
const taskPriorityEnum = ["LOW", "MEDIUM", "HIGH"];
const taskCategoryEnum = ["DESARROLLO", "DISENO", "TESTING", "DOCUMENTACION", "OTRO"];

export const tasksOpenApiSchemas = {
    TaskUserSummary: taskUserSummary,
    TaskProjectSummary: {
        type: "object",
        properties: {
            id: { type: "integer" },
            name: { type: "string" },
        },
    },
    TaskCommentItem: {
        type: "object",
        properties: {
            id: { type: "integer" },
            content: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            user: taskUserSummary,
        },
    },
    TaskWithProject: {
        type: "object",
        properties: {
            id: { type: "integer" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            status: { type: "string", enum: taskStatusEnum },
            priority: { type: "string", enum: taskPriorityEnum },
            category: { type: "string", enum: taskCategoryEnum },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            createdByUser: ref("TaskUserSummary"),
            designatedToUser: { allOf: [ref("TaskUserSummary")], nullable: true },
            designatedByUser: { allOf: [ref("TaskUserSummary")], nullable: true },
            project: ref("TaskProjectSummary"),
            taskComments: {
                type: "array",
                items: ref("TaskCommentItem"),
            },
        },
    },
    TaskItem: {
        type: "object",
        properties: {
            id: { type: "integer" },
            title: { type: "string" },
        },
    },
    CreateTaskBody: {
        type: "object",
        required: ["title", "projectId"],
        properties: {
            title: { type: "string", minLength: 3 },
            description: { type: "string" },
            status: { type: "string", enum: taskStatusEnum },
            priority: { type: "string", enum: taskPriorityEnum },
            category: { type: "string", enum: taskCategoryEnum },
            designatedTo: { type: "integer" },
            designatedBy: { type: "integer" },
            projectId: { type: "integer" },
            deadline: { type: "string", format: "date-time" },
        },
    },
    AddTaskCommentBody: {
        type: "object",
        required: ["content"],
        properties: {
            content: { type: "string", minLength: 3 },
        },
    },
    TasksOffsetPaginatedResponse: {
        type: "object",
        properties: {
            data: {
                type: "array",
                items: ref("TaskItem"),
            },
            pagination: {
                type: "object",
                properties: {
                    totalPages: { type: "integer" },
                    currentPage: { type: "integer" },
                    totalItems: { type: "integer" },
                },
            },
        },
    },
    TasksCursorPaginatedResponse: {
        type: "object",
        properties: {
            data: {
                type: "array",
                items: ref("TaskItem"),
            },
            nextCursor: { type: "integer", nullable: true },
        },
    },
};

const taskWithProjectDataResponse = {
    "200": {
        description: "Tarea con relaciones",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        data: ref("TaskWithProject"),
                    },
                },
            },
        },
    },
    "401": unauthorizedResponse,
};

const taskWithProjectListResponse = {
    "200": {
        description: "Lista de tareas del proyecto",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        data: {
                            type: "array",
                            items: ref("TaskWithProject"),
                        },
                    },
                },
            },
        },
    },
    "401": unauthorizedResponse,
};

const taskFilterQueryParameters = [
    {
        name: "category",
        in: "query",
        schema: {
            type: "string",
            enum: taskCategoryEnum,
        },
    },
    {
        name: "priority",
        in: "query",
        schema: {
            type: "string",
            enum: taskPriorityEnum,
        },
    },
    {
        name: "status",
        in: "query",
        schema: {
            type: "string",
            enum: taskStatusEnum,
        },
    },
    { name: "title", in: "query", schema: { type: "string" } },
    { name: "createdByUser", in: "query", schema: { type: "integer" } },
    { name: "designatedByUser", in: "query", schema: { type: "integer" } },
    { name: "designatedTo", in: "query", schema: { type: "integer" } },
    {
        name: "deadline",
        in: "query",
        schema: { type: "string", format: "date-time" },
    },
];

export const tasksOpenApiPaths = {
    "/tasks/project/{projectId}": {
        get: {
            tags: ["Tasks"],
            summary: "Listar tareas por proyecto",
            description: "Filtros opcionales vía query string (todos opcionales).",
            operationId: "tasks_findAllByProjectId",
            parameters: [
                {
                    name: "projectId",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
                ...taskFilterQueryParameters,
            ],
            responses: {
                ...taskWithProjectListResponse,
                "400": errorResponse("projectId o filtros inválidos"),
            },
        },
    },
    "/tasks/{projectId}": {
        post: {
            tags: ["Tasks"],
            summary: "Crear tarea en un proyecto",
            description:
                "Requiere JWT. El `projectId` del body debe coincidir con el de la URL.",
            operationId: "tasks_create",
            parameters: [
                {
                    name: "projectId",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            requestBody: {
                required: true,
                content: jsonContent(ref("CreateTaskBody")),
            },
            responses: {
                "201": {
                    description: "Tarea creada",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    data: ref("TaskWithProject"),
                                },
                            },
                        },
                    },
                },
                "400": validationErrorResponse("Body inválido (Zod)"),
                "401": unauthorizedResponse,
            },
        },
    },
    "/tasks/{id}": {
        get: {
            tags: ["Tasks"],
            summary: "Obtener tarea por id",
            operationId: "tasks_findById",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                ...taskWithProjectDataResponse,
                "400": errorResponse("id inválido o ausente"),
                "404": errorResponse("Tarea no encontrada"),
            },
        },
    },
    "/tasks/{projectId}/comments": {
        post: {
            tags: ["Tasks"],
            summary: "Agregar comentario a una tarea",
            description: "Requiere JWT. Ruta definida como `POST /tasks/:projectId/comments` en el router.",
            operationId: "tasks_addTaskComment",
            parameters: [
                {
                    name: "projectId",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            requestBody: {
                required: true,
                content: jsonContent(ref("AddTaskCommentBody")),
            },
            responses: {
                "201": {
                    description: "Comentario creado; devuelve la tarea actualizada",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    data: ref("TaskWithProject"),
                                },
                            },
                        },
                    },
                },
                "400": validationErrorResponse("Body o projectId inválido"),
                "401": unauthorizedResponse,
            },
        },
    },
    "/tasks/cursorPaginated": {
        get: {
            tags: ["Tasks"],
            summary: "Tareas con paginación por cursor",
            operationId: "tasks_findAllCursorPaginated",
            parameters: [
                {
                    name: "cursor",
                    in: "query",
                    schema: { type: "integer", default: 0 },
                    description: "ID del último ítem de la página anterior.",
                },
                {
                    name: "limit",
                    in: "query",
                    schema: { type: "integer", default: 10 },
                },
            ],
            responses: {
                "200": {
                    description: "Página de tareas y cursor siguiente",
                    content: jsonContent(ref("TasksCursorPaginatedResponse")),
                },
                "401": unauthorizedResponse,
            },
        },
    },
    "/tasks/offsetPaginated": {
        get: {
            tags: ["Tasks"],
            summary: "Tareas con paginación por offset",
            operationId: "tasks_findAllOffsetPaginated",
            parameters: [
                {
                    name: "page",
                    in: "query",
                    schema: { type: "integer", default: 1 },
                },
                {
                    name: "limit",
                    in: "query",
                    schema: { type: "integer", default: 20 },
                },
            ],
            responses: {
                "200": {
                    description: "Página de tareas y metadatos de paginación",
                    content: jsonContent(ref("TasksOffsetPaginatedResponse")),
                },
                "401": unauthorizedResponse,
            },
        },
    },
    "/tasks/fast": {
        get: {
            tags: ["Tasks"],
            summary: "Endpoint liviano de prueba",
            operationId: "tasks_fast",
            responses: {
                "200": {
                    description: "Pong inmediato",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: { type: "string", example: "pong" },
                                    timestamp: { type: "integer" },
                                },
                            },
                        },
                    },
                },
                "401": unauthorizedResponse,
            },
        },
    },
    "/tasks/block/{ms_to_block}": {
        get: {
            tags: ["Tasks"],
            summary: "Bloquear el hilo durante N milisegundos",
            operationId: "tasks_block",
            parameters: [
                {
                    name: "ms_to_block",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                "200": {
                    description: "Bloqueo finalizado",
                    content: jsonContent(ref("MessageResponse")),
                },
                "400": {
                    description: "Parámetro ausente",
                    content: jsonContent(ref("AppErrorBody")),
                },
                "401": unauthorizedResponse,
            },
        },
    },
    "/tasks/async": {
        get: {
            tags: ["Tasks"],
            summary: "Respuesta diferida (~5 s)",
            operationId: "tasks_async",
            responses: {
                "200": {
                    description: "Respuesta tras timeout interno",
                    content: jsonContent(ref("MessageResponse")),
                },
                "401": unauthorizedResponse,
            },
        },
    },
};
