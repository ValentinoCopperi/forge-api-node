import { OrganizationUserRole, PrismaClient, ProjectStatus } from "@prisma/client";
import { AddUserToOrganizationDto, CreateOrganizationDto } from "../dtos/organizations.dto";
import { OrganizationCreateResponse, organizationCreateSelect, OrganizationFindOneResponse, organizationFindOneSelect, OrganizationsGetAll, organizationsGetAllSelect } from "../types/organizations.types";


interface I_OrganizationRepository {
    create(data: CreateOrganizationDto, ownerUserId: number): Promise<OrganizationCreateResponse>
    findAll(): Promise<OrganizationsGetAll[]>
    findById(id: number): Promise<OrganizationFindOneResponse | null>
    existsById(id: number): Promise<boolean>
    userMembershipExists(organizationId: number, userId: number): Promise<boolean>
    findMembershipRole(organizationId: number, userId: number): Promise<OrganizationUserRole | null>
    insertOrganizationUser(data: AddUserToOrganizationDto): Promise<void>
    deleteOrganizationUser(organizationId: number, userId: number): Promise<void>
    addProjectToOrganization(data: { organizationId: number, projectId: number }): Promise<void>
    removeProjectFromOrganization(data: { organizationId: number, projectId: number }): Promise<void>
    updateOrganization(data: { organizationId: number, name?: string, description?: string }): Promise<OrganizationFindOneResponse>
    updateUserOrganizationRole(data: { organizationId: number, userId: number, role: OrganizationUserRole }): Promise<void>
    softDelete(id: number): Promise<void>
}

export class OrganizationRepository implements I_OrganizationRepository {

   


    constructor(private readonly prisma: PrismaClient) { }


    async updateOrganization(data: {
        organizationId: number;
        name?: string;
        description?: string;
    }): Promise<OrganizationFindOneResponse> {
        return this.prisma.organization.update({
            where: { id: data.organizationId },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.description !== undefined
                    ? { description: data.description }
                    : {}),
            },
            select: { ...organizationFindOneSelect },
        });
    }

    async updateUserOrganizationRole(data: {
        organizationId: number;
        userId: number;
        role: OrganizationUserRole;
    }): Promise<void> {
        await this.prisma.organizationUser.updateMany({
            where: {
                organizationId: data.organizationId,
                userId: data.userId,
            },
            data: { role: data.role },
        });
    }

    async softDelete(id: number): Promise<void> {
        await this.prisma.organization.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    addProjectToOrganization(data: { organizationId: number; projectId: number; }): Promise<void> {
        return this.prisma.$transaction(async (tx) => {
            await tx.project.update({
                where: { id: data.projectId },
                data: { organizationId: data.organizationId },
            });
        });
    }

    async removeProjectFromOrganization(data: {
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


    async insertOrganizationUser(data: AddUserToOrganizationDto): Promise<void> {

        const { organizationId, userId, role } = data;

        await this.prisma.organizationUser.create({
            data: {
                organizationId,
                userId,
                role,
            }
        })

    }


    async deleteOrganizationUser(organizationId: number, userId: number): Promise<void> {

        await this.prisma.organizationUser.deleteMany({
            where: { organizationId, userId },
        })

    }


    async userMembershipExists(organizationId: number, userId: number): Promise<boolean> {

        const row = await this.prisma.organizationUser.findFirst({
            where: { organizationId, userId },
        })
        return !!row;
    }

    async findMembershipRole(organizationId: number, userId: number): Promise<OrganizationUserRole | null> {

        const row = await this.prisma.organizationUser.findFirst({
            where: { organizationId, userId },
            select: { role: true },
        });

        // this.logger.info({ organizationId, userId, row }, "findMembershipRole");

        return row?.role ?? null;
    }


    async existsById(id: number): Promise<boolean> {

        const organization = await this.prisma.organization.findFirst({
            where: { id, deletedAt: null },
            select: { id: true },
        })

        return !!organization;
    }


    async findById(id: number): Promise<OrganizationFindOneResponse | null> {

        return this.prisma.organization.findFirst({
            where: { id, deletedAt: null },
            select: { ...organizationFindOneSelect }
        })

    }


    async findAll(): Promise<OrganizationsGetAll[]> {

        return this.prisma.organization.findMany({
            where: { deletedAt: null },
            select: { ...organizationsGetAllSelect }
        })
    }


    async create(data: CreateOrganizationDto, ownerUserId: number): Promise<OrganizationCreateResponse> {

        return this.prisma.$transaction(async (tx) => {

            const organization = await tx.organization.create({
                data: {
                    ...data,
                    createdByUserId: ownerUserId,
                },
                select: { ...organizationCreateSelect }
            });

            await tx.organizationUser.create({
                data: {
                    organizationId: organization.id,
                    userId: ownerUserId,
                    role: OrganizationUserRole.OWNER,
                },
            });

            return organization;
        });

    }

}
