# claude-concepts-maproute-node — API REST

API en **Node.js + TypeScript + Express** con PostgreSQL (Prisma), Redis, Socket.IO y almacenamiento compatible S3 (MinIO).

## Requisitos

- Node.js compatible con el proyecto
- **pnpm** o npm
- PostgreSQL, Redis y (según flujo) MinIO — vía **Docker** recomendado (`docker-compose.dev.yml`)

## Variables de entorno

Copiá `.env` desde tu plantilla habitual. Las variables se validan en `src/shared/configs/env.config.ts` con Zod. Entre otras:

| Grupo | Ejemplos |
|--------|-----------|
| App | `APP_PORT` (default **3000**), `DATABASE_URL` |
| JWT | `JWT_SECRET`, `JWT_REFRESH_SECRET` |
| PostgreSQL / pgAdmin | `POSTGRES_*`, `PGADMIN_*` |
| MinIO / S3 | `MINIO_*`, `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION` |
| Redis | `REDIS_HOST`, `REDIS_PORT` |
| Rate limit (auth) | `MAX_IP_REQUEST` (default **5**) |

No subas `.env` al repositorio.

## Puesta en marcha

```bash
pnpm install
# Levantar infra con Docker según tu compose
pnpm exec prisma migrate deploy   # o migrate dev en desarrollo
pnpm dev
```

- **Desarrollo**: `pnpm dev` (nodemon + ts-node).
- **Build**: `pnpm run build` → salida en `dist/` (normalmente ignorado en Git).
- **Producción**: `pnpm start` (`node dist/index.js`).

Otros scripts útiles: `pnpm test` (Vitest), `pnpm run prisma-seed`, `pnpm run test:migrate`.

## Prefijo de API

Las rutas REST principales están bajo **`/api/v1`** (constante `API_PREFIX` en `src/index.ts`).

## Documentación OpenAPI (Swagger)

- **UI**: `http://localhost:<APP_PORT>/docs`
- **JSON del spec**: `http://localhost:<APP_PORT>/docs/openapi.json`

De momento el spec describe sobre todo el módulo **Organizations** (`src/shared/docs/openapi-organizations.docs.ts`). Podés ampliar el documento a medida que crezca la API.

## Arquitectura

Patrón modular con capas:

- **Controllers**: HTTP (request/response, validación Zod en muchos casos).
- **Services**: reglas de negocio y orquestación.
- **Repositories**: acceso a datos vía **Prisma**.
- **Routes / module**: registro de rutas y wiring de dependencias.

Estructura típica (`src/`):

```
src/
├── auth/              # Registro, login, refresh, avatar
├── tasks/
├── organizations/     # CRUD org, membresías, permisos por rol de org
├── notifications/
├── health/
├── shared/            # config, errores, middleware, prisma, redis, docs, etc.
└── index.ts
```

En **organizations**, la autorización por acción dentro de la org usa `ORGANIZATION_ROLES_DEFINITIONS` y middleware de factoría (`createRequireOrganizationPermission`).

## Modelo de datos (resumen Prisma)

- **User**, **Session**, **UserRole** (rol de aplicación `Role`: DIRECTOR, GERENTE, EMPLEADO).
- **Organization**, **OrganizationUser** (rol en org `OrganizationUserRole`: OWNER, ADMIN, MEMBER, VIEWER).
- **Task**, **Project**, **TaskComment**, etc.

Detalle completo en `prisma/schema.prisma`.

## Autenticación y seguridad

- JWT (access / refresh según implementación en `AuthService`).
- **bcrypt** para contraseñas.
- **`tokenMiddleware`** en rutas protegidas (tasks, organizations, notifications).
- **`rateLimitMiddleware`** aplicado al montaje de **`/api/v1/auth`** (por IP / Redis según configuración).
- **`roleMiddleware`**: RBAC por rol de aplicación (p. ej. crear tareas como DIRECTOR, crear organización como DIRECTOR/GERENTE).

## Rutas HTTP (referencia rápida)

| Área | Base | Notas |
|------|------|--------|
| Health | `GET /api/v1/health/` | Postgres + Redis |
| Auth | `/api/v1/auth/...` | Rate limit global en el montaje |
| Tasks | `/api/v1/tasks/...` | Requiere JWT; `POST /` exige DIRECTOR |
| Organizations | `/api/v1/organizations/...` | Requiere JWT; detalle en `/docs` |
| Notifications | `/api/v1/notifications/...` | Requiere JWT |

**Auth** (`/api/v1/auth`):

- `POST /create` — registro  
- `POST /signin` — login  
- `POST /refresh` — refresh token  
- `POST /uploadAvatar` — subida de avatar (multipart, requiere token)

**Tasks** (`/api/v1/tasks`; protegidas con JWT):

- `GET /` — listado (cache Redis en esa ruta según implementación del servicio)  
- `GET /cursorPaginated`, `GET /offsetPaginated`  
- `POST /` — crear (rol DIRECTOR)  
- Rutas de prueba/demo: `/fast`, `/block/:ms_to_block`, `/async`

**Organizations** (`/api/v1/organizations`; JWT obligatorio):

- `GET /` — listado  
- `GET /:id` — detalle  
- `POST /` — crear (rol global DIRECTOR o GERENTE)  
- `POST /:organizationId/users` — agregar usuario con permiso org `add-user` (ver middleware y Swagger)

Otros endpoints en la raíz:

- `GET /client` — página HTML estática (`client.html`).

## Validación

**Zod** para DTOs (auth, tasks, organizations, envs).

## Errores

**`AppError`** con `statusCode`; **`ErrorRequestHandler`** al final del pipeline en `index.ts`.

## Docker

- **`docker-compose.dev.yml`** — desarrollo (PostgreSQL, pgAdmin, MinIO, Redis, etc.).
- **`docker-compose.prod.yml`** / **`dockerfile`** — despliegue según tu flujo.

## Dependencias destacadas

express, `@prisma/client`, `socket.io`, `ioredis`, `jsonwebtoken`, `bcrypt`, `multer`, `zod`, `@aws-sdk/client-s3`, `swagger-ui-express`, `pino`.
