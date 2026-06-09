import { OrganizationRepository } from "../../organizations/repositories/organization.repository";
import { AppError } from "../../shared/errors/AppError";
import { CreateProjectDto, UpdateProjectDto } from "../dtos/projects.dto";
import { ProjectsRepository } from "../repositories/projects.repository";
import { ProjectResponse } from "../types/projects.types";

interface I_ProjectsService {
    create(data: { createProjectDto: CreateProjectDto, createdByUserId: number }): Promise<ProjectResponse>
    findAllByOrganization(organizationId: number): Promise<ProjectResponse[]>
    findOne(data: { organizationId: number, projectId: number }): Promise<ProjectResponse>
    update(data: { organizationId: number, projectId: number, updateProjectDto: UpdateProjectDto }): Promise<ProjectResponse>
    remove(data: { organizationId: number, projectId: number }): Promise<void>
}

export class ProjectsService implements I_ProjectsService {

    constructor(
        private readonly projectsRepository: ProjectsRepository,
        private readonly organizationRepository: OrganizationRepository,
    ) { }

    async create(data: { createProjectDto: CreateProjectDto; createdByUserId: number; }): Promise<ProjectResponse> {

        if (!await this.organizationRepository.existsById(data.createProjectDto.organizationId)) {
            throw new AppError(`Organization with id ${data.createProjectDto.organizationId} not found`, 404);
        }

        if (!await this.organizationRepository.userMembershipExists(data.createProjectDto.organizationId, data.createProjectDto.managerId)) {
            throw new AppError(`User with id ${data.createProjectDto.managerId} is not a member of organization with id ${data.createProjectDto.organizationId}`, 403);
        }

        return this.projectsRepository.create(data);
    }

    async findAllByOrganization(organizationId: number): Promise<ProjectResponse[]> {
        if (!await this.organizationRepository.existsById(organizationId)) {
            throw new AppError(`Organization with id ${organizationId} not found`, 404);
        }

        return this.projectsRepository.findAllByOrganizationId(organizationId);
    }

    async findOne(data: { organizationId: number, projectId: number }): Promise<ProjectResponse> {
        const project = await this.projectsRepository.findByOrganizationAndId(data);

        if (!project) {
            throw new AppError(`Project with id ${data.projectId} not found`, 404);
        }

        return project;
    }

    async update(data: {
        organizationId: number;
        projectId: number;
        updateProjectDto: UpdateProjectDto;
    }): Promise<ProjectResponse> {
        await this.findOne({
            organizationId: data.organizationId,
            projectId: data.projectId,
        });

        if (data.updateProjectDto.managerId) {
            const isMember = await this.organizationRepository.userMembershipExists(
                data.organizationId,
                data.updateProjectDto.managerId,
            );

            if (!isMember) {
                throw new AppError(
                    `User with id ${data.updateProjectDto.managerId} is not a member of organization with id ${data.organizationId}`,
                    403,
                );
            }

            await this.projectsRepository.updateManager({
                projectId: data.projectId,
                managerId: data.updateProjectDto.managerId,
            });
        }

        if (data.updateProjectDto.name) {
            await this.projectsRepository.updateName({
                projectId: data.projectId,
                name: data.updateProjectDto.name,
            });
        }

        if (data.updateProjectDto.description !== undefined) {
            await this.projectsRepository.updateDescription({
                projectId: data.projectId,
                description: data.updateProjectDto.description,
            });
        }

        if (data.updateProjectDto.status) {
            await this.projectsRepository.updateStatus({
                projectId: data.projectId,
                status: data.updateProjectDto.status,
            });
        }

        return this.findOne({
            organizationId: data.organizationId,
            projectId: data.projectId,
        });
    }

    async remove(data: { organizationId: number, projectId: number }): Promise<void> {
        await this.findOne(data);
        await this.projectsRepository.softDelete(data);
    }
}
