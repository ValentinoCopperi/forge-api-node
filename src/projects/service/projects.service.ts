import { OrganizationRepository } from "../../organizations/repositories/organization.repository";
import { AppError } from "../../shared/errors/AppError";
import { CreateProjectDto } from "../dtos/projects.dto";
import { ProjectsRepository } from "../repositories/projects.repository";
import { ProjectCreateResponse } from "../types/projects.types";



interface I_ProjectsService {
    create(data: { createProjectDto: CreateProjectDto, createdByUserId: number }): Promise<ProjectCreateResponse>
}

export class ProjectsService implements I_ProjectsService {

    constructor(private readonly projectsRepository: ProjectsRepository, private readonly organizationRepository: OrganizationRepository) { }



    async create(data: { createProjectDto: CreateProjectDto; createdByUserId: number; }): Promise<ProjectCreateResponse> {

        if (!await this.organizationRepository.existsById(data.createProjectDto.organizationId)) {
            throw new AppError(`Organization with id ${data.createProjectDto.organizationId} not found`, 404);
        }

        if (!await this.organizationRepository.userMembershipExists(data.createProjectDto.organizationId, data.createProjectDto.managerId)) {
            throw new AppError(`User with id ${data.createProjectDto.managerId} is not a member of organization with id ${data.createProjectDto.organizationId}`, 403);
        }


        const project = await this.projectsRepository.create(data)

        return project;

    }



}