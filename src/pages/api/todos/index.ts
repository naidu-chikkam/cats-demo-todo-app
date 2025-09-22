import { NextApiResponse } from 'next';
import { db } from '@/db';
import { todos } from '@/db/schema';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: z.string().optional().transform((date) => date ? new Date(date) : undefined),
});

const updateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  due_date: z.string().optional().transform((date) => date ? new Date(date) : null),
  completed: z.boolean().optional(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;
  const userId = req.user.id;

  switch (method) {
    case 'GET':
      try {
        const userTodos = await db.query.todos.findMany({
          where: eq(todos.user_id, userId),
          orderBy: (todos, { desc }) => [desc(todos.created_at)],
        });

        res.status(200).json({ todos: userTodos });
      } catch (error) {
        console.error('Get todos error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    case 'POST':
      try {
        const data = createTodoSchema.parse(req.body);

        const [newTodo] = await db
          .insert(todos)
          .values({
            ...data,
            user_id: userId,
            updated_at: new Date(),
          })
          .returning();

        res.status(201).json({ todo: newTodo });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.issues[0].message });
        }
        console.error('Create todo error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    case 'PUT':
      try {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'Todo ID is required' });
        }

        const data = updateTodoSchema.parse(req.body);

        const [updatedTodo] = await db
          .update(todos)
          .set({
            ...data,
            updated_at: new Date(),
          })
          .where(and(eq(todos.id, parseInt(id)), eq(todos.user_id, userId)))
          .returning();

        if (!updatedTodo) {
          return res.status(404).json({ error: 'Todo not found' });
        }

        res.status(200).json({ todo: updatedTodo });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.issues[0].message });
        }
        console.error('Update todo error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'Todo ID is required' });
        }

        const deletedTodos = await db
          .delete(todos)
          .where(and(eq(todos.id, parseInt(id)), eq(todos.user_id, userId)))
          .returning();

        if (deletedTodos.length === 0) {
          return res.status(404).json({ error: 'Todo not found' });
        }

        res.status(200).json({ message: 'Todo deleted successfully' });
      } catch (error) {
        console.error('Delete todo error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ error: `Method ${method} not allowed` });
  }
}

export default withAuth(handler);