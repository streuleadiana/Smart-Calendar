
import React, { useState, useEffect } from 'react';
import { CalendarEvent, Category } from '../types';
import { X, Clock, Calendar as CalendarIcon, Type, Palette, Check } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  initialDate: Date;
  accentColor?: string;
  categories: Category[];
}

export const EventModal: React.FC<EventModalProps> = ({ 
  isOpen, onClose, onSave, initialDate, accentColor = '#4F46E5', categories 
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [details, setDetails] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(accentColor);
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDetails('');
      setTime('');
      setEndTime('');
      setSelectedCategoryId(categories.length > 0 ? categories[0].id : null);
      setSelectedColor(accentColor);
      setUseCustomColor(false);
      setError(null);
      
      const year = initialDate.getFullYear();
      const month = String(initialDate.getMonth() + 1).padStart(2, '0');
      const day = String(initialDate.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
    }
  }, [isOpen, initialDate, categories, accentColor]);

  if (!isOpen) return null;

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
      await onSave({
        title,
        description: details || undefined,
        date,
        time: time || undefined,
        endTime: endTime || undefined,
        categoryId: selectedCategoryId || undefined,
        color: useCustomColor ? selectedColor : undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to save event");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar border dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Add New Event</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1">
              <CalendarIcon size={14} /> Date
            </label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 appearance-none outline-none transition-all cursor-pointer"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
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

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1">
              <Type size={14} /> Category
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                      setSelectedCategoryId(cat.id);
                  }}
                  className={`px-2 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                    selectedCategoryId === cat.id && !useCustomColor
                      ? 'text-white'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  style={selectedCategoryId === cat.id && !useCustomColor ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1">
              <Palette size={14} /> Culoare Personalizată
            </label>
            <div className="flex items-center gap-3">
               <div 
                   className="relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 shadow-sm transition-transform hover:scale-105"
                   style={{ borderColor: useCustomColor ? selectedColor : '#e2e8f0' }}
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
               <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Alege o culoare...</span>
               {useCustomColor && (
                 <button 
                     type="button" 
                     onClick={() => {
                         setUseCustomColor(false);
                         setSelectedColor(accentColor);
                     }}
                     className="text-xs text-slate-400 dark:text-slate-500 underline ml-auto"
                 >
                     Reset
                 </button>
               )}
            </div>
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
