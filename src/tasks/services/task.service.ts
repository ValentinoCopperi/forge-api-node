import { AddTaskCommentDto, createTaskDto, CreateTaskDto, GetAllTasksByProjectIdFiltersDto } from "../dtos/tasks.dto";
import { TaskRepository } from "../repositories/tasks.repository";
import { TaskResponse, TaskWithUser } from "../types/tasks.types";
import Redis from "ioredis";
import { ProjectsRepository } from "../../projects/repositories/projects.repository";
import { AppError } from "../../shared/errors/AppError";
import { OrganizationRepository } from "../../organizations/repositories/organization.repository";


interface I_TaskService {

    findAllOffsetPaginated(data: { page: number, limit: number }): Promise<{
        data: TaskWithUser[],
        pagination: {
            totalPages: number,
            currentPage: number,
            totalItems: number
        }
    }>

    findAllCursorPaginated(data: { cursor?: number, limit?: number }): Promise<{
        data: TaskWithUser[],
        nextCursor: number | null
    }
    >

    create(data: { createTaskDto: CreateTaskDto, createdByUserId: number }): Promise<TaskResponse>

    addTaskComment(data: { addTaskCommentDto: AddTaskCommentDto, userId: number, taskId: number }): Promise<TaskResponse>

    findById(id: number): Promise<TaskResponse | null>

    findAllByProjectId(data: { projectId: number; filters: GetAllTasksByProjectIdFiltersDto }): Promise<TaskResponse[]>


}


export class TaskService implements I_TaskService {

    constructor(
        private readonly taskRepository: TaskRepository,
        private readonly redisClient: Redis,
        private readonly projectsRepository: ProjectsRepository,
        private readonly organizationRepository: OrganizationRepository
    ) { }



    async create(data: { createTaskDto: CreateTaskDto; createdByUserId: number; }): Promise<TaskResponse> {


        const project = await this.projectsRepository.findById(data.createTaskDto.projectId);

        if (!project) {
            throw new AppError(`project with id ${data.createTaskDto.projectId} not found`, 404);
        }

        if ( data.createTaskDto.deadline && data.createTaskDto.deadline < new Date() ) {
            throw new AppError(`deadline must be in the future`, 400);
        }

        if( !await this.organizationRepository.userMembershipExists(project.organizationId, data.createdByUserId) ) {
            throw new AppError(`user with id ${data.createdByUserId} is not a member of organization with id ${project.organizationId}`, 403);
        }


        const task = await this.taskRepository.create(data);

        return task;
    }


    addTaskComment(data: { addTaskCommentDto: AddTaskCommentDto; userId: number; taskId: number; }): Promise<TaskResponse> {
        return this.taskRepository.addTaskComment(data);
    }

    findAllByProjectId(data: { projectId: number; filters: GetAllTasksByProjectIdFiltersDto }): Promise<TaskResponse[]> {
        return this.taskRepository.findAllByProjectId(data);
    }

    findById(id: number): Promise<TaskResponse | null> {
        return this.taskRepository.findById(id);
    }


    /*
        Offset-based pagination:
        Usa page (página) y limit (items por página).
        
        Ejemplo:
        page=1, limit=5 → trae items 0–4
        page=2, limit=5 → trae items 5–9
        
        
        ✅Ventajas: Permite saltar directamente a cualquier página (ej: page=50).
        ❌Desventajas:
            * Problemas de consistencia: si se insertan o eliminan registros mientras navegas,
                los resultados pueden moverse → duplicados o faltantes.
            * Performance: en bases de datos grandes, OFFSET alto es costoso porque el motor
                debe recorrer muchos registros antes de devolver resultados.
   */

    async findAllOffsetPaginated(data: { page: number; limit: number; }): Promise<{
        data: TaskWithUser[];
        pagination: {
            currentPage: number;
            totalItems: number;
            totalPages: number;
        };
    }> {

        const { page, limit } = data;

        const [results, totalCount] = await Promise.all([
            this.taskRepository.findAllOffsetPaginated({ page, limit }),
            this.taskRepository.count()
        ]);

        return {
            data: results,
            pagination: {
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                totalItems: totalCount
            }
        }

    }


    /*
        Cursor-based pagination: En vez de usar páginas (1,2,3...), usa el ID del último elemento devuelto como "cursor".
        Ejemplo: (Twitter) limit=5 -> trae 5 tareas. El nextCursor devuelto es el ID de la última tarea.
        Para la siguiente llamada, pasas ese nextCursor y te trae las siguientes 5 tareas desde ese punto.

        ✅ Ventaja: Rápido sin importar el volumen — siempre usa índice
        ❌ Desventaja: No podésimport { getAllTasksByProjectIdFiltersDto } from './../dtos/tasks.dto';
 saltar a una página específica
    */
    async findAllCursorPaginated(data: { cursor?: number; limit?: number; }): Promise<{
        data: TaskWithUser[],
        nextCursor: number | null
    }> {

        const results = await this.taskRepository.findAllCursorPaginated(data)

        const nextCursor =
            results.length > 0
                ? results[results.length - 1].id
                : null

        return { data: results, nextCursor };

    }





}
