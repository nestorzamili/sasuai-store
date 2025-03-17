import { z } from 'zod';

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  label: z.string(),
  priority: z.string(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  assignee: z
    .object({
      name: z.string(),
      id: z.string().optional(),
    })
    .optional(),
});

export type Task = z.infer<typeof taskSchema>;
