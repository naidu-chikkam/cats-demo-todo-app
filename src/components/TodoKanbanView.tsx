import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Edit, Trash2, Plus } from 'lucide-react';
import { Todo } from '@/hooks/useTodos';
import TodoForm from './TodoForm';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const columns = [
  { id: 'todo', title: 'To Do', status: 'todo' as const },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress' as const },
  { id: 'completed', title: 'Completed', status: 'completed' as const },
];

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

function TodoCard({ todo, onEdit, onDelete }: TodoCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-move transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-105' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <h3 className="font-semibold text-sm line-clamp-2">{todo.title}</h3>
          {todo.description && (
            <p className="text-xs text-muted-foreground line-clamp-3">
              {todo.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <Badge className={priorityColors[todo.priority]} variant="outline">
              {todo.priority}
            </Badge>
            {todo.due_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {new Date(todo.due_date).toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(todo);
              }}
              className="h-7 w-7 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(todo.id);
              }}
              className="h-7 w-7 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface KanbanColumnProps {
  column: typeof columns[0];
  todos: Todo[];
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onAddTodo: (status: Todo['status']) => void;
}

function KanbanColumn({ column, todos, onEdit, onDelete, onAddTodo }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.status,
  });

  return (
    <div className="flex-1 min-w-80">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{column.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{todos.length}</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddTodo(column.status)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div ref={setNodeRef} className="space-y-3 min-h-[200px]">
            <SortableContext items={todos.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {todos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </SortableContext>
            {todos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Drop todos here or click + to add
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface TodoKanbanViewProps {
  todos: Todo[];
  createTodo: (data: any) => Promise<void>;
  updateTodo: (id: number, data: any) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
}

export default function TodoKanbanView({ todos, createTodo, updateTodo, deleteTodo }: TodoKanbanViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [newTodoStatus, setNewTodoStatus] = useState<Todo['status']>('todo');
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const todo = todos.find(t => t.id === event.active.id);
    setActiveTodo(todo || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    // If dropping on the same item, do nothing
    if (activeId === overId) return;
    
    // Find which column we're over
    let newStatus: Todo['status'] | null = null;
    
    // Check if we're over a column directly
    if (typeof overId === 'string' && ['todo', 'in_progress', 'completed'].includes(overId)) {
      newStatus = overId as Todo['status'];
    } else {
      // Check if we're over a todo item and get its status
      const overTodo = todos.find(todo => todo.id === overId);
      if (overTodo) {
        newStatus = overTodo.status;
      }
    }
    
    if (!newStatus) return;
    
    const draggedTodo = todos.find(todo => todo.id === activeId);
    if (!draggedTodo || draggedTodo.status === newStatus) return;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTodo(null);

    if (!over) return;

    const todoId = active.id as number;
    const newStatus = over.id as Todo['status'];
    
    const todo = todos.find(t => t.id === todoId);
    if (!todo || todo.status === newStatus) return;

    updateTodo(todoId, { 
      status: newStatus,
      completed: newStatus === 'completed'
    });
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  };

  const handleAddTodo = (status: Todo['status']) => {
    setNewTodoStatus(status);
    setEditingTodo(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTodo(null);
  };

  const handleSubmit = async (data: any) => {
    if (editingTodo) {
      await updateTodo(editingTodo.id, data);
    } else {
      await createTodo({ ...data, status: newTodoStatus });
    }
  };

  const todosByStatus = columns.reduce((acc, column) => {
    acc[column.status] = todos.filter(todo => todo.status === column.status);
    return acc;
  }, {} as Record<Todo['status'], Todo[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Kanban Board</h2>
        <Button onClick={() => handleAddTodo('todo')}>
          Add Todo
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              todos={todosByStatus[column.status]}
              onEdit={handleEdit}
              onDelete={deleteTodo}
              onAddTodo={handleAddTodo}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTodo ? (
            <TodoCard
              todo={activeTodo}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Todo Form */}
      <TodoForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        initialData={editingTodo || undefined}
        mode={editingTodo ? 'edit' : 'create'}
      />
    </div>
  );
}