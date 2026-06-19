import React, { useState, useEffect } from 'react';
import { Note, Theme, LanguageOption } from '../types';
import { Plus, X, Wand2, Trash2, Check, Circle, Heart, Settings, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { handleShare } from '../utils/share';

interface NotesViewProps {
  notes: Note[];
  theme: Theme;
  accentColor: string;
  lang: LanguageOption;
  categories: string[];
  categoryColors: Record<string, string>;
  onUpdateCategoryColor: (folder: string, color: string) => void;
  onAddCategory: (folder: string, color: string) => void;
  onEditCategory: (oldFolder: string, newFolder: string, newColor: string) => void;
  onDeleteCategory: (folder: string) => void;
  onSaveNote: (title: string, content: string, folder: string, color: string) => Promise<void>;
  onUpdateNote: (id: string, title: string, content: string, folder: string, color: string) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

const DEFAULT_FOLDERS = ["📓 Jurnal", "🛒 Cumpărături", "💡 Idei", "✈️ Travel"];

const CATEGORY_COLORS: Record<string, string> = {
  "✈️ Travel": "#bae6fd", // Soft Pastel Blue
  "💡 Idei": "#fef08a",   // Soft Pastel Yellow
  "🛒 Cumpărături": "#bbf7d0", // Soft Pastel Mint Green
  "📓 Jurnal": "#fce7f3", // Soft Pastel Pink
};
const FALLBACK_PASTEL_COLORS = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fbcfe8", "#e9d5ff", "#fed7aa", "#f5f5f4"];

export const NotesView: React.FC<NotesViewProps> = ({ notes, theme, accentColor, lang, categories, categoryColors, onUpdateCategoryColor, onAddCategory, onEditCategory, onDeleteCategory, onSaveNote, onUpdateNote, onDeleteNote }) => {
  const isNeon = theme === 'neon';
  const isSoft = theme === 'soft';
  const textPrimary = isNeon ? 'text-white' : 'text-slate-800';
  const textSecondary = isNeon ? 'text-slate-400' : 'text-slate-500';

  const mobileDropdownBtnClasses = isSoft
    ? 'bg-pink-50 border-pink-100 text-pink-900 border'
    : isNeon
    ? 'bg-slate-800 border-slate-700 text-slate-200 border'
    : 'bg-white border-slate-200 text-slate-800 border';

  const mobileDropdownMenuClasses = isNeon
    ? 'bg-slate-900 border-slate-800 text-slate-200'
    : 'bg-white border-slate-100 text-slate-800';

  const actionBtnClasses = isSoft
    ? 'bg-pink-100 text-pink-600 hover:bg-pink-200'
    : isNeon
    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
    : 'bg-slate-100 text-slate-600 hover:bg-slate-200';

  const categoryContainerClasses = isSoft
    ? 'bg-pink-50' 
    : isNeon 
    ? 'bg-slate-900' 
    : 'bg-slate-50';

  const modalBgClasses = isSoft 
    ? 'bg-pink-50 border border-pink-100' 
    : isNeon 
    ? 'bg-slate-800 border border-slate-700' 
    : 'bg-white border border-slate-200';

  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  
  // Folders derived from default + existing notes
  const folders = Array.from(new Set([...(categories.length > 0 ? categories : DEFAULT_FOLDERS), ...notes.map(n => n.folder)])).filter(Boolean);
  
  const filteredNotes = (activeFolder ? notes.filter(n => n.folder === activeFolder) : notes).filter(n => {
    const hasTitle = typeof n.title === 'string' && n.title.trim().length > 0;
    const hasContent = typeof n.content === 'string' && n.content.trim().length > 0;
    return hasTitle || hasContent;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [initialFolder, setInitialFolder] = useState<string | undefined>(undefined);
  
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(FALLBACK_PASTEL_COLORS[0]);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [manageCategoryState, setManageCategoryState] = useState<{ogName: string, name: string, color: string}[]>([]);

  const handleOpenManageCategories = () => {
    setManageCategoryState(folders.map(f => ({
      ogName: f,
      name: f,
      color: categoryColors[f] || (f?.includes("Jurnal") ? accentColor + "20" : (CATEGORY_COLORS[f] || FALLBACK_PASTEL_COLORS[0]))
    })));
    setIsManageCategoriesOpen(true);
  };

  const handleOpenNew = () => {
    setEditingNote(null);
    setInitialFolder(activeFolder || undefined);
    setIsModalOpen(true);
  };

  const handleSaveNewCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim(), newCategoryColor);
      setActiveFolder(newCategoryName.trim());
      setManageCategoryState(s => [...s, { ogName: newCategoryName.trim(), name: newCategoryName.trim(), color: newCategoryColor }]);
    }
    setNewCategoryName("");
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setInitialFolder(undefined);
    setIsModalOpen(true);
  };

  const renderContent = (note: Note) => {
    const safeContent = typeof note.content === 'string' ? note.content : '';
    if (note.folder?.includes("Cumpărături")) {
      const items = safeContent.split('\n').filter(l => l.trim());
      return (
        <div className="space-y-1.5 mt-2">
          {items.map((item, idx) => {
            const isChecked = item.startsWith('[x] ') || item.startsWith('[X] ');
            const text = item.replace(/^\[[xX ]\] /, '');
            return (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <div className="mt-0.5 flex-shrink-0" style={{ color: isChecked || note.folder?.includes("Cumpărături") ? accentColor : undefined }}>
                  {isChecked ? <Heart size={14} className="fill-current" /> : <Heart size={14} />}
                </div>
                <span className={isChecked ? 'line-through opacity-50' : 'opacity-90'}>{text}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return (
      <div className="text-slate-700 opacity-90 line-clamp-6 whitespace-pre-wrap text-sm markdown-body mt-2">
         <ReactMarkdown>{safeContent}</ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen flex flex-col pt-6 pb-32 px-4 md:px-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="mb-6 flex justify-between items-center z-10">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight mb-2 ${textPrimary}`}>
            Notițe
          </h1>
          <p className={`${textSecondary} font-medium`}>Gânduri și idei</p>
        </div>
        <button
          onClick={handleOpenNew}
          style={{ backgroundColor: accentColor }}
          className="text-white p-3 rounded-2xl shadow-[0_8px_16px_-6px_rgba(0,0,0,0.2)] hover:scale-105 transition-all outline-none"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Category Navigation Bar */}
      <div className={`mb-6 p-2 rounded-[2rem] ${categoryContainerClasses}`}>
        {/* Folders Row - Mobile Dropdown */}
        <div className="md:hidden flex gap-2 items-center z-20 relative w-full">
           <div className="relative flex-1">
               <button 
                   onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                   className={`w-full flex justify-between items-center font-bold px-5 py-3.5 rounded-[2rem] shadow-sm transition-all ${mobileDropdownBtnClasses}`}
               >
                   <span className="truncate pr-4">{activeFolder || "Toate Categoriile"}</span>
                   <span className={`text-sm transition-transform ${isMobileDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
               </button>
               {isMobileDropdownOpen && (
                   <div className={`absolute top-full left-0 right-0 mt-2 rounded-3xl shadow-xl p-2 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-top-2 max-h-64 overflow-y-auto no-scrollbar ${mobileDropdownMenuClasses}`}>
                       <button
                          onClick={() => { setActiveFolder(null); setIsMobileDropdownOpen(false); }}
                          className={`text-left px-4 py-3 rounded-2xl font-bold transition-all ${!activeFolder ? 'bg-slate-800 text-white' : isNeon ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}
                       >
                         Toate Categoriile
                       </button>
                       {folders.map(folder => (
                           <div key={folder} className="flex gap-2">
                               <button
                                  onClick={() => { setActiveFolder(folder); setIsMobileDropdownOpen(false); }}
                                  className={`flex-1 text-left px-4 py-3 rounded-2xl font-bold transition-all truncate ${activeFolder === folder ? 'bg-slate-800 text-white' : isNeon ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}
                               >
                                 {folder}
                               </button>
                           </div>
                       ))}
                   </div>
               )}
           </div>
           <button
              onClick={handleOpenManageCategories}
              className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl active:scale-95 transition-all shadow-sm ${actionBtnClasses}`}
           >
              <Settings size={22} className="stroke-[2.5]" />
           </button>
        </div>

        {/* Folders Row - Desktop Pills */}
        <div className="hidden md:flex gap-2 flex-wrap mt-0 z-10 items-center overflow-visible">
           <button
              onClick={() => setActiveFolder(null)}
              className={`flex-shrink-0 px-4 py-2 font-bold rounded-2xl transition-all shadow-sm ${!activeFolder ? 'bg-slate-800 text-white' : isNeon ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
           >
             Toate
           </button>
           {folders.map(folder => {
               const isActive = activeFolder === folder;
               return (
                 <div key={folder} className="flex gap-1 items-center bg-transparent group relative">
                   <button
                      onClick={() => setActiveFolder(folder)}
                      className={`flex-shrink-0 px-4 py-2 font-bold rounded-2xl transition-all shadow-sm flex items-center gap-2 ${isActive ? 'bg-slate-800 text-white' : isNeon ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
                   >
                     <span>{folder}</span>
                   </button>
                   {isActive && (
                     <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-black/5 flex gap-1 z-50 animate-in fade-in slide-in-from-top-2">
                       {FALLBACK_PASTEL_COLORS.map(c => (
                         <button 
                            key={c}
                            onClick={() => onUpdateCategoryColor(folder, c)}
                            className={`w-6 h-6 rounded-full hover:scale-110 transition-transform ${categoryColors[folder] === c ? 'scale-110 ring-2 ring-indigo-500' : ''}`}
                            style={{ backgroundColor: c }}
                         />
                       ))}
                     </div>
                   )}
                 </div>
               );
           })}
           <button
              onClick={handleOpenManageCategories}
              className={`flex-shrink-0 p-2 rounded-2xl active:scale-95 transition-all shadow-sm font-bold flex items-center justify-center gap-1 ml-1 ${actionBtnClasses}`}
           >
              <Settings size={20} className="stroke-[2.5]" />
           </button>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-70">
            <span className="text-4xl mb-2">📝</span>
            <p className={`${textSecondary} font-medium`}>Nu există notițe momentan.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 pb-20">
            {filteredNotes.map(note => {
              let bg = categoryColors[note.folder] || CATEGORY_COLORS[note.folder] || (isNeon ? '#164e63' : '#f8fafc');
              return (
                <div 
                  key={note.id}
                  onClick={() => handleEdit(note)}
                  className={`break-inside-avoid rounded-3xl p-5 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative group shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 ${textPrimary}`}
                  style={{ backgroundColor: (note.folder && !categoryColors[note.folder] && note.folder.includes("Jurnal")) ? accentColor : bg }}
                >
                  <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-50 flex justify-between items-center">
                      <span>{note.folder}</span>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const titleStr = typeof note.title === 'string' && note.title.trim() ? note.title.trim() : (lang === 'ro' ? 'Fără titlu' : 'Untitled');
                          const contentStr = typeof note.content === 'string' ? note.content.trim() : '';
                          const text = `📝 ${titleStr}\n\n${contentStr}\n\n${lang === 'ro' ? 'Trimis din SmartNotes ✨' : 'Sent from SmartNotes ✨'}`;
                          await handleShare({ title: titleStr, text });
                        }}
                        className="p-1 hover:scale-110 transition-transform text-slate-600 dark:text-slate-300 rounded-full hover:bg-black/5"
                        title={lang === 'ro' ? 'Distribuie' : 'Share'}
                      >
                        <Share2 size={14} className="stroke-[2.5]" />
                      </button>
                  </div>
                  <h3 className={`font-bold text-lg leading-tight ${typeof note.title === 'string' && note.title.trim() ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                      {(typeof note.title === 'string' && note.title.trim()) ? note.title : 'Fără titlu'}
                  </h3>
                  {renderContent(note)}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manage Categories Modal */}
      {isManageCategoriesOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => setIsManageCategoriesOpen(false)}></div>
              <div className={`relative w-full max-w-lg rounded-[2rem] shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] ${modalBgClasses}`}>
                  <div className="flex justify-between items-center mb-6">
                      <h2 className={`text-2xl font-bold ${isNeon ? 'text-slate-200' : 'text-slate-800'}`}>Gestionare Categorii</h2>
                      <button onClick={() => setIsManageCategoriesOpen(false)} className={`p-2 rounded-full transition-colors ${actionBtnClasses}`}>
                          <X size={20} />
                      </button>
                  </div>
                  <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar pb-4 -mx-2 px-2 flex-1">
                      {manageCategoryState.map((cat, i) => (
                          <div key={i} className={`flex flex-col sm:flex-row gap-3 p-3 rounded-2xl border relative ${isNeon ? 'bg-slate-700/50 border-slate-600' : isSoft ? 'bg-white/50 border-pink-100' : 'bg-slate-50 border-slate-100'}`}>
                              <input 
                                 className={`flex-1 px-3 py-2 rounded-xl focus:outline-none ring-2 ring-transparent transition-all shadow-sm border font-medium ${isNeon ? 'bg-slate-800 border-slate-600 text-white focus:ring-slate-500' : 'bg-white border-slate-200 text-slate-800 focus:ring-slate-300'}`}
                                 value={cat.name}
                                 onChange={(e) => setManageCategoryState(s => s.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                              />
                              <div className="flex gap-2 items-center justify-between sm:justify-start">
                                  <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[160px] p-1">
                                       {FALLBACK_PASTEL_COLORS.map(c => (
                                          <button
                                              key={c}
                                              onClick={() => setManageCategoryState(s => s.map((x, j) => j === i ? { ...x, color: c } : x))}
                                              className={`w-6 h-6 flex-shrink-0 rounded-full transition-transform ${cat.color === c ? 'scale-110 ring-2 ring-slate-400' : 'hover:scale-110 border border-black/5 shadow-sm'}`}
                                              style={{ backgroundColor: c }}
                                          />
                                       ))}
                                  </div>
                                  {!DEFAULT_FOLDERS.includes(cat.ogName) && (
                                      <button 
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             if (confirm(`Sigur ștergi categoria "${cat.ogName}"? Notițele din ea vor trece la categoria generală.`)) {
                                                 onDeleteCategory(cat.ogName);
                                                 setManageCategoryState(s => s.filter((_, j) => j !== i));
                                                 if (activeFolder === cat.ogName) setActiveFolder(null); // safety fallback
                                             }
                                         }}
                                         className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition-all"
                                      >
                                         <Trash2 size={18} />
                                      </button>
                                  )}
                              </div>
                          </div>
                      ))}
                      
                      {/* Create New Section inside Modal */}
                      <div className={`mt-4 pt-4 border-t ${isNeon ? 'border-slate-700' : 'border-slate-200'}`}>
                          <p className={`text-sm font-bold mb-3 ml-1 ${isNeon ? 'text-slate-400' : isSoft ? 'text-pink-800' : 'text-slate-600'}`}>Creează Categorie Nouă</p>
                          <div className={`flex flex-col sm:flex-row gap-3 p-3 rounded-2xl border ${isNeon ? 'bg-slate-700/50 border-slate-600' : isSoft ? 'bg-white/50 border-pink-100' : 'bg-slate-50 border-slate-100'}`}>
                              <input
                                  value={newCategoryName}
                                  onChange={(e) => setNewCategoryName(e.target.value)}
                                  placeholder="✨ Nume & Emoji..."
                                  className={`flex-1 px-3 py-2 rounded-xl focus:outline-none ring-2 ring-transparent transition-all shadow-sm border font-medium ${isNeon ? 'bg-slate-800 border-slate-600 text-white focus:ring-slate-500' : 'bg-white border-slate-200 text-slate-800 focus:ring-slate-300'}`}
                              />
                              <div className="flex gap-2 items-center justify-between sm:justify-start">
                                  <div className="flex gap-2 flex-wrap max-w-[160px] p-1">
                                      {FALLBACK_PASTEL_COLORS.map(c => (
                                          <button
                                             key={c}
                                             onClick={() => setNewCategoryColor(c)}
                                             className={`w-6 h-6 rounded-full hover:scale-110 transition-transform ${newCategoryColor === c ? 'scale-110 ring-2 ring-slate-400 ring-offset-1' : 'shadow-sm border border-black/5'}`}
                                             style={{ backgroundColor: c }}
                                          />
                                      ))}
                                  </div>
                                  <button
                                      onClick={handleSaveNewCategory}
                                      disabled={!newCategoryName.trim()}
                                      className={`p-2 rounded-xl transition-all flex items-center justify-center font-bold px-3 ${!newCategoryName.trim() ? 'opacity-50' : 'hover:scale-105 active:scale-95 shadow-sm'} ${isNeon ? 'bg-slate-800 text-white border border-slate-600' : isSoft ? 'bg-pink-500 text-white' : 'bg-slate-800 text-white'}`}
                                  >
                                      <Plus size={18} />
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="mt-4 pt-2 shrink-0">
                      <button
                          onClick={() => {
                              manageCategoryState.forEach(cat => {
                                  const defaultCol = cat.ogName?.includes("Jurnal") ? accentColor + "20" : (CATEGORY_COLORS[cat.ogName] || FALLBACK_PASTEL_COLORS[0]);
                                  if (cat.name.trim() !== cat.ogName || cat.color !== (categoryColors[cat.ogName] || defaultCol)) {
                                      const finalName = cat.name.trim() || cat.ogName;
                                      onEditCategory(cat.ogName, finalName, cat.color);
                                      // Update internal active folder if the selected one was renamed
                                      if (activeFolder === cat.ogName && finalName !== cat.ogName) {
                                          setActiveFolder(finalName);
                                      }
                                  }
                              });
                              setIsManageCategoriesOpen(false);
                          }}
                          className={`w-full font-bold py-3.5 rounded-2xl shadow-md hover:-translate-y-0.5 active:scale-95 transition-all ${isNeon ? 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
                      >
                          Salvează Modificările
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <NoteEditorModal 
          note={editingNote}
          initialFolder={initialFolder}
          folders={folders}
          theme={theme}
          accentColor={accentColor}
          categoryColors={categoryColors}
          lang={lang}
          onClose={() => setIsModalOpen(false)}
          onSave={onSaveNote}
          onUpdate={onUpdateNote}
          onDelete={onDeleteNote}
        />
      )}
    </div>
  );
};

interface NoteEditorModalProps {
  note: Note | null;
  initialFolder?: string;
  folders: string[];
  theme: Theme;
  accentColor: string;
  categoryColors: Record<string, string>;
  lang: LanguageOption;
  onClose: () => void;
  onSave: (title: string, content: string, folder: string, color: string) => Promise<void>;
  onUpdate: (id: string, title: string, content: string, folder: string, color: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const NoteEditorModal: React.FC<NoteEditorModalProps> = ({ note, initialFolder, folders, theme, accentColor, categoryColors, lang, onClose, onSave, onUpdate, onDelete }) => {
  const getTemplateForFolder = (folderName: string) => {
    const today = new Date().toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (folderName?.includes('Jurnal')) {
      return `📅 Data: ${today}\n\n✨ Cum mă simt azi:\n\n\n🙏 Sunt recunoscătoare pentru:\n- \n- `;
    } else if (folderName?.includes('Travel')) {
      return `📍 Destinație: \n📅 Perioada: \n\n🎒 De pus în bagaj:\n- [ ] Pașaport & Acte\n- [ ] Bani/Carduri\n- [ ] \n\n🗺️ Locuri de vizitat:\n- `;
    }
    return '';
  };

  const [title, setTitle] = useState(note?.title || '');
  const defaultFolder = note?.folder || initialFolder || folders[0] || DEFAULT_FOLDERS[0];
  const [folder, setFolder] = useState(defaultFolder);
  const [content, setContent] = useState(note?.content || (!note ? getTemplateForFolder(defaultFolder) : ''));
  
  const defaultColorBase = categoryColors[defaultFolder] || CATEGORY_COLORS[defaultFolder] || FALLBACK_PASTEL_COLORS[0];
  const initialColor = note?.color || (!categoryColors[defaultFolder] && defaultFolder?.includes("Jurnal") ? accentColor + "20" : defaultColorBase);
  const [color, setColor] = useState(initialColor);
  
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!note && initialFolder) {
      const c = categoryColors[initialFolder] || CATEGORY_COLORS[initialFolder] || FALLBACK_PASTEL_COLORS[0];
      setColor(!categoryColors[initialFolder] && initialFolder?.includes("Jurnal") ? accentColor + "20" : c);
      setFolder(initialFolder);
      // Wait, initial content is already set by useState initially. 
      // This runs on mount if initialFolder is provided. 
    }
  }, [initialFolder, note, categoryColors, accentColor]);

  // Sync folder color change
  useEffect(() => {
    if (!note && folder) {
      const c = categoryColors[folder] || CATEGORY_COLORS[folder] || FALLBACK_PASTEL_COLORS[0];
      setColor(!categoryColors[folder] && folder?.includes("Jurnal") ? accentColor + "20" : c);
      
      setContent((prev) => {
          if (!prev) return getTemplateForFolder(folder);
          const templates = [
              getTemplateForFolder("📓 Jurnal"),
              getTemplateForFolder("✈️ Travel"),
              "💡 Concept:\n\n\n🎯 Următorul pas:\n- "
          ];
          if (templates.includes(prev)) return getTemplateForFolder(folder);
          return prev;
      });
    } else if (note && folder) {
      // update color when picking a folder on an existing note
      const c = categoryColors[folder] || CATEGORY_COLORS[folder] || FALLBACK_PASTEL_COLORS[0];
      setColor(!categoryColors[folder] && folder?.includes("Jurnal") ? accentColor + "20" : c);
    }
  }, [folder, note, categoryColors, accentColor]);

  const handleSave = async () => {
    // Explicit save
    if (!title.trim() && !content.trim()) return onClose();
    const finalTitle = title.trim() || 'Notiță nouă';
    if (note) {
      await onUpdate(note.id, finalTitle, content, folder, color);
    } else {
      await onSave(finalTitle, content, folder, color);
    }
    onClose();
  };

  const handleMagicAI = async () => {
    if (!content.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/magic-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (res.ok) {
        setContent(data.text);
      } else {
        alert("Eroare AI: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
    setIsGenerating(false);
  };

  const isChecklist = folder?.includes("Cumpărături");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div 
        className="relative w-full max-w-2xl h-auto max-h-[80vh] flex flex-col rounded-[2rem] shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200"
        style={{ backgroundColor: folder?.includes("Jurnal") ? accentColor : color }}
      >
        <div className="flex justify-between items-center mb-6">
           <select 
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="bg-black/5 border-none rounded-xl px-4 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-black/10 outline-none appearance-none cursor-pointer"
           >
               {folders.map(f => <option key={f} value={f}>{f}</option>)}
           </select>
           
           <div className="flex items-center gap-2">
             <div className="flex gap-1 bg-black/5 p-1.5 rounded-full hidden sm:flex">
               {FALLBACK_PASTEL_COLORS.map(c => (
                 <button 
                   key={c}
                   onClick={() => setColor(c)}
                   title={c}
                   className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-black/20' : 'hover:scale-110'}`}
                   style={{ backgroundColor: c }}
                 />
               ))}
             </div>
             {note && (
               <button onClick={() => { onDelete(note.id); onClose(); }} className="p-2 bg-black/5 rounded-full text-slate-700 hover:bg-red-500 hover:text-white transition-colors ml-2">
                 <Trash2 size={20} />
               </button>
             )}
             <button 
               onClick={async () => {
                 const titleStr = title.trim() || (lang === 'ro' ? 'Notiță nouă' : 'New note');
                 const contentStr = content.trim();
                 const text = `📝 ${titleStr}\n\n${contentStr}\n\n${lang === 'ro' ? 'Trimis din SmartNotes ✨' : 'Sent from SmartNotes ✨'}`;
                 await handleShare({ title: titleStr, text });
               }}
               disabled={!title.trim() && !content.trim()}
               className="p-2 bg-black/5 rounded-full text-slate-700 hover:bg-black/10 transition-colors ml-2 disabled:opacity-40"
               title={lang === 'ro' ? 'Distribuie' : 'Share'}
             >
               <Share2 size={20} />
             </button>
             <button onClick={onClose} className="p-2 bg-black/5 rounded-full text-slate-700 hover:bg-black/10 transition-colors ml-1">
               <X size={20} />
             </button>
           </div>
        </div>

        <input 
           value={title}
           onChange={(e) => setTitle(e.target.value)}
           placeholder="Titlu notiță..."
           className="text-3xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 placeholder:text-slate-800/40 mb-4 px-1"
        />

        <div className="flex-1 min-h-0 relative flex flex-col">
          {isChecklist ? (
             <div className="flex-1 min-h-[150px] max-h-[45vh] overflow-y-auto no-scrollbar pb-16">
               {content.split('\n').map((line, idx) => {
                 const isChecked = line.startsWith('[x] ') || line.startsWith('[X] ');
                 const text = line.replace(/^\[[xX ]\] /, '');
                 if (!line.trim() && idx === content.split('\n').length - 1) return null; // skip last empty line
                 return (
                   <div key={idx} className="flex items-center gap-3 mb-2 group">
                     <button 
                       onClick={() => {
                         const lines = content.split('\n');
                         lines[idx] = (isChecked ? '[ ] ' : '[x] ') + text;
                         setContent(lines.join('\n'));
                       }}
                       className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center transition-all ${!isChecked ? 'text-slate-400 group-hover:text-slate-600' : ''}`}
                       style={isChecked ? { color: accentColor } : undefined}
                     >
                       <Heart size={20} className={isChecked ? "fill-current" : ""} />
                     </button>
                     <input 
                       className={`flex-1 bg-transparent border-b border-transparent hover:border-black/10 focus:border-black/20 focus:outline-none font-medium text-lg transition-all ${isChecked ? 'line-through opacity-50' : 'opacity-90 text-slate-800'}`}
                       value={text}
                       onChange={(e) => {
                         const lines = content.split('\n');
                         lines[idx] = (isChecked ? '[x] ' : '[ ] ') + e.target.value;
                         setContent(lines.join('\n'));
                       }}
                     />
                     <button 
                       onClick={() => {
                         const lines = content.split('\n');
                         lines.splice(idx, 1);
                         setContent(lines.join('\n'));
                       }}
                       className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                     >
                       <X size={16} />
                     </button>
                   </div>
                 );
               })}
               <div className="flex items-center gap-3 mt-2 opacity-60 hover:opacity-100 transition-opacity">
                 <div className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-slate-400">
                    <Plus size={20} />
                 </div>
                 <input 
                    placeholder="Adaugă articol..."
                    className="flex-1 bg-transparent border-b border-transparent focus:outline-none font-medium text-lg placeholder:text-slate-800/40"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const newContent = content ? content + `\n[ ] ${e.currentTarget.value}` : `[ ] ${e.currentTarget.value}`;
                        setContent(newContent);
                        e.currentTarget.value = '';
                      }
                    }}
                    onBlur={(e) => {
                      if (e.currentTarget.value.trim()) {
                         const newContent = content ? content + `\n[ ] ${e.currentTarget.value}` : `[ ] ${e.currentTarget.value}`;
                         setContent(newContent);
                         e.currentTarget.value = '';
                      }
                    }}
                 />
               </div>
             </div>
          ) : (
            <textarea
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="Scrie ceva inspirat..."
               className="w-full min-h-[150px] max-h-[45vh] bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 text-lg resize-none placeholder:text-slate-800/40 px-1 leading-relaxed pb-16 overflow-y-auto"
            />
          )}

          <div className="absolute bottom-0 left-0 right-0 py-4 px-2 flex justify-between items-center bg-gradient-to-t from-[var(--tw-gradient-from)] to-transparent" style={{ '--tw-gradient-from': color } as React.CSSProperties}>
            <button 
               onClick={handleMagicAI}
               disabled={isGenerating || !content.trim()}
               className="flex items-center gap-2 bg-white/60 hover:bg-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm text-slate-700 font-bold transition-all disabled:opacity-50"
            >
               {isGenerating ? <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin" /> : <Wand2 size={20} className="text-purple-500" />}
               <span className="hidden sm:inline">{isGenerating ? 'Se procesează...' : 'Magic AI'}</span>
            </button>
            <button 
               onClick={handleSave}
               className="flex items-center gap-2 px-6 py-2.5 rounded-2xl shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] text-white font-bold transition-all hover:scale-105"
               style={{ backgroundColor: accentColor }}
            >
               Salvare <Check size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
