import { OrganizationUserRole } from "@prisma/client";

export type RoleActions =
    'delete' | 'update' | 'add-user' | 'remove-user' | 'update-user-role' | 'add-project'  | 'remove-project';

type OrganizationRolesDefinitions = Map<OrganizationUserRole, RoleActions[]>;

export const ORGANIZATION_ROLES_DEFINITIONS: OrganizationRolesDefinitions = new Map([
    [OrganizationUserRole.OWNER, ["delete", "update", "add-user", "remove-user", "add-project", "remove-project"]],
    [OrganizationUserRole.ADMIN, ["delete", "update", "add-user", "remove-user", "add-project", "remove-project"]],
    [OrganizationUserRole.MEMBER, ["add-project", "remove-project"]],
    [OrganizationUserRole.VIEWER, []],
]);
