import { TaskService } from "../services/task.service";
import { Request, Response } from 'express'
import { AppError } from '../../shared/errors/AppError';
import { createTaskDto } from "../dtos/tasks.dto";


export class TaskController {

    constructor(private readonly taskService: TaskService) { }

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


    async findAll(req: Request, res: Response) {


        const data = await this.taskService.findAll()

        return res.status(200).json({ data })

    }

    async create(req: Request, res: Response) {



        // const body = createTaskDto.safeParse(req.body);

        // if (!body.success) {
        //     return res.status(400).json({
        //         errors: body.error.flatten().fieldErrors
        //     })
        // }

        // const new_task = await this.taskService.create({
        //     title: body.data.title,
        //     userId: req.user?.sub ?? 1
        // });

        // return res.status(200).json({ data: new_task })




    }

}
