import { OrganizationUserRole } from '@prisma/client';
import { z } from 'zod';

export const createOrganizationDto = z.object({
    name: z.string().min(3),
    description: z.string().optional(),
});

export type CreateOrganizationDto = z.infer<typeof createOrganizationDto>;

export const updateOrganizationDto = z
    .object({
        name: z.string().min(3).optional(),
        description: z.string().optional(),
    })
    .refine((data) => data.name !== undefined || data.description !== undefined, {
        message: 'At least one field must be provided',
    });

export type UpdateOrganizationDto = z.infer<typeof updateOrganizationDto>;

export const addUserToOrganizationDto = z.object({
    organizationId: z.number(),
    userId: z.number(),
    role: z.enum(OrganizationUserRole),
});

export type AddUserToOrganizationDto = z.infer<typeof addUserToOrganizationDto>;

export const removeUserFromOrganizationDto = z.object({
    organizationId: z.number(),
    userId: z.number(),
});

export type RemoveUserFromOrganizationDto = z.infer<
    typeof removeUserFromOrganizationDto
>;

export const updateUserOrganizationRoleDto = z.object({
    organizationId: z.number(),
    userId: z.number(),
    role: z.enum(OrganizationUserRole),
});

export type UpdateUserOrganizationRoleDto = z.infer<
    typeof updateUserOrganizationRoleDto
>;

export const organizationProjectRelationDto = z.object({
    organizationId: z.number(),
    projectId: z.number(),
});

export type OrganizationProjectRelationDto = z.infer<
    typeof organizationProjectRelationDto
>;
