
import React, { useState } from 'react';
import { CalendarEvent, Theme } from '../types';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { DayDetailModal } from './DayDetailModal';
import { HighlightText } from './HighlightText';

interface CalendarProps {
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onDeleteEvent: (id: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  theme: Theme;
  accentColor?: string;
  searchQuery?: string;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const Calendar: React.FC<CalendarProps> = ({ 
  events, 
  onDateSelect, 
  onDeleteEvent, 
  onEditEvent, 
  theme, 
  accentColor = '#4F46E5',
  searchQuery = ''
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const isNeon = theme === 'neon';
  const isPastel = theme === 'pastel';

  // Helper to resolve color
  const getEventColor = (event: CalendarEvent) => {
    if (event.color) return event.color;
    switch (event.type) {
      case 'urgent': return 'bg-red-500';
      case 'work': return 'bg-blue-500';
      case 'personal': return 'bg-emerald-500';
      case 'study': return 'bg-amber-500';
      default: return 'bg-slate-500';
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDay(newDate);
  };

  const handleAddEventFromDetail = () => {
    if (selectedDay) {
        onDateSelect(selectedDay);
        setSelectedDay(null);
    }
  };

  const getEventsForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    return events.filter(e => e.date === dateStr);
  };

  const getEventsForDateObj = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayStr}`;
      return events.filter(e => e.date === dateStr);
  }

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    const allCells = [...blanks, ...days];

    // Theme Specific Classes
    const gridBg = isNeon ? 'bg-slate-800' : 'bg-slate-200';
    const cellBg = isNeon ? 'bg-slate-900 hover:bg-slate-800' : isPastel ? 'bg-[#fffdf7] hover:bg-orange-50' : 'bg-white hover:bg-slate-50';
    const textBase = isNeon ? 'text-cyan-50' : 'text-slate-700';
    const textMuted = isNeon ? 'text-slate-400' : 'text-slate-400';
    const dayHeaderBg = isNeon ? 'bg-slate-950 text-cyan-500' : isPastel ? 'bg-stone-100 text-stone-500' : 'bg-slate-50 text-slate-400';
    const todayHighlight = isNeon ? 'bg-cyan-900/30' : 'bg-indigo-50/40';

    return (
      <div className={`grid grid-cols-7 gap-px rounded-2xl overflow-hidden border shadow-sm ${gridBg} ${isNeon ? 'border-slate-800' : 'border-slate-200'}`}>
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className={`py-3 text-center text-xs font-bold uppercase tracking-wider ${dayHeaderBg}`}>
            {day}
          </div>
        ))}
        {allCells.map((day, index) => {
          if (day === null) {
            return <div key={`blank-${index}`} className={`${cellBg} min-h-[120px]`} />;
          }

          const dayEvents = getEventsForDay(day);
          const isToday = 
            day === new Date().getDate() && 
            currentDate.getMonth() === new Date().getMonth() && 
            currentDate.getFullYear() === new Date().getFullYear();

          return (
            <div 
              key={day} 
              onClick={() => handleDayClick(day)}
              className={`${cellBg} min-h-[120px] p-2 transition-all cursor-pointer group relative flex flex-col gap-1 active:scale-[0.98] ${isToday ? todayHighlight : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span 
                    className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-all ${isToday ? 'text-white shadow-md scale-110' : `${textBase} group-hover:scale-110`}`}
                    style={isToday ? { backgroundColor: accentColor } : {}}
                >
                  {day}
                </span>
                <div 
                  className={`opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 ${isNeon ? 'text-cyan-400' : 'text-slate-400'}`}
                  style={!isNeon ? { color: accentColor } : {}}
                >
                  <Plus size={16} />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                {dayEvents.map(event => {
                  const colorClass = getEventColor(event);
                  const isHighlighted = !!searchQuery;
                  return (
                    <div 
                        key={event.id}
                        className={`text-xs p-1.5 rounded-md border-l-2 shadow-sm transition-all cursor-pointer flex items-center gap-1 ${
                            isNeon ? 'bg-slate-800 text-cyan-50 hover:brightness-110' : 'bg-white hover:brightness-95'
                        } ${colorClass.replace('bg-', 'border-')}`}
                        style={isHighlighted ? { boxShadow: `0 0 0 2px ${accentColor}`, zIndex: 10 } : {}}
                        title={`${event.title}${event.time ? ` (${event.time}${event.endTime ? ` - ${event.endTime}` : ''})` : ''}`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colorClass}`}></div>
                        <div className={`flex-1 truncate font-medium ${isNeon ? 'text-cyan-100' : 'text-slate-700'}`}>
                            {event.time && (
                                <span className={`${textMuted} mr-1 font-normal whitespace-nowrap`}>
                                    {event.time}{event.endTime ? `-${event.endTime}` : ''}
                                </span>
                            )}
                            <HighlightText text={event.title} highlight={searchQuery} />
                        </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const textHeader = isNeon ? 'text-white' : 'text-slate-800';
  const subHeader = isNeon ? 'text-slate-400' : 'text-slate-500';
  const buttonNav = isNeon ? 'text-cyan-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50';
  const navContainer = isNeon ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200';

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 px-1">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${textHeader}`}>
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <p className={`${subHeader} text-sm mt-0.5`}>Plan your success</p>
        </div>
        <div className={`flex items-center rounded-lg p-1 border shadow-sm ${navContainer}`}>
          <button 
            onClick={() => changeMonth(-1)}
            className={`p-1.5 rounded-md transition-colors ${buttonNav}`}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors border-x mx-1 ${
                isNeon 
                ? 'text-cyan-400 hover:bg-slate-800 border-slate-700' 
                : 'text-slate-600 hover:bg-slate-50 border-slate-100'
            }`}
            style={{ color: accentColor }}
          >
            Today
          </button>
          <button 
            onClick={() => changeMonth(1)}
            className={`p-1.5 rounded-md transition-colors ${buttonNav}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {renderCalendarGrid()}

      {/* Day Detail Modal */}
      <DayDetailModal 
        isOpen={!!selectedDay}
        date={selectedDay}
        onClose={() => setSelectedDay(null)}
        events={selectedDay ? getEventsForDateObj(selectedDay) : []}
        onAddEvent={handleAddEventFromDetail}
        onDeleteEvent={onDeleteEvent}
        onEditEvent={onEditEvent}
        theme={theme}
        accentColor={accentColor}
        searchQuery={searchQuery}
      />
    </div>
  );
};
