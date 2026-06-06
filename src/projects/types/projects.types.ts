import { Prisma } from "@prisma/client";





/*  
    Response type for the project create operation
*/
export const projectCreateSelect = Prisma.validator<Prisma.ProjectSelect>()({
    id: true,
    name: true,
    description: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    status: true,
    organizationId: true,
    manager: {
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
        }
    },
    createdByUser: {
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
        }
    },
})

export type ProjectResponse = Prisma.ProjectGetPayload<{
    select : typeof projectCreateSelect
}>


