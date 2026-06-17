import React, { useState } from 'react';
import { CalendarEvent, Todo, Theme, Category } from '../types';
import { translations, LanguageOption } from '../utils/translations';
import { Calendar as CalendarIcon, CheckSquare, Clock, Edit2, Trash2, Repeat, Heart } from 'lucide-react';
import { checkRecurrence, expandEventsForDateRange } from '../utils/recurrence';

interface HomeDashboardProps {
    events: CalendarEvent[];
    todos: Todo[];
    theme: Theme;
    accentColor: string;
    lang: LanguageOption;
    categories: Category[];
    onTodoToggle: (id: string) => void;
    onAddEventClick: () => void;
    onAddTaskClick: () => void;
    onEditEventClick: (event: CalendarEvent) => void;
    onDeleteEventClick: (id: string) => void;
    onEditTaskClick: (task: Todo) => void;
    onDeleteTaskClick: (id: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
    events,
    todos,
    theme,
    accentColor,
    lang,
    categories,
    onTodoToggle,
    onAddEventClick,
    onAddTaskClick,
    onEditEventClick,
    onDeleteEventClick,
    onEditTaskClick,
    onDeleteTaskClick
}) => {
    const [filter, setFilter] = useState<'day' | 'week' | 'month'>('day');
    const [selectedDashboardDate, setSelectedDashboardDate] = useState<Date>(new Date());
    const t = translations[lang];

    // Helper functions for date navigation
    const navigatePrevious = () => {
        const newDate = new Date(selectedDashboardDate);
        if (filter === 'day') newDate.setDate(selectedDashboardDate.getDate() - 1);
        else if (filter === 'week') newDate.setDate(selectedDashboardDate.getDate() - 7);
        else if (filter === 'month') newDate.setMonth(selectedDashboardDate.getMonth() - 1);
        setSelectedDashboardDate(newDate);
    };

    const navigateNext = () => {
        const newDate = new Date(selectedDashboardDate);
        if (filter === 'day') newDate.setDate(selectedDashboardDate.getDate() + 1);
        else if (filter === 'week') newDate.setDate(selectedDashboardDate.getDate() + 7);
        else if (filter === 'month') newDate.setMonth(selectedDashboardDate.getMonth() + 1);
        setSelectedDashboardDate(newDate);
    };

    const navigateToday = () => {
        setSelectedDashboardDate(new Date());
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const selectedDateStr = selectedDashboardDate.toLocaleDateString('en-CA');

    // Get end of week based on selected date
    const dayOfWeek = selectedDashboardDate.getDay();
    const processEventListTextMatches = (catId?: string) => {
        return catId ? categories.find(c => c.id === catId)?.name || 'Unknown' : '';
    };

    const displayEvents = (() => {
        let targetStart = new Date(selectedDashboardDate);
        targetStart.setHours(0, 0, 0, 0);
        let targetEnd = new Date(targetStart);
        
        if (filter === 'day') {
            targetEnd.setHours(23, 59, 59, 999);
        } else if (filter === 'week') {
            // Monday start
            const day = targetStart.getDay();
            const diff = targetStart.getDate() - day + (day === 0 ? -6 : 1);
            targetStart.setDate(diff);
            targetEnd = new Date(targetStart);
            targetEnd.setDate(targetStart.getDate() + 6);
            targetEnd.setHours(23, 59, 59, 999);
        } else if (filter === 'month') {
            targetStart.setDate(1);
            targetEnd = new Date(targetStart);
            targetEnd.setMonth(targetStart.getMonth() + 1);
            targetEnd.setDate(0);
            targetEnd.setHours(23, 59, 59, 999);
        }
        
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        return expandEventsForDateRange(events, targetStart, targetEnd)
            .filter(e => {
                // If the selected date is today, hide finished events that happened today
                if (filter === 'day' && isToday(selectedDashboardDate)) {
                    if (e.date !== todayStr) return true;
                    const endCompareTime = e.endTime || e.time;
                    if (!endCompareTime) return true;
                    return endCompareTime >= currentTime;
                }
                return true;
            })
            .sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
                const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
                return dateA.getTime() - dateB.getTime();
            });
    })();

    const displayTodos = (() => {
        // filter tasks based on deadlineDate
        // tasks without deadline are always shown in 'day' view if selected date is today, or in any view?
        // Let's show all unfinished tasks that either have no deadline, or have deadline <= targetEnd. But only for their specific group...
        // Actually, for simplicity: show all tasks due in the selected range, plus overdue/no-deadline in "today" context
        let targetStart = new Date(selectedDashboardDate);
        targetStart.setHours(0, 0, 0, 0);
        let targetEnd = new Date(targetStart);
        
        if (filter === 'day') {
            targetEnd.setHours(23, 59, 59, 999);
        } else if (filter === 'week') {
            const day = targetStart.getDay();
            const diff = targetStart.getDate() - day + (day === 0 ? -6 : 1);
            targetStart.setDate(diff);
            targetEnd = new Date(targetStart);
            targetEnd.setDate(targetStart.getDate() + 6);
            targetEnd.setHours(23, 59, 59, 999);
        } else if (filter === 'month') {
            targetStart.setDate(1);
            targetEnd = new Date(targetStart);
            targetEnd.setMonth(targetStart.getMonth() + 1);
            targetEnd.setDate(0);
            targetEnd.setHours(23, 59, 59, 999);
        }

        const startStr = targetStart.toLocaleDateString('en-CA');
        const endStr = targetEnd.toLocaleDateString('en-CA');

        return todos.filter(t => {
            if (t.completed) return false;
            
            // If it has no deadline and we're exploring present/past, maybe just show it
            if (!t.deadlineDate) return true;

            // Simple check: is deadline within our range, or before our start (overdue)?
            // If it's overdue, but we are looking at a past day, it might be weird. Let's just treat standard deadlines:
            if (t.recurrence && t.recurrence !== 'none') {
                 // evaluate recurrence over our range
                 const expanded = expandEventsForDateRange([{ ...t, id: t.id, title: t.text, date: t.deadlineDate, recurrence: t.recurrence } as any], targetStart, targetEnd);
                 return expanded.length > 0;
            }

            // no recurrence: is it strictly inside range, or overdue if we're on "today" range
            const isOverdue = t.deadlineDate < todayStr;
            const isInRange = t.deadlineDate >= startStr && t.deadlineDate <= endStr;
            
            if (isToday(selectedDashboardDate) && isOverdue) return true;
            return isInRange;
        });
    })();

    const isNeon = theme === 'neon';
    const cardBg = isNeon 
        ? 'bg-slate-900 border-slate-800 text-white rounded-3xl' 
        : 'bg-white border-transparent text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl';
    const textMuted = isNeon ? 'text-slate-400' : 'text-slate-500';

    const getCategoryColor = (id?: string) => {
        if (!id) return accentColor;
        const cat = categories.find(c => c.id === id);
        return cat ? cat.color : accentColor;
    };

    const getFormattedDateRange = () => {
        if (filter === 'day') {
            return selectedDashboardDate.toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        } else if (filter === 'week') {
            const start = new Date(selectedDashboardDate);
            const day = start.getDay();
            const diff = start.getDate() - day + (day === 0 ? -6 : 1);
            start.setDate(diff);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            return `${start.toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`;
        } else {
            return selectedDashboardDate.toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', { year: 'numeric', month: 'long' });
        }
    };

    const groupItemsByTime = <T extends any>(items: T[], isEvent: boolean) => {
        if (filter === 'day') {
             return [{ label: '', items }];
        } else if (filter === 'week') {
            const grouped = items.reduce((acc, item) => {
                const dateStr = isEvent ? item.date : (item.deadlineDate || 'no-deadline');
                if (!acc[dateStr]) acc[dateStr] = [];
                acc[dateStr].push(item);
                return acc;
            }, {} as Record<string, T[]>);
            return Object.keys(grouped).sort().map(d => {
                if (d === 'no-deadline') return { label: lang === 'ro' ? 'Fără termen' : 'No deadline', items: grouped[d] };
                const dt = new Date(`${d}T12:00:00`);
                return {
                    label: dt.toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }),
                    items: grouped[d]
                };
            });
        } else {
            const grouped = items.reduce((acc, item) => {
                const dateStr = isEvent ? item.date : (item.deadlineDate || 'no-deadline');
                if (dateStr === 'no-deadline') {
                    if (!acc['no-deadline']) acc['no-deadline'] = [];
                    acc['no-deadline'].push(item);
                    return acc;
                }
                const dt = new Date(`${dateStr}T12:00:00`);
                const weekNum = Math.ceil(dt.getDate() / 7);
                const weekStr = `${lang === 'ro' ? 'Săptămâna' : 'Week'} ${weekNum}`;
                if (!acc[weekStr]) acc[weekStr] = [];
                acc[weekStr].push(item);
                return acc;
            }, {} as Record<string, T[]>);
            return Object.keys(grouped).sort().map(week => ({
                label: week === 'no-deadline' ? (lang === 'ro' ? 'Fără termen' : 'No deadline') : week,
                items: grouped[week]
            }));
        }
    };

    const renderEvent = (event: CalendarEvent) => (
        <div key={`${event.id}-${event.date}`} className="flex gap-4 items-start p-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors group relative" style={{ backgroundColor: `${getCategoryColor(event.categoryId)}10` }}>
            <div className="flex flex-col items-center min-w-[60px] flex-shrink-0 text-center">
                <span className="text-xs font-bold uppercase opacity-60">
                    {new Date(`${event.date}T12:00:00`).toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', { weekday: 'short' })}
                </span>
                <span className="text-lg font-bold" style={{ color: event.color || getCategoryColor(event.categoryId) }}>
                    {new Date(`${event.date}T12:00:00`).getDate()}
                    {event.endDate && event.endDate !== event.date && (
                        <span className="text-sm">-{new Date(`${event.endDate}T12:00:00`).getDate()}</span>
                    )}
                </span>
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                    {event.title}
                    {event.recurrence && event.recurrence !== 'none' && (
                        <Repeat size={14} className="opacity-60 text-indigo-500" />
                    )}
                </h4>
                {event.time && (
                    <div className="flex items-center gap-1.5 text-sm opacity-70">
                        <Clock size={14} />
                        {event.time} {event.endTime ? `- ${event.endTime}` : ''}
                    </div>
                )}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                <button 
                    onClick={() => onEditEventClick(event)}
                    className="p-1.5 rounded bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-500 shadow hover:shadow-md transition-all"
                >
                    <Edit2 size={14} />
                </button>
                <button 
                    onClick={() => onDeleteEventClick(event.id)}
                    className="p-1.5 rounded bg-white dark:bg-slate-800 text-slate-500 hover:text-red-500 shadow hover:shadow-md transition-all"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );

    const renderTodo = (todo: Todo) => (
        <div 
            key={`${todo.id}-${todo.deadlineDate || 'no-date'}`} 
            className="flex items-center gap-4 p-4 rounded-xl border border-transparent shadow-sm hover:shadow-md transition-all group"
            style={{ backgroundColor: `${getCategoryColor(todo.categoryId)}08` }}
        >
            <button
                onClick={() => onTodoToggle(todo.id)}
                className={`flex-shrink-0 transition-all active:scale-95 ${
                  todo.completed 
                    ? 'scale-110' 
                    : isNeon ? 'text-slate-600 hover:text-slate-500' : 'text-slate-300 hover:text-slate-400'
                }`}
                style={{ color: todo.completed ? accentColor : (todo.color || getCategoryColor(todo.categoryId) || undefined) }}
            >
                {todo.completed ? <Heart size={20} className="fill-current" strokeWidth={1} /> : <Heart size={20} strokeWidth={1.5} />}
            </button>
            <span 
                onClick={() => onTodoToggle(todo.id)} 
                className={`font-medium text-[15px] flex-1 cursor-pointer flex items-center gap-2 ${todo.color && !todo.color.startsWith('#') ? todo.color : ''}`}
                style={{ color: todo.color && todo.color.startsWith('#') ? todo.color : undefined }}
            >
                {todo.text}
                {todo.recurrence && todo.recurrence !== 'none' && (
                    <Repeat size={14} className="opacity-60 text-indigo-500" />
                )}
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 flex-shrink-0">
                <button 
                    onClick={() => onEditTaskClick(todo)}
                    className="p-1.5 rounded bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-500 shadow-sm transition-all"
                >
                    <Edit2 size={13} />
                </button>
                <button 
                    onClick={() => onDeleteTaskClick(todo.id)}
                    className="p-1.5 rounded bg-white dark:bg-slate-800 text-slate-500 hover:text-red-500 shadow-sm transition-all"
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="h-full p-4 pb-24 sm:pb-8 lg:p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className={`text-3xl font-bold ${isNeon ? 'text-white' : 'text-slate-800'}`}>Dashboard</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <button onClick={navigatePrevious} className={`p-1.5 rounded-lg border flex items-center justify-center transition-colors ${isNeon ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            </button>
                            <button onClick={navigateToday} className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${isNeon ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                                {lang === 'ro' ? 'Azi' : 'Today'}
                            </button>
                            <button onClick={navigateNext} className={`p-1.5 rounded-lg border flex items-center justify-center transition-colors ${isNeon ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        </div>
                        <p className={`mt-2 font-medium ${textMuted}`}>
                            {getFormattedDateRange()}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 self-start sm:self-auto">
                        <div className={`flex p-1 rounded-xl ${isNeon ? 'bg-slate-800' : 'bg-slate-100'} self-start sm:self-auto`}>
                            <button
                                onClick={() => setFilter('day')}
                                className={`px-4 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'day' ? 'shadow-sm' : ''}`}
                                style={filter === 'day' ? { backgroundColor: isNeon ? '#1e293b' : '#ffffff', color: accentColor } : { color: isNeon ? '#94a3b8' : '#64748b' }}
                            >
                                {lang === 'ro' ? 'Ziua' : 'Day'}
                            </button>
                            <button
                                onClick={() => setFilter('week')}
                                className={`px-4 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'week' ? 'shadow-sm' : ''}`}
                                style={filter === 'week' ? { backgroundColor: isNeon ? '#1e293b' : '#ffffff', color: accentColor } : { color: isNeon ? '#94a3b8' : '#64748b' }}
                            >
                                {lang === 'ro' ? 'Săptămâna' : 'Week'}
                            </button>
                            <button
                                onClick={() => setFilter('month')}
                                className={`px-4 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'month' ? 'shadow-sm' : ''}`}
                                style={filter === 'month' ? { backgroundColor: isNeon ? '#1e293b' : '#ffffff', color: accentColor } : { color: isNeon ? '#94a3b8' : '#64748b' }}
                            >
                                {lang === 'ro' ? 'Luna' : 'Month'}
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onAddEventClick}
                                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
                                style={{ backgroundColor: accentColor }}
                            >
                                <CalendarIcon size={16} />
                                {lang === 'ro' ? '+ Eveniment' : '+ Add Event'}
                            </button>
                            <button
                                onClick={onAddTaskClick}
                                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
                                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, boxShadow: `0 4px 14px 0 ${accentColor}40` }}
                            >
                                <CheckSquare size={16} />
                                {lang === 'ro' ? '+ Task' : '+ Add Task'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Events Timeline */}
                    <div className={`p-6 rounded-2xl border ${cardBg}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <CalendarIcon size={24} style={{ color: accentColor }} />
                            <h3 className="text-xl font-bold">Schedule</h3>
                        </div>

                        {displayEvents.length === 0 ? (
                            <div className="text-center py-10 opacity-60 flex flex-col items-center">
                                <span className="text-4xl mb-3">✨</span>
                                <p className="font-medium">Niciun eveniment.</p>
                                <p className="text-sm">Folosește timpul pentru tine!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {groupItemsByTime(displayEvents, true).map((group, idx) => (
                                    <div key={idx} className="space-y-3">
                                        {group.label && (
                                            <h4 className={`text-sm font-bold tracking-wider uppercase opacity-70 border-b pb-2 ${isNeon ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                                                {group.label}
                                            </h4>
                                        )}
                                        <div className="space-y-3">
                                            {group.items.map(event => renderEvent(event as CalendarEvent))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pending Tasks */}
                    <div className={`p-6 rounded-2xl border ${cardBg}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <CheckSquare size={24} style={{ color: accentColor }} />
                            <h3 className="text-xl font-bold">Pending Tasks</h3>
                        </div>

                        {displayTodos.length === 0 ? (
                            <div className="text-center py-10 opacity-60 flex flex-col items-center">
                                <span className="text-4xl mb-3">🌸</span>
                                <p className="font-medium">Ai terminat tot!</p>
                                <p className="text-sm">Bucură-te de liniște ☕</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {groupItemsByTime(displayTodos, false).map((group, idx) => (
                                    <div key={idx} className="space-y-3">
                                        {group.label && (
                                            <h4 className={`text-sm font-bold tracking-wider uppercase opacity-70 border-b pb-2 ${isNeon ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                                                {group.label}
                                            </h4>
                                        )}
                                        <div className="space-y-3">
                                            {group.items.map(todo => renderTodo(todo as Todo))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
