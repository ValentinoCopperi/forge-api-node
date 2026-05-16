import { OrganizationUserRole } from '@prisma/client';
import { z } from 'zod';



/*
    DTO for the organization create operation
*/
export const createOrganizationDto = z.object({
    name : z.string().min(3),
    description : z.string().optional()
})

export type CreateOrganizationDto = z.infer<typeof createOrganizationDto>;



/*
    DTO for the organization add user operation
*/
export const addUserToOrganizationDto = z.object({
    organizationId: z.number(),
    userId: z.number(),
    role: z.enum(OrganizationUserRole)
})

export type AddUserToOrganizationDto = z.infer<typeof addUserToOrganizationDto>;


/*
    DTO for the organization remove user operation
*/
export const removeUserFromOrganizationDto = z.object({
    organizationId: z.number(),
    userId: z.number(),
})

export type RemoveUserFromOrganizationDto = z.infer<typeof removeUserFromOrganizationDto>;
