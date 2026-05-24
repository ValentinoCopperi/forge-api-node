import { Prisma, PrismaClient, TaskComment, TaskStatus } from "@prisma/client";
import { TaskWithProject, taskWithProjectSelect, TaskWithUser, taskWithUserSelect } from "../types/tasks.types";
import { AddTaskCommentDto, CreateTaskDto, GetAllTasksByProjectIdFiltersDto } from "../dtos/tasks.dto";



interface I_TaskRepository {
    count(): Promise<number>

    findAllOffsetPaginated(data: { page: number, limit: number }): Promise<TaskWithUser[]>

    findAllCursorPaginated(data: { cursor?: number, limit?: number }): Promise<TaskWithUser[]>

    findAllByProjectId(data: { projectId: number; filters: GetAllTasksByProjectIdFiltersDto }): Promise<TaskWithProject[]>

    create(data: { createTaskDto: CreateTaskDto, createdByUserId: number }): Promise<TaskWithProject>

    addTaskComment(data: { addTaskCommentDto: AddTaskCommentDto, userId: number, taskId: number }): Promise<TaskWithProject>

    findById(id: number): Promise<TaskWithProject | null>

    updateMany(data: { where: Prisma.TaskWhereInput, data: Prisma.TaskUpdateInput }): Promise<{count : number}>

}

export class TaskRepository implements I_TaskRepository {

    constructor(private readonly prisma: PrismaClient) { }


    async updateMany(data: { where: Prisma.TaskWhereInput; data: Prisma.TaskUpdateInput; }): Promise<{count : number}> {
        return this.prisma.task.updateMany({...data });
    }





    async count(): Promise<number> {
        return this.prisma.task.count({
            where: { deletedAt: null },
        });
    }

    async create(data: { createTaskDto: CreateTaskDto, createdByUserId: number }): Promise<TaskWithProject> {
        return this.prisma.task.create({
            data: {
                ...data.createTaskDto,
                createdBy: data.createdByUserId,
            },
            select: taskWithProjectSelect,
        });
    }


    async findAllByProjectId(data: { projectId: number; filters: GetAllTasksByProjectIdFiltersDto }): Promise<TaskWithProject[]> {

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

    async addTaskComment(data: { addTaskCommentDto: AddTaskCommentDto, userId: number, taskId: number }): Promise<TaskWithProject> {

        await this.prisma.taskComment.create({
            data: {
                ...data.addTaskCommentDto,
                userId: data.userId,
                taskId: data.taskId,
            },
        });

        return (await this.findById(data.taskId))!;
    }

    async findById(id: number): Promise<TaskWithProject | null> {
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
