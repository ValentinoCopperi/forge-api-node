


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

        this.router.post('/:organizationId/projects', requireAddProject, (req, res) => this.projectController.create(req, res));
    }


    getRouter() { return this.router }


}
