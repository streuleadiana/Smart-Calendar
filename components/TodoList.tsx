
import React, { useState } from 'react';
import { Todo, Theme, Category } from '../types';
import { CheckSquare, Square, Trash2, Plus, ListTodo, Pin, Palette, Pencil, Check, X, Repeat, Heart } from 'lucide-react';
import { HighlightText } from './HighlightText';
import { translations, LanguageOption } from '../utils/translations';

interface TodoListProps {
  todos: Todo[];
  onAddTaskClick: () => void;
  onEditTaskClick: (task: Todo) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onTogglePin: (task: Todo) => void;
  onChangeColor: (id: string, color: string) => void;
  theme: Theme;
  accentColor?: string;
  searchQuery?: string;
  categories: Category[];
  hideHeader?: boolean;
  lang: LanguageOption;
}

export const TodoList: React.FC<TodoListProps> = ({ 
  todos, 
  onAddTaskClick, 
  onEditTaskClick,
  onToggleTodo, 
  onDeleteTodo, 
  onTogglePin,
  onChangeColor,
  theme,
  accentColor = '#4F46E5',
  searchQuery = '',
  categories = [],
  hideHeader = false,
  lang
}) => {
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

  const textClass = isNeon ? 'text-slate-200' : 'text-slate-800';
  const completedText = isNeon ? 'text-slate-600' : 'text-slate-400';

  const t = translations[lang] || translations.ro;

  return (
    <div className={`rounded-3xl shadow-sm border w-full flex flex-col overflow-visible ${containerClass}`}>
      {!hideHeader && (
        <div className={`p-4 border-b flex items-center gap-2 ${headerClass}`}>
          <div 
              className={`p-1.5 rounded-md text-white`}
              style={{ backgroundColor: `${accentColor}80` }}
          >
            <ListTodo size={20} />
          </div>
          <h3 className="font-bold">{t.todoList.title}</h3>
          <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded-full ${isNeon ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
            {todos.filter(t => !t.completed).length} {t.todoList.pending}
          </span>
        </div>
      )}

      <div className={`p-4 border-b ${isNeon ? 'border-slate-800' : 'border-slate-100'}`}>
        <button
          onClick={onAddTaskClick}
          className={`w-full py-3 rounded-2xl font-bold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2`}
          style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, boxShadow: `0 4px 14px 0 ${accentColor}40` }}
        >
          <Plus size={18} strokeWidth={1.5} />
          {t.todoList.addBtn}
        </button>
      </div>

      {/* Pastel Progress Bar */}
      {todos.length > 0 && (() => {
        const totalTasks = todos.length;
        const completedTasks = todos.filter(t => t.completed).length;
        const completionPercentage = Math.round((completedTasks / totalTasks) * 100);
        
        let encouragementText = '';
        if (completionPercentage === 0) {
          encouragementText = t.todoList.motivationStart.replace('{total}', totalTasks.toString());
        } else if (completionPercentage === 100) {
          encouragementText = t.todoList.motivationDone;
        } else {
          encouragementText = t.todoList.motivationProgress
            .replace('{completed}', completedTasks.toString())
            .replace('{total}', totalTasks.toString());
        }

        return (
          <div className="px-4 py-3.5 border-b border-pink-100/50 bg-pink-50/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-pink-600/95">
              <span>{encouragementText}</span>
              <span className="font-mono text-pink-500 font-bold">{completionPercentage}%</span>
            </div>
            <div className="h-4 w-full bg-pink-100 rounded-full overflow-hidden shadow-sm">
              <div 
                className="h-full bg-gradient-to-r from-pink-300 to-pink-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        );
      })()}

      <div className="flex-1 p-2 space-y-1 overflow-visible">
        {todos.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm flex flex-col items-center gap-2">
            <span className="text-3xl">🌸</span>
            <p className="font-medium text-slate-500">{t.todoList.finishedAll}</p>
            <p className="text-xs">{t.todoList.takeABreak}</p>
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
            let customTextClass = '';
            
            if (!todo.completed) {
                if (todo.color) {
                    if (todo.color.startsWith('#')) {
                        textStyle.color = todo.color;
                        if (isNeon) {
                            // Ensure dark colors pop on dark backgrounds
                            textStyle.filter = 'brightness(1.5) saturate(1.2)';
                        }
                    } else {
                        customTextClass = todo.color; // it's a tailwind class
                    }
                } else if (todo.isPinned) {
                    // Pinned task text specifically
                    textStyle.color = isNeon ? '#f8fafc' : '#0f172a';
                }
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
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTodo(todo.id);
                }}
                className={`flex-shrink-0 transition-all active:scale-95 ${
                  todo.completed 
                    ? 'scale-110' 
                    : isNeon ? 'text-slate-600 hover:text-slate-500' : 'text-slate-300 hover:text-slate-400'
                }`}
                style={todo.completed ? { color: accentColor } : {}}
              >
                {todo.completed ? <Heart size={20} className="fill-current" strokeWidth={1} /> : <Heart size={20} strokeWidth={1.5} />}
              </button>
              
              <div className="flex-1 min-w-0">
                  <span 
                    className={`block flex items-center gap-1.5 text-sm truncate ${todo.completed ? `line-through ${completedText}` : `${textClass} ${customTextClass}`}`}
                    style={textStyle}
                  >
                    {todo.recurrence && todo.recurrence !== 'none' && (
                        <Repeat size={12} className="opacity-60 flex-shrink-0" />
                    )}
                    <span className="truncate"><HighlightText text={todo.text} highlight={searchQuery} /></span>
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
                    onClick={(e) => {
                       e.stopPropagation();
                       onEditTaskClick(todo);
                    }}
                    className="p-1 text-slate-300 hover:text-indigo-500 dark:hover:text-cyan-400 transition-colors"
                    title="Edit task"
                 >
                    <Pencil size={14} />
                 </button>

                 {/* Pin Toggle */}
                 <button
                    onClick={(e) => {
                       e.stopPropagation();
                       onTogglePin(todo);
                    }}
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
                    onClick={(e) => {
                       e.stopPropagation();
                       onDeleteTodo(todo.id);
                    }}
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
