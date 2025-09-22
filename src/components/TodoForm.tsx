import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CreateTodoData, Todo, UpdateTodoData } from '@/hooks/useTodos';

interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTodoData | UpdateTodoData) => Promise<void>;
  initialData?: Todo;
  mode: 'create' | 'edit';
}

export default function TodoForm({ isOpen, onClose, onSubmit, initialData, mode }: TodoFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium' as const,
    due_date: initialData?.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        description: formData.description || undefined,
        due_date: formData.due_date || undefined,
      };
      
      await onSubmit(submitData);
      onClose();
      
      // Reset form for create mode
      if (mode === 'create') {
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          due_date: '',
        });
      }
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] gap-0">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">
            {mode === 'create' ? 'Create New Todo' : 'Edit Todo'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                placeholder="Enter todo title"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter todo description (optional)"
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date" className="text-sm font-medium">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleChange('due_date', e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none">
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Todo' : 'Update Todo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}