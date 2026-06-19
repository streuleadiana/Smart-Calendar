import React, { useState, useEffect } from 'react';
import { CalendarEvent, Category, Theme } from '../types';
import { X, Clock, Calendar as CalendarIcon, Type, Palette } from 'lucide-react';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, eventData: Partial<CalendarEvent>) => void;
  event: CalendarEvent | null;
  accentColor?: string;
  categories: Category[];
  theme: Theme;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({ 
  isOpen, onClose, onSave, event, accentColor = '#4F46E5', categories, theme 
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [details, setDetails] = useState('');
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'yearly'>('none');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(accentColor);
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [offsetValue, setOffsetValue] = useState<number>(0);
  const [offsetUnit, setOffsetUnit] = useState<string>('minutes');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && event) {
      setTitle(event.title || '');
      setDate(event.date || '');
      setEndDate(event.endDate || '');
      setTime(event.time || '');
      setEndTime(event.endTime || '');
      setDetails(event.description || '');
      setRecurrence(event.recurrence || 'none');
      
      const existingOffset = event.notificationOffset || 0;
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
      
      if (event.categoryId) {
          setSelectedCategoryId(event.categoryId);
          setUseCustomColor(false);
      } else if (event.color) {
          setSelectedCategoryId(null);
          setSelectedColor(event.color);
          setUseCustomColor(true);
      } else {
          setSelectedCategoryId(categories.length > 0 ? categories[0].id : null);
          setUseCustomColor(false);
          setSelectedColor(accentColor);
      }
      setError(null);
    }
  }, [isOpen, event, categories, accentColor]);

  if (!isOpen || !event) return null;

  const isNeon = theme === 'neon';
  const isSoft = theme === 'soft';

  // Soft/Girly UI: Pink-tinted pastel background, heavy pink shadow, extra rounded
  const modalBg = isSoft
    ? 'bg-gradient-to-b from-white to-pink-50/95 backdrop-blur-xl border border-pink-100/80 shadow-[0_25px_60px_-15px_rgba(244,114,182,0.35)] text-slate-800 rounded-[2.2rem]'
    : isNeon
    ? 'bg-slate-900 border-slate-800 text-white shadow-[0_25px_60px_-15px_rgba(244,63,94,0.15)] rounded-[2.2rem]'
    : 'bg-white/95 backdrop-blur-xl border border-slate-100/90 text-slate-800 shadow-[0_25px_60px_-15px_rgba(99,102,241,0.15)] rounded-[2.2rem]';

  const inputClass = isSoft
    ? 'bg-white/75 focus:bg-white text-slate-800 border-pink-100/70 focus:ring-pink-300 focus:border-pink-300 rounded-2xl shadow-sm'
    : isNeon
    ? 'bg-slate-800 border-slate-700 text-white focus:ring-rose-500 rounded-2xl'
    : 'bg-slate-50 border-slate-200 focus:ring-indigo-300 rounded-2xl shadow-sm';

  const headingColor = isSoft ? 'text-pink-600 font-extrabold' : isNeon ? 'text-slate-100' : 'text-slate-900';
  const closeBtnHover = isSoft ? 'hover:bg-pink-100/50 text-pink-400 hover:text-pink-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800';

  const labelClass = isSoft
    ? 'text-xs font-bold tracking-wider text-pink-500/95 flex items-center gap-1.5 uppercase mb-1.5'
    : isNeon
    ? 'text-xs font-bold tracking-wider text-slate-400 flex items-center gap-1.5 uppercase mb-1.5'
    : 'text-xs font-bold tracking-wider text-indigo-500 flex items-center gap-1.5 uppercase mb-1.5';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title || !date) return;

    if (time && endTime) {
        if (endTime <= time) {
            setError(theme === 'soft' ? "Ora de sfârșit trebuie să fie după ora de început!" : "End time must be after start time.");
            return;
        }
    }

    try {
      let notificationOffset = 0;
      if (offsetUnit === 'minutes') {
          notificationOffset = offsetValue;
      } else if (offsetUnit === 'hours') {
          notificationOffset = offsetValue * 60;
      } else if (offsetUnit === 'days') {
          notificationOffset = offsetValue * 1440;
      }
      await onSave(event.id, {
        title,
        description: details || undefined,
        date,
        endDate: endDate || undefined,
        time: time || undefined,
        endTime: endTime || undefined,
        recurrence: recurrence !== 'none' ? recurrence : undefined,
        categoryId: selectedCategoryId || undefined,
        color: useCustomColor ? selectedColor : undefined,
        notificationOffset
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to update event");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className={`${modalBg} border w-full max-w-md overflow-hidden scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar`} onClick={(e) => e.stopPropagation()}>
        <div className={`px-6 py-5 border-b flex justify-between items-center ${isSoft ? 'border-pink-100/50 bg-pink-100/10' : isNeon ? 'border-slate-800' : 'border-slate-100'}`}>
          <h2 className={`text-lg font-extrabold ${headingColor}`}>✨ Edit Event</h2>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${closeBtnHover}`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col space-y-4">
          <div className="mb-4">
            <label className={labelClass}>
              🦄 Category
            </label>
            <select
              value={selectedCategoryId || ''}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className={`w-full p-3.5 border focus:outline-none focus:ring-2 transition-all cursor-pointer appearance-none ${inputClass}`}
            >
               <option value="">Alege o categorie...</option>
               {categories.map(cat => (
                   <option key={cat.id} value={cat.id}>{cat.name}</option>
               ))}
            </select>
          </div>

          <div className="mb-4">
            <label className={labelClass}>
              🏷️ Event Title
            </label>
            <input
              autoFocus
              type="text"
              required
              className={`w-full p-3.5 border focus:outline-none focus:ring-2 transition-all ${inputClass}`}
              placeholder="e.g., Team Meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-start mb-4">
            <div>
              <label className={labelClass}>
                📅 Start Date
              </label>
              <input
                type="date"
                required
                className={`w-full p-3.5 border focus:outline-none focus:ring-2 transition-all cursor-pointer ${inputClass}`}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>
                📅 End Date (Optional)
              </label>
              <input
                type="date"
                className={`w-full p-3.5 border focus:outline-none focus:ring-2 transition-all cursor-pointer ${inputClass}`}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-start mb-4">
            <div>
              <label className={labelClass}>
                ⏰ Start Time
              </label>
              <input
                type="time"
                className={`w-full p-3.5 border focus:outline-none focus:ring-2 transition-all cursor-pointer ${inputClass}`}
                value={time}
                onChange={(e) => {
                    setTime(e.target.value);
                    if (error) setError(null);
                }}
              />
            </div>
            <div>
              <label className={labelClass}>
                ⏰ End Time
              </label>
              <input
                type="time"
                className={`w-full p-3.5 appearance-none cursor-pointer border focus:ring-2 focus:outline-none transition-all ${
                  error 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : isSoft
                    ? 'border-pink-100/70 focus:ring-pink-300'
                    : isNeon
                    ? 'border-slate-700 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-indigo-300'
                } ${inputClass}`}
                value={endTime}
                onChange={(e) => {
                    setEndTime(e.target.value);
                    if (error) setError(null);
                }}
              />
            </div>
          </div>
          
          {error && (
            <p className="text-xs text-red-500 font-medium px-1 mb-4">✨ {error}</p>
          )}

          <div className="mb-4">
             <label className={labelClass}>
               ✍️ Detalii (opțional)
             </label>
             <textarea
                 className={`w-full p-4 border focus:outline-none focus:ring-2 transition-all resize-y ${inputClass}`}
                 rows={3}
                 value={details}
                 onChange={(e) => setDetails(e.target.value)}
                 placeholder="Adaugă detalii, note, link-uri..."
             />
          </div>

          <div className="mb-4">
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

          <div className="mb-4">
            <label className={labelClass}>
              🔁 Repetare
            </label>
            <select
              className={`w-full p-3.5 border focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${inputClass}`}
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as any)}
            >
              <option value="none">Nu se repetă</option>
              <option value="daily">Zilnic</option>
              <option value="weekly">Săptămânal</option>
              <option value="bi-weekly">Bi-săptămânal</option>
              <option value="monthly">Lunar</option>
              <option value="yearly">Anual</option>
            </select>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-3.5 rounded-full font-bold text-center border transition-colors ${
                isSoft 
                  ? 'border-pink-200 hover:bg-pink-100/30 text-pink-500' 
                  : isNeon 
                  ? 'border-slate-800 hover:bg-slate-800 text-slate-300' 
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3.5 rounded-full font-extrabold text-white shadow-xl transition-all hover:scale-[1.01] active:scale-95"
              style={{ 
                  background: isSoft 
                      ? `linear-gradient(135deg, ${accentColor}, #f472b6)`
                      : `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, 
                  boxShadow: isSoft 
                      ? `0 10px 25px -3px rgba(244,114,182,0.4)`
                      : `0 10px 25px -3px ${accentColor}50`
              }}
            >
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
