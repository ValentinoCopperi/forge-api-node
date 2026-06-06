import { TaskRepository } from "../repositories/tasks.repository";
import { logger } from "../../shared/libs/logger/logger";
import cron from 'node-cron';
import { TaskStatus } from "@prisma/client";


export class TasksJob {

    private logger = logger.child({ module: "TasksJob" });


    constructor(private readonly taskRepository: TaskRepository) { }


    async start() {

        cron.schedule('0 0 * * *', () => {
            this.validateTasksStatus().catch(error => {
                this.logger.error(error);
            });
        });

    }


    private async validateTasksStatus() {

        const tasksUpdated = await this.taskRepository.updateMany({
            where: {
                deadline: {
                    lt: new Date()
                },
                status: { in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] }
            },
            data: { status: TaskStatus.OVERDUE }
        });

        this.logger.info(`${tasksUpdated.count} tasks updated to overdue status on ${new Date().toISOString()}`);

    }
}