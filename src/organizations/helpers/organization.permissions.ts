import { OrganizationUserRole } from "@prisma/client";
import { ORGANIZATION_ROLES_DEFINITIONS } from "../constants/organizations-roles.constant";
import type { RoleActions } from "../constants/organizations-roles.constant";


export function organizationRoleAllowsAction(role: OrganizationUserRole, action: RoleActions): boolean {

    const allowed = ORGANIZATION_ROLES_DEFINITIONS.get(role);

    return allowed?.includes(action) ?? false;
}
