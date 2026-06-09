import { PrismaClient, ProjectStatus } from "@prisma/client";
import { CreateProjectDto } from "../dtos/projects.dto";
import { projectCreateSelect, ProjectResponse } from "../types/projects.types";



interface I_ProjectsRepository {

    create(data: { createProjectDto: CreateProjectDto, createdByUserId: number }): Promise<ProjectResponse>

    existsById(id: number): Promise<boolean>

    findById(id: number): Promise<ProjectResponse | null>

    updateManager(data: { projectId: number, managerId: number }): Promise<ProjectResponse>

    updateStatus(data: { projectId: number, status: ProjectStatus }): Promise<ProjectResponse>

    updateDescription(data: { projectId: number, description: string }): Promise<ProjectResponse>

    updateName(data: { projectId: number, name: string }): Promise<ProjectResponse>

    delete(id: number): Promise<void>

    findAllByOrganizationId(organizationId: number): Promise<ProjectResponse[]>

    findByOrganizationAndId(data: {
        organizationId: number;
        projectId: number;
    }): Promise<ProjectResponse | null>

    softDelete(data: { organizationId: number; projectId: number }): Promise<void>
}



export class ProjectsRepository implements I_ProjectsRepository {

    constructor(private readonly prisma: PrismaClient) { }




    updateStatus(data: { projectId: number, status: ProjectStatus }): Promise<ProjectResponse> {
        return this.prisma.project.update({
            where: { id: data.projectId },
            data: { status: data.status },
            select: { ...projectCreateSelect },
        });
    }


    updateDescription(data: { projectId: number, description: string }): Promise<ProjectResponse> {
        return this.prisma.project.update({
            where: { id: data.projectId },
            data: { description: data.description },
            select: { ...projectCreateSelect },
        });
    }

    updateName(data: { projectId: number, name: string }): Promise<ProjectResponse> {
        return this.prisma.project.update({
            where: { id: data.projectId },
            data: { name: data.name },
            select: { ...projectCreateSelect },
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.project.delete({
            where: { id },
        });
    }

    findAllByOrganizationId(organizationId: number): Promise<ProjectResponse[]> {
        return this.prisma.project.findMany({
            where: { organizationId, deletedAt: null },
            select: { ...projectCreateSelect },
            orderBy: { createdAt: 'desc' },
        });
    }

    findByOrganizationAndId(data: {
        organizationId: number;
        projectId: number;
    }): Promise<ProjectResponse | null> {
        return this.prisma.project.findFirst({
            where: {
                id: data.projectId,
                organizationId: data.organizationId,
                deletedAt: null,
            },
            select: { ...projectCreateSelect },
        });
    }

    async softDelete(data: {
        organizationId: number;
        projectId: number;
    }): Promise<void> {
        await this.prisma.project.updateMany({
            where: {
                id: data.projectId,
                organizationId: data.organizationId,
                deletedAt: null,
            },
            data: {
                deletedAt: new Date(),
                status: ProjectStatus.DELETED,
            },
        });
    }



    updateManager(data: { projectId: number; managerId: number; }): Promise<ProjectResponse> {
        return this.prisma.project.update({
            where: { id: data.projectId },
            data: { managerId: data.managerId },
            select: { ...projectCreateSelect },
        });
    }


    async findById(id: number): Promise<ProjectResponse | null> {
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


    create(data: { createProjectDto: CreateProjectDto, createdByUserId: number }): Promise<ProjectResponse> {
        return this.prisma.project.create({
            data: {
                ...data.createProjectDto,
                createdByUserId: data.createdByUserId,
            },
            select: { ...projectCreateSelect }
        })
    }


}