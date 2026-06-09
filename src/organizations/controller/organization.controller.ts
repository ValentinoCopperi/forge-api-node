import { OrganizationService } from "../service/organization.service";
import { Request, Response } from "express";
import { AppError } from "../../shared/errors/AppError";
import {
    addUserToOrganizationDto,
    createOrganizationDto,
    organizationProjectRelationDto,
    removeUserFromOrganizationDto,
    updateOrganizationDto,
    updateUserOrganizationRoleDto,
} from "../dtos/organizations.dto";

export class OrganizationController {

    constructor(private readonly organizationService: OrganizationService) { }

    async create(req: Request, res: Response) {
        const parsed = createOrganizationDto.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const creatorId = req.user?.sub;
        if (creatorId === undefined) {
            throw new AppError("Unauthorized", 401);
        }

        const data = await this.organizationService.create(parsed.data, creatorId);

        return res.status(200).json({ data });
    }

    async findAll(req: Request, res: Response) {
        const data = await this.organizationService.findAll();
        return res.status(200).json({ data });
    }

    async findOne(req: Request, res: Response) {
        const id = Number(req.params.id);

        if (!Number.isFinite(id)) {
            return res.status(400).json({
                errors: { id: ["Invalid organization id"] }
            });
        }

        const data = await this.organizationService.findOne(id);
        return res.status(200).json({ data });
    }

    async update(req: Request, res: Response) {
        const id = Number(req.params.id);

        if (!Number.isFinite(id)) {
            return res.status(400).json({
                errors: { id: ["Invalid organization id"] }
            });
        }

        const parsed = updateOrganizationDto.safeParse(req.body ?? {});

        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const data = await this.organizationService.update(id, parsed.data);
        return res.status(200).json({ data });
    }

    async remove(req: Request, res: Response) {
        const id = Number(req.params.id);

        if (!Number.isFinite(id)) {
            return res.status(400).json({
                errors: { id: ["Invalid organization id"] }
            });
        }

        await this.organizationService.remove(id);
        return res.status(204).send();
    }

    async addUserToOrganization(req: Request, res: Response) {
        const parsed = addUserToOrganizationDto.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.flatten().fieldErrors
            });
        }

        await this.organizationService.addUserToOrganization(parsed.data);
        return res.status(204).send();
    }

    async removeUserFromOrganization(req: Request, res: Response) {
        const parsed = removeUserFromOrganizationDto.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.flatten().fieldErrors
            });
        }

        await this.organizationService.removeUserFromOrganization(parsed.data);
        return res.status(204).send();
    }

    async updateUserOrganizationRole(req: Request, res: Response) {
        const parsed = updateUserOrganizationRoleDto.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.flatten().fieldErrors
            });
        }

        await this.organizationService.updateUserOrganizationRole(parsed.data);
        return res.status(204).send();
    }

    async addProjectToOrganization(req: Request, res: Response) {
        const parsed = organizationProjectRelationDto.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.flatten().fieldErrors
            });
        }

        await this.organizationService.addProjectToOrganization(parsed.data);
        return res.status(204).send();
    }

    async removeProjectFromOrganization(req: Request, res: Response) {
        const parsed = organizationProjectRelationDto.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.flatten().fieldErrors
            });
        }

        await this.organizationService.removeProjectFromOrganization(parsed.data);
        return res.status(204).send();
    }
}
