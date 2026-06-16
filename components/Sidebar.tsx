import React from 'react';
import { Home, Calendar as CalendarIcon, CheckSquare, Settings, Layout, Menu, LogOut } from 'lucide-react';
import { Theme } from '../types';
import { LanguageOption, translations } from '../utils/translations';

interface SidebarProps {
  currentView: 'home' | 'calendar' | 'tasks' | 'settings';
  setCurrentView: (view: 'home' | 'calendar' | 'tasks' | 'settings') => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  theme: Theme;
  accentColor: string;
  lang: LanguageOption;
  handleLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  isSidebarOpen,
  setIsSidebarOpen,
  theme,
  accentColor,
  lang,
  handleLogout
}) => {
  const t = translations[lang];
  const isNeon = theme === 'neon';
  const sidebarClass = isNeon ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const sidebarWidth = isSidebarOpen ? 'w-64' : 'w-20 hidden lg:flex';

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 ${sidebarWidth} flex-shrink-0 flex flex-col border-r transition-all duration-300 ${sidebarClass}`}>
      <div className="p-4 flex flex-col h-full overflow-y-auto">
          {/* Header / Toggle */}
          <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-between lg:justify-center'} mb-8`}>
            <div className={`flex items-center gap-2 animate-in fade-in duration-300 ${!isSidebarOpen ? 'lg:hidden' : ''}`}>
                <div 
                    className={`p-1.5 rounded-lg text-white shadow-lg`}
                    style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}
                >
                    <Layout size={20} />
                </div>
                <span className={`text-lg font-bold ${isNeon ? 'text-white' : 'text-slate-800'}`}>
                    Smart Calendar
                </span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-1.5 rounded-lg transition-colors hidden lg:block ${isNeon ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
               <Menu size={20} />
            </button>
            {/* Close button for mobile inside sidebar */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className={`p-1.5 rounded-lg transition-colors lg:hidden ${isNeon ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
               <Menu size={20} />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-2 flex-1">
              {[
                  { id: 'home', icon: Home, label: t.tabs.home },
                  { id: 'calendar', icon: CalendarIcon, label: t.tabs.calendar },
                  { id: 'tasks', icon: CheckSquare, label: t.tabs.tasks },
                  { id: 'settings', icon: Settings, label: t.tabs.settings }
              ].map(item => (
                  <button 
                      key={item.id}
                      onClick={() => {
                          setCurrentView(item.id as any);
                          setIsSidebarOpen(false);
                      }} 
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-medium cursor-pointer w-full ${!isSidebarOpen ? 'justify-center' : ''} ${
                          currentView !== item.id 
                          ? (isNeon ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')
                          : ''
                      }`}
                      style={currentView === item.id ? {
                          color: accentColor,
                          backgroundColor: `${accentColor}15` // 15 = ~8% opacity hex
                      } : {}}
                      title={item.label}
                  >
                      <item.icon size={22} className="flex-shrink-0" /> <span className={!isSidebarOpen ? 'lg:hidden' : ''}>{item.label}</span>
                  </button>
              ))}
          </nav>

          {/* Footer Buttons */}
          <div className={`mt-auto pt-4 border-t ${isNeon ? 'border-slate-800' : 'border-slate-100'} space-y-3`}>
              <a 
              href="https://www.buymeacoffee.com/dianastreulea" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`flex items-center gap-2 w-full bg-[#FFF6C3] hover:bg-[#FDE68A] border border-[#FDE68A] text-gray-900 font-bold rounded-xl transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${isSidebarOpen ? 'py-3 px-4 justify-center' : 'p-3 py-3 px-4 lg:p-3 lg:aspect-square justify-center'}`}
              title="Susține proiectul!"
              >
              <span className="text-xl">💖</span>
              <span className={`text-xs font-bold whitespace-nowrap ${!isSidebarOpen ? 'lg:hidden' : ''}`}>Susține proiectul!</span>
              </a>

              <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLScMZLG3xZVGMHgKMq_QXSzQG35tDYwrtoeXLgtHyKbqD4bR5Q/viewform?usp=header"
              target="_blank" 
              rel="noopener noreferrer"
              className={`flex items-center gap-2 w-full rounded-xl font-semibold border transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
                  isNeon 
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              } ${isSidebarOpen ? 'py-3 px-4 justify-center' : 'p-3 py-3 px-4 lg:p-3 lg:aspect-square justify-center'}`}
              title="Feedback"
              >
              <span className="text-lg">💬</span>
              <span className={`text-xs ${!isSidebarOpen ? 'lg:hidden' : ''}`}>Feedback</span>
              </a>

              <button
                onClick={handleLogout}
                className={`flex items-center gap-2 w-full rounded-xl font-semibold border transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
                  isNeon 
                  ? 'bg-slate-800 border-slate-700 text-red-400 hover:bg-red-900/30' 
                  : 'bg-white border-slate-200 text-red-500 hover:bg-red-50'
                } ${isSidebarOpen ? 'py-3 px-4 justify-center' : 'p-3 py-3 px-4 lg:p-3 lg:aspect-square justify-center'}`}
                title={t.settings?.logout || "Logout"}
              >
                <LogOut size={18} />
                <span className={`text-xs ${!isSidebarOpen ? 'lg:hidden' : ''}`}>{t.settings?.logout || "Logout"}</span>
              </button>
          </div>
      </div>
    </aside>
  );
};
