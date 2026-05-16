import { Router } from 'express'
import { OrganizationController } from '../controller/organization.controller';
import { OrganizationRepository } from '../repositories/organization.repository';
import { Role } from '@prisma/client';
import { roleMiddleware } from '../../auth/middlewares/auth.middleware';
import {
    createRequireOrganizationPermission,
    mergeBodyOrganizationIdFromParams,
    organizationIdFromParam,
} from '../middlewares/organizations.middleware';

export class OrganizationRoutes {

    private router: Router;

    constructor(
        private readonly organizationController: OrganizationController,
        private readonly organizationRepository: OrganizationRepository,
    ) {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes() {

        const requireAddUser = createRequireOrganizationPermission(
            this.organizationRepository,
            'add-user',
            { resolveOrganizationId: organizationIdFromParam('organizationId') },
        );

        
        this.router.post(
            '/:organizationId/users',
            mergeBodyOrganizationIdFromParams('organizationId'),
            requireAddUser,
            (req, res) => this.organizationController.addUserToOrganization(req, res),
        );

        this.router.get('/', (req, res) => this.organizationController.findAll(req, res));

        this.router.get('/:id', (req, res) => this.organizationController.findOne(req, res));

        this.router.post('/', roleMiddleware([Role.DIRECTOR, Role.GERENTE]), (req, res) => this.organizationController.create(req, res));
    }


    getRouter() { return this.router }


}
