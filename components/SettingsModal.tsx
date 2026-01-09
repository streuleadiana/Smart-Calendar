
import React, { useRef, useState } from 'react';
import { CalendarEvent, Todo, User, Theme } from '../types';
import { X, Download, Upload, Share2, Check, FileJson, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  events: CalendarEvent[];
  todos: Todo[];
  theme: Theme;
  onImportData: (data: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, user, events, todos, theme, onImportData
}) => {
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isNeon = theme === 'neon';
  const isPastel = theme === 'pastel';

  // --- STYLES ---
  const modalBg = isNeon ? 'bg-slate-900' : 'bg-white';
  const textPrimary = isNeon ? 'text-cyan-50' : 'text-slate-800';
  const textSecondary = isNeon ? 'text-slate-400' : 'text-slate-500';
  const borderClass = isNeon ? 'border-slate-700' : 'border-slate-200';
  
  const sectionBg = isNeon ? 'bg-slate-800/50' : isPastel ? 'bg-orange-50/50' : 'bg-slate-50';
  
  const btnPrimary = isNeon 
    ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20' 
    : isPastel 
      ? 'bg-orange-400 hover:bg-orange-500 text-white' 
      : 'bg-primary hover:bg-indigo-600 text-white';

  const btnSecondary = isNeon
    ? 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700'
    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200';

  // --- ACTIONS ---

  const handleExport = () => {
    const data = {
      user,
      events,
      todos,
      theme,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `smart-calendar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation
        if (!json.user && !json.events) {
            throw new Error("Invalid backup file format");
        }
        onImportData(json);
        onClose();
      } catch (err) {
        setImportError("Fișier invalid! Te rog încarcă un backup .json valid.");
      }
    };
    reader.readAsText(file);
    // Reset
    e.target.value = '';
  };

  const handleShare = async () => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    // Filter upcoming events
    const upcoming = events
      .filter(e => {
        const d = new Date(e.date);
        return d >= new Date(now.setHours(0,0,0,0)) && d <= nextWeek;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let text = `📅 *Programul meu (Următoarele 7 zile)*:\n\n`;

    if (upcoming.length === 0) {
      text += "Sunt liber toată săptămâna! 😎\n";
    } else {
      upcoming.forEach(e => {
        const dateObj = new Date(e.date);
        const dayName = dateObj.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric' });
        text += `▫️ ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}: ${e.title} ${e.time ? `(${e.time})` : ''}\n`;
      });
    }
    
    text += `\nRestul sunt liber! ☕`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200 ${modalBg}`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex justify-between items-center ${borderClass} ${isNeon ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isNeon ? 'bg-cyan-900/30 text-cyan-400' : 'bg-primary/10 text-primary'}`}>
                <FileJson size={20} />
            </div>
            <h2 className={`text-lg font-bold ${textPrimary}`}>Setări & Date</h2>
          </div>
          <button 
            onClick={onClose}
            className={`p-1 rounded-full transition-colors ${textSecondary} hover:bg-slate-100/10 hover:text-red-400`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
            
            {/* SECTION 1: BACKUP */}
            <div className={`p-5 rounded-xl border ${borderClass} ${sectionBg}`}>
                <h3 className={`font-semibold mb-1 ${textPrimary}`}>Backup & Portabilitate</h3>
                <p className={`text-sm mb-4 ${textSecondary}`}>
                    Salvează datele local sau mută-le pe alt dispozitiv. Nu stocăm nimic în cloud.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                        onClick={handleExport}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all active:scale-95 ${btnSecondary}`}
                    >
                        <Download size={18} />
                        Descarcă Datele
                    </button>

                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all active:scale-95 ${btnPrimary}`}
                    >
                        <Upload size={18} />
                        Încarcă Backup
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept=".json" 
                        className="hidden" 
                        onChange={handleFileChange}
                    />
                </div>
                {importError && (
                    <div className="mt-3 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {importError}
                    </div>
                )}
            </div>

            {/* SECTION 2: SOCIAL */}
            <div className={`p-5 rounded-xl border ${borderClass} ${sectionBg}`}>
                <h3 className={`font-semibold mb-1 ${textPrimary}`}>Social Share</h3>
                <p className={`text-sm mb-4 ${textSecondary}`}>
                    Copiază un rezumat al următoarelor 7 zile pentru a-l trimite prietenilor.
                </p>

                <button 
                    onClick={handleShare}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-white transition-all active:scale-95 shadow-lg ${
                        copied 
                        ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30' 
                        : isNeon ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110' : 'bg-gradient-to-r from-primary to-secondary hover:opacity-90'
                    }`}
                >
                    {copied ? <Check size={20} /> : <Share2 size={20} />}
                    {copied ? 'Copiat în Clipboard!' : 'Copiază Programul (WhatsApp Ready)'}
                </button>
            </div>
        </div>

        <div className={`px-6 py-4 text-center text-xs border-t ${borderClass} ${textSecondary}`}>
            Versiune App: 1.0.2 • Datele tale sunt salvate în LocalStorage.
        </div>

      </div>
    </div>
  );
};
