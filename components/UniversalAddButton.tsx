import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, CheckSquare, Sparkles, Smile, ShoppingBag, Edit3, CheckCircle2 } from 'lucide-react';
import { Theme, MoodLog } from '../types';
import { uploadImageToStorage } from '../lib/firebase';
import { translations, LanguageOption } from '../utils/translations';

interface UniversalAddButtonProps {
    onSaveNote: (title: string, content: string, folder: string, color: string) => Promise<void>;
    onAddTask: () => void;
    onAddEvent: () => void;
    onSaveMood: (mood: any) => Promise<void>;
    onSaveWishlist?: (item: any) => Promise<void>;
    theme: Theme;
    accentColor: string;
    moodLogs?: MoodLog[];
    noteCategories?: string[];
    noteCategoryColors?: Record<string, string>;
    lang: LanguageOption;
}

export const UniversalAddButton: React.FC<UniversalAddButtonProps> = ({
    onSaveNote,
    onAddTask,
    onAddEvent,
    onSaveMood,
    onSaveWishlist,
    theme,
    accentColor,
    moodLogs = [],
    noteCategories = ["📓 Jurnal", "🛒 Cumpărături", "💡 Idei", "✈️ Travel"],
    noteCategoryColors = {},
    lang
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const t = translations[lang] || translations.ro;

    const MOODS = [
        { id: 'amazing', emoji: '🤩', label: lang === 'ro' ? 'Excelent' : lang === 'en' ? 'Excellent' : lang === 'es' ? 'Excelente' : 'Excellent' },
        { id: 'happy', emoji: '😊', label: lang === 'ro' ? 'Bine' : lang === 'en' ? 'Good' : lang === 'es' ? 'Bien' : 'Bien' },
        { id: 'meh', emoji: '😐', label: 'Meh' },
        { id: 'sad', emoji: '😔', label: lang === 'ro' ? 'Trist' : lang === 'en' ? 'Sad' : lang === 'es' ? 'Triste' : 'Triste' },
        { id: 'terrible', emoji: '😫', label: lang === 'ro' ? 'Groaznic' : lang === 'en' ? 'Terrible' : lang === 'es' ? 'Terrible' : 'Terrible' }
    ];

    // Modals internal state
    const [activeModal, setActiveModal] = useState<'note' | 'mood' | 'wishlist' | null>(null);

    // Note State
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [noteCategory, setNoteCategory] = useState(noteCategories[0] || '💡 Idei');
    const [isSavingNote, setIsSavingNote] = useState(false);

    useEffect(() => {
        if (noteCategories && noteCategories.length > 0) {
            setNoteCategory(noteCategories[0]);
        }
    }, [noteCategories]);

    // Wishlist State
    const [wishlistTitle, setWishlistTitle] = useState('');
    const [wishlistPrice, setWishlistPrice] = useState('');
    const [wishlistLink, setWishlistLink] = useState('');
    const [isSavingWishlist, setIsSavingWishlist] = useState(false);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const isNeon = theme === 'neon';
    const isSoft = theme === 'pastel';

    // Check if daily mood already exists
    const dStr = (() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    })();
    const todayMoodExists = moodLogs.some(m => m.date === dStr);

    // Speed Dial Menu Items in precise, requested visual order:
    const menuItems = [
        { label: t.modals.addEvent, icon: '🗓️', onClick: onAddEvent },
        { label: t.modals.addTask, icon: '✅', onClick: onAddTask },
        { label: lang === 'ro' ? 'Adaugă Notiță' : lang === 'es' ? 'Añadir Nota' : lang === 'fr' ? 'Ajouter Note' : 'Add Note', icon: '📝', onClick: () => setActiveModal('note') },
        { label: t.home.addWishlist || t.home.newWishlist, icon: '🛍️', onClick: () => setActiveModal('wishlist') },
    ];

    if (!todayMoodExists) {
        menuItems.push({ label: t.home.todayState, icon: '✨', onClick: () => setActiveModal('mood') });
    }

    const handleSaveQuickNote = async () => {
        if (!noteTitle.trim() && !noteContent.trim()) return;
        setIsSavingNote(true);
        try {
            const folder = noteCategory || noteCategories[0] || '💡 Idei';
            const CATEGORY_COLORS: Record<string, string> = {
              "✈️ Travel": "#bae6fd",
              "💡 Idei": "#fef08a",
              "🛒 Cumpărături": "#bbf7d0",
              "📓 Jurnal": "#fce7f3",
            };
            const noteColor = noteCategoryColors[folder] || CATEGORY_COLORS[folder] || (folder.includes("Jurnal") ? accentColor + "20" : "#bfdbfe");

            await onSaveNote(
                noteTitle.trim() || t.home.quickNote,
                noteContent.trim(),
                folder,
                noteColor
            );
            setNoteTitle('');
            setNoteContent('');
            setActiveModal(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleSaveQuickMood = async (moodId: string) => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const todayCA = `${year}-${month}-${day}`;
        await onSaveMood({ date: todayCA, mood: moodId, activities: [], note: '' });
        setActiveModal(null);
    };

    const handleSaveQuickWishlist = async () => {
        if (!wishlistTitle.trim() || !onSaveWishlist) return;
        setIsSavingWishlist(true);
        try {
            let imageUrl = undefined;
            if (wishlistLink.trim()) {
                try {
                    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(wishlistLink.trim())}`);
                    const data = await res.json();
                    imageUrl = data.data?.image?.url || data.data?.logo?.url;
                } catch (e) {
                    console.error("Microlink fetch error:", e);
                }
            }
            if (!imageUrl) {
                // Cute pastel placeholder from Unsplash
                imageUrl = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80";
            }
            
            await onSaveWishlist({
                title: wishlistTitle.trim(),
                price: wishlistPrice.trim() || undefined,
                storeLink: wishlistLink.trim() || undefined,
                imageUrl
            });
            setWishlistTitle('');
            setWishlistPrice('');
            setWishlistLink('');
            setActiveModal(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSavingWishlist(false);
        }
    };

    return (
        <>
            {/* Backdrop Blur Overlay */}
            {isOpen && (
                <div 
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 z-40 backdrop-blur-sm bg-black/10 dark:bg-black/40 animate-in fade-in duration-200 cursor-pointer"
                />
            )}

            <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end pointer-events-none" ref={containerRef}>
                {/* Speed Dial Menu */}
                <div 
                    className={`flex flex-col gap-3 mb-4 transition-all duration-300 origin-bottom-right pointer-events-auto ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50 !pointer-events-none'}`}
                >
                    {menuItems.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setIsOpen(false);
                                item.onClick();
                            }}
                            className={`flex items-center gap-3 px-5 py-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 whitespace-nowrap font-bold ${isNeon ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white text-slate-800'}`}
                        >
                            <span>{item.label}</span>
                            <span className="text-xl">{item.icon}</span>
                        </button>
                    ))}
                </div>

                {/* Main FAB */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-transform hover:scale-105 active:scale-95 pointer-events-auto"
                    style={{ 
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                        boxShadow: `0 10px 25px -5px ${accentColor}80`
                    }}
                >
                    <div className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
                        <Plus size={32} />
                    </div>
                </button>
            </div>

            {/* --- MODALS --- */}
            
            {/* Quick Note Modal */}
            {activeModal === 'note' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setActiveModal(null)} />
                    <div className={`relative w-full max-w-lg p-6 rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-200 ${isNeon ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white text-slate-800'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold flex items-center gap-2">📝 {t.home.quickNote}</h3>
                            <button onClick={() => setActiveModal(null)} className={`p-2 rounded-full transition-colors ${isNeon ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-xs font-bold mb-1.5 ml-1 opacity-70 ${isNeon ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {t.modals.category}
                                </label>
                                <select 
                                    value={noteCategory}
                                    onChange={(e) => setNoteCategory(e.target.value)}
                                    className={`w-full p-4 font-bold rounded-2xl border transition-all ${isNeon ? 'bg-slate-800 border-slate-700 text-white focus:ring-2 focus:ring-slate-700 outline-none' : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-400 outline-none'}`}
                                >
                                    {noteCategories.map(f => (
                                        <option key={f} value={f} className={isNeon ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}>
                                            {f}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <input 
                                type="text"
                                placeholder={t.home.optionalTitle}
                                value={noteTitle}
                                onChange={e => setNoteTitle(e.target.value)}
                                className={`w-full p-4 text-lg font-bold rounded-2xl border-none focus:ring-2 transition-all ${isNeon ? 'bg-slate-800 focus:ring-slate-700 placeholder-slate-500' : 'bg-slate-50 focus:ring-slate-200 placeholder-slate-400'}`}
                            />
                            <textarea 
                                placeholder={lang === 'ro' ? 'Scrie aici la ce te gândești...' : lang === 'es' ? 'Escribe lo que tengas en mente...' : lang === 'fr' ? 'Écrivez tout ce qui vous passe par la tête...' : 'Write whatever is on your mind...'}
                                value={noteContent}
                                onChange={e => setNoteContent(e.target.value)}
                                rows={5}
                                className={`w-full p-4 rounded-2xl border-none focus:ring-2 resize-none transition-all custom-scrollbar ${isNeon ? 'bg-slate-800 focus:ring-slate-700 placeholder-slate-500' : 'bg-slate-50 focus:ring-slate-200 placeholder-slate-400'}`}
                            />
                            <button 
                                onClick={handleSaveQuickNote}
                                disabled={isSavingNote || (!noteTitle.trim() && !noteContent.trim())}
                                className="w-full py-4 rounded-2xl font-bold text-white shadow-md active:scale-95 transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                style={{ backgroundColor: accentColor }}
                            >
                                {isSavingNote ? t.home.saving : (
                                    <>
                                        <CheckCircle2 size={20} /> {t.home.saveNote}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Mood Modal */}
            {activeModal === 'mood' && (() => {
                const d = new Date();
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const todayCA = `${year}-${month}-${day}`;
                const todaysMood = moodLogs.find(m => m.date === todayCA);

                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setActiveModal(null)} />
                        <div className={`relative w-full max-w-sm rounded-[2rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200 border ${isNeon ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                            <button onClick={() => setActiveModal(null)} className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isNeon ? 'hover:bg-slate-800 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                                <X size={20} />
                            </button>
                            <h3 className={`text-2xl font-bold mb-2 ${isNeon ? 'text-white' : 'text-slate-800'} flex flex-col items-center gap-2`}>
                                <span>{t.home.howDoYouFeel}</span>
                                {todaysMood && (
                                    <span className="text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-full font-semibold animate-pulse">
                                        {t.home.registeredAlready}
                                    </span>
                                )}
                            </h3>
                            {todaysMood && (
                                <p className={`text-xs mb-6 ${isNeon ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {t.home.chooseAnotherState}
                                </p>
                            )}
                            <div className={`flex justify-center gap-2 sm:gap-4 ${!todaysMood ? 'mt-6' : ''}`}>
                                {MOODS.map(mood => {
                                    const isActive = todaysMood ? (todaysMood.mood === mood.id || todaysMood.moodEmoji === mood.emoji) : false;
                                    return (
                                        <button
                                            key={mood.id}
                                            onClick={() => handleSaveQuickMood(mood.id)}
                                            className={`text-4xl sm:text-5xl hover:scale-110 transition-transform active:scale-95 p-1 rounded-2xl ${isActive ? 'ring-2 ring-emerald-400 bg-emerald-400/10' : 'opacity-60 hover:opacity-100'}`}
                                            title={mood.label}
                                        >
                                            {mood.emoji}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Quick Wishlist Modal */}
            {activeModal === 'wishlist' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setActiveModal(null)}></div>
                    <div className={`relative w-full max-w-sm rounded-[2rem] shadow-2xl p-6 animate-in zoom-in-95 duration-200 border ${isNeon ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">🛍️ {t.home.newWishlist}</h2>
                            <button onClick={() => setActiveModal(null)} className={`p-2 rounded-full transition-colors ${isNeon ? 'hover:bg-slate-800 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-2 ml-1 opacity-70">{t.home.productName}</label>
                                <input 
                                    type="text"
                                    value={wishlistTitle}
                                    onChange={(e) => setWishlistTitle(e.target.value)}
                                    placeholder={t.home.productPlaceholder}
                                    className={`w-full p-4 rounded-2xl focus:outline-none focus:ring-2 transition-all border ${isNeon ? 'bg-slate-800 border-slate-700 text-white focus:ring-slate-600' : 'bg-slate-50 border-slate-200 focus:ring-indigo-400'}`}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold mb-2 ml-1 opacity-70">{t.home.priceOptional}</label>
                                    <input 
                                        type="text"
                                        value={wishlistPrice}
                                        onChange={(e) => setWishlistPrice(e.target.value)}
                                        placeholder={lang === 'ro' ? 'ex: 150 RON' : lang === 'es' ? 'ej: 150 EUR' : 'e.g., 150 USD'}
                                        className={`w-full p-4 rounded-2xl focus:outline-none focus:ring-2 transition-all border ${isNeon ? 'bg-slate-800 border-slate-700 text-white focus:ring-slate-600' : 'bg-slate-50 border-slate-200 focus:ring-indigo-400'}`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 ml-1 opacity-70">{t.home.storeLinkOptional}</label>
                                <input 
                                    type="url"
                                    value={wishlistLink}
                                    onChange={(e) => setWishlistLink(e.target.value)}
                                    placeholder="https://..."
                                    className={`w-full p-4 rounded-2xl focus:outline-none focus:ring-2 transition-all border ${isNeon ? 'bg-slate-800 border-slate-700 text-white focus:ring-slate-600' : 'bg-slate-50 border-slate-200 focus:ring-indigo-400'}`}
                                />
                            </div>
                            <button 
                                onClick={handleSaveQuickWishlist}
                                disabled={!wishlistTitle.trim() || isSavingWishlist}
                                className={`w-full py-4 mt-2 rounded-2xl font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center`}
                                style={{ backgroundColor: accentColor }}
                            >
                                {isSavingWishlist ? t.home.imageSearch : t.home.addWishlist}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
