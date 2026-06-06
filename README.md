# Maproute API

API REST de gestión de organizaciones, proyectos y tareas construida con **Node.js + TypeScript + Express 5**. Incluye autenticación JWT, notificaciones en tiempo real via Socket.io, subida de archivos a MinIO (S3-compatible) y scheduler de tareas con node-cron.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express 5 |
| ORM | Prisma 5 + PostgreSQL 15 |
| Caché | Redis 7 + ioredis |
| Storage | MinIO (S3-compatible, AWS SDK v3) |
| Auth | JWT (access token + refresh token) + bcrypt |
| Real-time | Socket.io 4 |
| Validación | Zod |
| Logging | Pino + pino-pretty |
| Scheduler | node-cron |
| Docs | Swagger UI (`/docs`) |
| Testing | Vitest |
| Linting | ESLint + typescript-eslint |

## Requisitos

- Node.js >= 18
- Docker + Docker Compose

## Instalación y arranque

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno y completarlas
cp .env.example .env

# 3. Levantar servicios (PostgreSQL, Redis, MinIO, pgAdmin)
docker compose -f docker-compose.dev.yml up -d

# 4. Ejecutar migraciones de base de datos
npx prisma migrate deploy

# 5. Seed inicial (opcional)
npm run prisma-seed

# 6. Iniciar en modo desarrollo
npm run dev
```

El servidor queda disponible en `http://localhost:<APP_PORT>`.

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor con hot-reload vía nodemon + ts-node |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Corre la versión compilada de `dist/index.js` |
| `npm run lint` | Ejecuta ESLint sobre `src/**/*.ts` |
| `npm run prisma-seed` | Carga datos iniciales en la base de datos |
| `npm test` | Corre los tests con Vitest |

## Variables de entorno

Copiá `.env.example` a `.env` y completá los valores. Las variables se validan al arrancar con Zod en `src/shared/configs/env.config.ts`; si falta alguna el proceso termina con error.

```env
# Aplicación
APP_PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/maproute
JWT_SECRET=cambia_esto_en_produccion
JWT_REFRESH_SECRET=cambia_esto_tambien

# PostgreSQL (desarrollo)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=maproute
POSTGRES_PORT=5432

# PostgreSQL (tests)
POSTGRES_USER_TEST=postgres_test
POSTGRES_PASSWORD_TEST=postgres_test
POSTGRES_DB_TEST=maproute_test
POSTGRES_PORT_TEST=5433

# pgAdmin
PG_ADMIN_PORT=5050
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin

# MinIO (storage S3-compatible)
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

# S3
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=maproute
S3_REGION=us-east-1

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Rate limiting (requests por IP en rutas de auth/health)
MAX_IP_REQUEST=5
```

No subas `.env` al repositorio.

## Servicios Docker

El `docker-compose.dev.yml` levanta:

| Servicio | Puerto(s) | Descripción |
|---|---|---|
| PostgreSQL 15 (prod) | `POSTGRES_PORT` → 5432 | Base de datos principal |
| PostgreSQL 15 (test) | `POSTGRES_PORT_TEST` → 5432 | Base de datos aislada para tests |
| pgAdmin 4 | `PG_ADMIN_PORT` → 80 | GUI para administrar PostgreSQL |
| MinIO | `MINIO_PORT` (API) · `MINIO_CONSOLE_PORT` (Web) | Storage para avatares de usuario |
| Redis 7 | `REDIS_PORT` → 6379 | Caché y adapter de Socket.io |

## Endpoints de la API

Base URL: `http://localhost:<APP_PORT>/api/v1`

> **[Auth]** = requiere header `Authorization: Bearer <accessToken>`.
> **[RL]** = sujeto a rate limiting por IP (máx. `MAX_IP_REQUEST` requests).

### Health

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | **[RL]** Estado del servidor, PostgreSQL y Redis |

### Auth

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| POST | `/auth/create` | `{ name, email, password }` | **[RL]** Registra un nuevo usuario |
| POST | `/auth/signin` | `{ email, password }` | **[RL]** Inicia sesión; devuelve `accessToken` y `refreshToken` |
| POST | `/auth/refresh` | `{ refresh_token }` | **[RL]** Renueva el `accessToken` |
| POST | `/auth/uploadAvatar` | `multipart/form-data: avatar` | **[Auth][RL]** Sube avatar; guarda en MinIO |

Validaciones: `name` mín. 1 char · `email` válido · `password` mín. 6 chars.

### Organizations

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/organizations` | **[Auth]** Lista todas las organizaciones |
| GET | `/organizations/:id` | **[Auth]** Obtiene una organización por ID |
| POST | `/organizations` | **[Auth]** Crea una organización (rol de app: `DIRECTOR` o `GERENTE`) |
| POST | `/organizations/:orgId/users` | **[Auth]** Agrega un usuario a la org (permiso `add-user`) |
| DELETE | `/organizations/:orgId/users` | **[Auth]** Elimina un usuario de la org (permiso `remove-user`) |

Body `POST /:orgId/users`: `{ organizationId, userId, role: OrganizationUserRole }`  
Body `DELETE /:orgId/users`: `{ organizationId, userId }`

### Projects

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/organizations/:orgId/projects` | **[Auth]** Crea un proyecto en la organización (permiso `add-project`) |

Body: `{ name (mín. 3), description?, managerId, organizationId }`

### Tasks

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/tasks/:projectId` | **[Auth]** Crea una tarea en un proyecto |
| GET | `/tasks/:id` | **[Auth]** Obtiene una tarea por ID |
| GET | `/tasks/project/:projectId` | **[Auth]** Lista tareas de un proyecto con filtros opcionales |
| POST | `/tasks/:taskId/comments` | **[Auth]** Agrega un comentario (`{ content (mín. 3) }`) |
| GET | `/tasks/cursorPaginated` | **[Auth]** Paginación por cursor (`?cursor=0&limit=10`) |
| GET | `/tasks/offsetPaginated` | **[Auth]** Paginación por offset (`?page=1&limit=20`) |
| GET | `/tasks/fast` | **[Auth]** Ping de prueba (respuesta inmediata) |
| GET | `/tasks/block/:ms` | **[Auth]** Bloquea el event loop N ms (benchmark síncrono) |
| GET | `/tasks/async` | **[Auth]** Espera 5 segundos de forma asíncrona (benchmark async) |

**Body `POST /tasks/:projectId`:**

```json
{
  "title": "Implementar login",
  "projectId": 1,
  "description": "Opcional",
  "status": "PENDING",
  "priority": "HIGH",
  "category": "DESARROLLO",
  "designatedTo": 2,
  "designatedBy": 1,
  "deadline": "2026-06-01T00:00:00.000Z"
}
```

**Filtros query en `GET /tasks/project/:projectId`:**

`category` · `priority` · `status` · `title` · `designatedTo` · `createdByUser` · `designatedByUser` · `deadline`

### Notifications

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/notifications/:socketId` | **[Auth]** Envía una notificación a un socket específico (body: `{ message }`) |

El cliente puede conectarse vía **Socket.io** directamente al servidor para recibir el evento `notification` en tiempo real. El `socketId` se obtiene al conectar.

## Enums del modelo

| Enum | Valores |
|---|---|
| `Role` (rol de aplicación) | `DIRECTOR` · `GERENTE` · `EMPLEADO` |
| `OrganizationUserRole` | `OWNER` · `ADMIN` · `MEMBER` · `VIEWER` |
| `TaskStatus` | `PENDING` · `IN_PROGRESS` · `DONE` · `OVERDUE` |
| `TaskPriority` | `LOW` · `MEDIUM` · `HIGH` |
| `TaskCategory` | `DESARROLLO` · `DISENO` · `TESTING` · `DOCUMENTACION` · `OTRO` |
| `ProjectStatus` | `ACTIVE` · `INACTIVE` · `ARCHIVED` · `DELETED` · `PAUSED` · `CANCELLED` · `COMPLETED` |

## Herramientas de desarrollo

- **Swagger UI:** `http://localhost:<APP_PORT>/docs`
- **OpenAPI JSON:** `http://localhost:<APP_PORT>/docs/openapi.json`
- **Test client HTML:** `http://localhost:<APP_PORT>/client` — interfaz visual para probar todos los endpoints, con gestión automática de tokens y listener de Socket.io en tiempo real.

## Arquitectura

Patrón modular con capas: Controller → Service → Repository (Prisma).

```
src/
├── auth/              # Registro, login, refresh, upload de avatar
├── organizations/     # CRUD de organizaciones y membresías
├── projects/          # CRUD de proyectos
├── tasks/             # CRUD de tareas, comentarios, paginación y cron
├── notifications/     # Endpoint REST + Socket.io
├── health/            # Health check
└── shared/
    ├── configs/       # Validación de env vars con Zod
    ├── docs/          # Generación del documento OpenAPI
    ├── libs/          # Clientes de Prisma, Redis y Socket.io
    └── middleware/    # Auth, rate limit, logger, request-id, error handler
```

La autorización dentro de una organización usa `ORGANIZATION_ROLES_DEFINITIONS` y el middleware de factoría `createRequireOrganizationPermission`.

## Modelo de datos (resumen)

```
User ──< UserRole
User ──< Session
User ──< OrganizationUser >── Organization ──< Project ──< Task ──< TaskComment
```

Detalle completo en `prisma/schema.prisma`.

**Soft delete:** `Organization`, `Project`, `Task` y `TaskComment` tienen un campo `deletedAt`; las queries de negocio filtran `deletedAt: null` para excluirlos sin borrarlos físicamente.

## Scheduler (node-cron)

Un job de `node-cron` se ejecuta periódicamente para marcar como `OVERDUE` las tareas cuyo `deadline` ya pasó y cuyo estado no sea `DONE`. Esto mantiene el campo `status` sincronizado sin intervención manual.

## Autenticación y seguridad

- **JWT** con dos tokens: `accessToken` (vida corta) y `refreshToken` (vida larga).
- **bcrypt** para el hash de contraseñas.
- `tokenMiddleware` valida el JWT en cada ruta protegida.
- `rateLimitMiddleware` (Redis) limita requests por IP en `/auth` y `/health`.
- `RequestIdMiddleware` agrega un ID único a cada request para trazabilidad en logs.
- `LoggerMiddleware` (Pino) loguea cada request con método, ruta, status y duración.
- `ErrorRequestHandler` al final del pipeline captura cualquier `AppError` y devuelve el `statusCode` correcto.

## Testing

```bash
# Tests unitarios / integración
npm test

# Aplicar migraciones sobre la DB de test y luego correr tests
npm run test:migrate && npm test
```

Los tests usan la base de datos `postgres-test` definida en `.env.test`, aislada de los datos de desarrollo.

## Docker (producción)

El archivo `docker-compose.prod.yml` y el `Dockerfile` disponibles en el repositorio permiten deployar la API en un entorno containerizado. Asegurate de configurar las variables de entorno de producción y de no exponer credenciales en la imagen.
