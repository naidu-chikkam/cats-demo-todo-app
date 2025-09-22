import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Todo {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  user_id: number;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
}

export interface UpdateTodoData {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  completed?: boolean;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    try {
      const response = await fetch('/api/todos');
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await response.json();
      setTodos(data.todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast.error('Failed to load todos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTodo = async (todoData: CreateTodoData) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create todo');
      }

      const data = await response.json();
      setTodos(prev => [data.todo, ...prev]);
      toast.success('Todo created successfully');
      return data.todo;
    } catch (error) {
      console.error('Error creating todo:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create todo');
      throw error;
    }
  };

  const updateTodo = async (id: number, todoData: UpdateTodoData) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update todo');
      }

      const data = await response.json();
      setTodos(prev => prev.map(todo => todo.id === id ? data.todo : todo));
      toast.success('Todo updated successfully');
      return data.todo;
    } catch (error) {
      console.error('Error updating todo:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update todo');
      throw error;
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete todo');
      }

      setTodos(prev => prev.filter(todo => todo.id !== id));
      toast.success('Todo deleted successfully');
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete todo');
      throw error;
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return {
    todos,
    loading,
    createTodo,
    updateTodo,
    deleteTodo,
    refreshTodos: fetchTodos,
  };
}