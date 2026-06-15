
import React from 'react';
import { CalendarEvent, Theme, Category } from '../types';
import { X, Clock, Plus, Trash2, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { HighlightText } from './HighlightText';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  events: CalendarEvent[];
  onAddEvent: () => void;
  onDeleteEvent: (id: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  theme: Theme;
  accentColor?: string;
  searchQuery?: string;
  categories: Category[];
  lang?: string;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  date, 
  events, 
  onAddEvent, 
  onDeleteEvent,
  onEditEvent,
  theme,
  accentColor = '#4F46E5',
  searchQuery = '',
  categories,
  lang = 'ro'
}) => {
  if (!isOpen || !date) return null;

  const isNeon = theme === 'neon';
  const isPastel = theme === 'pastel';

  // Helper to resolve color
  const getEventColor = (event: CalendarEvent) => {
    if (event.color) return event.color;
    if (event.categoryId) {
        const cat = categories.find(c => c.id === event.categoryId);
        if (cat) return cat.color;
    }
    return '#94a3b8'; // default slate-400
  };

  // Sort events by time
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = a.time || '23:59';
    const timeB = b.time || '23:59';
    return timeA.localeCompare(timeB);
  });

  // Formatting
  const localeMap: Record<string, string> = { ro: 'ro-RO', en: 'en-US', es: 'es-ES', fr: 'fr-FR' };
  const locale = localeMap[lang] || 'en-US';
  const rawDayName = date.toLocaleDateString(locale, { weekday: 'long' });
  const dayName = rawDayName.charAt(0).toUpperCase() + rawDayName.slice(1);
  const fullDate = date.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });

  // Translations
  const tStrings: Record<string, {allDay: string, empty: string, sub: string, add: string}> = {
    ro: { allDay: 'Toată ziua', empty: 'Niciun eveniment planificat', sub: 'Timp să te relaxezi sau să planifici ceva nou! ☕', add: 'Adaugă Misiune' },
    en: { allDay: 'All Day', empty: 'Nothing scheduled', sub: 'Time to relax or plan something new! ☕', add: 'Add New Event' },
    es: { allDay: 'Todo el día', empty: 'Nada programado', sub: '¡Tiempo para relajarte o planear algo nuevo! ☕', add: 'Agregar Evento' },
    fr: { allDay: 'Toute la journée', empty: 'Rien de prévu', sub: 'Le temps de se détendre ou de planifier quelque chose de nouveau ! ☕', add: 'Ajouter un événement' }
  };
  const t = tStrings[lang] || tStrings['en'];

  // Styles
  const modalBg = isNeon ? 'bg-slate-900 border-slate-700' : isPastel ? 'bg-[#fffbf0] border-orange-100' : 'bg-white border-slate-200';
  const textPrimary = isNeon ? 'text-white' : 'text-slate-800';
  const textSecondary = isNeon ? 'text-slate-400' : 'text-slate-500';
  const closeBtn = isNeon ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500';
  
  const getEventBg = (event: CalendarEvent) => {
    if (isNeon) return 'bg-slate-800 border-slate-700';
    if (isPastel) return 'bg-white border-orange-100 shadow-sm';
    return 'bg-slate-50 border-slate-100';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] border ${modalBg}`}>
        
        {/* Header */}
        <div className={`px-8 py-6 border-b flex justify-between items-start ${isNeon ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-white/50'}`}>
          <div>
            <h2 className={`text-3xl font-bold tracking-tight ${textPrimary}`}>{dayName}</h2>
            <div className={`flex items-center gap-2 mt-1 ${textSecondary}`}>
              <CalendarIcon size={16} />
              <span className="font-medium">{fullDate}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-all ${closeBtn}`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {sortedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center opacity-60">
               <div className={`p-4 rounded-full mb-3 ${isNeon ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                  <Clock size={32} />
               </div>
               <p className={`font-medium ${textPrimary}`}>{t.empty}</p>
               <p className={`text-sm ${textSecondary}`}>{t.sub}</p>
            </div>
          ) : (
            sortedEvents.map(event => {
              const colorClass = getEventColor(event);
              const isHighlighted = !!searchQuery;
              return (
                <div 
                    key={event.id} 
                    onClick={() => onEditEvent(event)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all hover:scale-[1.01] group relative ${getEventBg(event)}`}
                    style={isHighlighted ? { boxShadow: `0 0 0 2px ${accentColor}` } : {}}
                    title="Click to Edit"
                >
                    <div className="flex gap-4">
                    {/* Time Column */}
                    <div className="flex flex-col items-center pt-1 min-w-[60px]">
                        <span className={`text-sm font-bold ${isNeon ? 'text-cyan-400' : 'text-slate-900'}`}>
                        {event.time || t.allDay}
                        </span>
                        {event.endTime && (
                        <span className={`text-xs opacity-60 ${isNeon ? 'text-slate-400' : 'text-slate-500'}`}>
                            {event.endTime}
                        </span>
                        )}
                        <div className={`w-0.5 flex-1 mt-2 mb-1 rounded-full opacity-30 ${colorClass.replace('bg-', 'bg-')}`}></div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 pb-1">
                        <div className="flex justify-between items-start">
                            <h3 className={`font-bold text-lg leading-tight mb-1 ${textPrimary}`}>
                                <HighlightText text={event.title} highlight={searchQuery} />
                            </h3>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(window.confirm('Delete this event?')) onDeleteEvent(event.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                             {/* Category Badge / Indicator */}
                            {event.categoryId ? (() => {
                                const cat = categories.find(c => c.id === event.categoryId);
                                return cat ? (
                                    <span 
                                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold border ${isNeon ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                        {cat.name}
                                    </span>
                                ) : null;
                            })() : event.color ? (
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.color }} title="Custom Color"></div>
                            ) : null}
                        </div>
                    </div>
                    </div>
                </div>
            )})
          )}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${isNeon ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-white/50'}`}>
          <button
            onClick={() => {
                onClose();
                onAddEvent();
            }}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 hover:opacity-90`}
            style={{ backgroundColor: accentColor }}
          >
            <Plus size={20} />
            {t.add}
          </button>
        </div>
      </div>
    </div>
  );
};
