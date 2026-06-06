import { OrganizationUserRole, PrismaClient } from "@prisma/client";
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
    addProjectToOrganization(data: { organizationId: number, projectId: number }): Promise<void>
    updateDescription(data: { organizationId: number, description: string }): Promise<OrganizationFindOneResponse>
    updateName(data: { organizationId: number, name: string }): Promise<OrganizationFindOneResponse>
    delete(id: number): Promise<void>
}

export class OrganizationRepository implements I_OrganizationRepository {

   


    constructor(private readonly prisma: PrismaClient) { }


    async updateDescription(data: { organizationId: number; description: string; }): Promise<OrganizationFindOneResponse> {
        return this.prisma.organization.update({
            where: { id: data.organizationId },
            data: { description: data.description },
            select: { ...organizationFindOneSelect },
        });
    }
    updateName(data: { organizationId: number; name: string; }): Promise<OrganizationFindOneResponse> {
        return this.prisma.organization.update({
            where: { id: data.organizationId },
            data: { name: data.name },
            select: { ...organizationFindOneSelect },
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.organization.delete({
            where: { id },
        });
    }


    addProjectToOrganization(data: { organizationId: number; projectId: number; }): Promise<void> {
        return this.prisma.$transaction(async (tx) => {
            await tx.organization.update({
                where: { id: data.organizationId },
                data: {
                    projects: {
                        connect: { id: data.projectId },
                    },
                },
            });
        });
    }


    async removeProjectFromOrganization(_data: { organizationId: number, projectId: number }): Promise<void> {
        throw new Error("Method not implemented.");
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
