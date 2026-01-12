
import React, { useState, useEffect } from 'react';
import { CalendarEvent, Theme } from '../types';
import { X, Clock, Type, Save } from 'lucide-react';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, title: string, time?: string, endTime?: string) => void;
  event: CalendarEvent | null;
  theme: Theme;
  accentColor?: string;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({ isOpen, onClose, onSave, event, theme, accentColor = '#4F46E5' }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setTime(event.time || '');
      setEndTime(event.endTime || '');
    }
  }, [event, isOpen]);

  if (!isOpen || !event) return null;

  const isNeon = theme === 'neon';

  // Theme Styles
  const modalBg = isNeon ? 'bg-slate-900 border-slate-700' : 'bg-white';
  const textPrimary = isNeon ? 'text-white' : 'text-slate-800';
  const inputClass = isNeon
    ? 'bg-slate-800 border-slate-700 text-white focus:ring-cyan-500'
    : 'bg-white border-slate-300 text-slate-900 focus:ring-primary';
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(event.id, title, time || undefined, endTime || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 scale-100 animate-in zoom-in-95 duration-200 border ${modalBg}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-lg font-bold ${textPrimary}`}>Edit Event</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isNeon ? 'text-slate-400' : 'text-slate-700'}`}>Event Title</label>
            <div className="relative">
                <Type className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${inputClass}`}
                required
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className={`block text-sm font-medium mb-1 ${isNeon ? 'text-slate-400' : 'text-slate-700'}`}>Start Time</label>
                <div className="relative">
                    <Clock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${inputClass}`}
                    />
                </div>
            </div>
            <div>
                <label className={`block text-sm font-medium mb-1 ${isNeon ? 'text-slate-400' : 'text-slate-700'}`}>End Time</label>
                <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${inputClass}`}
                />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2 rounded-lg border font-medium transition-colors ${isNeon ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-2 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 text-white hover:opacity-90`}
              style={{ backgroundColor: accentColor }}
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
