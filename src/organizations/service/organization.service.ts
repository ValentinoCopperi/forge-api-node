import {
    AddUserToOrganizationDto,
    CreateOrganizationDto,
    OrganizationProjectRelationDto,
    RemoveUserFromOrganizationDto,
    UpdateOrganizationDto,
    UpdateUserOrganizationRoleDto,
} from "../dtos/organizations.dto";
import { OrganizationRepository } from "../repositories/organization.repository";
import {
    OrganizationCreateResponse,
    OrganizationFindOneResponse,
    OrganizationsGetAll,
} from "../types/organizations.types";
import { AppError } from "../../shared/errors/AppError";

interface I_OrganizationService {
    create(createOrganization: CreateOrganizationDto, userId: number): Promise<OrganizationCreateResponse>
    findAll(): Promise<OrganizationsGetAll[]>
    findOne(id: number): Promise<OrganizationFindOneResponse>
    update(id: number, data: UpdateOrganizationDto): Promise<OrganizationFindOneResponse>
    remove(id: number): Promise<void>
    addUserToOrganization(data: AddUserToOrganizationDto): Promise<void>
    removeUserFromOrganization(data: RemoveUserFromOrganizationDto): Promise<void>
    updateUserOrganizationRole(data: UpdateUserOrganizationRoleDto): Promise<void>
    addProjectToOrganization(data: OrganizationProjectRelationDto): Promise<void>
    removeProjectFromOrganization(data: OrganizationProjectRelationDto): Promise<void>
}

export class OrganizationService implements I_OrganizationService {

    constructor(private readonly organizationRepository: OrganizationRepository) { }

    async create(data: CreateOrganizationDto, userId: number): Promise<OrganizationCreateResponse> {
        return this.organizationRepository.create(data, userId);
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

    async update(id: number, data: UpdateOrganizationDto): Promise<OrganizationFindOneResponse> {
        if (!(await this.organizationRepository.existsById(id))) {
            throw new AppError(`Organization with id ${id} not found`, 404);
        }

        return this.organizationRepository.updateOrganization({
            organizationId: id,
            ...data,
        });
    }

    async remove(id: number): Promise<void> {
        if (!(await this.organizationRepository.existsById(id))) {
            throw new AppError(`Organization with id ${id} not found`, 404);
        }

        await this.organizationRepository.softDelete(id);
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

    async updateUserOrganizationRole(data: UpdateUserOrganizationRoleDto): Promise<void> {
        const { organizationId, userId } = data;

        if (!(await this.organizationRepository.existsById(organizationId))) {
            throw new AppError(`Organization with id ${organizationId} not found`, 404);
        }

        if (!(await this.organizationRepository.userMembershipExists(organizationId, userId))) {
            throw new AppError(`User with id ${userId} not found in organization with id ${organizationId}`, 404);
        }

        await this.organizationRepository.updateUserOrganizationRole(data);
    }

    async addProjectToOrganization(data: OrganizationProjectRelationDto): Promise<void> {
        if (!(await this.organizationRepository.existsById(data.organizationId))) {
            throw new AppError(`Organization with id ${data.organizationId} not found`, 404);
        }

        await this.organizationRepository.addProjectToOrganization(data);
    }

    async removeProjectFromOrganization(data: OrganizationProjectRelationDto): Promise<void> {
        if (!(await this.organizationRepository.existsById(data.organizationId))) {
            throw new AppError(`Organization with id ${data.organizationId} not found`, 404);
        }

        await this.organizationRepository.removeProjectFromOrganization(data);
    }
}
