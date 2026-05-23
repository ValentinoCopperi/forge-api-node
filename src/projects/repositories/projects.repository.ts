import { PrismaClient } from "@prisma/client";
import { CreateProjectDto } from "../dtos/projects.dto";
import { ProjectCreateResponse, projectCreateSelect } from "../types/projects.types";



interface I_ProjectsRepository {

    create(data: { createProjectDto: CreateProjectDto, createdByUserId: number }): Promise<ProjectCreateResponse>

    existsById(id: number): Promise<boolean>

    findById(id: number): Promise<ProjectCreateResponse | null>

}



export class ProjectsRepository implements I_ProjectsRepository {

    constructor(private readonly prisma: PrismaClient) { }


    async findById(id: number): Promise<ProjectCreateResponse | null> {
        return this.prisma.project.findFirst({
            where: { id, deletedAt: null },
            select: { ...projectCreateSelect },
        });
    }

 
    async existsById(id: number): Promise<boolean> {
        const project = await this.prisma.project.findFirst({
            where: { id, deletedAt: null },
            select: { id: true },
        });
        return !!project;
    }


    create(data: { createProjectDto: CreateProjectDto, createdByUserId: number }): Promise<ProjectCreateResponse> {
        return this.prisma.project.create({
            data: {
                ...data.createProjectDto,
                createdByUserId: data.createdByUserId,
            },
            select: { ...projectCreateSelect }
        })
    }


}