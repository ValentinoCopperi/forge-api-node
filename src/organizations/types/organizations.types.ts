import { Prisma } from "@prisma/client";


/*  
    Response type for the organization create operation
*/
export const organizationCreateSelect = Prisma.validator<Prisma.OrganizationSelect>()({
    id: true,
    name: true,
    description: true,
    updatedAt: true,
})

export type OrganizationCreateResponse = Prisma.OrganizationGetPayload<{
    select : typeof organizationCreateSelect
}>


/*
    Response type for the organizations get all operation
*/
export const organizationsGetAllSelect = Prisma.validator<Prisma.OrganizationSelect>()({
    id: true,
    name: true,
    description: true,
    updatedAt: true,

    _count : {
        select : { organizationUsers : true , projects : true }
    }
})


export type OrganizationsGetAll = Prisma.OrganizationGetPayload<{
    select : typeof organizationsGetAllSelect
}>



/*
    Response type for the organization find one operation
*/


export const organizationFindOneSelect = Prisma.validator<Prisma.OrganizationSelect>()({
    id: true,
    name: true,
    description: true,
    updatedAt: true,
    projects : {
        select : {
            id: true,
            name: true,
            description: true,
            createdAt : true,
            manager : {
                select : {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                }
            }
        }
    },
    organizationUsers : {
        select : {
            id: true,
            role : true,
            user : {
                select : {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                }
            },
        }
    }
})

export type OrganizationFindOneResponse = Prisma.OrganizationGetPayload<{
    select : typeof organizationFindOneSelect
}>




