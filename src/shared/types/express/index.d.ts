import type { OrganizationUserRole } from "@prisma/client";
import type { JwtPayload } from "../../auth/types/auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      request_id?: string;
      organizationMembership?: {
        organizationId: number;
        role: OrganizationUserRole;
      };
    }
  }
}
