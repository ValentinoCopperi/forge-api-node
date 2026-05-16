import { PrismaClient } from "@prisma/client";
import { OrganizationController } from "./controller/organization.controller";
import { OrganizationRepository } from "./repositories/organization.repository";
import { OrganizationRoutes } from "./routes/organization.routes";
import { OrganizationService } from "./service/organization.service";


export const createOrganizationModule = (prisma: PrismaClient) => {

    const repository = new OrganizationRepository(prisma);
    const service = new OrganizationService(repository);
    const controller = new OrganizationController(service);
    const routes = new OrganizationRoutes(controller, repository);

    return routes.getRouter();
};
