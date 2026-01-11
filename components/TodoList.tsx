
import React, { useState } from 'react';
import { Todo, Theme } from '../types';
import { CheckSquare, Square, Trash2, Plus, ListTodo, Pin, Palette, Check } from 'lucide-react';

interface TodoListProps {
  todos: Todo[];
  onAddTodo: (text: string, isPinned: boolean, color?: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onTogglePin: (id: string) => void;
  onChangeColor: (id: string, color: string) => void;
  theme: Theme;
}

const TODO_COLORS = [
  { class: '', label: 'Default', bg: 'bg-transparent' },
  { class: 'bg-red-500', label: 'Urgent', bg: 'bg-red-500' },
  { class: 'bg-orange-500', label: 'Medium', bg: 'bg-orange-500' },
  { class: 'bg-blue-500', label: 'Low', bg: 'bg-blue-500' },
];

export const TodoList: React.FC<TodoListProps> = ({ 
  todos, 
  onAddTodo, 
  onToggleTodo, 
  onDeleteTodo, 
  onTogglePin,
  onChangeColor,
  theme 
}) => {
  const [newTodo, setNewTodo] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('');
  
  const isNeon = theme === 'neon';
  const isPastel = theme === 'pastel';

  const containerClass = isNeon 
    ? 'bg-slate-900 border-slate-800' 
    : isPastel 
      ? 'bg-[#fffbf0] border-orange-100' 
      : 'bg-white border-slate-200';
      
  const headerClass = isNeon 
    ? 'bg-slate-950 border-slate-800 text-white' 
    : isPastel 
      ? 'bg-orange-50/50 border-orange-100 text-stone-800' 
      : 'bg-slate-50/50 border-slate-100 text-slate-800';

  const inputClass = isNeon
    ? 'bg-slate-800 border-slate-700 text-white focus:ring-cyan-500/50 focus:border-cyan-500'
    : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-secondary/50 focus:border-secondary';

  const textClass = isNeon ? 'text-slate-300' : 'text-slate-700';
  const iconClass = isNeon ? 'text-cyan-400' : 'text-secondary';
  const completedText = isNeon ? 'text-slate-600' : 'text-slate-400';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      onAddTodo(newTodo.trim(), isPinned, selectedColor || undefined);
      setNewTodo('');
      setIsPinned(false);
      setSelectedColor('');
    }
  };

  const handleCycleColor = (todo: Todo) => {
    const currentIndex = TODO_COLORS.findIndex(c => c.class === (todo.color || ''));
    const nextIndex = (currentIndex + 1) % TODO_COLORS.length;
    onChangeColor(todo.id, TODO_COLORS[nextIndex].class);
  };

  return (
    <div className={`rounded-2xl shadow-sm border h-full flex flex-col overflow-hidden ${containerClass}`}>
      <div className={`p-4 border-b flex items-center gap-2 ${headerClass}`}>
        <div className={`p-1.5 rounded-md ${isNeon ? 'bg-cyan-900/50 text-cyan-400' : 'bg-secondary/10 text-secondary'}`}>
          <ListTodo size={20} />
        </div>
        <h3 className="font-bold">My Tasks</h3>
        <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded-full ${isNeon ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
          {todos.filter(t => !t.completed).length} pending
        </span>
      </div>

      <div className={`p-4 border-b space-y-3 ${isNeon ? 'border-slate-800' : 'border-slate-100'}`}>
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            className={`w-full pl-4 pr-10 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${inputClass}`}
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newTodo.trim()}
            className={`absolute right-1.5 top-1.5 p-1.5 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isNeon ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-secondary hover:bg-purple-600'}`}
          >
            <Plus size={16} />
          </button>
        </form>
        
        {/* Input Tools */}
        <div className="flex items-center gap-3">
             <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors ${
                    isPinned 
                    ? 'bg-amber-100 text-amber-700' 
                    : isNeon ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                }`}
             >
                <Pin size={12} className={isPinned ? 'fill-current' : ''} />
                Pin
             </button>

             <div className="flex items-center gap-1.5">
                {TODO_COLORS.slice(1).map((color) => (
                    <button
                        key={color.label}
                        type="button"
                        onClick={() => setSelectedColor(selectedColor === color.class ? '' : color.class)}
                        className={`w-4 h-4 rounded-full transition-transform ${color.bg} ${selectedColor === color.class ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : 'opacity-40 hover:opacity-100'}`}
                        title={color.label}
                    />
                ))}
             </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {todos.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            <p>No tasks yet.</p>
            <p className="text-xs mt-1">Add one above to get started!</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`group flex items-center gap-3 p-3 rounded-lg border transition-all ${
                todo.isPinned 
                    ? isNeon ? 'border-amber-500/20 bg-amber-900/10' : 'border-amber-200 bg-amber-50' 
                    : 'border-transparent'
              } ${
                todo.completed
                  ? `opacity-60 ${isNeon ? 'bg-slate-800/50' : 'bg-slate-50'}`
                  : `${isNeon ? 'bg-slate-900 hover:border-cyan-500/30' : 'bg-white hover:border-secondary/30'} hover:shadow-sm`
              }`}
            >
              <button
                onClick={() => onToggleTodo(todo.id)}
                className={`flex-shrink-0 transition-colors ${
                  todo.completed 
                    ? iconClass 
                    : isNeon ? 'text-slate-600 hover:text-cyan-400' : 'text-slate-300 hover:text-secondary'
                }`}
              >
                {todo.completed ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
              
              <div className="flex-1 min-w-0">
                  <span className={`block text-sm truncate ${todo.completed ? `line-through ${completedText}` : textClass}`}>
                    {todo.text}
                  </span>
              </div>
              
              {/* Task Controls */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 {/* Color Indicator/Cycler */}
                 <button
                    onClick={() => handleCycleColor(todo)}
                    className={`w-3 h-3 rounded-full mx-1 ${todo.color ? todo.color : 'bg-slate-300'}`}
                    title="Cycle Priority Color"
                 />
                 
                 {/* Pin Toggle */}
                 <button
                    onClick={() => onTogglePin(todo.id)}
                    className={`p-1 rounded transition-colors ${
                        todo.isPinned 
                        ? 'text-amber-500' 
                        : 'text-slate-300 hover:text-amber-500'
                    }`}
                    title="Toggle Pin"
                 >
                    <Pin size={14} className={todo.isPinned ? 'fill-current' : ''} />
                 </button>

                 <button
                    onClick={() => onDeleteTodo(todo.id)}
                    className="text-slate-300 hover:text-red-500 p-1"
                    title="Delete task"
                 >
                    <Trash2 size={14} />
                 </button>
              </div>
              
              {/* Always visible indicators if pinned/colored but hover not active */}
              {todo.isPinned && (
                 <div className="block group-hover:hidden text-amber-500">
                    <Pin size={12} className="fill-current" />
                 </div>
              )}
               {todo.color && (
                 <div className={`block group-hover:hidden w-2 h-2 rounded-full ${todo.color}`}></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
