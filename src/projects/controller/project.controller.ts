import { Request, Response } from "express";
import { AppError } from "../../shared/errors/AppError";
import { createProjectDto, updateProjectDto } from "../dtos/projects.dto";
import { ProjectsService } from "../service/projects.service";

export class ProjectController {

    constructor(private readonly projectsService: ProjectsService) { }

    async create(req: Request, res: Response) {
        const parsed = createProjectDto.safeParse(req.body ?? {});

        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const createdByUserId = req.user?.sub;
        if (createdByUserId === undefined) {
            throw new AppError("Unauthorized", 401);
        }

        const project = await this.projectsService.create({
            createProjectDto: parsed.data,
            createdByUserId,
        });

        return res.status(201).json({ data: project });
    }

    async findAllByOrganization(req: Request, res: Response) {
        const organizationId = Number(req.params.organizationId);

        if (!Number.isFinite(organizationId)) {
            return res.status(400).json({
                errors: { organizationId: ["Invalid organization id"] }
            });
        }

        const data = await this.projectsService.findAllByOrganization(organizationId);
        return res.status(200).json({ data });
    }

    async findOne(req: Request, res: Response) {
        const organizationId = Number(req.params.organizationId);
        const projectId = Number(req.params.projectId);

        if (!Number.isFinite(organizationId) || !Number.isFinite(projectId)) {
            return res.status(400).json({
                errors: { id: ["Invalid organization or project id"] }
            });
        }

        const data = await this.projectsService.findOne({ organizationId, projectId });
        return res.status(200).json({ data });
    }

    async update(req: Request, res: Response) {
        const organizationId = Number(req.params.organizationId);
        const projectId = Number(req.params.projectId);

        if (!Number.isFinite(organizationId) || !Number.isFinite(projectId)) {
            return res.status(400).json({
                errors: { id: ["Invalid organization or project id"] }
            });
        }

        const parsed = updateProjectDto.safeParse(req.body ?? {});

        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const data = await this.projectsService.update({
            organizationId,
            projectId,
            updateProjectDto: parsed.data,
        });

        return res.status(200).json({ data });
    }

    async remove(req: Request, res: Response) {
        const organizationId = Number(req.params.organizationId);
        const projectId = Number(req.params.projectId);

        if (!Number.isFinite(organizationId) || !Number.isFinite(projectId)) {
            return res.status(400).json({
                errors: { id: ["Invalid organization or project id"] }
            });
        }

        await this.projectsService.remove({ organizationId, projectId });
        return res.status(204).send();
    }
}
