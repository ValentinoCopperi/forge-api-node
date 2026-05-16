import { PrismaClient, Task } from "@prisma/client";
import { TaskWithUser, taskWithUserSelect } from "../types/tasks.types";



interface I_TaskRepository {
    
    count() : Promise<number>
    
    findAllOffsetPaginated(data: { page: number, limit: number }): Promise<TaskWithUser[]>

    findAllCursorPaginated(data: { cursor?: number, limit?: number }): Promise<TaskWithUser[]>

    findAll(): Promise<TaskWithUser[]>

    // create(data: { title: string, userId: number }): Promise<Task>

    findByTitle(title: string): Promise<boolean>

    
}

export class TaskRepository implements I_TaskRepository {

    constructor(private readonly prisma: PrismaClient) { }


    async count(): Promise<number> {
        return await this.prisma.task.count();
    }



    findAllOffsetPaginated(data: { page: number; limit: number; }): Promise<TaskWithUser[]> {

        const { page , limit } = data;

        const offset = (page - 1) * limit

         return this.prisma.task.findMany({
            skip : offset,
            take: limit,
            select: { ...taskWithUserSelect }
        })


    }


    findAllCursorPaginated(data: { cursor?: number; limit?: number; }): Promise<TaskWithUser[]> {

        const { cursor, limit } = data;

        return this.prisma.task.findMany({
            where: {
                id: { gt: cursor || 0 }
            },
            take: limit || 10,
            select: { ...taskWithUserSelect }
        })

    }

    findAll(): Promise<TaskWithUser[]> {
        return this.prisma.task.findMany({
            select: { ...taskWithUserSelect }
        });
    }

    // create(data: { title: string; userId: number; }): Promise<Task> {

    //     const { title, userId } = data;

    //     return this.prisma.task.create({
    //         data: {
    //             title,
    //             userId
    //         }
    //     })

    // }

    async findByTitle(title: string): Promise<boolean> {

        const task = await this.prisma.task.findFirst({
            where: {
                title: {
                    equals: title
                }
            }
        });

        return !!task;

    }
}
