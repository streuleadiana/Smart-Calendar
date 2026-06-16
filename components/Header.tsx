import React from 'react';
import { Menu, Search, Pencil } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Theme } from '../types';
import { LanguageOption, translations } from '../utils/translations';

interface HeaderProps {
    setIsSidebarOpen: (isOpen: boolean) => void;
    theme: Theme;
    accentColor: string;
    handleAccentChange: (color: string) => void;
    handleThemeChange: (theme: Theme) => void;
    userName: string | null;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isEditingName: boolean;
    setIsEditingName: (isEditing: boolean) => void;
    tempName: string;
    setTempName: (name: string) => void;
    saveNameEdit: () => void;
    lang: LanguageOption;
}

export const Header: React.FC<HeaderProps> = ({
    setIsSidebarOpen,
    theme,
    accentColor,
    handleAccentChange,
    handleThemeChange,
    userName,
    searchQuery,
    setSearchQuery,
    isEditingName,
    setIsEditingName,
    tempName,
    setTempName,
    saveNameEdit,
    lang
}) => {
    const t = translations[lang];
    const headerBg = theme === 'neon' ? 'bg-slate-900 border-slate-800' : theme === 'pastel' ? 'bg-[#fffbf0] border-orange-100' : 'bg-white border-slate-200';
    const searchBg = theme === 'neon' ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-transparent';

    return (
        <header className={`h-16 flex items-center justify-between px-4 lg:px-6 border-b shrink-0 z-10 ${headerBg}`}>
            {/* Left: Hamburger + Greeting + Name Edit */}
            <div className="flex items-center gap-2 sm:gap-3">
                 <button 
                   onClick={() => setIsSidebarOpen(true)}
                   className={`hidden md:block lg:hidden p-1.5 rounded-lg transition-colors ${theme === 'neon' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                 >
                    <Menu size={20} />
                 </button>
                 <span className={`hidden sm:inline text-lg ${theme === 'neon' ? 'text-slate-300' : 'text-slate-500'}`}>{t.header.greeting}</span>
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
                        className={`text-base sm:text-lg font-bold flex items-center gap-2 group transition-colors ${
                            theme === 'neon' ? 'text-white' : 'text-slate-800'
                        }`}
                        style={{ color: isEditingName ? undefined : undefined }} // Reset
                        title="Click to edit name"
                    >
                        <span className="group-hover:opacity-80 transition-opacity truncate max-w-[120px] sm:max-w-none">{userName}</span>
                        <Pencil size={14} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </button>
                )}
            </div>

            {/* Middle: Search Bar */}
            <div className="flex-1 max-w-md mx-2 sm:mx-4 hidden sm:block">
                <div className={`relative flex items-center rounded-xl overflow-hidden px-4 py-2 ${searchBg}`}>
                    <Search size={18} className="opacity-50 mr-2 shrink-0" />
                    <input 
                        type="text"
                        placeholder={t.header.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full placeholder:text-opacity-70"
                    />
                </div>
            </div>

            {/* Right: Color Picker & Theme Switcher */}
            <div className="flex items-center gap-3">
                <div 
                    className="relative flex items-center justify-center w-9 h-9 rounded-full overflow-hidden cursor-pointer border-2 shadow-sm transition-transform hover:scale-105"
                    style={{ borderColor: theme === 'neon' ? '#334155' : '#e2e8f0' }}
                    title={t.header.shareTooltip}
                >
                   <input
                     type="color"
                     value={accentColor}
                     onChange={(e) => handleAccentChange(e.target.value)}
                     className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 cursor-pointer border-none"
                   />
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <ThemeSwitcher currentTheme={theme} onThemeChange={handleThemeChange} />
            </div>
        </header>
    );
};
