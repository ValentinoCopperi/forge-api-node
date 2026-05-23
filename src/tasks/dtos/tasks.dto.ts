
import { TaskCategory, TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";

export const createTaskDto = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    category: z.nativeEnum(TaskCategory).optional(),
    designatedTo: z.number().optional(),
    designatedBy: z.number().optional(),
    projectId: z.number(),
    deadline: z.coerce.date().optional(),
});

export type CreateTaskDto = z.infer<typeof createTaskDto>;




export const addTaskCommentDto = z.object({
    content: z.string().min(3),
});

export type AddTaskCommentDto = z.infer<typeof addTaskCommentDto>;



/*
    DTO for get all tasks by project id with category - priority - status - title - createdByUser - designatedByUser.
    All fields are optional.
*/
export const getAllTasksByProjectIdFiltersDto = z.object({
    category: z.nativeEnum(TaskCategory).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    title: z.string().optional(),
    createdByUser: z.coerce.number().optional(),
    designatedByUser:z.coerce.number().optional(),
    deadline: z.coerce.date().optional(),
    designatedTo: z.coerce.number().optional(),
});

export type GetAllTasksByProjectIdFiltersDto = z.infer<typeof getAllTasksByProjectIdFiltersDto>;
