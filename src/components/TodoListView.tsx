import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Edit, Trash2, Search } from 'lucide-react';
import { Todo, useTodos } from '@/hooks/useTodos';
import TodoForm from './TodoForm';

type FilterStatus = 'all' | 'todo' | 'in_progress' | 'completed';
type SortOption = 'created_at' | 'due_date' | 'priority' | 'title';

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const statusColors = {
  todo: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

interface TodoListViewProps {
  todos: Todo[];
  createTodo: (data: any) => Promise<void>;
  updateTodo: (id: number, data: any) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
}

export default function TodoListView({ todos, createTodo, updateTodo, deleteTodo }: TodoListViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('created_at');
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
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
      await createTodo(data);
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    const newStatus = todo.completed ? 'todo' : 'completed';
    await updateTodo(todo.id, { 
      completed: !todo.completed,
      status: newStatus 
    });
  };

  const filteredAndSortedTodos = todos
    .filter(todo => {
      if (filter !== 'all' && todo.status !== filter) return false;
      if (searchTerm && !todo.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !todo.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Todo List</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          Add Todo
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search todos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={(value: FilterStatus) => setFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Todos</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Date Created</SelectItem>
            <SelectItem value="due_date">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Todo List */}
      <div className="space-y-4">
        {filteredAndSortedTodos.map((todo) => (
          <Card key={todo.id} className={`transition-all duration-200 ${todo.completed ? 'opacity-75' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => handleToggleComplete(todo)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-semibold ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p className={`text-sm mt-1 ${todo.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                        {todo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className={statusColors[todo.status]}>
                        {todo.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={priorityColors[todo.priority]}>
                        {todo.priority}
                      </Badge>
                      {todo.due_date && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          {new Date(todo.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(todo)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredAndSortedTodos.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                {searchTerm || filter !== 'all' 
                  ? 'No todos match your filters.' 
                  : 'No todos yet. Create your first todo!'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

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