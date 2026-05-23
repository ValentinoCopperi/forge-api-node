import { PrismaClient } from "@prisma/client";
import { OrganizationRepository } from "../organizations/repositories/organization.repository";
import { ProjectController } from "./controller/project.controller";
import { ProjectsRepository } from "./repositories/projects.repository";
import { ProjectsRoutes } from "./routes/projects.routes";
import { ProjectsService } from "./service/projects.service";


export const createProjectsModule = (prisma: PrismaClient) => {

    const projectsRepository = new ProjectsRepository(prisma);
    const organizationRepository = new OrganizationRepository(prisma);
    const service = new ProjectsService(projectsRepository, organizationRepository);
    const controller = new ProjectController(service);
    const routes = new ProjectsRoutes(controller, organizationRepository);

    return routes.getRouter();
};
