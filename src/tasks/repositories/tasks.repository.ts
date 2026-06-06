import { Prisma, PrismaClient, TaskCategory, TaskPriority, TaskStatus } from "@prisma/client";
import { TaskResponse, taskWithProjectSelect, TaskWithUser, taskWithUserSelect } from "../types/tasks.types";
import { AddTaskCommentDto, CreateTaskDto, GetAllTasksByProjectIdFiltersDto } from "../dtos/tasks.dto";



interface I_TaskRepository {
    count(): Promise<number>

    findAllOffsetPaginated(data: { page: number, limit: number }): Promise<TaskWithUser[]>

    findAllCursorPaginated(data: { cursor?: number, limit?: number }): Promise<TaskWithUser[]>

    findAllByProjectId(data: { projectId: number; filters: GetAllTasksByProjectIdFiltersDto }): Promise<TaskResponse[]>

    create(data: { createTaskDto: CreateTaskDto, createdByUserId: number }): Promise<TaskResponse>

    addTaskComment(data: { addTaskCommentDto: AddTaskCommentDto, userId: number, taskId: number }): Promise<TaskResponse>

    deletedTaskComments(taskId: number): Promise<void>

    delete(id: number): Promise<void>

    updateStatus(data: { taskId: number, status: TaskStatus }): Promise<TaskResponse>

    updatePriority(data: { taskId: number, priority: TaskPriority }): Promise<TaskResponse>

    updateCategory(data: { taskId: number, category: TaskCategory }): Promise<TaskResponse>

    updateDescription(data: { taskId: number, description: string }): Promise<TaskResponse>

    updateTitle(data: { taskId: number, title: string }): Promise<TaskResponse>

    updateDeadline(data: { taskId: number, deadline: Date }): Promise<TaskResponse>

    updateDesignatedTo(data: { taskId: number, designatedTo: number }): Promise<TaskResponse>

    updateDesignatedBy(data: { taskId: number, designatedBy: number }): Promise<TaskResponse>
    findById(id: number): Promise<TaskResponse | null>

    updateMany(data: { where: Prisma.TaskWhereInput, data: Prisma.TaskUpdateInput }): Promise<{ count: number }>

}

export class TaskRepository implements I_TaskRepository {

    constructor(private readonly prisma: PrismaClient) { }


    updatePriority(data: { taskId: number; priority: TaskPriority; }): Promise<TaskResponse> {
        return this.prisma.task.update({
            where: { id: data.taskId },
            data: { priority: data.priority },
            select: taskWithProjectSelect,
        });
    }

    updateCategory(data: { taskId: number; category: TaskCategory; }): Promise<TaskResponse> {
        return this.prisma.task.update({
            where: { id: data.taskId },
            data: { category: data.category },
            select: taskWithProjectSelect,
        });
    }

    async updateDescription(data: { taskId: number; description: string; }): Promise<TaskResponse> {
        return this.prisma.task.update({
            where: { id: data.taskId },
            data: { description: data.description },
            select: taskWithProjectSelect,
        });
    }


    async deletedTaskComments(taskId: number): Promise<void> {
        await this.prisma.taskComment.deleteMany({
            where: { taskId },
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.task.delete({
            where: { id },
        });
    }

    async updateStatus(data: { taskId: number; status: TaskStatus; }): Promise<TaskResponse> {
        return this.prisma.task.update({
            where: { id: data.taskId },
            data: { status: data.status },
            select: taskWithProjectSelect,
        });
    }


    async updateTitle(data: { taskId: number; title: string; }): Promise<TaskResponse> {
        return this.prisma.task.update({
            where: { id: data.taskId },
            data: { title: data.title },
            select: taskWithProjectSelect,
        });
    }


    async updateDeadline(data: { taskId: number; deadline: Date; }): Promise<TaskResponse> {
        return this.prisma.task.update({
            where: { id: data.taskId },
            data: { deadline: data.deadline },
            select: taskWithProjectSelect,
        });
    }


    async updateDesignatedTo(data: { taskId: number; designatedTo: number; }): Promise<TaskResponse> {
        return this.prisma.task.update({
            where: { id: data.taskId },
            data: { designatedTo: data.designatedTo },
            select: taskWithProjectSelect,
        });
    }


    async updateDesignatedBy(data: { taskId: number; designatedBy: number; }): Promise<TaskResponse> {
        return this.prisma.task.update({
            where: { id: data.taskId },
            data: { designatedBy: data.designatedBy },
            select: taskWithProjectSelect,
        });
    }


    async updateMany(data: { where: Prisma.TaskWhereInput; data: Prisma.TaskUpdateInput; }): Promise<{ count: number }> {
        return this.prisma.task.updateMany({ ...data });
    }




    async count(): Promise<number> {
        return this.prisma.task.count({
            where: { deletedAt: null },
        });
    }

    async create(data: { createTaskDto: CreateTaskDto, createdByUserId: number }): Promise<TaskResponse> {
        return this.prisma.task.create({
            data: {
                ...data.createTaskDto,
                createdBy: data.createdByUserId,
            },
            select: taskWithProjectSelect,
        });
    }


    async findAllByProjectId(data: { projectId: number; filters: GetAllTasksByProjectIdFiltersDto }): Promise<TaskResponse[]> {

        const where: Prisma.TaskWhereInput = {
            projectId: data.projectId,
            deletedAt: null,
            status: data.filters.status,
            priority: data.filters.priority,
            category: data.filters.category,
            title: data.filters.title ? { contains: data.filters.title, mode: 'insensitive' } : undefined,
            createdByUser: { id: data.filters.createdByUser },
            designatedByUser: { id: data.filters.designatedByUser },
            designatedToUser: { id: data.filters.designatedTo },
            deadline: data.filters.deadline ? { gte: data.filters.deadline } : undefined,
        }

        return this.prisma.task.findMany({
            where,
            select: taskWithProjectSelect,
        })
    }

    async addTaskComment(data: { addTaskCommentDto: AddTaskCommentDto, userId: number, taskId: number }): Promise<TaskResponse> {

        await this.prisma.taskComment.create({
            data: {
                ...data.addTaskCommentDto,
                userId: data.userId,
                taskId: data.taskId,
            },
        });

        return (await this.findById(data.taskId))!;
    }

    async findById(id: number): Promise<TaskResponse | null> {
        return this.prisma.task.findFirst({
            where: { id },
            select: taskWithProjectSelect,
        });
    }


    findAllOffsetPaginated(data: { page: number; limit: number; }): Promise<TaskWithUser[]> {

        const { page, limit } = data;

        const offset = (page - 1) * limit

        return this.prisma.task.findMany({
            skip: offset,
            take: limit,
            where: { deletedAt: null },
            select: taskWithUserSelect,
        })


    }


    findAllCursorPaginated(data: { cursor?: number; limit?: number; }): Promise<TaskWithUser[]> {

        const { cursor, limit } = data;

        return this.prisma.task.findMany({
            where: {
                deletedAt: null,
                id: { gt: cursor || 0 },
            },
            take: limit || 10,
            select: taskWithUserSelect,
        })

    }



}
