import React, { useState, useEffect } from 'react';
import { CalendarEvent, EventType } from '../types';
import { X, Clock, Calendar as CalendarIcon, Type } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  initialDate: Date;
}

const COLORS = [
  { type: 'urgent', label: 'Urgent', class: 'bg-red-500' },
  { type: 'work', label: 'Work', class: 'bg-blue-500' },
  { type: 'personal', label: 'Personal', class: 'bg-emerald-500' },
  { type: 'study', label: 'Study', class: 'bg-amber-500' },
];

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, initialDate }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedType, setSelectedType] = useState<EventType>('personal');

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setTitle('');
      setTime('');
      setSelectedType('personal');
      
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
    if (!title || !date) return;

    const colorClass = COLORS.find(c => c.type === selectedType)?.class || 'bg-slate-500';

    onSave({
      title,
      date,
      time: time || undefined,
      type: selectedType,
      color: colorClass,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
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

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Clock size={14} /> Time <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="time"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
              <Type size={14} /> Category
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {COLORS.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setSelectedType(opt.type as EventType)}
                  className={`px-2 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                    selectedType === opt.type
                      ? `border-${opt.class.replace('bg-', '')} ${opt.class} text-white`
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
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
