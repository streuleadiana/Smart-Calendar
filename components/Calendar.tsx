
import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { CalendarEvent, Theme, Category } from '../types';
import { ChevronLeft, ChevronRight, Plus, Repeat } from 'lucide-react';
import { DayDetailModal } from './DayDetailModal';
import { HighlightText } from './HighlightText';

import { checkRecurrence, expandEventsForDateRange } from '../utils/recurrence';

interface CalendarProps {
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onDeleteEvent: (id: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  theme: Theme;
  accentColor?: string;
  searchQuery?: string;
  categories: Category[];
  lang: string;
}

const WEEKDAYS: Record<string, string[]> = {
  ro: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
  en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  es: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  fr: ['L', 'M', 'M', 'J', 'V', 'S', 'D']
};

export const Calendar: React.FC<CalendarProps> = ({ 
  events, 
  onDateSelect, 
  onDeleteEvent, 
  onEditEvent, 
  theme, 
  accentColor = '#4F46E5',
  searchQuery = '',
  categories,
  lang = 'ro'
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const isNeon = theme === 'neon';
  const isPastel = theme === 'soft';

  const daysOfWeek = WEEKDAYS[lang] || WEEKDAYS['en'];

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

  // Adjust for Monday start
  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // 0 (Sun) -> 6 (Sunday offset), 1 (Mon) -> 0, etc.
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
    
    // Create a precise date object for just this one day
    const targetDateObj = new Date(`${dateStr}T12:00:00`);
    
    // Expand to get actual localized instances (so event.date == dateStr)
    return expandEventsForDateRange(events, targetDateObj, targetDateObj);
  };

  const getEventsForDateObj = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayStr}`;
      
      const targetDateObj = new Date(`${dateStr}T12:00:00`);
      return expandEventsForDateRange(events, targetDateObj, targetDateObj);
  }

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    const allCells = [...blanks, ...days];

    // Theme Specific Classes
    const isPastel = theme === 'soft';
    const gridBg = isNeon ? 'bg-slate-800' : 'bg-slate-200';
    const cellBg = isNeon ? 'bg-slate-900 hover:bg-slate-800' : isPastel ? 'bg-[#fff5f7] hover:bg-[#fff0f4]' : 'bg-white hover:bg-slate-50';
    const textBase = isNeon ? 'text-cyan-50' : 'text-slate-700';
    const textMuted = isNeon ? 'text-slate-400' : 'text-slate-400';
    const dayHeaderBg = isNeon ? 'bg-slate-950 text-cyan-500' : isPastel ? 'bg-pink-50 text-pink-400' : 'bg-slate-50 text-slate-400';
    const todayHighlight = isNeon ? 'bg-cyan-900/30' : 'bg-pink-50/50';

    const cellHeightClass = 'min-h-[100px] sm:min-h-[160px]';

    return (
      <div className={`grid grid-cols-7 gap-px rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${gridBg} ${isNeon ? 'border border-slate-800' : ''}`}>
        {daysOfWeek.map((day, index) => (
          <div key={`header-${index}`} className={`py-2 sm:py-3 text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center ${dayHeaderBg}`}>
            <span>{day}</span>
          </div>
        ))}
        {allCells.map((day, index) => {
          if (day === null) {
            return <div key={`blank-${index}`} className={`${cellBg} ${cellHeightClass}`} />;
          }

          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const dayStr = String(day).padStart(2, '0');
          const cellDateStr = `${year}-${month}-${dayStr}`;

          const dayEvents = getEventsForDay(day);
          const isToday = 
            day === new Date().getDate() && 
            currentDate.getMonth() === new Date().getMonth() && 
            currentDate.getFullYear() === new Date().getFullYear();

          return (
            <div 
              key={day} 
              onClick={() => handleDayClick(day)}
              className={`${cellBg} ${cellHeightClass} p-1 sm:p-0 sm:py-2 flex flex-col transition-all cursor-pointer group relative active:scale-[0.98] ${isToday ? todayHighlight : ''}`}
            >
              <div className="flex justify-center sm:justify-between items-start mb-0.5 sm:mb-1 px-1 sm:px-2">
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
              
              <div className={`flex-1 overflow-y-auto custom-scrollbar flex flex-row flex-wrap sm:flex-col content-start justify-center sm:justify-start px-0 gap-1`}>
                {dayEvents.map((event, eventIndex) => {
                  const eventColor = getEventColor(event);
                  const isHighlighted = !!searchQuery;
                  
                  const isMultiDay = event.endDate && event.endDate !== event.date;
                  const isStart = event.date === cellDateStr;
                  const isEnd = event.endDate === cellDateStr;
                  const isMiddle = isMultiDay && !isStart && !isEnd;

                  let roundedClass = 'rounded-full sm:rounded-md';
                  let mlClass = 'sm:ml-2'; // Default margin left inside cell
                  let mrClass = 'sm:mr-2'; // Default margin right inside cell
                  
                  if (isMultiDay) {
                      if (isStart) {
                          roundedClass = 'rounded-full sm:rounded-l-md sm:rounded-r-none';
                          mrClass = 'sm:mr-0';
                      } else if (isEnd) {
                          roundedClass = 'rounded-full sm:rounded-r-md sm:rounded-l-none';
                          mlClass = 'sm:ml-0';
                      } else if (isMiddle) {
                          roundedClass = 'rounded-full sm:rounded-none';
                          mlClass = 'sm:ml-0';
                          mrClass = 'sm:mr-0';
                      }
                  }

                  const asBlock = isMultiDay;

                  const containerStyles: React.CSSProperties = {
                      ...(isHighlighted && { boxShadow: `0 0 0 2px ${accentColor}`, zIndex: 10 }),
                      backgroundColor: asBlock ? eventColor : undefined,
                      color: asBlock ? '#ffffff' : undefined,
                      borderLeftColor: !isMultiDay ? eventColor : 'transparent',
                      borderLeftWidth: !isMultiDay ? '2px' : '0px'
                  };

                  return (
                    <div 
                        key={`${event.id}-${day}`}
                        className={`text-xs p-0 sm:px-2 sm:py-1 transition-all flex items-center justify-center sm:justify-start gap-1 ${mlClass} ${mrClass} ${roundedClass} ${
                            asBlock 
                                ? 'shadow-sm border-0' 
                                : (isNeon ? 'sm:bg-slate-800 text-cyan-50' : 'sm:bg-white shadow-sm sm:shadow-none sm:border-y sm:border-r border-slate-100/50')
                        }`}
                        style={containerStyles}
                        title={`${event.title}${event.time ? ` (${event.time}${event.endTime ? ` - ${event.endTime}` : ''})` : ''}`}
                    >
                        {!isMultiDay && (
                           <div className={`w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full flex-shrink-0`} style={{ backgroundColor: eventColor }}></div>
                        )}
                        <div className={`block flex-1 truncate font-medium ${asBlock ? 'text-white' : (isNeon ? 'text-cyan-100' : 'text-slate-700')} ${(isMultiDay && !isStart) ? 'opacity-0' : ''} flex items-center gap-1`}>
                            {event.time && (!isMultiDay || isStart) && (
                                <span className={`${asBlock ? 'text-white/80' : textMuted} mr-1 font-normal whitespace-nowrap`}>
                                    {event.time}
                                </span>
                            )}
                            <div className="truncate flex items-center gap-1">
                                {event.recurrence && event.recurrence !== 'none' && (
                                   <Repeat size={10} className="inline-block opacity-60 flex-shrink-0" />
                                )}
                                <HighlightText text={event.title} highlight={searchQuery} />
                            </div>
                        </div>
                    </div>
                  );
                })}
                {dayEvents.length > 0 && <div className={`hidden w-full text-[8px] text-center text-slate-400 mt-0.5 pointer-events-none`}>+{dayEvents.length}</div>}
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

  const localeMap: Record<string, string> = { ro: 'ro-RO', en: 'en-US', es: 'es-ES', fr: 'fr-FR' };
  const locale = localeMap[lang] || 'en-US';
  
  const rawMonthStr = currentDate.toLocaleString(locale, { month: 'long', year: 'numeric' });
  const formattedMonth = rawMonthStr.charAt(0).toUpperCase() + rawMonthStr.slice(1);

  const tStrings: Record<string, {today: string, subtitle: string, aspect: string}> = {
    ro: { today: 'Azi', subtitle: 'Planifică-ți succesul', aspect: 'Aspect' },
    en: { today: 'Today', subtitle: 'Plan your success', aspect: 'Aspect Ratio' },
    es: { today: 'Hoy', subtitle: 'Planea tu éxito', aspect: 'Aspecto' },
    fr: { today: "Aujourd'hui", subtitle: 'Planifiez votre succès', aspect: 'Aspect' },
  };
  const t = tStrings[lang] || tStrings['en'];

  const calendarSwipeHandlers = useSwipeable({
    onSwipedLeft: (e) => {
      e.event.stopPropagation();
      changeMonth(1);
    },
    onSwipedRight: (e) => {
      e.event.stopPropagation();
      changeMonth(-1);
    },
    trackMouse: false,
    delta: 40,
  });

  return (
    <div {...calendarSwipeHandlers} className="w-full h-full flex flex-col">
      <div className="flex flex-row items-center justify-between mb-2 sm:mb-4 px-1 gap-2">
        <div className="text-left">
          <h2 className={`text-lg sm:text-2xl font-bold tracking-tight capitalize ${textHeader}`}>
            {formattedMonth}
          </h2>
          <p className={`hidden md:block ${subHeader} text-xs sm:text-sm mt-0.5`}>{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
            <div className={`flex items-center rounded-lg p-0.5 sm:p-1 border shadow-sm ${navContainer}`}>
              <button 
                onClick={() => changeMonth(-1)}
                className={`p-1 sm:p-1.5 rounded-md transition-colors ${buttonNav}`}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-md transition-colors border-x mx-0.5 sm:mx-1 flex-shrink-0 ${
                    isNeon 
                    ? 'text-cyan-400 hover:bg-slate-800 border-slate-700' 
                    : 'text-slate-600 hover:bg-slate-50 border-slate-100'
                }`}
                style={{ color: accentColor }}
              >
                {t.today}
              </button>
              <button 
                onClick={() => changeMonth(1)}
                className={`p-1 sm:p-1.5 rounded-md transition-colors ${buttonNav}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
            
            <button
               onClick={() => {
                   const now = new Date();
                   let targetDate = currentDate;
                   // If current view is same month/year as today, use today. Else use 1st of viewed month.
                   if (currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear()) {
                       targetDate = now;
                   } else {
                       targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                   }
                   onDateSelect(targetDate);
               }}
               className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-xl text-white font-medium text-xs sm:text-sm transition-transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
               style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, boxShadow: `0 4px 14px 0 ${accentColor}40` }}
            >
               <Plus size={16} strokeWidth={2} />
               <span className="hidden sm:inline break-keep whitespace-nowrap">{lang === 'ro' ? 'Adaugă Eveniment' : 'Add Event'}</span>
               <span className="sm:hidden break-keep whitespace-nowrap">{lang === 'ro' ? 'Adaugă' : 'Add'}</span>
            </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-24 sm:pb-4 custom-scrollbar">
         {renderCalendarGrid()}
      </div>

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
        lang={lang}
      />
    </div>
  );
};

