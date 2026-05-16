import { OrganizationUserRole, PrismaClient } from "@prisma/client";
import { AddUserToOrganizationDto, CreateOrganizationDto } from "../dtos/organizations.dto";
import { OrganizationCreateResponse, organizationCreateSelect, OrganizationFindOneResponse, organizationFindOneSelect, OrganizationsGetAll, organizationsGetAllSelect } from "../types/organizations.types";
import { logger } from "../../shared/libs/logger/logger";


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
}

export class OrganizationRepository implements I_OrganizationRepository {

    private readonly logger = logger.child({
        repository: "OrganizationRepository",
    });


    constructor(private readonly prisma: PrismaClient) { }


    addProjectToOrganization(data: { organizationId: number; projectId: number; }): Promise<void> {
        throw new Error("Method not implemented.");
    }


    async removeProjectFromOrganization(data: { organizationId: number, projectId: number }): Promise<void> {
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

        this.logger.info({ organizationId, userId, row }, "findMembershipRole");

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
