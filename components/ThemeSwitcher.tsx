
import React from 'react';
import { Theme } from '../types';
import { Palette, Moon, Sun, Flower2, Sparkles } from 'lucide-react';

interface ThemeSwitcherProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-sm p-0.5 sm:p-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">
      <button
        onClick={() => onThemeChange('modern')}
        className={`p-1.5 sm:p-2 rounded-full transition-all ${
          currentTheme === 'modern' 
            ? 'bg-white text-indigo-600 shadow-sm' 
            : 'text-slate-500 hover:text-indigo-500'
        }`}
        title="Modern White"
      >
        <Sun size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} />
      </button>
      
      <button
        onClick={() => onThemeChange('neon')}
        className={`p-1.5 sm:p-2 rounded-full transition-all ${
          currentTheme === 'neon' 
            ? 'bg-slate-900 text-cyan-400 shadow-sm' 
            : 'text-slate-500 hover:text-slate-900'
        }`}
        title="Dark Neon"
      >
        <Moon size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} />
      </button>

      <button
        onClick={() => onThemeChange('soft')}
        className={`p-1.5 sm:p-2 rounded-full transition-all ${
          currentTheme === 'soft' 
            ? 'bg-pink-100 text-pink-500 shadow-sm' 
            : 'text-slate-500 hover:text-pink-400'
        }`}
        title="Soft Girly"
      >
        <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} />
      </button>
    </div>
  );
};
