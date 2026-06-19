import React, { useState, useEffect } from 'react';
import { Theme, Category } from '../types';
import { X, Palette } from 'lucide-react';
import { translations, LanguageOption } from '../utils/translations';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string, categoryId?: string, color?: string, deadlineDate?: string, notificationOffset?: number, recurrence?: 'none'|'daily'|'weekly'|'bi-weekly'|'monthly'|'yearly') => void;
  theme: Theme;
  accentColor: string;
  categories: Category[];
  lang: LanguageOption;
  initialTask?: { id: string; text: string; categoryId?: string; color?: string; deadlineDate?: string; notificationOffset?: number; recurrence?: 'none'|'daily'|'weekly'|'bi-weekly'|'monthly'|'yearly' };
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
  const [deadlineDate, setDeadlineDate] = useState(initialTask?.deadlineDate || '');
  const [offsetValue, setOffsetValue] = useState<number>(0);
  const [offsetUnit, setOffsetUnit] = useState<string>('minutes');
  const [recurrence, setRecurrence] = useState<'none'|'daily'|'weekly'|'bi-weekly'|'monthly'|'yearly'>(initialTask?.recurrence || 'none');

  // Reset state when opening/closing or when initialTask changes
  useEffect(() => {
     if (isOpen) {
          setText(initialTask?.text || '');
          setCategoryId(initialTask?.categoryId || '');
          setColor(initialTask?.color || accentColor);
          setUseCustomColor(!!initialTask?.color);
          setDeadlineDate(initialTask?.deadlineDate || '');
          
          const existingOffset = initialTask?.notificationOffset || 0;
          let val = 0;
          let unit = 'minutes';
          if (existingOffset > 0) {
              if (existingOffset % 1440 === 0) {
                  val = existingOffset / 1440;
                  unit = 'days';
              } else if (existingOffset % 60 === 0) {
                  val = existingOffset / 60;
                  unit = 'hours';
              } else {
                  val = existingOffset;
                  unit = 'minutes';
              }
          }
          setOffsetValue(val);
          setOffsetUnit(unit);
          
          setRecurrence(initialTask?.recurrence || 'none');
     }
  }, [isOpen, initialTask, accentColor]);

  if (!isOpen) return null;

  const isNeon = theme === 'neon';
  const isSoft = theme === 'soft';

  // Cute, theme-aware panel design
  const modalBg = isSoft
    ? 'bg-gradient-to-b from-white to-pink-50/90 backdrop-blur-xl border border-pink-100/80 shadow-[0_25px_60px_-15px_rgba(244,114,182,0.35)] text-slate-800 rounded-[2.2rem]'
    : isNeon
    ? 'bg-slate-900 border-slate-800 shadow-[0_25px_60px_-15px_rgba(244,63,94,0.15)] text-white rounded-[2.2rem]'
    : 'bg-white/95 backdrop-blur-xl border border-slate-100/90 shadow-[0_25px_60px_-15px_rgba(99,102,241,0.15)] text-slate-800 rounded-[2.2rem]';

  const inputClass = isSoft
    ? 'bg-white/75 focus:bg-white text-slate-800 border-pink-100/70 focus:ring-pink-300 focus:border-pink-300 rounded-2xl shadow-sm'
    : isNeon
    ? 'bg-slate-800 border-slate-700 text-white focus:ring-rose-500 rounded-2xl'
    : 'bg-slate-50 border-slate-200 focus:ring-indigo-300 rounded-2xl shadow-sm';

  const headingColor = isSoft ? 'text-pink-600' : isNeon ? 'text-slate-100' : 'text-slate-900';
  const closeBtnHover = isSoft ? 'hover:bg-pink-100/50 text-pink-400 hover:text-pink-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800';

  const labelClass = isSoft
    ? 'text-xs font-bold tracking-wider text-pink-500/95 flex items-center gap-1.5 uppercase'
    : isNeon
    ? 'text-xs font-bold tracking-wider text-slate-400 flex items-center gap-1.5 uppercase'
    : 'text-xs font-bold tracking-wider text-indigo-500 flex items-center gap-1.5 uppercase';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    let notificationOffset = 0;
    if (offsetUnit === 'minutes') {
        notificationOffset = offsetValue;
    } else if (offsetUnit === 'hours') {
        notificationOffset = offsetValue * 60;
    } else if (offsetUnit === 'days') {
        notificationOffset = offsetValue * 1440;
    }
    onSave(
        text.trim(), 
        categoryId || undefined, 
        useCustomColor ? color : undefined, 
        deadlineDate || undefined, 
        notificationOffset,
        recurrence !== 'none' ? recurrence : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
      
      <div className={`relative w-full max-w-md ${modalBg} border flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar`} onClick={(e) => e.stopPropagation()}>
        <div className={`px-6 py-5 border-b flex items-center justify-between ${isSoft ? 'border-pink-100/50 bg-pink-100/10' : isNeon ? 'border-slate-800' : 'border-slate-100'}`}>
          <h2 className={`text-lg font-extrabold ${headingColor}`}>
             {initialTask ? '✨ ' : '🌸 '}
             {initialTask ? (lang === 'ro' ? 'Editează Task' : 'Edit Task') : (lang === 'ro' ? 'Adaugă Task' : 'Add Task')}
          </h2>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${closeBtnHover}`}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col space-y-4">
          <div className="space-y-2 mb-4">
            <label className={labelClass}>🦄 {lang === 'ro' ? 'Categorie' : 'Category'}</label>
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
                className={`flex-1 p-3.5 border focus:outline-none focus:ring-2 text-sm appearance-none cursor-pointer transition-all ${inputClass}`}
              >
                 <option value="">{lang === 'ro' ? 'Alege o categorie...' : 'No category'}</option>
                 {categories.map(cat => (
                     <option key={cat.id} value={cat.id}>{cat.name}</option>
                 ))}
                 <option value="custom">{lang === 'ro' ? 'Culoare Personalizată...' : 'Custom Color...'}</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 mb-4">
             <label className={labelClass}>🏷️ {lang === 'ro' ? 'Denumire Task' : 'Task Name'}</label>
             <input
               autoFocus
               type="text"
               value={text}
               onChange={(e) => setText(e.target.value)}
               className={`w-full p-3.5 border focus:outline-none focus:ring-2 transition-all ${inputClass}`}
               placeholder={lang === 'ro' ? 'Ex: Cumpără lapte...' : 'e.g. Buy groceries...'}
             />
          </div>

          <div className="grid grid-cols-2 gap-4 items-start mb-4">
             <div className="space-y-2">
                  <label className={labelClass}>📅 Deadline Date</label>
                  <input
                      type="date"
                      value={deadlineDate}
                      onChange={(e) => setDeadlineDate(e.target.value)}
                      className={`w-full p-3.5 border focus:outline-none focus:ring-2 transition-all cursor-pointer ${inputClass}`}
                  />
             </div>
             <div className="space-y-2">
                  <label className={labelClass}>🔁 Repeat</label>
                  <select
                      value={recurrence}
                      onChange={(e) => setRecurrence(e.target.value as any)}
                      className={`w-full p-3.5 border focus:outline-none focus:ring-2 transition-all cursor-pointer ${inputClass}`}
                  >
                      <option value="none">None</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                  </select>
             </div>
          </div>

          {useCustomColor && (
             <div className="space-y-2 mb-4">
                  <label className={labelClass}>
                    🎨 {lang === 'ro' ? 'Culoare Personalizată' : 'Custom Color'}
                  </label>
                  <div className="flex items-center gap-3">
                     <div 
                        className="relative flex items-center justify-center w-11 h-11 rounded-full overflow-hidden cursor-pointer border-2 shadow-sm transition-transform hover:scale-110"
                        style={{ borderColor: isSoft ? '#fbcfe8' : isNeon ? '#334155' : '#e2e8f0' }}
                     >
                          <input
                              type="color"
                              value={color}
                              onChange={(e) => setColor(e.target.value)}
                              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] p-0 m-0 cursor-pointer border-none"
                          />
                     </div>
                  </div>
             </div>
          )}

          <div className="space-y-2 mb-4">
            <label className={labelClass}>
              🔔 Anunță-mă înainte cu:
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  value={offsetValue}
                  onChange={e => setOffsetValue(Math.max(0, parseInt(e.target.value) || 0))}
                  className={`w-full p-3.5 border focus:outline-none focus:ring-2 transition-all cursor-pointer shadow-sm ${inputClass}`}
                />
              </div>
              <div className="flex-1">
                <select
                  value={offsetUnit}
                  onChange={e => setOffsetUnit(e.target.value)}
                  className={`w-full p-3.5 border focus:outline-none focus:ring-2 transition-all cursor-pointer shadow-sm appearance-none ${inputClass}`}
                >
                  <option value="minutes">Minute</option>
                  <option value="hours">Ore</option>
                  <option value="days">Zile</option>
                </select>
              </div>
            </div>
          </div>

          <button
             type="submit"
             disabled={!text.trim()}
             className={`w-full py-4 rounded-full font-extrabold text-white shadow-xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
             style={{ 
                 background: isSoft 
                     ? `linear-gradient(135deg, ${accentColor}, #f472b6)`
                     : `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, 
                 boxShadow: isSoft 
                     ? `0 10px 25px -3px rgba(244,114,182,0.4)`
                     : `0 10px 25px -3px ${accentColor}50` 
             }}
          >
             {initialTask ? (lang === 'ro' ? 'Salvează modificările' : 'Save Changes') : (lang === 'ro' ? 'Adaugă Task' : 'Add Task')}
          </button>
        </form>
      </div>
    </div>
  );
};
