import { AddUserToOrganizationDto, CreateOrganizationDto, RemoveUserFromOrganizationDto } from "../dtos/organizations.dto";
import { OrganizationRepository } from "../repositories/organization.repository";
import {
    OrganizationCreateResponse,
    OrganizationFindOneResponse,
    OrganizationsGetAll,
} from "../types/organizations.types";
import { AppError } from "../../shared/errors/AppError";


interface I_OrganizationService {
    create(data: CreateOrganizationDto): Promise<OrganizationCreateResponse>
    findAll(): Promise<OrganizationsGetAll[]>
    findOne(id: number): Promise<OrganizationFindOneResponse>
    addUserToOrganization(data: AddUserToOrganizationDto): Promise<void>
    removeUserFromOrganization(data: RemoveUserFromOrganizationDto): Promise<void>
    addProjectToOrganization(data: { organizationId: number, projectId: number }): Promise<void>
    removeProjectFromOrganization(data: { organizationId: number, projectId: number }): Promise<void>
}


export class OrganizationService implements I_OrganizationService {

    constructor(private readonly organizationRepository: OrganizationRepository) { }


    async create(data: CreateOrganizationDto): Promise<OrganizationCreateResponse> {
        return this.organizationRepository.create(data);
    }

    async findAll(): Promise<OrganizationsGetAll[]> {
        return this.organizationRepository.findAll();
    }

    async findOne(id: number): Promise<OrganizationFindOneResponse> {
        const organization = await this.organizationRepository.findById(id);

        if (!organization) {
            throw new AppError(`Organization with id ${id} not found`, 404);
        }

        return organization;
    }

    async addUserToOrganization(data: AddUserToOrganizationDto): Promise<void> {
        const { organizationId, userId } = data;

        const organizationExists = await this.organizationRepository.existsById(organizationId);

        if (!organizationExists) {
            throw new AppError(`Organization with id ${organizationId} not found`, 404);
        }

        const membershipExists = await this.organizationRepository.userMembershipExists(organizationId, userId);

        if (membershipExists) {
            throw new AppError(`User with id ${userId} already exists in organization with id ${organizationId}`, 409);
        }

        await this.organizationRepository.insertOrganizationUser(data);
    }

    async removeUserFromOrganization(data: RemoveUserFromOrganizationDto): Promise<void> {
        const { organizationId, userId } = data;

        const organizationExists = await this.organizationRepository.existsById(organizationId);

        if (!organizationExists) {
            throw new AppError(`Organization with id ${organizationId} not found`, 404);
        }

        const membershipExists = await this.organizationRepository.userMembershipExists(organizationId, userId);

        if (!membershipExists) {
            throw new AppError(`User with id ${userId} not found in organization with id ${organizationId}`, 404);
        }

        await this.organizationRepository.deleteOrganizationUser(organizationId, userId);
    }

    addProjectToOrganization(data: { organizationId: number, projectId: number }): Promise<void> {
        return this.organizationRepository.addProjectToOrganization(data);
    }

    removeProjectFromOrganization(data: { organizationId: number, projectId: number }): Promise<void> {
        return this.organizationRepository.removeProjectFromOrganization(data);
    }
}
