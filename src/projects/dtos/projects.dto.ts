import z from "zod";
import { ProjectStatus } from "@prisma/client";

export const createProjectDto = z.object({
    name: z.string().min(3),
    description: z.string().optional(),
    managerId: z.number(),
    organizationId: z.number(),
});

export type CreateProjectDto = z.infer<typeof createProjectDto>;

export const updateProjectDto = z
    .object({
        name: z.string().min(3).optional(),
        description: z.string().optional(),
        managerId: z.number().optional(),
        status: z.nativeEnum(ProjectStatus).optional(),
    })
    .refine(
        (data) =>
            data.name !== undefined ||
            data.description !== undefined ||
            data.managerId !== undefined ||
            data.status !== undefined,
        { message: "At least one field must be provided" },
    );

export type UpdateProjectDto = z.infer<typeof updateProjectDto>;
