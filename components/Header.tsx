import React from 'react';
import { Menu, Search, Pencil, Settings, MessageCircle } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Theme } from '../types';
import { LanguageOption, translations } from '../utils/translations';

interface HeaderProps {
    setIsSidebarOpen: (isOpen: boolean) => void;
    theme: Theme;
    accentColor: string;
    handleThemeChange: (theme: Theme) => void;
    userName: string | null;
    profilePicture: string | null;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isEditingName: boolean;
    setIsEditingName: (isEditing: boolean) => void;
    tempName: string;
    setTempName: (name: string) => void;
    saveNameEdit: () => void;
    lang: LanguageOption;
    isChatOpen: boolean;
    setIsChatOpen: (isOpen: boolean) => void;
    hasChatNotification: boolean;
    setHasChatNotification: (has: boolean) => void;
    setCurrentView: (view: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
    setIsSidebarOpen,
    theme,
    accentColor,
    handleThemeChange,
    userName,
    profilePicture,
    searchQuery,
    setSearchQuery,
    isEditingName,
    setIsEditingName,
    tempName,
    setTempName,
    saveNameEdit,
    lang,
    isChatOpen,
    setIsChatOpen,
    hasChatNotification,
    setHasChatNotification,
    setCurrentView
}) => {
    const t = translations[lang];
    const headerBg = theme === 'neon' ? 'bg-slate-900 border-slate-800' : theme === 'pastel' ? 'bg-[#fffbf0] border-orange-100' : 'bg-white border-slate-200';
    const searchBg = theme === 'neon' ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-transparent';

    return (
        <header className={`h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 lg:px-6 border-b shrink-0 z-10 ${headerBg}`}>
            {/* Left: Hamburger + Greeting + Name Edit */}
            <div className="flex items-center gap-2 sm:gap-3">
                 <button 
                   onClick={() => setIsSidebarOpen(true)}
                   className={`hidden md:block lg:hidden p-1.5 rounded-lg transition-colors ${theme === 'neon' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                 >
                    <Menu size={20} />
                 </button>
                 
               <div className="flex items-center gap-2">
                 {profilePicture ? (
                     <img src={profilePicture} alt="Profile" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-sm border" style={{ borderColor: accentColor }} />
                 ) : (
                     <div className="w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-base rounded-full shadow-sm flex flex-shrink-0 items-center justify-center font-bold text-white uppercase" style={{ backgroundColor: accentColor }}>
                        {userName ? userName.charAt(0) : 'U'}
                     </div>
                 )}
                 <span className={`hidden lg:inline text-lg ${theme === 'neon' ? 'text-slate-300' : 'text-slate-500'}`}>{t.header.greeting}</span>
               </div>

                 {isEditingName ? (
                    <input 
                        autoFocus
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={saveNameEdit}
                        onKeyDown={(e) => e.key === 'Enter' && saveNameEdit()}
                        className={`text-lg font-bold bg-transparent border-b-2 outline-none py-0.5 px-1 w-24 sm:w-32 ${
                            theme === 'neon' 
                            ? 'text-white border-cyan-500' 
                            : 'text-slate-800 border-indigo-500'
                        }`}
                        style={{ borderColor: accentColor }}
                    />
                ) : (
                    <button
                        onClick={() => {
                            setTempName(userName || '');
                            setIsEditingName(true);
                        }}
                        className={`text-base sm:text-lg font-bold flex items-center gap-1 sm:gap-2 group transition-colors ${
                            theme === 'neon' ? 'text-white' : 'text-slate-800'
                        }`}
                        style={{ color: isEditingName ? undefined : undefined }} // Reset
                        title="Click to edit name"
                    >
                        <span className="group-hover:opacity-80 transition-opacity truncate max-w-[100px] sm:max-w-none">{userName}</span>
                        <Pencil size={14} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </button>
                )}
            </div>

            {/* Middle: Search Bar */}
            <div className="flex-1 max-w-md mx-2 sm:mx-4 hidden sm:block">
                <div className={`relative flex items-center rounded-xl overflow-hidden px-3 py-1.5 sm:px-4 sm:py-2 ${searchBg}`}>
                    <Search size={16} className="opacity-50 mr-2 shrink-0" />
                    <input 
                        type="text"
                        placeholder={t.header.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full placeholder:text-opacity-70"
                    />
                </div>
            </div>

            {/* Right: Actions & Theme Switcher */}
            <div className="flex items-center gap-2 sm:gap-3">
                <button
                    onClick={() => {
                        if (!isChatOpen) setHasChatNotification(false);
                        setIsChatOpen(!isChatOpen);
                    }}
                    className={`relative p-2 rounded-full transition-colors ${theme === 'neon' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'} ${isChatOpen ? 'text-primary' : ''}`}
                    style={isChatOpen ? { color: accentColor, backgroundColor: `${accentColor}1A` } : {}}
                    title="Assistant"
                >
                    <MessageCircle size={20} />
                    {hasChatNotification && !isChatOpen && (
                        <span className="absolute top-0 right-0 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                        </span>
                    )}
                </button>
                
                <button 
                  onClick={() => setCurrentView('settings')}
                  className={`p-2 rounded-full transition-colors ${theme === 'neon' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
                  title={t.tabs.settings}
                >
                   <Settings size={20} />
                </button>

                <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-0 sm:mx-1"></div>
                <ThemeSwitcher currentTheme={theme} onThemeChange={handleThemeChange} />
            </div>
        </header>
    );
};
