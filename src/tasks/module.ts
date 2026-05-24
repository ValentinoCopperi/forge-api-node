import { PrismaClient } from "@prisma/client"
import { TaskController } from "./controllers/tasks.controller"
import { TaskRepository } from "./repositories/tasks.repository"
import { TaskRoutes } from "./routes/task.routes"
import { TaskService } from "./services/task.service"
import { getRedisClient } from "../shared/libs/redis/redis.connection"
import { ProjectsRepository } from "../projects/repositories/projects.repository"
import { OrganizationRepository } from "../organizations/repositories/organization.repository"
import { TasksJob } from "./jobs/tasks.job"


export const createTaskModule = (prisma: PrismaClient) => {

    const repository = new TaskRepository(prisma)

    const projectsRepository = new ProjectsRepository(prisma)
    
    const organizationRepository = new OrganizationRepository(prisma)

    const service = new TaskService(repository, getRedisClient(), projectsRepository, organizationRepository)

    const controller = new TaskController(service)

    const job = new TasksJob(repository)
    job.start()

    const routes = new TaskRoutes(controller)

    return routes.getRouter()
}
