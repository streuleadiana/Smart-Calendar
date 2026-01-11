
import React, { useState, useEffect } from 'react';
import { CalendarEvent, EventType } from '../types';
import { X, Clock, Calendar as CalendarIcon, Type, Palette, Check } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  initialDate: Date;
}

const CATEGORIES = [
  { type: 'urgent', label: 'Urgent', class: 'bg-red-500' },
  { type: 'work', label: 'Work', class: 'bg-blue-500' },
  { type: 'personal', label: 'Personal', class: 'bg-emerald-500' },
  { type: 'study', label: 'Study', class: 'bg-amber-500' },
];

const CUSTOM_COLORS = [
  { name: 'Red', class: 'bg-red-500' },
  { name: 'Orange', class: 'bg-orange-500' },
  { name: 'Amber', class: 'bg-amber-500' },
  { name: 'Green', class: 'bg-green-500' },
  { name: 'Emerald', class: 'bg-emerald-500' },
  { name: 'Teal', class: 'bg-teal-500' },
  { name: 'Blue', class: 'bg-blue-500' },
  { name: 'Indigo', class: 'bg-indigo-500' },
  { name: 'Purple', class: 'bg-purple-500' },
  { name: 'Pink', class: 'bg-pink-500' },
  { name: 'Rose', class: 'bg-rose-500' },
  { name: 'Slate', class: 'bg-slate-500' },
];

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, initialDate }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedType, setSelectedType] = useState<EventType>('personal');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setTitle('');
      setTime('');
      setEndTime('');
      setSelectedType('personal');
      setSelectedColor(null);
      setError(null);
      
      // Format initialDate to YYYY-MM-DD
      const year = initialDate.getFullYear();
      const month = String(initialDate.getMonth() + 1).padStart(2, '0');
      const day = String(initialDate.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
    }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title || !date) return;

    // Time Validation
    if (time && endTime) {
        if (endTime <= time) {
            setError("End time must be after start time.");
            return;
        }
    }

    onSave({
      title,
      date,
      time: time || undefined,
      endTime: endTime || undefined,
      type: selectedType,
      color: selectedColor || undefined, // Pass custom color if selected
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Add New Event</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
            <input
              autoFocus
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="e.g., Team Meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <CalendarIcon size={14} /> Date
            </label>
            <input
              type="date"
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Clock size={14} /> Start Time
              </label>
              <input
                type="time"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                value={time}
                onChange={(e) => {
                    setTime(e.target.value);
                    if (error) setError(null);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                 End Time
              </label>
              <input
                type="time"
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-primary focus:border-primary'}`}
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
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
              <Type size={14} /> Category
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CATEGORIES.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => {
                      setSelectedType(opt.type as EventType);
                      setSelectedColor(null); // Reset custom color when category changes
                  }}
                  className={`px-2 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                    selectedType === opt.type && !selectedColor
                      ? `border-${opt.class.replace('bg-', '')} ${opt.class} text-white`
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
              <Palette size={14} /> Color (Optional Override)
            </label>
            <div className="flex flex-wrap gap-3">
              {CUSTOM_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.class)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${c.class} ${
                    selectedColor === c.class ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                  }`}
                  title={c.name}
                >
                  {selectedColor === c.class && <Check size={14} className="text-white" />}
                </button>
              ))}
              {selectedColor && (
                <button 
                    type="button" 
                    onClick={() => setSelectedColor(null)}
                    className="text-xs text-slate-400 underline ml-2"
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
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-indigo-600 text-white font-medium shadow-lg shadow-primary/25 transition-all"
            >
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
