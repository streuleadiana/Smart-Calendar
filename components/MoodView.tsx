import React, { useState } from 'react';
import { Sparkles, Calendar, Heart, MessageCircle, X } from 'lucide-react';
import { Theme, MoodLog } from '../types';

interface MoodViewProps {
  moodLogs: MoodLog[];
  onSaveMood: (log: Omit<MoodLog, 'id'>) => Promise<void>;
  theme: Theme;
  accentColor: string;
}

const DEFAULT_MOODS = [
  { emoji: '🤩', label: 'Super', color: '#fef08a' }, // yellow-200
  { emoji: '😊', label: 'Bine', color: '#bbf7d0' }, // green-200
  { emoji: '😐', label: 'Neutru', color: '#bfdbfe' }, // blue-200
  { emoji: '😔', label: 'Trist', color: '#c084fc' }, // purple-400
  { emoji: '😤', label: 'Stresată', color: '#fecaca' }, // red-200
];

export const MoodView: React.FC<MoodViewProps> = ({ moodLogs, onSaveMood, theme, accentColor }) => {
  const isNeon = theme === 'neon';
  const isSoft = theme === 'soft';
  const textPrimary = isNeon ? 'text-white' : 'text-slate-800';
  const textSecondary = isNeon ? 'text-slate-400' : 'text-slate-500';

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString();
  const todayMood = moodLogs.find(m => m.date === todayStr);

  const [selectedMoodDate, setSelectedMoodDate] = useState<string>(todayStr);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<{ emoji: string, label: string, color: string } | null>(null);
  const [journalNote, setJournalNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [recapText, setRecapText] = useState('');
  const [isGeneratingRecap, setIsGeneratingRecap] = useState(false);
  
  const [selectedDayLog, setSelectedDayLog] = useState<MoodLog | null>(null);

  // Sync state once the mood logs are loaded asynchronously from Firestore
  React.useEffect(() => {
    const activeLog = moodLogs.find(m => m.date === selectedMoodDate);
    if (activeLog) {
      setSelectedMood({ emoji: activeLog.moodEmoji, label: activeLog.moodLabel, color: activeLog.color });
      setJournalNote(activeLog.journalNote || '');
    } else {
      setSelectedMood(null);
      setJournalNote('');
    }
  }, [selectedMoodDate, moodLogs]);

  const handleSave = async () => {
    if (!selectedMood) return;
    setIsSaving(true);
    try {
      await onSaveMood({
        date: selectedMoodDate,
        moodEmoji: selectedMood.emoji,
        moodLabel: selectedMood.label,
        color: selectedMood.color,
        journalNote: journalNote.trim()
      });
      setIsMoodModalOpen(false);
    } catch (error) {
      console.error("Failed to save mood log:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateRecap = async () => {
    setIsGeneratingRecap(true);
    setShowRecapModal(true);
    try {
        const currentDate = new Date();
        const currentMonthLogs = moodLogs.filter(log => {
            const logDate = new Date(log.date);
            return logDate.getMonth() === currentDate.getMonth() && logDate.getFullYear() === currentDate.getFullYear();
        });

        if (currentMonthLogs.length === 0) {
            setRecapText("Nu ai adăugat încă nicio stare în această lună. Notează cum te simți pentru a primi un rezumat!");
            setIsGeneratingRecap(false);
            return;
        }

        const formattedLogs = currentMonthLogs.map(log => `${log.date}: ${log.moodEmoji} ${log.moodLabel}${log.journalNote ? ` - Note: ${log.journalNote}` : ''}`).join('\n');

        const res = await fetch('/api/mood-recap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logs: formattedLogs })
        });
        const data = await res.json();
        if (data.error) {
            setRecapText("Eroare la generare: " + data.error);
        } else {
            setRecapText(data.text);
        }
    } catch (e: any) {
        setRecapText("A intervenit o eroare. Te rog să încerci din nou.");
    } finally {
        setIsGeneratingRecap(false);
    }
  };

  const [hoveredPixel, setHoveredPixel] = useState<{ log?: MoodLog, date: Date, x: number, y: number } | null>(null);

  const renderYearInPixels = () => {
      const now = new Date();
      const year = now.getFullYear();
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      const daysCount = isLeapYear ? 366 : 365;
      
      const pixels = [];
      const startDate = new Date(year, 0, 1);
      
      for (let i = 0; i < daysCount; i++) {
          const d = new Date(startDate);
          d.setDate(d.getDate() + i);
          const dateStr = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const log = moodLogs.find(m => m.date === dateStr);
          
          // Only zero out time for 'now' to compare dates correctly
          const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const compareDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const isFuture = compareDate > todayDate;
          
          let bgClass = isNeon ? 'bg-slate-800' : 'bg-slate-100';
          let style = {};
          
          if (log) {
              style = { backgroundColor: log.color };
              bgClass = 'shadow-sm';
          } else if (isFuture) {
              bgClass = isNeon ? 'bg-transparent border border-slate-800/60' : 'bg-transparent border border-slate-200/60';
          }

          pixels.push(
              <button 
                  key={i}
                  onMouseEnter={(e) => {
                      if (!isFuture) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredPixel({
                              log,
                              date: d,
                              x: rect.left + rect.width / 2,
                              y: rect.top
                          });
                      }
                  }}
                  onMouseLeave={() => setHoveredPixel(null)}
                  onClick={() => {
                      if (!isFuture) {
                          setSelectedMoodDate(dateStr);
                          setIsMoodModalOpen(true);
                      }
                  }}
                  disabled={isFuture}
                  className={`w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] rounded-[4px] sm:rounded-md transition-all duration-300 ${bgClass} ${!isFuture ? 'hover:scale-150 hover:z-10 cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-40'}`}
                  style={style}
              />
          );
      }
      return pixels;
  };

  return (
    <div className={`flex flex-col w-full px-4 pb-32 lg:pb-8 animate-in slide-in-from-bottom-2 ${isNeon ? 'bg-slate-950 text-slate-200' : 'bg-[#fafafa]'}`}>
        <div className="max-w-xl w-full mx-auto mt-6">
            
            <div className="flex items-center justify-between mb-8">
                <h1 className={`text-3xl font-extrabold tracking-tight ${textPrimary} flex items-center gap-2`}>
                   <Heart className="text-pink-400 fill-pink-400" size={28} />
                   Calendarul Stărilor
                </h1>
                <button 
                    onClick={handleGenerateRecap}
                    className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-bold shadow-md transition-transform hover:-translate-y-0.5 active:scale-95 text-white bg-gradient-to-r from-indigo-500 to-purple-500`}
                >
                    <Sparkles size={18} />
                    <span className="hidden sm:inline">AI Recap</span>
                </button>
            </div>

            {/* Check-in Card (Soft UI) */}
            <div className={`rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 mb-8 transition-all ${isNeon ? 'bg-slate-900 border border-slate-800' : isSoft ? 'bg-white border border-pink-50' : 'bg-white'}`}>
                 <div className="flex flex-col items-center mb-6">
                    <h2 className={`text-xl font-bold text-center ${textPrimary} flex items-center gap-2 justify-center`}>
                        <span>{selectedMoodDate === todayStr ? 'Cum te simți azi?' : 'Cum te-ai simțit?'}</span>
                        {moodLogs.some(m => m.date === selectedMoodDate) && (
                            <span className="text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded-full font-semibold animate-pulse">
                                Înregistrat ✨
                            </span>
                        )}
                    </h2>
                    {moodLogs.some(m => m.date === selectedMoodDate) && (
                        <p className={`text-xs text-center mt-1 ${textSecondary}`}>
                            Ai înregistrat deja starea pentru această dată. O poți edita mai jos.
                        </p>
                    )}
                    
                    {/* Soft-styled Date Picker Inline */}
                    <div className="mt-3 flex flex-col gap-1 w-full max-w-xs mx-auto">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary} text-center`}>Alege Data</label>
                        <input 
                            type="date"
                            value={selectedMoodDate}
                            max={todayStr}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val <= todayStr) {
                                    setSelectedMoodDate(val);
                                }
                            }}
                            className={`w-full p-2 px-3 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all border ${
                                isNeon 
                                    ? 'bg-slate-800 border-slate-700 text-white' 
                                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                            } font-semibold text-sm cursor-pointer`}
                        />
                    </div>
                </div>
                <div className="flex justify-between sm:justify-center sm:gap-6 mb-6">
                    {DEFAULT_MOODS.map(mood => (
                        <button
                            key={mood.label}
                            onClick={() => setSelectedMood(mood)}
                            className={`flex flex-col items-center gap-2 transition-all p-2 rounded-2xl hover:scale-105 active:scale-95 ${selectedMood?.label === mood.label ? 'ring-2 ring-offset-2 ring-indigo-400 bg-slate-50' : 'opacity-80 hover:opacity-100 hover:bg-slate-50'}`}
                        >
                            <div className="w-12 h-12 flex items-center justify-center rounded-full text-2xl shadow-sm border border-black/5" style={{ backgroundColor: mood.color }}>
                                {mood.emoji}
                            </div>
                            <span className={`text-xs font-medium ${selectedMood?.label === mood.label ? 'text-indigo-600 font-bold' : textSecondary}`}>{mood.label}</span>
                        </button>
                    ))}
                </div>

                {selectedMood && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300 flex flex-col gap-4">
                         <textarea 
                            value={journalNote}
                            onChange={(e) => setJournalNote(e.target.value)}
                            placeholder="De ce te simți așa? (Opțional)"
                            className={`w-full p-4 rounded-2xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all ${isNeon ? 'bg-slate-800 text-white placeholder-slate-500' : 'bg-slate-50/50 border border-slate-100 placeholder-slate-400'}`}
                         />
                         <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`w-full py-3.5 rounded-2xl font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{ backgroundColor: accentColor }}
                         >
                            {isSaving ? 'Se salvează...' : 'Salvează Starea'}
                         </button>
                    </div>
                )}
            </div>

            {/* Calendar Grid -> Year in Pixels */}
            <div className={`rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 transition-all ${isNeon ? 'bg-slate-900 border border-slate-800' : isSoft ? 'bg-white border border-pink-50' : 'bg-white'}`}>
                <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${textPrimary}`}>
                    <Calendar size={20} className={isNeon ? 'text-indigo-400' : 'text-indigo-500'} />
                    Anul în Pixeli
                </h3>
                
                <div className="flex flex-wrap gap-1 md:gap-1.5 justify-center sm:justify-start">
                    {renderYearInPixels()}
                </div>
            </div>

        </div>

        {/* Floating Tooltip */}
        {hoveredPixel && (
            <div 
                className="fixed z-[150] pointer-events-none -translate-x-1/2 -translate-y-full pb-3 animate-in fade-in zoom-in-95 duration-100"
                style={{ left: hoveredPixel.x, top: hoveredPixel.y }}
            >
                <div className={`p-3 rounded-2xl shadow-xl border ${isNeon ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-100 text-slate-800'}`}>
                    <div className="text-xs font-bold opacity-70 mb-1">
                        {hoveredPixel.date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    {hoveredPixel.log ? (
                         <div className="flex flex-col gap-1">
                             <div className="flex items-center gap-2">
                                <span className="text-xl">{hoveredPixel.log.moodEmoji}</span>
                                <span className="font-bold">{hoveredPixel.log.moodLabel}</span>
                             </div>
                             {hoveredPixel.log.journalNote && (
                                 <div className="text-sm mt-1 max-w-[200px] line-clamp-2 italic opacity-80">
                                     "{hoveredPixel.log.journalNote}"
                                 </div>
                             )}
                         </div>
                    ) : (
                        <div className="text-sm italic opacity-60">Nicio înregistrare</div>
                    )}
                </div>
            </div>
        )}

        {/* Recap Modal */}
        {showRecapModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => setShowRecapModal(false)}></div>
                <div className={`relative w-full max-w-md flex flex-col rounded-[2rem] shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 border ${isNeon ? 'bg-slate-900 border-slate-800' : isSoft ? 'bg-[#fffbf0] border-pink-100' : 'bg-white border-slate-100'}`}>
                   <div className="flex justify-between items-center mb-4">
                       <h2 className={`text-2xl font-bold flex items-center gap-2 ${isNeon ? 'text-indigo-300' : 'text-indigo-600'}`}>
                           <Sparkles size={24} /> AI Recap
                       </h2>
                       <button onClick={() => setShowRecapModal(false)} className={`p-2 rounded-full transition-colors ${isNeon ? 'hover:bg-slate-800 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                           <X size={20} />
                       </button>
                   </div>
                   <div className={`flex-1 overflow-y-auto custom-scrollbar p-2 -mx-2 ${textPrimary}`}>
                       {isGeneratingRecap ? (
                           <div className="flex flex-col items-center justify-center py-8 gap-4 opacity-70">
                               <Sparkles size={32} className="animate-spin text-indigo-400" />
                               <p className="font-medium text-sm animate-pulse">Gemini analizează stările tale...</p>
                           </div>
                       ) : (
                           <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base font-medium opacity-90">{recapText}</div>
                       )}
                   </div>
                </div>
            </div>
        )}
        
        {/* Mood Logging Modal */}
        {isMoodModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => setIsMoodModalOpen(false)}></div>
                <div className={`relative w-full max-w-sm flex flex-col rounded-[2rem] shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 border ${isNeon ? 'bg-slate-900 border-slate-800' : isSoft ? 'bg-[#fff9fa] border-pink-100' : 'bg-white border-slate-100'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className={`text-xl font-bold flex items-center gap-2 ${textPrimary}`}>
                            <Heart className="text-pink-400 fill-pink-400" size={20} />
                            <span>Înregistrează starea</span>
                        </h2>
                        <button onClick={() => setIsMoodModalOpen(false)} className={`p-2 rounded-full transition-colors ${isNeon ? 'hover:bg-slate-800 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Date Selector */}
                    <div className="flex flex-col gap-1.5 align-start text-left mb-4">
                        <label className={`text-[11px] font-bold uppercase tracking-wider ${textSecondary}`}>Data stării</label>
                        <input 
                            type="date"
                            value={selectedMoodDate}
                            max={todayStr}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val <= todayStr) {
                                    setSelectedMoodDate(val);
                                }
                            }}
                            className={`w-full p-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all border ${
                                isNeon 
                                    ? 'bg-slate-800 border-slate-700 text-white' 
                                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                            } font-semibold text-sm cursor-pointer`}
                        />
                    </div>

                    {/* Mood Emojis */}
                    <div className="flex flex-col gap-1.5 align-start text-left mb-4">
                        <label className={`text-[11px] font-bold uppercase tracking-wider ${textSecondary}`}>Selectează starea</label>
                        <div className="flex justify-between gap-1 mt-1">
                            {DEFAULT_MOODS.map(mood => (
                                <button
                                    key={mood.label}
                                    type="button"
                                    onClick={() => setSelectedMood(mood)}
                                    className={`flex flex-col items-center gap-1 transition-all p-1.5 rounded-2xl hover:scale-105 active:scale-95 ${
                                        selectedMood?.label === mood.label 
                                            ? 'ring-2 ring-indigo-400 bg-indigo-50/50' 
                                            : 'opacity-80 hover:opacity-100'
                                    }`}
                                >
                                    <div className="w-10 h-10 flex items-center justify-center rounded-full text-2xl shadow-sm border border-black/5" style={{ backgroundColor: mood.color }}>
                                        {mood.emoji}
                                    </div>
                                    <span className={`text-[10px] font-semibold ${
                                        selectedMood?.label === mood.label 
                                            ? 'text-indigo-600 font-bold dark:text-indigo-400' 
                                            : textSecondary
                                    }`}>{mood.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Journal Note */}
                    <div className="flex flex-col gap-1.5 align-start text-left mb-4">
                        <label className={`text-[11px] font-bold uppercase tracking-wider ${textSecondary}`}>Notiță de jurnal (Opțional)</label>
                        <textarea 
                            value={journalNote}
                            onChange={(e) => setJournalNote(e.target.value)}
                            placeholder="Cum a fost ziua ta?"
                            className={`w-full p-3 rounded-xl resize-none h-20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all ${
                                isNeon 
                                    ? 'bg-slate-800 text-white placeholder-slate-500 border-slate-700' 
                                    : 'bg-slate-50 border border-slate-200 placeholder-slate-400 text-slate-800'
                            }`}
                        />
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !selectedMood}
                        className={`w-full py-3.5 mt-2 rounded-xl font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95 ${
                            isSaving || !selectedMood ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        style={{ backgroundColor: accentColor }}
                    >
                        {isSaving ? 'Se salvează...' : 'Salvează starea'}
                    </button>
                </div>
            </div>
        )}

    </div>
  );
};
