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

        const requireRemoveUser = createRequireOrganizationPermission(
            this.organizationRepository,
            'remove-user',
            { resolveOrganizationId: organizationIdFromParam('organizationId') }
        );

        const requireUpdateUserRole = createRequireOrganizationPermission(
            this.organizationRepository,
            'update-user-role',
            { resolveOrganizationId: organizationIdFromParam('organizationId') },
        );

        const requireUpdate = createRequireOrganizationPermission(
            this.organizationRepository,
            'update',
            { resolveOrganizationId: organizationIdFromParam('id') },
        );

        const requireDelete = createRequireOrganizationPermission(
            this.organizationRepository,
            'delete',
            { resolveOrganizationId: organizationIdFromParam('id') },
        );

        const requireAddProject = createRequireOrganizationPermission(
            this.organizationRepository,
            'add-project',
            { resolveOrganizationId: organizationIdFromParam('organizationId') },
        );

        const requireRemoveProject = createRequireOrganizationPermission(
            this.organizationRepository,
            'remove-project',
            { resolveOrganizationId: organizationIdFromParam('organizationId') },
        );

        this.router.get('/', (req, res) => this.organizationController.findAll(req, res));

        this.router.post('/', roleMiddleware([Role.DIRECTOR, Role.GERENTE]), (req, res) => this.organizationController.create(req, res));

        this.router.post(
            '/:organizationId/users',
            mergeBodyOrganizationIdFromParams('organizationId'),
            requireAddUser,
            (req, res) => this.organizationController.addUserToOrganization(req, res),
        );

        this.router.patch(
            '/:organizationId/users',
            mergeBodyOrganizationIdFromParams('organizationId'),
            requireUpdateUserRole,
            (req, res) => this.organizationController.updateUserOrganizationRole(req, res),
        );

        this.router.delete(
            '/:organizationId/users',
            mergeBodyOrganizationIdFromParams('organizationId'),
            requireRemoveUser,
            (req, res) => this.organizationController.removeUserFromOrganization(req, res),
        );

        this.router.post(
            '/:organizationId/projects/link',
            mergeBodyOrganizationIdFromParams('organizationId'),
            requireAddProject,
            (req, res) => this.organizationController.addProjectToOrganization(req, res),
        );

        this.router.delete(
            '/:organizationId/projects/link',
            mergeBodyOrganizationIdFromParams('organizationId'),
            requireRemoveProject,
            (req, res) => this.organizationController.removeProjectFromOrganization(req, res),
        );

        this.router.get('/:id', (req, res) => this.organizationController.findOne(req, res));

        this.router.patch('/:id', requireUpdate, (req, res) => this.organizationController.update(req, res));

        this.router.delete('/:id', requireDelete, (req, res) => this.organizationController.remove(req, res));
    }

    getRouter() { return this.router }
}
