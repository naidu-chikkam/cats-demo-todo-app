import { NextApiResponse } from 'next';
import { db } from '@/db';
import { todos } from '@/db/schema';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

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
  const { id } = req.query;
  const userId = req.user.id;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Todo ID is required' });
  }

  const todoId = parseInt(id);

  switch (method) {
    case 'GET':
      try {
        const todo = await db.query.todos.findFirst({
          where: and(eq(todos.id, todoId), eq(todos.user_id, userId)),
        });

        if (!todo) {
          return res.status(404).json({ error: 'Todo not found' });
        }

        res.status(200).json({ todo });
      } catch (error) {
        console.error('Get todo error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    case 'PUT':
      try {
        const data = updateTodoSchema.parse(req.body);

        const [updatedTodo] = await db
          .update(todos)
          .set({
            ...data,
            updated_at: new Date(),
          })
          .where(and(eq(todos.id, todoId), eq(todos.user_id, userId)))
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
        const deletedTodos = await db
          .delete(todos)
          .where(and(eq(todos.id, todoId), eq(todos.user_id, userId)))
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
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({ error: `Method ${method} not allowed` });
  }
}

export default withAuth(handler);