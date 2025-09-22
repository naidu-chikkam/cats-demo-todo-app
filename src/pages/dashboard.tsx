import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import TodoListView from '@/components/TodoListView';
import TodoKanbanView from '@/components/TodoKanbanView';
import { Button } from '@/components/ui/button';
import { List, LayoutGrid } from 'lucide-react';
import { useTodos } from '@/hooks/useTodos';

type ViewMode = 'list' | 'kanban';

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { todos, loading, createTodo, updateTodo, deleteTodo } = useTodos();

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* View Toggle */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                List View
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                onClick={() => setViewMode('kanban')}
                className="flex items-center gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Kanban Board
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {todos.length} total todos
            </div>
          </div>

          {/* Views */}
          {viewMode === 'list' ? (
            <TodoListView
              todos={todos}
              createTodo={createTodo}
              updateTodo={updateTodo}
              deleteTodo={deleteTodo}
            />
          ) : (
            <TodoKanbanView
              todos={todos}
              createTodo={createTodo}
              updateTodo={updateTodo}
              deleteTodo={deleteTodo}
            />
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}