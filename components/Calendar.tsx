
import React, { useState } from 'react';
import { CalendarEvent, Theme, Category } from '../types';
import { ChevronLeft, ChevronRight, Plus, ZoomIn, ZoomOut } from 'lucide-react';
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
  categories: Category[];
}

const DAYS_OF_WEEK = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
const MONTH_NAMES = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
];

export const Calendar: React.FC<CalendarProps> = ({ 
  events, 
  onDateSelect, 
  onDeleteEvent, 
  onEditEvent, 
  theme, 
  accentColor = '#4F46E5',
  searchQuery = '',
  categories
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [zoomLevel, setZoomLevel] = useState(2); // 1 = small, 2 = medium, 3 = large

  const isNeon = theme === 'neon';
  const isPastel = theme === 'pastel';

  // Helper to resolve color
  const getEventColor = (event: CalendarEvent) => {
    if (event.color) return event.color;
    if (event.categoryId) {
        const cat = categories.find(c => c.id === event.categoryId);
        if (cat) return cat.color;
    }
    return '#94a3b8'; // default slate-400 equivalent
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

    // Zoom Classes
    let cellHeightClass = 'min-h-[60px] sm:min-h-[120px]';
    let textDisplayClass = 'hidden sm:block';
    
    if (zoomLevel === 1) { // Zoomed Out (Small)
        cellHeightClass = 'min-h-[40px] sm:min-h-[80px]';
        textDisplayClass = 'hidden'; // Never show text
    } else if (zoomLevel === 3) { // Zoomed In (Large)
        cellHeightClass = 'min-h-[100px] sm:min-h-[160px]';
        textDisplayClass = 'block'; // Always show text
    }

    return (
      <div className={`grid grid-cols-7 gap-px rounded-xl sm:rounded-2xl overflow-hidden border shadow-sm ${gridBg} ${isNeon ? 'border-slate-800' : 'border-slate-200'}`}>
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className={`py-2 sm:py-3 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center ${dayHeaderBg}`}>
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
        {allCells.map((day, index) => {
          if (day === null) {
            return <div key={`blank-${index}`} className={`${cellBg} ${cellHeightClass}`} />;
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
              className={`${cellBg} ${cellHeightClass} p-1 sm:p-2 transition-all cursor-pointer group relative flex flex-col gap-0.5 sm:gap-1 active:scale-[0.98] ${isToday ? todayHighlight : ''}`}
            >
              <div className="flex justify-center sm:justify-between items-start mb-0.5 sm:mb-1">
                <span 
                    className={`text-xs sm:text-sm font-semibold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full transition-all ${isToday ? 'text-white shadow-md scale-110' : `${textBase} group-hover:scale-110`}`}
                    style={isToday ? { backgroundColor: accentColor } : {}}
                >
                  {day}
                </span>
                <div 
                  className={`hidden sm:block opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 ${isNeon ? 'text-cyan-400' : 'text-slate-400'}`}
                  style={!isNeon ? { color: accentColor } : {}}
                >
                  <Plus size={16} />
                </div>
              </div>
              
              <div className={`flex-1 overflow-y-auto custom-scrollbar flex ${zoomLevel === 1 ? 'flex-row flex-wrap content-start justify-center' : 'flex-row flex-wrap sm:flex-col content-start justify-center sm:justify-start'} gap-1`}>
                {dayEvents.map(event => {
                  const eventColor = getEventColor(event);
                  const isHighlighted = !!searchQuery;
                  
                  // Dynamic styles for the event container based on zoom
                  const containerStyles: React.CSSProperties = {
                      ...(isHighlighted && { boxShadow: `0 0 0 2px ${accentColor}`, zIndex: 10 }),
                      borderLeftColor: (zoomLevel > 1) ? eventColor : undefined // Use border color only if not zoom level 1 where we hide it
                  };

                  return (
                    <div 
                        key={event.id}
                        className={`text-xs p-0 sm:p-1.5 rounded-full sm:rounded-md border-0 sm:border-l-2 sm:shadow-sm transition-all flex items-center justify-center sm:justify-start gap-1 ${
                            isNeon ? 'sm:bg-slate-800 text-cyan-50 sm:hover:brightness-110' : 'sm:bg-white sm:hover:brightness-95'
                        }`}
                        style={containerStyles}
                        title={`${event.title}${event.time ? ` (${event.time}${event.endTime ? ` - ${event.endTime}` : ''})` : ''}`}
                    >
                        <div className={`w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full flex-shrink-0`} style={{ backgroundColor: eventColor }}></div>
                        <div className={`${textDisplayClass} flex-1 truncate font-medium ${isNeon ? 'text-cyan-100' : 'text-slate-700'}`}>
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
                {dayEvents.length > 0 && <div className={`${textDisplayClass === 'block' ? 'hidden' : 'sm:hidden'} w-full text-[8px] text-center text-slate-400 mt-0.5 pointer-events-none`}>+{dayEvents.length}</div>}
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
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 px-1 gap-2">
        <div className="text-center sm:text-left">
          <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${textHeader}`}>
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <p className={`${subHeader} text-xs sm:text-sm mt-0.5`}>Plan your success</p>
        </div>
        <div className="flex items-center gap-4">
            {/* Zoom Controls (Mobile Friendly) */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm ${navContainer}`}>
                <ZoomOut size={16} className={subHeader} />
                <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="1" 
                    value={zoomLevel} 
                    onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                    className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    style={{ accentColor: accentColor }}
                />
                <ZoomIn size={16} className={subHeader} />
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
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors border-x mx-1 flex-shrink-0 ${
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
      </div>
      
      {/* Mobile Zoom Controls (Visible only on small screens) */}
      <div className={`sm:hidden flex items-center justify-between gap-2 p-2 mb-4 rounded-lg border bg-opacity-50 ${navContainer}`}>
           <span className={`text-xs font-medium ${subHeader}`}>Aspect Ratio</span>
           <div className="flex items-center gap-2">
                <button 
                    onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1))}
                    disabled={zoomLevel === 1}
                    className={`p-1.5 rounded-md transition-colors disabled:opacity-50 ${buttonNav}`}
                >
                    <ZoomOut size={18} />
                </button>
                <div className="flex gap-1">
                    {[1,2,3].map(lvl => (
                        <div key={lvl} className={`w-2 h-2 rounded-full ${zoomLevel === lvl ? '' : 'bg-slate-300 opacity-50'}`} style={zoomLevel === lvl ? {backgroundColor: accentColor} : {}} />
                    ))}
                </div>
                <button 
                    onClick={() => setZoomLevel(Math.min(3, zoomLevel + 1))}
                    disabled={zoomLevel === 3}
                    className={`p-1.5 rounded-md transition-colors disabled:opacity-50 ${buttonNav}`}
                >
                    <ZoomIn size={18} />
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
        categories={categories}
      />
    </div>
  );
};

