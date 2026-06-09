import { Router } from 'express'
import { ProjectController } from '../controller/project.controller';
import { createRequireOrganizationPermission, organizationIdFromParam } from '../../organizations/middlewares/organizations.middleware';
import { OrganizationRepository } from '../../organizations/repositories/organization.repository';

export class ProjectsRoutes {

    private router: Router;

    constructor(
        private readonly projectController: ProjectController,
        private readonly organizationRepository: OrganizationRepository,
    ) {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes() {

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

        this.router.get('/:organizationId/projects', (req, res) =>
            this.projectController.findAllByOrganization(req, res),
        );

        this.router.get('/:organizationId/projects/:projectId', (req, res) =>
            this.projectController.findOne(req, res),
        );

        this.router.post('/:organizationId/projects', requireAddProject, (req, res) =>
            this.projectController.create(req, res),
        );

        this.router.patch('/:organizationId/projects/:projectId', requireAddProject, (req, res) =>
            this.projectController.update(req, res),
        );

        this.router.delete('/:organizationId/projects/:projectId', requireRemoveProject, (req, res) =>
            this.projectController.remove(req, res),
        );
    }

    getRouter() { return this.router }
}
