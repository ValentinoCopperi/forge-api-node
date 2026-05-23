import z from "zod";




export const createProjectDto = z.object({
    name : z.string().min(3),
    description : z.string().optional(),
    managerId : z.number(),
    organizationId : z.number(),
})

export type CreateProjectDto = z.infer<typeof createProjectDto>;