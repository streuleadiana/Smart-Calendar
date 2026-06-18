import React, { useState, useEffect } from 'react';
import { CalendarEvent, Todo, Theme, Category, VisionBoardItem, MoodLog, Note } from '../types';
import { translations, LanguageOption } from '../utils/translations';
import { Calendar as CalendarIcon, CheckSquare, Heart, X, CheckCircle2 } from 'lucide-react';
import { expandEventsForDateRange } from '../utils/recurrence';

interface HomeDashboardProps {
    events: CalendarEvent[];
    todos: Todo[];
    visionItems: VisionBoardItem[];
    moodLogs: MoodLog[];
    onSaveMood: (log: Omit<MoodLog, 'id'>) => Promise<void>;
    onSaveNote: (title: string, content: string, folder: string, color: string) => Promise<void>;
    setCurrentView: (view: 'home' | 'calendar' | 'tasks' | 'settings' | 'notes' | 'moods' | 'vision') => void;
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

const MOODS = [
  { id: 'great', emoji: '😄', label: 'Super' },
  { id: 'good', emoji: '🙂', label: 'Bine' },
  { id: 'neutral', emoji: '😐', label: 'Normal' },
  { id: 'bad', emoji: '😔', label: 'Rău' },
  { id: 'awful', emoji: '😢', label: 'Groaznic' }
];

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
    events,
    todos,
    visionItems,
    moodLogs,
    onSaveMood,
    onSaveNote,
    setCurrentView,
    theme,
    accentColor,
    lang,
    categories,
    onTodoToggle
}) => {
    const t = translations[lang];
    const isNeon = theme === 'neon';
    const isSoft = theme === 'soft';
    
    const bgGradient = isNeon ? 'bg-slate-900 border-slate-800 text-white' : isSoft ? 'bg-white/50 backdrop-blur-xl border-pink-100' : 'bg-white border-slate-100';
    
    const [heroItem, setHeroItem] = useState<VisionBoardItem | null>(null);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [quickNoteTitle, setQuickNoteTitle] = useState('');
    const [quickNoteContent, setQuickNoteContent] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);

    useEffect(() => {
        if (visionItems && visionItems.length > 0) {
            const random = visionItems[Math.floor(Math.random() * visionItems.length)];
            setHeroItem(random);
        } else {
            setHeroItem(null);
        }
    }, [visionItems]);

    const fallbackQuotes = [
        "Fiecare zi este o nouă șansă să devii cea mai bună versiune a ta. ✨",
        "Nu uita să iei o pauză și să respiri. Ești exact unde trebuie să fii. 🌸",
        "Lucrurile mici de azi devin amintirile prețioase de mâine. 💖",
        "Crede în magia noilor începuturi. 🌟",
        "Fii blândă cu tine însăți în timp ce crești. 🦋"
    ];
    
    // Choose one quote per day consistently
    const quoteIndex = Math.floor(Date.now() / 86400000) % fallbackQuotes.length;
    const dailyQuote = fallbackQuotes[quoteIndex];

    const todayCA = new Date().toLocaleDateString('en-CA');
    const todaysMood = moodLogs.find(m => m.date === todayCA);

    const displayTodos = todos.filter(t => !t.completed && (!t.deadlineDate || t.deadlineDate <= todayCA));
    
    const todayEvents = events.filter(e => e.date === todayCA).sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    const handleMoodSelect = async (moodId: string) => {
        await onSaveMood({ date: todayCA, mood: moodId as any, activities: [], note: '' });
    };

    const handleSaveQuickNote = async () => {
        if (!quickNoteTitle.trim() && !quickNoteContent.trim()) return;
        setIsSavingNote(true);
        try {
            await onSaveNote(
                quickNoteTitle.trim() || 'Notiță Rapidă',
                quickNoteContent.trim(),
                'Idei Generale',
                '#ffffff'
            );
            setQuickNoteTitle('');
            setQuickNoteContent('');
            setIsNoteModalOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSavingNote(false);
        }
    };

    const getCategoryColor = (id?: string) => {
        if (!id) return accentColor;
        const cat = categories.find(c => c.id === id);
        return cat ? cat.color : accentColor;
    };

    return (
        <div className="h-full p-4 pb-24 sm:pb-8 lg:p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-min">
                    
                    {/* Widget 1: Daily Inspiration (Hero) */}
                    <div className={`col-span-1 md:col-span-2 relative overflow-hidden rounded-[2rem] shadow-xl border ${bgGradient} min-h-[250px] flex items-end group transition-all`}>
                        {heroItem && heroItem.imageUrl ? (
                            <>
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                                <img src={heroItem.imageUrl} alt="Daily Inspiration" className="absolute inset-0 w-full h-full object-cover" />
                                <div className="relative z-20 p-8 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                    <span className="inline-block px-3 py-1 mb-3 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                                        Tema Zilei
                                    </span>
                                    {heroItem.quote && (
                                        <h3 className="text-2xl md:text-3xl font-bold text-white max-w-2xl leading-tight drop-shadow-md">
                                            "{heroItem.quote}"
                                        </h3>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center bg-gradient-to-br from-pink-100 to-purple-100">
                                <span className="inline-block px-3 py-1 mb-4 rounded-full bg-white/60 backdrop-blur-md text-sm font-bold uppercase tracking-wider border-white/40 border text-pink-600">
                                    Tema Zilei
                                </span>
                                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 max-w-2xl leading-relaxed text-center px-4">
                                    "{dailyQuote}"
                                </h3>
                                <button 
                                    onClick={() => setCurrentView('vision')}
                                    className="mt-6 px-6 py-2.5 rounded-full font-bold text-slate-700 bg-white/80 hover:bg-white shadow-sm border border-white transition-all hover:scale-105 active:scale-95 text-sm"
                                >
                                    Personalizează cu o imagine ✨
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Widget 2: Today's Schedule (Spans across) */}
                    <div className={`col-span-1 md:col-span-2 p-6 rounded-[2rem] shadow-lg border ${bgGradient}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-xl font-bold flex items-center gap-2 ${isNeon ? 'text-white' : 'text-slate-800'}`}>
                                🗓️ Programul de azi
                            </h3>
                            <button 
                                onClick={() => setCurrentView('calendar')}
                                className="text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"
                                style={{ color: accentColor }}
                            >
                                Vezi calendar
                            </button>
                        </div>
                        {todayEvents.length === 0 ? (
                            <div className="text-center py-6 opacity-60 font-medium">
                                Nu ai niciun eveniment planificat pentru azi! Bucură-te de timp liber ✨
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {todayEvents.map(event => (
                                    <div 
                                        key={event.id} 
                                        className={`flex items-center gap-3 p-3 rounded-2xl border border-transparent shadow-sm transition-all group`}
                                        style={{ backgroundColor: `${event.color || accentColor}10` }}
                                    >
                                        <div 
                                           className="w-1.5 h-full rounded-full min-h-[3rem]" 
                                           style={{ backgroundColor: event.color || accentColor }} 
                                        />
                                        <div className="flex-1 min-w-0 py-1">
                                            <div className={`font-medium truncate ${isNeon ? 'text-white' : 'text-slate-700'}`}>
                                                {event.title}
                                            </div>
                                            {event.time && (
                                                <div className={`text-sm tracking-tight font-medium opacity-70 truncate ${isNeon ? 'text-white' : 'text-slate-600'}`}>
                                                    {event.time} {event.endTime ? `- ${event.endTime}` : ''}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Widget 3: Quick Actions (Shortcuts Grid) */}
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setIsNoteModalOpen(true)}
                            className={`p-6 rounded-[2rem] shadow-lg border flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 ${bgGradient}`}
                        >
                            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-300 text-amber-600 shadow-inner">
                                <span className="text-2xl">✍️</span>
                            </div>
                            <span className={`font-bold tracking-tight ${isNeon ? 'text-white' : 'text-slate-800'}`}>Notiță Rapidă</span>
                        </button>
                        
                        <button 
                            onClick={() => setCurrentView('tasks')}
                            className={`p-6 rounded-[2rem] shadow-lg border flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 ${bgGradient}`}
                        >
                            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-300 text-emerald-600 shadow-inner">
                                <span className="text-2xl">✅</span>
                            </div>
                            <span className={`font-bold tracking-tight ${isNeon ? 'text-white' : 'text-slate-800'}`}>Task-uri</span>
                        </button>
                    </div>

                    {/* Widget 4: Mood Check-in */}
                    <div className={`p-6 rounded-[2rem] shadow-lg border flex flex-col justify-center ${bgGradient}`}>
                        {todaysMood ? (
                            <div className="text-center py-6">
                                <div className="text-6xl mb-4 animate-bounce">
                                    {MOODS.find(m => m.id === todaysMood.mood)?.emoji || '✨'}
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${isNeon ? 'text-white' : 'text-slate-800'}`}>
                                    Mi-ai spus cum te simți azi!
                                </h3>
                                <p className={isNeon ? 'text-slate-400' : 'text-slate-500'}>
                                    Să ai o zi minunată în continuare.
                                </p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <h3 className={`text-xl font-bold mb-6 ${isNeon ? 'text-white' : 'text-slate-800'}`}>
                                    Cum te simți astăzi?
                                </h3>
                                <div className="flex justify-center gap-2 sm:gap-4">
                                    {MOODS.map(mood => (
                                        <button
                                            key={mood.id}
                                            onClick={() => handleMoodSelect(mood.id)}
                                            className={`text-4xl sm:text-5xl hover:scale-110 transition-transform active:scale-95 filter drop-shadow-sm`}
                                            title={mood.label}
                                        >
                                            {mood.emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Quick Note Modal */}
            {isNoteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsNoteModalOpen(false)} />
                    <div className={`relative w-full max-w-lg p-6 rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-200 ${isNeon ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white text-slate-800'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold">Notiță Rapidă</h3>
                            <button 
                                onClick={() => setIsNoteModalOpen(false)}
                                className={`p-2 rounded-full transition-colors ${isNeon ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <input 
                                type="text"
                                placeholder="Titlu opțional..."
                                value={quickNoteTitle}
                                onChange={e => setQuickNoteTitle(e.target.value)}
                                className={`w-full p-4 text-lg font-bold rounded-2xl border-none focus:ring-2 transition-all ${isNeon ? 'bg-slate-800 focus:ring-slate-700 placeholder-slate-500' : 'bg-slate-50 focus:ring-slate-200 placeholder-slate-400'}`}
                            />
                            <textarea 
                                placeholder="Scrie aici la ce te gândești..."
                                value={quickNoteContent}
                                onChange={e => setQuickNoteContent(e.target.value)}
                                rows={5}
                                className={`w-full p-4 rounded-2xl border-none focus:ring-2 resize-none transition-all custom-scrollbar ${isNeon ? 'bg-slate-800 focus:ring-slate-700 placeholder-slate-500' : 'bg-slate-50 focus:ring-slate-200 placeholder-slate-400'}`}
                            />
                            <button 
                                onClick={handleSaveQuickNote}
                                disabled={isSavingNote || (!quickNoteTitle.trim() && !quickNoteContent.trim())}
                                className="w-full py-4 rounded-2xl font-bold text-white shadow-md active:scale-95 transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                style={{ backgroundColor: accentColor }}
                            >
                                {isSavingNote ? 'Se salvează...' : (
                                    <>
                                        <CheckCircle2 size={20} />
                                        Salvează Notița
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
