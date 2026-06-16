import React, { useState } from 'react';
import { CalendarEvent, Todo, Theme, Category } from '../types';
import { translations, LanguageOption } from '../utils/translations';
import { Calendar as CalendarIcon, CheckSquare, Clock } from 'lucide-react';

interface HomeDashboardProps {
    events: CalendarEvent[];
    todos: Todo[];
    theme: Theme;
    accentColor: string;
    lang: LanguageOption;
    categories: Category[];
    onTodoToggle: (id: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
    events,
    todos,
    theme,
    accentColor,
    lang,
    categories,
    onTodoToggle
}) => {
    const [filter, setFilter] = useState<'today' | 'week'>('today');
    const t = translations[lang];

    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    
    // Get end of week
    const todayObj = new Date();
    const dayOfWeek = todayObj.getDay();
    const isToday = (dateStr: string) => dateStr === todayStr;
    const isThisWeek = (dateStr: string) => {
        const dateObj = new Date(dateStr);
        const diffTime = dateObj.getTime() - todayObj.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= -dayOfWeek && diffDays <= (7 - dayOfWeek);
    };

    const displayEvents = events.filter(e => {
        if (!e.date) return false;
        return filter === 'today' ? isToday(e.date) : isThisWeek(e.date);
    }).sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dateA.getTime() - dateB.getTime();
    });

    // We'll show incomplete tasks, and maybe those that apply
    const displayTodos = todos.filter(t => !t.completed);

    const isNeon = theme === 'neon';
    const cardBg = isNeon ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800';
    const textMuted = isNeon ? 'text-slate-400' : 'text-slate-500';

    const getCategoryColor = (id?: string) => {
        if (!id) return accentColor;
        const cat = categories.find(c => c.id === id);
        return cat ? cat.color : accentColor;
    };

    return (
        <div className="h-full p-4 lg:p-8 overflow-y-auto animate-in fade-in duration-300">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className={`text-3xl font-bold ${isNeon ? 'text-white' : 'text-slate-800'}`}>Dashboard</h2>
                        <p className={textMuted}>
                            {new Date().toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <div className={`flex p-1 rounded-xl ${isNeon ? 'bg-slate-800' : 'bg-slate-100'} self-start`}>
                        <button
                            onClick={() => setFilter('today')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${filter === 'today' ? 'shadow-sm' : ''}`}
                            style={filter === 'today' ? { backgroundColor: isNeon ? '#1e293b' : '#ffffff', color: accentColor } : { color: isNeon ? '#94a3b8' : '#64748b' }}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setFilter('week')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${filter === 'week' ? 'shadow-sm' : ''}`}
                            style={filter === 'week' ? { backgroundColor: isNeon ? '#1e293b' : '#ffffff', color: accentColor } : { color: isNeon ? '#94a3b8' : '#64748b' }}
                        >
                            This Week
                        </button>
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
                                    <div key={event.id} className="flex gap-4 items-start p-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors" style={{ backgroundColor: `${getCategoryColor(event.categoryId)}10` }}>
                                        <div className="flex flex-col items-center min-w-[60px] flex-shrink-0 text-center">
                                            <span className="text-xs font-bold uppercase opacity-60">
                                                {new Date(`${event.date}T12:00:00`).toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', { weekday: 'short' })}
                                            </span>
                                            <span className="text-lg font-bold" style={{ color: event.color || getCategoryColor(event.categoryId) }}>
                                                {new Date(`${event.date}T12:00:00`).getDate()}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">{event.title}</h4>
                                            {event.time && (
                                                <div className="flex items-center gap-1.5 text-sm opacity-70">
                                                    <Clock size={14} />
                                                    {event.time} {event.endTime ? `- ${event.endTime}` : ''}
                                                </div>
                                            )}
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
                                        onClick={() => onTodoToggle(todo.id)}
                                        className="flex items-center gap-4 p-4 rounded-xl border border-transparent shadow-sm cursor-pointer hover:shadow-md transition-all"
                                        style={{ backgroundColor: `${getCategoryColor(todo.categoryId)}08` }}
                                    >
                                        <div 
                                            className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors"
                                            style={{ borderColor: todo.color || getCategoryColor(todo.categoryId) }}
                                        ></div>
                                        <span className="font-medium text-[15px]">{todo.text}</span>
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
