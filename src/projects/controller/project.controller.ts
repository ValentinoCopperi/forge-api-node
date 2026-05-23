import { Request, Response } from "express";
import { AppError } from "../../shared/errors/AppError";
import { createProjectDto } from "../dtos/projects.dto";
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

}
