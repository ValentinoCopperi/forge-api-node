import { NextFunction, Request, RequestHandler, Response } from "express";
import { OrganizationRepository } from "../repositories/organization.repository";
import type { RoleActions } from "../constants/organizations-roles.constant";
import { organizationRoleAllowsAction } from "../helpers/organization.permissions";
import { AppError } from "../../shared/errors/AppError";


export type ResolveOrganizationId = (req: Request) => number | undefined;


export interface RequireOrganizationPermissionOptions {

    resolveOrganizationId: ResolveOrganizationId;
}


/**
 * Obtiene organizationId desde el segmento `:paramName` de la URL.
 */
export function organizationIdFromParam(paramName: string): ResolveOrganizationId {

    return (req) => {
        const n = Number(req.params[paramName]);

        return Number.isFinite(n) ? n : undefined;
    };
}


/**
 * Obtiene organizationId del body JSON (por defecto `organizationId`).
 */
export function organizationIdFromBody(field: string = "organizationId"): ResolveOrganizationId {

    return (req) => {

        const body = req.body;

        const raw =
            typeof body === "object" && body !== null && field in body
                ? (body as Record<string, unknown>)[field]
                : undefined;

        if (typeof raw === "number" && Number.isFinite(raw)) {

            return raw;
        }

        if (typeof raw === "string" && raw.trim() !== "") {

            const n = Number(raw);

            return Number.isFinite(n) ? n : undefined;
        }

        return undefined;
    };
}


/**
 * Antes del middleware de permisos (y del controller con Zod), copia `:paramName`
 * dentro de `body.organizationId`. Útil para rutas REST `POST /orgs/:organizationId/users`
 * donde el cliente solo envía `{ userId, role }`.
 */
export function mergeBodyOrganizationIdFromParams(paramName: string): RequestHandler {

    return (req, _res, next) => {

        const parsed = Number(req.params[paramName]);

        if (!Number.isFinite(parsed)) {

            return next(new AppError(`Invalid organization id`, 400));
        }

        req.body =
            typeof req.body === "object" && req.body !== null ? { ...(req.body as object), organizationId: parsed } : {
                organizationId: parsed,
            };

        next();
    };
}


/**
 * Factory: middleware que comprueba membresía y que el rol permite la acción
 * declarada en `ORGANIZATION_ROLES_DEFINITIONS`.
 */
export function createRequireOrganizationPermission(

    organizationRepository: OrganizationRepository,

    action: RoleActions,

    options: RequireOrganizationPermissionOptions,

): RequestHandler {

    return async (req: Request, _res: Response, next: NextFunction) => {

        try {

            const userId = req.user?.sub;

            if (userId === undefined) {

                return next(new AppError("Unauthorized", 401));
            }

            const organizationId = options.resolveOrganizationId(req);

            if (organizationId === undefined) {

                return next(new AppError("Invalid or missing organization id", 400));
            }

            const role = await organizationRepository.findMembershipRole(organizationId, userId);

            if (role === null) {

                return next(new AppError("Forbidden", 403));
            }

            if (!organizationRoleAllowsAction(role, action)) {

                return next(new AppError("Forbidden", 403));
            }

            req.organizationMembership = {
                organizationId,
                role,
            };

            next();
        } catch (e) {

            next(e);

        }

    };

}
