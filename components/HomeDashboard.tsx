import React, { useState } from 'react';
import { CalendarEvent, Todo, Theme, Category } from '../types';
import { translations, LanguageOption } from '../utils/translations';
import { Calendar as CalendarIcon, CheckSquare, Clock, Edit2, Trash2, Repeat } from 'lucide-react';
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
    const [filter, setFilter] = useState<'today' | 'week'>('today');
    const t = translations[lang];

    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    
    // Get end of week
    const todayObj = new Date();
    const dayOfWeek = todayObj.getDay();
    const processEventListTextMatches = (catId?: string) => {
        return catId ? categories.find(c => c.id === catId)?.name || 'Unknown' : '';
    };

    const isEventToday = (e: CalendarEvent) => {
        return checkRecurrence(todayStr, e);
    };
    const isEventThisWeek = (e: CalendarEvent) => {
        // Build an array of date strings for the next 7 days (or current week)
        for (let i = 0; i <= 6; i++) {
            const checkDate = new Date(todayObj);
            checkDate.setDate(todayObj.getDate() - dayOfWeek + i);
            const y = checkDate.getFullYear();
            const m = String(checkDate.getMonth() + 1).padStart(2, '0');
            const d = String(checkDate.getDate()).padStart(2, '0');
            if (checkRecurrence(`${y}-${m}-${d}`, e)) return true;
        }
        return false;
    };

    const displayEvents = (() => {
        let targetStart = new Date();
        targetStart.setHours(0, 0, 0, 0);
        let targetEnd = new Date(targetStart);
        
        if (filter === 'today') {
            targetEnd.setHours(23, 59, 59, 999);
        } else {
            targetStart.setDate(targetStart.getDate() - dayOfWeek);
            targetEnd = new Date(targetStart);
            targetEnd.setDate(targetStart.getDate() + 6);
            targetEnd.setHours(23, 59, 59, 999);
        }
        
        return expandEventsForDateRange(events, targetStart, targetEnd).sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
            const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
            return dateA.getTime() - dateB.getTime();
        });
    })();

    const displayTodos = todos.filter(t => {
        if (t.completed) return false;
        if (!t.deadlineDate) return true; // Show tasks without due date always
        
        // Use calendar logic for task due dates
        if (filter === 'today') {
            return checkRecurrence(todayStr, { date: t.deadlineDate, recurrence: t.recurrence } as CalendarEvent) || t.deadlineDate < todayStr;
        } else {
            // week view: check if task is due any day this week, or is overdue
            if (t.deadlineDate < todayStr) return true;
            for (let i = 0; i <= 6; i++) {
                const checkDate = new Date(todayObj);
                checkDate.setDate(todayObj.getDate() - dayOfWeek + i);
                const y = checkDate.getFullYear();
                const m = String(checkDate.getMonth() + 1).padStart(2, '0');
                const d = String(checkDate.getDate()).padStart(2, '0');
                if (checkRecurrence(`${y}-${m}-${d}`, { date: t.deadlineDate, recurrence: t.recurrence } as CalendarEvent)) return true;
            }
            return false;
        }
    });

    const isNeon = theme === 'neon';
    const cardBg = isNeon ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800';
    const textMuted = isNeon ? 'text-slate-400' : 'text-slate-500';

    const getCategoryColor = (id?: string) => {
        if (!id) return accentColor;
        const cat = categories.find(c => c.id === id);
        return cat ? cat.color : accentColor;
    };

    return (
        <div className="h-full p-4 pb-24 sm:pb-8 lg:p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className={`text-3xl font-bold ${isNeon ? 'text-white' : 'text-slate-800'}`}>Dashboard</h2>
                        <p className={textMuted}>
                            {new Date().toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 self-start sm:self-auto">
                        <div className={`flex p-1 rounded-xl ${isNeon ? 'bg-slate-800' : 'bg-slate-100'} self-start sm:self-auto`}>
                            <button
                                onClick={() => setFilter('today')}
                                className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${filter === 'today' ? 'shadow-sm' : ''}`}
                                style={filter === 'today' ? { backgroundColor: isNeon ? '#1e293b' : '#ffffff', color: accentColor } : { color: isNeon ? '#94a3b8' : '#64748b' }}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setFilter('week')}
                                className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${filter === 'week' ? 'shadow-sm' : ''}`}
                                style={filter === 'week' ? { backgroundColor: isNeon ? '#1e293b' : '#ffffff', color: accentColor } : { color: isNeon ? '#94a3b8' : '#64748b' }}
                            >
                                This Week
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
                                style={{ backgroundColor: accentColor }}
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
                            <div className="text-center py-10 opacity-50 flex flex-col items-center">
                                <Clock size={40} className="mb-3 opacity-50" />
                                <p>No events set for {filter === 'today' ? 'today' : 'this week'}.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {displayEvents.map(event => (
                                    <div key={event.id} className="flex gap-4 items-start p-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors group relative" style={{ backgroundColor: `${getCategoryColor(event.categoryId)}10` }}>
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
                            <div className="text-center py-10 opacity-50 flex flex-col items-center">
                                <CheckSquare size={40} className="mb-3 opacity-50" />
                                <p>You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {displayTodos.map(todo => (
                                    <div 
                                        key={todo.id} 
                                        className="flex items-center gap-4 p-4 rounded-xl border border-transparent shadow-sm hover:shadow-md transition-all group"
                                        style={{ backgroundColor: `${getCategoryColor(todo.categoryId)}08` }}
                                    >
                                        <div 
                                            onClick={() => onTodoToggle(todo.id)}
                                            className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                                            style={{ borderColor: todo.color || getCategoryColor(todo.categoryId) }}
                                        ></div>
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
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
