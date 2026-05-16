import { OrganizationService } from "../service/organization.service";
import { Request, Response } from "express";
import { AppError } from "../../shared/errors/AppError";
import {
    createOrganizationDto,
    addUserToOrganizationDto,
    removeUserFromOrganizationDto,
} from "../dtos/organizations.dto";
import { z } from "zod";


const organizationProjectRelationDto = z.object({
    organizationId: z.number(),
    projectId: z.number(),
});


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
