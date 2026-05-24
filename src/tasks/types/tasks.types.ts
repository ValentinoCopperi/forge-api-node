import { Prisma } from "@prisma/client";



/*
    Types for list of all tasks by project
*/
export const taskWithProjectSelect = Prisma.validator<Prisma.TaskSelect>()({
    id: true,
    title: true,
    description: true,
    status: true,
    priority: true,
    category: true,
    createdAt: true,
    updatedAt: true,
    deadline: true,
    createdByUser : {
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
        }
    },
    designatedToUser : {
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
        }
    },
    designatedByUser : {
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
        }
    },
    project : {
        select: {
            id: true,
            name: true,
        }
    },
    taskComments : {
        select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            user : {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    }
})

export type TaskWithProject = Prisma.TaskGetPayload<{
    select: typeof taskWithProjectSelect
}>




export const taskWithUserSelect = Prisma.validator<Prisma.TaskSelect>()({
    id: true,
    title: true,
})


export type TaskWithUser = Prisma.TaskGetPayload<{
    select: typeof taskWithUserSelect
}>






