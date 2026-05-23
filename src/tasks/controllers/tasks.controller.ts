import { TaskService } from "../services/task.service";
import { Request, Response } from 'express'
import { AppError } from '../../shared/errors/AppError';
import { addTaskCommentDto, createTaskDto, getAllTasksByProjectIdFiltersDto } from "../dtos/tasks.dto";
import { logger } from "../../shared/libs/logger/logger";


export class TaskController {

    private logger = logger.child({ module: "TaskController" });

    constructor(private readonly taskService: TaskService) { }



    async create(req: Request, res: Response) {

        const createdByUserId = req.user?.sub;
        if (createdByUserId === undefined) {
            throw new AppError("Unauthorized", 401);
        }
        
        const body = createTaskDto.safeParse(req.body ?? {});
        if (!body.success) {
            return res.status(400).json({
                errors: body.error.flatten().fieldErrors
            });
        }


        const data = await this.taskService.create({ createTaskDto: body.data, createdByUserId });


        return res.status(201).json({ data })
    }

    async findById(req: Request, res: Response) {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            throw new AppError('id is required and must be a number', 400);
        }
        const data = await this.taskService.findById(Number(id));
        return res.status(200).json({ data })
    }

    async findAllByProjectId(req: Request, res: Response) {

        const { projectId } = req.params;

        if (!projectId || isNaN(Number(projectId))) {
            throw new AppError('projectId is required and must be a number', 400);
        }

        const queryParams = getAllTasksByProjectIdFiltersDto.safeParse(req.query)

        if (!queryParams.success) {
            throw new AppError( JSON.stringify(queryParams.error.flatten().fieldErrors), 400);
        }

     

        const data = await this.taskService.findAllByProjectId({ projectId: Number(projectId), filters: queryParams.data });

        return res.status(200).json({ data })

    }

    async addTaskComment(req: Request, res: Response) {
        const { projectId } = req.params;
        if (!projectId || isNaN(Number(projectId))) {
            throw new AppError('projectId is required and must be a number', 400);
        }

        const userId = req.user?.sub;
        if (userId === undefined) {
            throw new AppError("Unauthorized", 401);
        }

        const body = addTaskCommentDto.safeParse(req.body ?? {});

        if (!body.success) {
            return res.status(400).json({
                errors: body.error.flatten().fieldErrors
            });
        }

        const data = await this.taskService.addTaskComment({ addTaskCommentDto: body.data, userId: Number(userId), taskId: Number(projectId) });
        return res.status(201).json({ data })
    }

    async findAllOffsetPaginated(req: Request, res: Response) {

        const { page = 1, limit = 20 } = req.query as {
            page?: number, limit?: number
        };


        const data = await this.taskService.findAllOffsetPaginated({ page : Number(page), limit : Number(limit) });

        return res.status(200).json({ data })

    }


    async findAllCursorPaginated(req: Request, res: Response) {

        const { cursor = 0, limit = 10 } = req.query as {
            cursor?: number, limit?: number
        };

        const data = await this.taskService.findAllCursorPaginated({ cursor: Number(cursor), limit: Number(limit) });

        return res.status(200).json({ data })

    }


   

}
