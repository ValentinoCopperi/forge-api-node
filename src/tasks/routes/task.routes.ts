import { Router } from 'express'
import { TaskController } from '../controllers/tasks.controller';


export class TaskRoutes {

    private router: Router;

    constructor(
        private readonly taskController: TaskController
    ) {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes() {

        

        this.router.get('/project/:projectId', (req, res) => this.taskController.findAllByProjectId(req, res))

        this.router.get('/:id', (req, res) => this.taskController.findById(req, res))

        this.router.post('/:projectId/comments', (req, res) => this.taskController.addTaskComment(req, res))

        this.router.post('/:projectId', (req, res) => this.taskController.create(req, res))


        this.router.get('/cursorPaginated' , (req, res) => this.taskController.findAllCursorPaginated(req, res))

        this.router.get('/offsetPaginated' , (req, res) => this.taskController.findAllOffsetPaginated(req, res))


        this.router.get('/fast', (req, res) => {
            res.json({ message: "pong", timestamp: Date.now() })
        })

        this.router.get('/block/:ms_to_block', (req, res) => {

            const { ms_to_block } = req.params;

            if (!ms_to_block) res.status(400).json({ error: 'ms_to_block is required' });

            const end = Date.now() + Number(ms_to_block);

            while (Date.now() < end) {

            }

            return res.status(200).json({ message: 'Finished!' });

        })


        this.router.get('/async', (req, res) => {

            setTimeout(
                () => {
                    return res.status(200).json({ message: 'Finished!' });
                }, 5000
            )

        })
    }


    getRouter() { return this.router }



}
