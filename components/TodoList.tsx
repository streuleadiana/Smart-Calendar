
import React, { useState } from 'react';
import { Todo, Theme, Category } from '../types';
import { CheckSquare, Square, Trash2, Plus, ListTodo, Pin, Palette, Pencil, Check, X } from 'lucide-react';
import { HighlightText } from './HighlightText';

interface TodoListProps {
  todos: Todo[];
  onAddTodo: (text: string, isPinned: boolean, categoryId?: string, color?: string) => void;
  onEditTodo: (id: string, text: string, categoryId?: string, color?: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onTogglePin: (id: string) => void;
  onChangeColor: (id: string, color: string) => void;
  theme: Theme;
  accentColor?: string;
  searchQuery?: string;
  categories: Category[];
}

export const TodoList: React.FC<TodoListProps> = ({ 
  todos, 
  onAddTodo, 
  onEditTodo,
  onToggleTodo, 
  onDeleteTodo, 
  onTogglePin,
  onChangeColor,
  theme,
  accentColor = '#4F46E5',
  searchQuery = '',
  categories = []
}) => {
  const [newTodo, setNewTodo] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string>(accentColor);
  const [useCustomColor, setUseCustomColor] = useState(false);
  
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editParams, setEditParams] = useState<{ text: string, categoryId?: string, color?: string, useCustomColor: boolean }>({ text: '', useCustomColor: false });
  
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

  const textClass = isNeon ? 'text-slate-200' : 'text-slate-800';
  const completedText = isNeon ? 'text-slate-600' : 'text-slate-400';
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      onAddTodo(newTodo.trim(), isPinned, selectedCategoryId, useCustomColor ? selectedColor : undefined);
      setNewTodo('');
      setIsPinned(false);
      setSelectedColor(accentColor);
      setUseCustomColor(false);
      setSelectedCategoryId(undefined);
    }
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
        <div className="flex flex-col gap-2">
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

                 <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar flex-1 pb-1">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategoryId(selectedCategoryId === cat.id ? undefined : cat.id)}
                            className={`text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap transition-all border ${
                                selectedCategoryId === cat.id && !useCustomColor
                                    ? 'text-white'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                            style={selectedCategoryId === cat.id && !useCustomColor ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                            title={cat.name}
                        >
                            {cat.name}
                        </button>
                    ))}
                 </div>
             </div>

             <div className="flex items-center gap-2">
                 <div 
                     className="relative flex items-center justify-center w-6 h-6 rounded-full overflow-hidden cursor-pointer border-2 shadow-sm transition-transform hover:scale-110"
                     style={{ borderColor: useCustomColor ? selectedColor : '#e2e8f0' }}
                     title="Alege o Culoare Personalizată"
                 >
                     <input
                         type="color"
                         value={selectedColor}
                         onChange={(e) => {
                             setSelectedColor(e.target.value);
                             setUseCustomColor(true);
                         }}
                         className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 cursor-pointer border-none"
                     />
                 </div>
                 {useCustomColor && (
                     <button 
                         type="button" 
                         onClick={() => {
                             setUseCustomColor(false);
                             setSelectedColor(accentColor);
                         }}
                         className="text-[10px] text-slate-400 underline"
                     >
                         Reset Culoare
                     </button>
                 )}
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
            const textStyle: React.CSSProperties = {};
            if (!todo.completed) {
                if (todo.color) {
                    textStyle.color = todo.color;
                    if (isNeon) {
                        // Ensure dark colors pop on dark backgrounds
                        textStyle.filter = 'brightness(1.5) saturate(1.2)';
                    }
                } else if (todo.isPinned) {
                    // Pinned task text specifically
                    textStyle.color = isNeon ? '#f8fafc' : '#0f172a';
                }
            }

            const isEditing = editingTaskId === todo.id;

            if (isEditing) {
                return (
                    <div
                        key={todo.id}
                        className={`p-3 rounded-lg border transition-all shadow-lg ${isNeon ? 'bg-slate-900 border-cyan-500' : 'bg-white border-indigo-500'}`}
                        style={{ ...itemStyle, zIndex: 20 }}
                    >
                         <form onSubmit={(e) => {
                             e.preventDefault();
                             if (editParams.text.trim()) {
                                 onEditTodo(todo.id, editParams.text.trim(), editParams.categoryId, editParams.useCustomColor ? editParams.color : undefined);
                                 setEditingTaskId(null);
                             }
                         }} className="space-y-3">
                              <div className="flex items-center gap-2">
                                  <input 
                                      type="text"
                                      autoFocus
                                      className={`flex-1 px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-2 ${inputClass}`}
                                      value={editParams.text}
                                      onChange={(e) => setEditParams({...editParams, text: e.target.value})}
                                  />
                                  <button type="submit" className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors" title="Save changes"><Check size={16} /></button>
                                  <button type="button" onClick={() => setEditingTaskId(null)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" title="Cancel edit"><X size={16} /></button>
                              </div>
                              
                              {/* Category and Color pickers for edit */}
                              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                   <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar flex-1 pb-1">
                                      {categories.map((cat) => (
                                          <button
                                              key={cat.id}
                                              type="button"
                                              onClick={() => setEditParams({...editParams, categoryId: editParams.categoryId === cat.id ? undefined : cat.id, useCustomColor: false})}
                                              className={`text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap transition-all border ${
                                                  editParams.categoryId === cat.id && !editParams.useCustomColor
                                                      ? 'text-white'
                                                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                                              }`}
                                              style={editParams.categoryId === cat.id && !editParams.useCustomColor ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                                              title={cat.name}
                                          >
                                              {cat.name}
                                          </button>
                                      ))}
                                   </div>

                                   <div className="flex items-center gap-2">
                                       <div 
                                           className="relative flex items-center justify-center w-6 h-6 rounded-full overflow-hidden cursor-pointer border-2 shadow-sm transition-transform hover:scale-110"
                                           style={{ borderColor: editParams.useCustomColor ? editParams.color : '#e2e8f0' }}
                                           title="Alege o Culoare Personalizată"
                                       >
                                           <input
                                               type="color"
                                               value={editParams.useCustomColor && editParams.color ? editParams.color : accentColor}
                                               onChange={(e) => setEditParams({...editParams, color: e.target.value, useCustomColor: true, categoryId: undefined})}
                                               className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 cursor-pointer border-none"
                                           />
                                       </div>
                                       {editParams.useCustomColor && (
                                           <button 
                                               type="button" 
                                               onClick={() => setEditParams({...editParams, useCustomColor: false, color: accentColor})}
                                               className="text-[10px] text-slate-400 underline"
                                           >
                                               Reset Culoare
                                           </button>
                                       )}
                                   </div>
                              </div>
                         </form>
                    </div>
                );
            }

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
                 {/* Color Indicator */}
                 {(todo.color || todo.categoryId) && (
                     <div
                        className="w-3 h-3 rounded-full mx-1 flex-shrink-0"
                        style={{ backgroundColor: todo.color || categories.find(c => c.id === todo.categoryId)?.color || '#cbd5e1' }}
                        title="Task Category/Color"
                     />
                 )}
                 
                 {/* Edit Task */}
                 <button
                    onClick={() => {
                        setEditingTaskId(todo.id);
                        setEditParams({
                            text: todo.text,
                            categoryId: todo.categoryId,
                            color: todo.color || accentColor,
                            useCustomColor: !!todo.color && !todo.categoryId
                        });
                    }}
                    className="p-1 text-slate-300 hover:text-indigo-500 dark:hover:text-cyan-400 transition-colors"
                    title="Edit task"
                 >
                    <Pencil size={14} />
                 </button>

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
