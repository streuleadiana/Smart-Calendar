import React, { useState } from 'react';
import { Theme, Category } from '../types';
import { X } from 'lucide-react';
import { translations, LanguageOption } from '../utils/translations';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string, categoryId?: string, color?: string) => void;
  theme: Theme;
  accentColor: string;
  categories: Category[];
  lang: LanguageOption;
  initialTask?: { id: string; text: string; categoryId?: string; color?: string };
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  theme,
  accentColor,
  categories,
  lang,
  initialTask
}) => {
  const [text, setText] = useState(initialTask?.text || '');
  const [categoryId, setCategoryId] = useState<string>(initialTask?.categoryId || '');
  const [color, setColor] = useState(initialTask?.color || accentColor);
  const [useCustomColor, setUseCustomColor] = useState(!!initialTask?.color);

  // Reset state when opening/closing or when initialTask changes
  React.useEffect(() => {
     if (isOpen) {
         setText(initialTask?.text || '');
         setCategoryId(initialTask?.categoryId || '');
         setColor(initialTask?.color || accentColor);
         setUseCustomColor(!!initialTask?.color);
     }
  }, [isOpen, initialTask, accentColor]);

  if (!isOpen) return null;

  const isNeon = theme === 'neon';
  const modalBg = isNeon ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800';
  const inputClass = isNeon ? 'bg-slate-800 border-slate-700 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSave(text.trim(), categoryId || undefined, useCustomColor ? color : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-md ${modalBg} border shadow-2xl rounded-2xl flex flex-col animate-in zoom-in-95 duration-200`}>
        <div className={`p-4 border-b flex items-center justify-between ${isNeon ? 'border-slate-800' : 'border-slate-100'}`}>
          <h2 className="text-lg font-bold">{initialTask ? (lang === 'ro' ? 'Editează Task' : 'Edit Task') : (lang === 'ro' ? 'Adaugă Task' : 'Add Task')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
             <label className="text-sm font-semibold opacity-70">{lang === 'ro' ? 'Denumire Task' : 'Task Name'}</label>
             <input
               autoFocus
               type="text"
               value={text}
               onChange={(e) => setText(e.target.value)}
               className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${inputClass}`}
               placeholder={lang === 'ro' ? 'Ex: Cumpără lapte...' : 'e.g. Buy groceries...'}
             />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold opacity-70">{lang === 'ro' ? 'Categorie & Culoare' : 'Category & Color'}</label>
            <div className="flex items-center gap-3">
              <select
                value={useCustomColor ? 'custom' : categoryId}
                onChange={(e) => {
                   if (e.target.value === 'custom') {
                       setUseCustomColor(true);
                       setCategoryId('');
                   } else {
                       setUseCustomColor(false);
                       setCategoryId(e.target.value);
                   }
                }}
                className={`flex-1 p-3 rounded-xl border focus:outline-none focus:ring-2 text-sm ${inputClass}`}
              >
                 <option value="">{lang === 'ro' ? 'Fără categorie' : 'No category'}</option>
                 {categories.map(cat => (
                     <option key={cat.id} value={cat.id}>{cat.name}</option>
                 ))}
                 <option value="custom">{lang === 'ro' ? 'Culoare Personalizată...' : 'Custom Color...'}</option>
              </select>

              {useCustomColor && (
                 <div 
                    className="relative flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden cursor-pointer border-2 shadow-sm transition-transform hover:scale-105"
                    style={{ borderColor: isNeon ? '#334155' : '#e2e8f0' }}
                 >
                     <input
                         type="color"
                         value={color}
                         onChange={(e) => setColor(e.target.value)}
                         className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 cursor-pointer border-none"
                     />
                 </div>
              )}
            </div>
          </div>

          <button
             type="submit"
             disabled={!text.trim()}
             className="w-full py-4 rounded-xl font-bold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
             style={{ backgroundColor: accentColor }}
          >
             {initialTask ? (lang === 'ro' ? 'Salvează' : 'Save Changes') : (lang === 'ro' ? 'Adaugă Task' : 'Add Task')}
          </button>
        </form>
      </div>
    </div>
  );
};
