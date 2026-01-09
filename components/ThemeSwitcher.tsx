
import React from 'react';
import { Theme } from '../types';
import { Palette, Moon, Sun, Coffee } from 'lucide-react';

interface ThemeSwitcherProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm p-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">
      <button
        onClick={() => onThemeChange('modern')}
        className={`p-2 rounded-full transition-all ${
          currentTheme === 'modern' 
            ? 'bg-white text-indigo-600 shadow-sm' 
            : 'text-slate-500 hover:text-indigo-500'
        }`}
        title="Modern White"
      >
        <Sun size={18} />
      </button>
      
      <button
        onClick={() => onThemeChange('neon')}
        className={`p-2 rounded-full transition-all ${
          currentTheme === 'neon' 
            ? 'bg-slate-900 text-cyan-400 shadow-sm' 
            : 'text-slate-500 hover:text-slate-900'
        }`}
        title="Dark Neon"
      >
        <Moon size={18} />
      </button>

      <button
        onClick={() => onThemeChange('pastel')}
        className={`p-2 rounded-full transition-all ${
          currentTheme === 'pastel' 
            ? 'bg-orange-100 text-orange-600 shadow-sm' 
            : 'text-slate-500 hover:text-orange-500'
        }`}
        title="Cozy Pastel"
      >
        <Coffee size={18} />
      </button>
    </div>
  );
};
