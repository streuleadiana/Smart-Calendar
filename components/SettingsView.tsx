import React, { useState, useEffect } from 'react';
import { Theme, Category, FontOption } from '../types';
import { User as UserIcon, Settings, Globe, LogOut, X, Sparkles, Trash2, Plus, Camera } from 'lucide-react';
import { LanguageOption, translations } from '../utils/translations';
import { ThemeSwitcher } from './ThemeSwitcher';

const AVATARS = ["🦉", "🤖", "👽", "🦊", "🐱", "🦁", "🦄", "🧙‍♂️", "🧠", "💼", "👨‍💻", "👩‍💻"];

interface SettingsViewProps {
  theme: Theme;
  accentColor: string;
  lang: LanguageOption;
  font: FontOption;
  handleFontChange: (val: FontOption) => void;
  userName: string | null;
  handleUpdateUserName: (name: string) => void;
  profilePicture: string | null;
  handleUpdateProfilePicture: (pic: string | null) => void;
  assistantName: string;
  handleUpdateAssistantName: (name: string) => void;
  assistantAvatar: string;
  handleUpdateAssistantAvatar: (avatar: string) => void;
  categories: Category[];
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  newCategoryColor: string;
  setNewCategoryColor: (color: string) => void;
  handleAddCategory: () => void;
  handleUpdateCategory: (id: string, name: string, color: string) => void;
  handleDeleteCategory: (id: string) => void;
  handleLangChange: (lang: LanguageOption) => void;
  handleLogout: () => void;

  eventsCount: number;
  todosCount: number;
  handleExport: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  importError: string | null;
  testNotification: () => void;
  setIsFeedbackModalOpen: (val: boolean) => void;
  handleAccentChange: (val: string) => void;
  handleThemeChange: (val: Theme) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme, accentColor, lang, font, handleFontChange, userName, handleUpdateUserName, profilePicture, handleUpdateProfilePicture,
  assistantName, handleUpdateAssistantName, assistantAvatar, handleUpdateAssistantAvatar,
  categories, newCategoryName, setNewCategoryName, newCategoryColor, setNewCategoryColor,
  handleAddCategory, handleUpdateCategory, handleDeleteCategory, handleLangChange, handleLogout,
  eventsCount, todosCount, handleExport, handleFileChange, fileInputRef, importError, testNotification, setIsFeedbackModalOpen, handleAccentChange, handleThemeChange
}) => {
  const t = translations[lang];

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryColor, setEditCategoryColor] = useState('');

  useEffect(() => {
    if (selectedCategoryId && selectedCategoryId !== 'new') {
      const cat = categories.find(c => c.id === selectedCategoryId);
      if (cat) {
        setEditCategoryName(cat.name);
        setEditCategoryColor(cat.color);
      }
    }
  }, [selectedCategoryId, categories]);

  const profileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 300;
              const MAX_HEIGHT = 300;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                  if (width > MAX_WIDTH) {
                      height *= MAX_WIDTH / width;
                      width = MAX_WIDTH;
                  }
              } else {
                  if (height > MAX_HEIGHT) {
                      width *= MAX_HEIGHT / height;
                      height = MAX_HEIGHT;
                  }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
              handleUpdateProfilePicture(dataUrl);
          };
          img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
  };

  return (
    <div className="w-full p-3 pb-32 sm:pb-6 lg:p-6 animate-in fade-in duration-300">
       <div className="max-w-3xl mx-auto space-y-6">
           <div className="mb-6">
              <h2 className={`text-3xl font-bold ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>{t.settings.title}</h2>
              <p className={`${theme === 'neon' ? 'text-slate-400' : 'text-slate-500'}`}>{t.settings.subtitle}</p>
          </div>

          {/* Profile Card */}
          <div className={`p-6 rounded-2xl border ${theme === 'neon' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-4">
                  <input type="file" accept="image/*" className="hidden" ref={profileInputRef} onChange={handleAvatarChange} />
                  <div 
                     onClick={() => profileInputRef.current?.click()}
                     className={`relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer overflow-hidden border-2 shadow-sm transition-transform hover:scale-105 flex-shrink-0 group`}
                     style={{ borderColor: accentColor, backgroundColor: !profilePicture ? accentColor : undefined }}
                  >
                     {profilePicture ? (
                         <img src={profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                         <span className="text-2xl font-bold text-white uppercase">
                             {userName ? userName.charAt(0) : 'U'}
                         </span>
                     )}
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera size={20} className="text-white" strokeWidth={1.5} />
                     </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className={`text-sm font-medium ${theme === 'neon' ? 'text-slate-400' : 'text-slate-700'}`}>{t.settings.profile} - {t.settings.yourName}</label>
                    <input 
                         type="text"
                         value={userName || ''}
                         onChange={(e) => handleUpdateUserName(e.target.value)}
                         className={`w-full p-3 rounded-xl border transition-all text-lg font-medium shadow-sm ${
                             theme === 'neon' 
                             ? 'bg-slate-800 border-slate-700 text-white focus:ring-cyan-500 focus:border-cyan-500 shadow-cyan-900/20' 
                             : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500'
                         }`}
                         style={theme !== 'neon' ? { boxShadow: `0 4px 20px -5px ${accentColor}30` } : undefined}
                    />
                  </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                      <div className="space-y-2">
                          <label className={`text-sm font-medium ${theme === 'neon' ? 'text-slate-400' : 'text-slate-700'}`}>Nume Mascotă AI / Assistant Name</label>
                          <input 
                               type="text"
                               value={assistantName}
                               onChange={(e) => handleUpdateAssistantName(e.target.value)}
                               className={`w-full p-3 rounded-xl border transition-all ${
                                   theme === 'neon' 
                                   ? 'bg-slate-800 border-slate-700 text-white focus:ring-cyan-500 focus:border-cyan-500' 
                                   : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500'
                               }`}
                          />
                      </div>
                      <div className="space-y-2">
                          <label className={`text-sm font-medium ${theme === 'neon' ? 'text-slate-400' : 'text-slate-700'}`}>Avatar Mascotă / Assistant Avatar</label>
                          <div className={`grid grid-cols-6 sm:grid-cols-12 gap-2 p-3 rounded-xl border ${theme === 'neon' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                              {AVATARS.map(emoji => (
                                  <button
                                      key={emoji}
                                      onClick={() => handleUpdateAssistantAvatar(emoji)}
                                      className={`text-2xl p-2 rounded-lg transition-transform hover:scale-110 ${
                                          assistantAvatar === emoji 
                                          ? (theme === 'neon' ? 'bg-cyan-900/50 outline outline-2 outline-cyan-500 scale-110' : 'bg-indigo-100 outline outline-2 outline-indigo-500 scale-110') 
                                          : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
                                      }`}
                                  >
                                      {emoji}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
          </div>

          {/* Categories Card */}
          <div className={`p-6 rounded-2xl border ${theme === 'neon' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-full bg-slate-100 text-slate-600`}>
                      <Settings size={24} />
                  </div>
                  <div>
                      <h3 className={`font-bold text-lg ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>{t.settings.categoriesTitle}</h3>
                      <p className="text-sm text-slate-500">{t.settings.categoriesDesc}</p>
                  </div>
              </div>
              
              <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                          <select
                              value={selectedCategoryId}
                              onChange={(e) => setSelectedCategoryId(e.target.value)}
                              className={`w-full appearance-none rounded-lg border p-2.5 pr-10 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                                  theme === 'neon' 
                                  ? 'bg-slate-800 border-slate-700 text-white focus:ring-cyan-500' 
                                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500'
                              }`}
                          >
                              <option value="" disabled>Select a category to edit...</option>
                              {categories.map((cat) => (
                                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                          </select>
                          <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${theme === 'neon' ? 'text-slate-400' : 'text-slate-500'}`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                      </div>
                      <button
                          onClick={() => setSelectedCategoryId('new')}
                          className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all hover:opacity-90 flex-shrink-0"
                          style={{ backgroundColor: accentColor }}
                      >
                          <Plus size={18} />
                          <span className="hidden sm:inline">Add New Category</span>
                      </button>
                  </div>

                  {selectedCategoryId && (
                      <div className={`p-4 rounded-xl border mt-2 space-y-4 ${theme === 'neon' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center gap-3">
                              <input 
                                  type="text"
                                  placeholder={t.settings.categoryPlaceholder}
                                  value={selectedCategoryId === 'new' ? newCategoryName : editCategoryName}
                                  onChange={(e) => selectedCategoryId === 'new' ? setNewCategoryName(e.target.value) : setEditCategoryName(e.target.value)}
                                  className={`flex-1 p-2.5 rounded-lg border text-sm transition-all ${
                                      theme === 'neon' 
                                      ? 'bg-slate-900 border-slate-700 text-white focus:ring-cyan-500 focus:border-cyan-500' 
                                      : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500'
                                  }`}
                              />
                              <div 
                                 className="relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 shadow-sm flex-shrink-0"
                                 style={{ borderColor: theme === 'neon' ? '#334155' : '#e2e8f0' }}
                              >
                                  <input
                                      type="color"
                                      value={selectedCategoryId === 'new' ? newCategoryColor : editCategoryColor}
                                      onChange={(e) => selectedCategoryId === 'new' ? setNewCategoryColor(e.target.value) : setEditCategoryColor(e.target.value)}
                                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 cursor-pointer border-none"
                                  />
                              </div>
                          </div>

                          <div className="flex items-center gap-3 justify-end pt-2">
                              {selectedCategoryId !== 'new' && (
                                  <button
                                      type="button"
                                      onClick={() => {
                                          handleDeleteCategory(selectedCategoryId);
                                          setSelectedCategoryId('');
                                      }}
                                      disabled={categories.length <= 1}
                                      className={`flex items-center gap-1.5 px-4 py-2 font-medium transition-colors ${categories.length <= 1 ? 'opacity-50 cursor-not-allowed text-slate-400' : 'text-red-500 hover:text-red-600'}`}
                                      title={categories.length <= 1 ? t.settings.cannotDeleteLast : t.settings.deleteCategory}
                                  >
                                      <Trash2 size={16} />
                                      Delete
                                  </button>
                              )}
                              
                              <button
                                  type="button"
                                  onClick={() => {
                                      if (selectedCategoryId === 'new') {
                                          handleAddCategory();
                                          setSelectedCategoryId('');
                                      } else {
                                          handleUpdateCategory(selectedCategoryId, editCategoryName, editCategoryColor);
                                      }
                                  }}
                                  disabled={selectedCategoryId === 'new' ? !newCategoryName.trim() : !editCategoryName.trim()}
                                  className="px-5 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all hover:opacity-90 disabled:opacity-50"
                                  style={{ backgroundColor: accentColor }}
                              >
                                  {selectedCategoryId === 'new' ? t.settings.addBtn || 'Save' : 'Update'}
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          </div>

          {/* Appearance Card */}
          <div className={`p-6 rounded-2xl border ${theme === 'neon' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-full bg-slate-100 text-slate-600`}>
                      <Sparkles size={24} />
                  </div>
                  <div>
                      <h3 className={`font-bold text-lg ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>{t.settings.appearance || "Appearance"}</h3>
                      <p className="text-sm text-slate-500">{t.settings.appearanceDesc || "Customize the look and feel"}</p>
                  </div>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                  <span className={`font-medium ${theme === 'neon' ? 'text-slate-300' : 'text-slate-700'}`}>{t.settings.theme || "Theme"}</span>
                  <ThemeSwitcher currentTheme={theme} onThemeChange={handleThemeChange} />
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className={`font-medium ${theme === 'neon' ? 'text-slate-300' : 'text-slate-700'}`}>
                      {t.settings.accentColor || "Accent Color"}
                  </span>
                  <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">
                          {accentColor}
                      </span>
                      <div 
                          className="relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 shadow-sm transition-transform hover:scale-105"
                          style={{ borderColor: theme === 'neon' ? '#334155' : '#e2e8f0' }}
                      >
                          <input
                              type="color"
                              value={accentColor}
                              onChange={(e) => handleAccentChange(e.target.value)}
                              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 cursor-pointer border-none"
                          />
                      </div>
                  </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className={`font-medium ${theme === 'neon' ? 'text-slate-300' : 'text-slate-700'}`}>
                      {lang === 'ro' ? 'Fontul Aplicației' : 'App Font'}
                  </span>
                  <select 
                      value={font}
                      onChange={(e) => handleFontChange(e.target.value as FontOption)}
                      className={`px-3 py-2 border rounded-xl shadow-sm text-sm transition-colors focus:ring-2 focus:outline-none ${theme === 'neon' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                  >
                      <option value="system">Default</option>
                      <option value="quicksand">Quicksand</option>
                      <option value="playfair">Playfair Display</option>
                      <option value="caveat">Caveat</option>
                  </select>
              </div>
          </div>

          {/* Language Card */}
          <div className={`p-6 rounded-2xl border ${theme === 'neon' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-full bg-slate-100 text-slate-600`}>
                      <Globe size={24} />
                  </div>
                  <div>
                      <h3 className={`font-bold text-lg ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>{t.settings.languageTitle}</h3>
                      <p className="text-sm text-slate-500">{t.settings.languageDesc}</p>
                  </div>
              </div>
              
              <div className="flex items-center justify-between">
                  <span className={`font-medium ${theme === 'neon' ? 'text-slate-300' : 'text-slate-700'}`}>
                      {t.settings.languageTitle.split(' /')[0]}
                  </span>
                  <div className="relative w-32">
                      <select
                          value={lang}
                          onChange={(e) => handleLangChange(e.target.value as LanguageOption)}
                          className={`w-full appearance-none bg-transparent border rounded-xl p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm font-medium cursor-pointer transition-all ${
                              theme === 'neon' 
                              ? 'text-white border-slate-700 focus:ring-cyan-500 bg-slate-800' 
                              : 'text-slate-700 border-slate-200 focus:ring-indigo-500 bg-slate-50'
                          }`}
                      >
                          <option value="ro" className={`${theme === 'neon' ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>Română 🇷🇴</option>
                          <option value="en" className={`${theme === 'neon' ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>English 🇬🇧</option>
                      </select>
                      <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${theme === 'neon' ? 'text-slate-400' : 'text-slate-500'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                  </div>
              </div>
          </div>

          {/* Data Card */}
          <div className={`p-6 rounded-2xl border ${theme === 'neon' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                   <div className={`p-4 rounded-xl text-center border ${theme === 'neon' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                       <p className={`text-2xl font-bold ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>{eventsCount}</p>
                       <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t.settings.events}</p>
                   </div>
                   <div className={`p-4 rounded-xl text-center border ${theme === 'neon' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                       <p className={`text-2xl font-bold ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>{todosCount}</p>
                       <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t.settings.tasks}</p>
                   </div>
              </div>
              <div className="space-y-3">
                  <div className="flex gap-3">
                      <button onClick={handleExport} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${theme === 'neon' ? 'bg-slate-800 hover:bg-slate-700 text-cyan-400' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'}`}>
                         Backup Data
                      </button>
                      <button onClick={() => fileInputRef.current?.click()} style={{ backgroundColor: accentColor }} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-white shadow-lg hover:opacity-90`}>
                         Restore Data
                      </button>
                      <input type="file" ref={fileInputRef} accept=".json,application/json,text/plain,*/*" className="hidden" onChange={handleFileChange} />
                  </div>
                  {importError && (
                      <div className="text-xs text-red-500 flex items-center gap-1 justify-center">{importError}</div>
                  )}
              </div>
          </div>

          {/* System Card */}
          <div className={`p-6 rounded-2xl border ${theme === 'neon' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className={`font-bold text-lg mb-4 ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>System</h3>
              <div className="flex flex-col gap-4">
                  <a 
                    href="https://buymeacoffee.com/dianastreulea" target="_blank" rel="noreferrer"
                    className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-semibold border transition-all shadow-sm ${
                        theme === 'neon' 
                        ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">☕</span> 
                    Buy me a coffee
                  </a>

                  <button onClick={() => setIsFeedbackModalOpen(true)} className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium border transition-colors ${theme === 'neon' ? 'bg-slate-800 hover:bg-slate-700 text-cyan-400' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'}`}>
                    <span className="text-lg">💬</span>
                    Feedback
                  </button>
                  
                  <button onClick={testNotification} className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${theme === 'neon' ? 'bg-slate-800/50 hover:bg-slate-700 text-slate-400' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'}`}>
                    Test Push Notification
                  </button>
              </div>
          </div>
          
          {/* Logout Section */}
          <div className="pt-4 pb-8 flex justify-center">
              <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${
                      theme === 'neon'
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                      : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                  }`}
              >
                  <LogOut size={20} />
                  <span>{lang === 'ro' ? 'Deconectare Cont' : 'Sign Out Account'}</span>
              </button>
          </div>
       </div>
    </div>
  );
};
