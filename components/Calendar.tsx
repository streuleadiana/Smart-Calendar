
import React, { useState } from 'react';
import { CalendarEvent, Theme } from '../types';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarProps {
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onDeleteEvent: (id: string) => void;
  theme: Theme;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const Calendar: React.FC<CalendarProps> = ({ events, onDateSelect, onDeleteEvent, theme }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const isNeon = theme === 'neon';
  const isPastel = theme === 'pastel';

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
    onDateSelect(newDate);
  };

  const getEventsForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    return events.filter(e => e.date === dateStr);
  };

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
    const todayBadge = isNeon ? 'bg-cyan-500 text-black shadow-cyan-500/50' : isPastel ? 'bg-orange-400 text-white' : 'bg-primary text-white';

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
              className={`${cellBg} min-h-[120px] p-2 transition-colors cursor-pointer group relative flex flex-col gap-1 ${isToday ? todayHighlight : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-all ${isToday ? `${todayBadge} shadow-md scale-110` : `${textBase} group-hover:scale-110`}`}>
                  {day}
                </span>
                <button 
                  className={`opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 ${isNeon ? 'text-cyan-400' : 'text-slate-400 hover:text-primary'}`}
                  title="Add Event"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                {dayEvents.map(event => (
                  <div 
                    key={event.id}
                    className={`group/event text-xs p-1.5 rounded-md border-l-2 shadow-sm transition-all hover:shadow-md cursor-default flex items-center gap-1 ${
                        isNeon ? 'bg-slate-800 text-cyan-50 hover:bg-slate-700' : 'bg-white hover:bg-slate-50'
                    } ${event.color.replace('bg-', 'border-')}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete "${event.title}"?`)) {
                        onDeleteEvent(event.id);
                      }
                    }}
                    title={`${event.title}${event.time ? ` at ${event.time}` : ''}`}
                  >
                     <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${event.color}`}></div>
                     <div className={`flex-1 truncate font-medium ${isNeon ? 'text-cyan-100' : 'text-slate-700'}`}>
                        {event.time && <span className={`${textMuted} mr-1 font-normal`}>{event.time}</span>}
                        {event.title}
                     </div>
                  </div>
                ))}
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
    </div>
  );
};
