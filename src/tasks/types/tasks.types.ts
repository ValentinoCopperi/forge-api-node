import { Prisma } from "@prisma/client";



export const taskWithUserSelect = Prisma.validator<Prisma.TaskSelect>()({
    id: true,
    title: true,
})


export type TaskWithUser = Prisma.TaskGetPayload<{
    select: typeof taskWithUserSelect
}>