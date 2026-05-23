import "dotenv/config";
import bcrypt from "bcrypt";
import {
  OrganizationUserRole,
  PrismaClient,
  ProjectStatus,
  Role,
  TaskCategory,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = "Password123!";

async function resetDatabase() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "TaskComment",
      "Task",
      "Project",
      "OrganizationUser",
      "Organization",
      "Session",
      "UserRole",
      "User"
    RESTART IDENTITY CASCADE;
  `);
}

async function main() {
  console.log("🌱 Iniciando seed completo...");

  const passwordHash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

  await resetDatabase();
  console.log("✓ Base de datos limpiada (TRUNCATE + RESTART IDENTITY)");

  const userDefinitions = [
    { name: "Ana Director", email: "director@maproute.test", roles: [Role.DIRECTOR] },
    { name: "Bruno Gerente", email: "gerente@maproute.test", roles: [Role.GERENTE] },
    { name: "Carla Empleado", email: "empleado1@maproute.test", roles: [Role.EMPLEADO] },
    {
      name: "Diego Manager",
      email: "manager@maproute.test",
      roles: [Role.GERENTE, Role.EMPLEADO],
    },
    { name: "Elena Empleado", email: "empleado2@maproute.test", roles: [Role.EMPLEADO] },
    { name: "Franco Empleado", email: "empleado3@maproute.test", roles: [Role.EMPLEADO] },
    {
      name: "Gina Developer",
      email: "developer@maproute.test",
      roles: [Role.EMPLEADO],
    },
  ];

  const users = [];
  for (const user of userDefinitions) {
    users.push(
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          passwordHash,
          userRoles: {
            create: user.roles.map((role) => ({ role })),
          },
        },
      }),
    );
  }

  const [ana, bruno, , diego, , , gina] = users;
  console.log(`✓ ${users.length} usuarios creados (ids 1–${users.length})`);

  const organization = await prisma.organization.create({
    data: {
      name: "MapRoute Demo",
      description: "Organización de prueba para desarrollo local",
      createdByUserId: diego.id,
      updatedByUserId: diego.id,
      organizationUsers: {
        create: [
          { userId: diego.id, role: OrganizationUserRole.OWNER },
          { userId: ana.id, role: OrganizationUserRole.ADMIN },
          { userId: bruno.id, role: OrganizationUserRole.ADMIN },
          { userId: gina.id, role: OrganizationUserRole.MEMBER },
          { userId: users[2].id, role: OrganizationUserRole.MEMBER },
          { userId: users[4].id, role: OrganizationUserRole.VIEWER },
        ],
      },
    },
  });
  console.log(`✓ Organización "${organization.name}" (id ${organization.id})`);

  const projectApi = await prisma.project.create({
    data: {
      name: "API Core",
      description: "Backend REST, auth y módulo de tareas",
      organizationId: organization.id,
      status: ProjectStatus.ACTIVE,
      managerId: diego.id,
      createdByUserId: diego.id,
    },
  });

  const projectPortal = await prisma.project.create({
    data: {
      name: "Portal Web",
      description: "Frontend del panel de proyectos",
      organizationId: organization.id,
      status: ProjectStatus.ACTIVE,
      managerId: bruno.id,
      createdByUserId: bruno.id,
    },
  });

  const projectArchived = await prisma.project.create({
    data: {
      name: "Legacy Archive",
      description: "Proyecto archivado de referencia",
      organizationId: organization.id,
      status: ProjectStatus.ARCHIVED,
      managerId: ana.id,
      createdByUserId: ana.id,
    },
  });

  console.log(
    `✓ Proyectos: API Core (${projectApi.id}), Portal Web (${projectPortal.id}), Legacy Archive (${projectArchived.id})`,
  );

  const taskRows: Array<{
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    category: TaskCategory;
    designatedTo?: number;
    designatedBy?: number;
    deadline?: Date;
  }> = [
    {
      title: "Implementar endpoint de login",
      description: "JWT + refresh token y validación de credenciales",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      category: TaskCategory.DESARROLLO,
      designatedTo: gina.id,
      designatedBy: diego.id,
      deadline: new Date("2026-06-10T18:00:00.000Z"),
    },
    {
      title: "Diseñar pantalla del dashboard",
      description: "Wireframes y paleta de colores del panel principal",
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      category: TaskCategory.DISENO,
      designatedTo: gina.id,
      designatedBy: diego.id,
      deadline: new Date("2026-06-20T12:00:00.000Z"),
    },
    {
      title: "Escribir pruebas E2E del flujo de tareas",
      description: "Cypress o Playwright para crear, asignar y cerrar tareas",
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      category: TaskCategory.TESTING,
      designatedTo: gina.id,
      designatedBy: diego.id,
      deadline: new Date("2026-07-01T23:59:59.000Z"),
    },
    {
      title: "Documentar API de organizaciones",
      description: "OpenAPI / README con ejemplos de request y response",
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
      category: TaskCategory.DOCUMENTACION,
      designatedTo: gina.id,
      designatedBy: diego.id,
    },
    {
      title: "Refactorizar repositorio de tasks",
      description: "Separar queries de listado y detalle por proyecto",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      category: TaskCategory.DESARROLLO,
      designatedTo: gina.id,
      designatedBy: diego.id,
      deadline: new Date("2026-05-30T17:00:00.000Z"),
    },
    {
      title: "Revisar permisos por rol en proyectos",
      description: "Validar OWNER, ADMIN y MEMBER en rutas protegidas",
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      category: TaskCategory.OTRO,
      deadline: new Date("2026-06-05T09:00:00.000Z"),
    },
    {
      title: "Corregir bug en filtro de status",
      description: "El listado no respeta status=IN_PROGRESS en algunos casos",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      category: TaskCategory.DESARROLLO,
      designatedTo: gina.id,
      designatedBy: diego.id,
      deadline: new Date("2026-05-25T14:30:00.000Z"),
    },
    {
      title: "Iconos y estados visuales de prioridad",
      description: "Badges LOW / MEDIUM / HIGH en la tabla de tareas",
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
      category: TaskCategory.DISENO,
      designatedTo: gina.id,
      designatedBy: diego.id,
    },
    {
      title: "Pruebas unitarias del servicio de tasks",
      description: "Mocks del repositorio y casos de error 404/403",
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      category: TaskCategory.TESTING,
    },
    {
      title: "Guía de despliegue con Docker",
      description: "Variables de entorno y migraciones Prisma en producción",
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
      category: TaskCategory.DOCUMENTACION,
      designatedTo: gina.id,
      designatedBy: diego.id,
      deadline: new Date("2026-08-01T00:00:00.000Z"),
    },
    {
      title: "Migración de datos legacy de tareas",
      description: "Importar tareas antiguas al proyecto API Core",
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      category: TaskCategory.OTRO,
      designatedTo: gina.id,
      designatedBy: diego.id,
      deadline: new Date("2026-05-15T10:00:00.000Z"),
    },
    {
      title: "Optimizar consultas con índices",
      description: "Revisar índices en projectId, status y deletedAt",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      category: TaskCategory.DESARROLLO,
      designatedBy: diego.id,
      deadline: new Date("2026-06-12T16:00:00.000Z"),
    },
    {
      title: "Maquetar vista de listado de proyectos",
      description: "Tabla responsive en Portal Web",
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      category: TaskCategory.DISENO,
      designatedTo: gina.id,
      designatedBy: bruno.id,
      deadline: new Date("2026-06-18T15:00:00.000Z"),
    },
  ];

  const apiTasks = await prisma.task.createMany({
    data: taskRows.slice(0, 12).map((task) => ({
      ...task,
      projectId: projectApi.id,
      createdBy: diego.id,
    })),
  });

  await prisma.task.create({
    data: {
      title: taskRows[12].title,
      description: taskRows[12].description,
      status: taskRows[12].status,
      priority: taskRows[12].priority,
      category: taskRows[12].category,
      designatedTo: taskRows[12].designatedTo,
      designatedBy: taskRows[12].designatedBy,
      deadline: taskRows[12].deadline,
      projectId: projectPortal.id,
      createdBy: bruno.id,
    },
  });

  console.log(`✓ ${apiTasks.count + 1} tareas creadas (12 en proyecto ${projectApi.id})`);

  const loginTask = await prisma.task.findFirstOrThrow({
    where: { projectId: projectApi.id, title: "Implementar endpoint de login" },
  });
  const dashboardTask = await prisma.task.findFirstOrThrow({
    where: { projectId: projectApi.id, title: "Diseñar pantalla del dashboard" },
  });
  const bugTask = await prisma.task.findFirstOrThrow({
    where: { projectId: projectApi.id, title: "Corregir bug en filtro de status" },
  });

  await prisma.taskComment.createMany({
    data: [
      {
        content: "JWT listo; falta refresh token en cookie httpOnly.",
        taskId: loginTask.id,
        userId: gina.id,
      },
      {
        content: "Wireframe aprobado por Bruno, pasamos a alta fidelidad.",
        taskId: dashboardTask.id,
        userId: bruno.id,
      },
      {
        content: "Bug reproducido en listado con query ?status=IN_PROGRESS.",
        taskId: bugTask.id,
        userId: diego.id,
      },
    ],
  });
  console.log("✓ 3 comentarios de tarea");

  console.log("\n✅ Seed completado");
  console.log("────────────────────────────────────────");
  console.log(`Organización: ${organization.name} (id ${organization.id})`);
  console.log(`Proyecto principal: API Core (id ${projectApi.id})`);
  console.log(`Creador de tareas: Diego Manager (id ${diego.id})`);
  console.log(`Asignada frecuente: Gina Developer (id ${gina.id})`);
  console.log(`Contraseña de todos los usuarios: ${DEFAULT_PASSWORD}`);
  console.log("Emails: director@, gerente@, empleado1@, manager@, empleado2@, empleado3@, developer@maproute.test");
}

main()
  .catch((error) => {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
