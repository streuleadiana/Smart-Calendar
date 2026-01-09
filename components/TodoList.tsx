
import React, { useState } from 'react';
import { Todo, Theme } from '../types';
import { CheckSquare, Square, Trash2, Plus, ListTodo } from 'lucide-react';

interface TodoListProps {
  todos: Todo[];
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  theme: Theme;
}

export const TodoList: React.FC<TodoListProps> = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo, theme }) => {
  const [newTodo, setNewTodo] = useState('');
  
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
      onAddTodo(newTodo.trim());
      setNewTodo('');
    }
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

      <div className={`p-4 border-b ${isNeon ? 'border-slate-800' : 'border-slate-100'}`}>
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
                todo.completed
                  ? `border-transparent opacity-60 ${isNeon ? 'bg-slate-800/50' : 'bg-slate-50'}`
                  : `${isNeon ? 'bg-slate-900 border-slate-800 hover:border-cyan-500/30' : 'bg-white border-slate-100 hover:border-secondary/30'} hover:shadow-sm`
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
              
              <span className={`flex-1 text-sm ${todo.completed ? `line-through ${completedText}` : textClass}`}>
                {todo.text}
              </span>

              <button
                onClick={() => onDeleteTodo(todo.id)}
                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
