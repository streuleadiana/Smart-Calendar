import React from 'react';
import { Home, Calendar as CalendarIcon, CheckSquare, Settings, Book, Smile, Sparkles } from 'lucide-react';
import { Theme } from '../types';
import { LanguageOption, translations } from '../utils/translations';

interface BottomNavProps {
  currentView: 'home' | 'calendar' | 'tasks' | 'settings' | 'notes' | 'moods' | 'vision';
  setCurrentView: (view: 'home' | 'calendar' | 'tasks' | 'settings' | 'notes' | 'moods' | 'vision') => void;
  theme: Theme;
  accentColor: string;
  lang: LanguageOption;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  setCurrentView,
  theme,
  accentColor,
  lang
}) => {
  const t = translations[lang];
  const isNeon = theme === 'neon';
  const navBg = isNeon ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  const items = [
      { id: 'home', icon: Home, label: t.tabs.home },
      { id: 'calendar', icon: CalendarIcon, label: t.tabs.calendar },
      { id: 'notes', icon: Book, label: lang === 'ro' ? 'Notițe' : 'Notes' },
      { id: 'moods', icon: Smile, label: lang === 'ro' ? 'Stări' : 'Moods' },
      { id: 'vision', icon: Sparkles, label: lang === 'ro' ? 'Inspirație' : 'Vision' }
  ];

  return (
    <nav className={`lg:hidden fixed bottom-0 w-full z-40 border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)] transition-colors duration-300 ${navBg}`}>
      <div className="flex justify-around items-center px-1 py-3">
        {items.map((item) => {
           const isActive = currentView === item.id;
           return (
             <button
               key={item.id}
               onClick={() => setCurrentView(item.id as any)}
               className="flex flex-col items-center justify-center w-[60px] gap-1"
               style={{ color: isActive ? accentColor : (isNeon ? '#94a3b8' : '#64748b') }}
             >
               <item.icon 
                  size={24} 
                  className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`} 
               />
               <span className={`text-[10px] font-medium transition-all ${isActive ? 'opacity-100 font-bold' : 'opacity-70'}`}>
                 {item.label}
               </span>
             </button>
           );
        })}
      </div>
    </nav>
  );
};
