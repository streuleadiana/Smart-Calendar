
import React, { useState } from 'react';
import { Todo, Theme } from '../types';
import { CheckSquare, Square, Trash2, Plus, ListTodo, Pin } from 'lucide-react';
import { HighlightText } from './HighlightText';

interface TodoListProps {
  todos: Todo[];
  onAddTodo: (text: string, isPinned: boolean, color?: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onTogglePin: (id: string) => void;
  onChangeColor: (id: string, color: string) => void;
  theme: Theme;
  accentColor?: string;
  searchQuery?: string;
}

// Updated to use Hex values for text coloring
const TODO_COLORS = [
  { value: '', label: 'Default', bg: 'bg-slate-200' },
  { value: '#ef4444', label: 'Urgent', bg: 'bg-red-500' },
  { value: '#f97316', label: 'Medium', bg: 'bg-orange-500' },
  { value: '#3b82f6', label: 'Low', bg: 'bg-blue-500' },
];

export const TodoList: React.FC<TodoListProps> = ({ 
  todos, 
  onAddTodo, 
  onToggleTodo, 
  onDeleteTodo, 
  onTogglePin,
  onChangeColor,
  theme,
  accentColor = '#4F46E5',
  searchQuery = ''
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
    : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500/50';

  const textClass = isNeon ? 'text-slate-300' : 'text-slate-700';
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
    // Determine current index based on value match
    const currentIndex = TODO_COLORS.findIndex(c => c.value === (todo.color || ''));
    const nextIndex = (currentIndex + 1) % TODO_COLORS.length;
    onChangeColor(todo.id, TODO_COLORS[nextIndex].value);
  };

  return (
    <div className={`rounded-2xl shadow-sm border h-full flex flex-col overflow-hidden ${containerClass}`}>
      <div className={`p-4 border-b flex items-center gap-2 ${headerClass}`}>
        <div 
            className={`p-1.5 rounded-md text-white`}
            style={{ backgroundColor: `${accentColor}80` }}
        >
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
            className={`absolute right-1.5 top-1.5 p-1.5 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-90`}
            style={{ backgroundColor: accentColor }}
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
                        onClick={() => setSelectedColor(selectedColor === color.value ? '' : color.value)}
                        className={`w-4 h-4 rounded-full transition-transform ${color.bg} ${selectedColor === color.value ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : 'opacity-40 hover:opacity-100'}`}
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
          todos.map((todo) => {
            const isHighlighted = !!searchQuery;
            
            // Dynamic Styles
            const itemStyle: React.CSSProperties = {
                // Pinned Logic: Background Tint + Left Border
                backgroundColor: todo.isPinned ? `${accentColor}1A` : undefined, // 10-15% opacity hex (1A = ~10%)
                borderLeft: todo.isPinned ? `4px solid ${accentColor}` : '4px solid transparent',
                
                // Pop Effect Logic
                boxShadow: isHighlighted ? `0 0 0 2px ${accentColor}` : undefined,
                zIndex: isHighlighted ? 10 : undefined,
            };

            // Text Color Logic
            const textStyle: React.CSSProperties = {
                color: (!todo.completed && todo.color) ? todo.color : 'inherit'
            };

            return (
            <div
              key={todo.id}
              className={`group flex items-center gap-3 p-3 rounded-lg border transition-all ${
                isNeon ? 'border-slate-800' : 'border-transparent' // removed specific pinned classes, handled in style
              } ${
                todo.completed
                  ? `opacity-60 ${isNeon ? 'bg-slate-800/50' : 'bg-slate-50'}`
                  : `${isNeon ? 'bg-slate-900 hover:border-cyan-500/30' : 'bg-white hover:border-slate-300'} hover:shadow-sm`
              }`}
              style={itemStyle}
            >
              <button
                onClick={() => onToggleTodo(todo.id)}
                className={`flex-shrink-0 transition-colors ${
                  todo.completed 
                    ? '' 
                    : isNeon ? 'text-slate-600' : 'text-slate-300'
                }`}
                style={todo.completed ? { color: accentColor } : {}}
              >
                {todo.completed ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
              
              <div className="flex-1 min-w-0">
                  <span 
                    className={`block text-sm truncate ${todo.completed ? `line-through ${completedText}` : textClass}`}
                    style={textStyle}
                  >
                    <HighlightText text={todo.text} highlight={searchQuery} />
                  </span>
              </div>
              
              {/* Task Controls */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 {/* Color Indicator/Cycler */}
                 <button
                    onClick={() => handleCycleColor(todo)}
                    className={`w-3 h-3 rounded-full mx-1`}
                    style={{ backgroundColor: todo.color || '#cbd5e1' }}
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
              
              {/* Always visible indicators */}
              {todo.isPinned && (
                 <div className="block group-hover:hidden text-amber-500" style={{ color: accentColor }}>
                    <Pin size={12} className="fill-current" />
                 </div>
              )}
            </div>
          )})
        )}
      </div>
    </div>
  );
};
