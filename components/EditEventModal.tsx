import React, { useState, useEffect } from 'react';
import { CalendarEvent, Category } from '../types';
import { X, Clock, Calendar as CalendarIcon, Type, Palette } from 'lucide-react';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, eventData: Partial<CalendarEvent>) => void;
  event: CalendarEvent | null;
  accentColor?: string;
  categories: Category[];
}

export const EditEventModal: React.FC<EditEventModalProps> = ({ 
  isOpen, onClose, onSave, event, accentColor = '#4F46E5', categories 
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title || !date) return;

    if (time && endTime) {
        if (endTime <= time) {
            setError("End time must be after start time.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar border dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Edit Event</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1">
              <Type size={14} /> Category
            </label>
            <select
                value={selectedCategoryId || ''}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                 <option value="">Alege o categorie...</option>
                 {categories.map(cat => (
                     <option key={cat.id} value={cat.id}>{cat.name}</option>
                 ))}
              </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Event Title</label>
            <input
              autoFocus
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="e.g., Team Meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1">
                <CalendarIcon size={14} /> Start Date
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 appearance-none outline-none transition-all cursor-pointer"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 appearance-none outline-none transition-all cursor-pointer"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1">
                <Clock size={14} /> Start Time
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 appearance-none outline-none transition-all cursor-pointer"
                value={time}
                onChange={(e) => {
                    setTime(e.target.value);
                    if (error) setError(null);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1">
                 End Time
              </label>
              <input
                type="time"
                className={`w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none cursor-pointer border focus:ring-2 outline-none transition-all ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-700 dark:focus:border-red-600' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'}`}
                value={endTime}
                onChange={(e) => {
                    setEndTime(e.target.value);
                    if (error) setError(null);
                }}
              />
            </div>
          </div>
          
          {error && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          )}

          <div>
             <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Detalii (opțional)</label>
             <textarea
                 className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y placeholder:text-slate-400 dark:placeholder:text-slate-500"
                 rows={3}
                 value={details}
                 onChange={(e) => setDetails(e.target.value)}
                 placeholder="Adaugă detalii, note, link-uri..."
             />
          </div>

          {time && (
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                  Anunță-mă înainte cu:
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      value={offsetValue}
                      onChange={e => setOffsetValue(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer shadow-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <select
                      value={offsetUnit}
                      onChange={e => setOffsetUnit(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer shadow-sm appearance-none"
                    >
                      <option value="minutes">Minute</option>
                      <option value="hours">Ore</option>
                      <option value="days">Zile</option>
                    </select>
                  </div>
                </div>
              </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Repetare</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg text-white font-medium shadow-lg transition-all hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
