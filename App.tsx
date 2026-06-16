
import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from './components/Calendar';
import { TodoList } from './components/TodoList';
import { EventModal } from './components/EventModal';
import { EditEventModal } from './components/EditEventModal';
import { ChatAssistant } from './components/ChatAssistant';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CalendarEvent, Todo, Theme, Category } from './types';
import * as storage from './utils/storage';
import { LanguageOption, translations } from './utils/translations';
import { requestNotificationPermission, auth, googleProvider } from './lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseAuthUser } from 'firebase/auth';
import { useNotifications } from './hooks/useNotifications';
import { useEvents } from './hooks/useEvents';
import { useTodos } from './hooks/useTodos';
import { LoadingSpinner } from './components/LoadingSpinner';
import { 
  LogOut, Layout, Settings, ArrowRight, Sparkles, 
  Calendar as CalendarIcon, CheckSquare, MessageCircle, 
  Download, Upload, Share2, Check, User as UserIcon, AlertCircle,
  Menu, Home, Search, Pencil, X, Globe
} from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'todo' | 'settings'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data State
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const { testNotification } = useNotifications(events);
  const [userName, setUserName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  
  // Name Editing in Header
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Language
  const [lang, setLang] = useState<LanguageOption>('ro');
  const t = translations[lang];

  // Identity & Themes
  const [theme, setTheme] = useState<Theme>('modern');
  const [accentColor, setAccentColor] = useState<string>('#4F46E5'); // Default Indigo Hex
  
  // Data
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [initializing, setInitializing] = useState(true);

  // AI & Gamification State
  const [aiMessage, setAiMessage] = useState<{text: string, id: string} | null>(null);
  const [lastCompletedTask, setLastCompletedTask] = useState<string | null>(null);

  const triggerAiMessage = (message: string) => {
    setAiMessage({ text: message, id: crypto.randomUUID() });
  };

  const {
      handleSaveEvent,
      handleUpdateEvent,
      handleDeleteEvent,
      handleDeleteEventByTitle
  } = useEvents(events, setEvents, triggerAiMessage);

  const {
      handleAddTodo,
      handleEditTodo,
      handleToggleTodo,
      handleTogglePin,
      handleChangeTodoColor,
      handleToggleTodoByText,
      handleDeleteTodo
  } = useTodos(todos, setTodos, setLastCompletedTask);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Edit Event State
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Settings State (for Import/Export feedback)
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#10B981');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            setUserName(user.displayName || 'Utilizator');
            await loadUserData();
        } else {
            setUserName(null);
            setInitializing(false);
        }
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async () => {
        const storedLang = localStorage.getItem('app_lang') as LanguageOption | null;
        if (storedLang && translations[storedLang]) {
            setLang(storedLang);
        }

        // 2. Load other data from Firebase / localStorage
        let storedEvents = [];
        let storedTodos = [];
        let storedCategories = [];

        try {
            // Fetch everything in parallel
            const fetchPromise = Promise.all([
                storage.getEvents(),
                storage.getTodos(),
                storage.getCategories()
            ]);

            // Add a 5 second timeout to prevent infinite hanging
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('offline')), 5000)
            );

            const [eventsData, todosData, categoriesData] = await Promise.race([fetchPromise, timeoutPromise]) as any;
            
            storedEvents = eventsData;
            storedTodos = todosData;
            storedCategories = categoriesData;
        } catch (error) {
            console.warn("Offline or timeout reached. Using localStorage as backup.");
            // We use directly localStorage here as a reliable backup
            const localEvents = localStorage.getItem('smart_calendar_events');
            const localTodos = localStorage.getItem('smart_calendar_todos');
            const localCats = localStorage.getItem('smart_calendar_categories');
            
            if (localEvents) storedEvents = JSON.parse(localEvents);
            if (localTodos) storedTodos = JSON.parse(localTodos);
            if (localCats) storedCategories = JSON.parse(localCats);

            triggerAiMessage("Eroare de conexiune (offline). Folosesc datele locale! 📡");
        }
        
        if (storedEvents && storedEvents.length > 0) setEvents(storedEvents);
        if (storedTodos && storedTodos.length > 0) setTodos(storedTodos);
        
        const storedTheme = storage.getTheme();
        const storedAccent = localStorage.getItem('app_accent_color');
        
        if (storedTheme) {
            setTheme(storedTheme);
        } else {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initialTheme: Theme = prefersDark ? 'neon' : 'modern';
            setTheme(initialTheme);
            storage.saveTheme(initialTheme);
        }
        if (storedAccent) setAccentColor(storedAccent);
        
        if (storedCategories && storedCategories.length > 0) {
          setCategories(storedCategories);
        } else {
          // Default Categories
          const defaults = [
            { id: crypto.randomUUID(), name: 'Work', color: '#4F46E5' },
            { id: crypto.randomUUID(), name: 'Personal', color: '#10B981' },
            { id: crypto.randomUUID(), name: 'Study', color: '#F59E0B' },
            { id: crypto.randomUUID(), name: 'Urgent', color: '#EF4444' }
          ];
          setCategories(defaults);
          storage.saveCategories(defaults);
        }
        
        // Request notifications permission
        requestNotificationPermission();

        setInitializing(false);
  };

  useEffect(() => {
    const isDark = theme === 'neon';
    
    // Toggle Tailwind's dark class
    document.documentElement.classList.toggle('dark', isDark);
    
    // CRITICAL FIX FOR iOS DATE/TIME INPUTS:
    // This forces native inputs to obey the app's theme, not the OS theme.
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    
    // Save to localStorage
    storage.saveTheme(theme);
  }, [theme]);

  const handleStartApp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error("Login failed:", error);
        alert("Autentificarea a eșuat. Încercați din nou.");
    }
  };

  const handleUpdateUserName = async (name: string) => {
    setUserName(name);
    if (auth.currentUser) {
        const { updateProfile } = await import('firebase/auth');
        try {
            await updateProfile(auth.currentUser, { displayName: name });
        } catch (error) {
            console.error("Failed to update display name:", error);
        }
    }
  };
  
  const saveNameEdit = () => {
    if (tempName.trim()) {
        handleUpdateUserName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleLogout = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem('app_username');
        setUserName(null);
        setNameInput('');
        sessionStorage.removeItem('olli_greeted');
        setEvents([]);
        setTodos([]);
    } catch (error) {
        console.error("Logout failed:", error);
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    storage.saveTheme(newTheme);
  };

  const handleLangChange = (newLang: LanguageOption) => {
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const handleAccentChange = (newColor: string) => {
    setAccentColor(newColor);
    localStorage.setItem('app_accent_color', newColor);
  };

  // --- CATEGORY HANDLERS ---
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const cat = {
      id: crypto.randomUUID(),
      name: newCategoryName.trim(),
      color: newCategoryColor
    };
    const updated = [...categories, cat];
    setCategories(updated);
    storage.saveCategories(updated);
    setNewCategoryName('');
  };

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) return; // don't delete last one
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    storage.saveCategories(updated);
  };

  // --- SEARCH FILTERING ---
  const filteredEvents = events.filter(e => {
    const q = searchQuery.toLowerCase();
    const cat = categories.find(c => c.id === e.categoryId);
    return e.title.toLowerCase().includes(q) || (cat && cat.name.toLowerCase().includes(q));
  });

  const filteredTodos = todos.filter(t => 
    t.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- DATA MANAGEMENT ---
  const handleExport = () => {
    const data = {
      user: { name: userName },
      events,
      todos,
      theme,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-calendar-backup.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        handleImportData(json);
        alert('Backup restaurat cu succes!');
        window.location.reload();
      } catch (err) {
        alert('Eroare: Fișier invalid sau corupt.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportData = (data: any) => {
    if (data.user && data.user.name) {
        setUserName(data.user.name);
        localStorage.setItem('app_username', data.user.name);
    }
    if (data.events && Array.isArray(data.events)) {
        setEvents(data.events);
        storage.saveEvents(data.events);
    }
    if (data.todos && Array.isArray(data.todos)) {
        setTodos(data.todos);
        storage.saveTodos(data.todos);
    }
    if (data.theme) {
        setTheme(data.theme);
        storage.saveTheme(data.theme);
    }
    triggerAiMessage("Datele au fost restaurate cu succes! 💾");
  };

  const handleShare = async () => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const upcoming = events
      .filter(e => {
        const d = new Date(e.date);
        // Clone now to avoid mutation in filter
        const startOfToday = new Date(now);
        startOfToday.setHours(0,0,0,0);
        return d >= startOfToday && d <= nextWeek;
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

  // --- EVENT HANDLERS ---
  const handleOpenModal = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const openEditModal = (event: CalendarEvent) => {
      setEditingEvent(event);
      setIsEditModalOpen(true);
  };

  // --- STYLES HELPER ---
  const getThemeBackground = () => {
    switch(theme) {
      case 'neon': return 'bg-slate-950';
      case 'pastel': return 'bg-stone-50';
      default: return 'bg-slate-100';
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // --- WELCOME SCREEN ---
  if (!userName) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
             <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md text-center border border-white/20 animate-in zoom-in-95 duration-300">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-sm bg-indigo-50 text-indigo-600`}>
                    <Sparkles size={40} />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Bine ai venit! 👋</h1>
                <p className="text-slate-500 mb-8">Smart Calendar te ajută să te organizezi eficient.</p>
                <form onSubmit={handleStartApp} className="space-y-4">
                    <button 
                        type="submit" 
                        className={`w-full py-3.5 text-slate-700 font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition-all active:scale-95 flex items-center justify-center gap-3 text-lg`}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span>Sign in with Google</span>
                    </button>
                </form>
             </div>
        </div>
    );
  }

  // --- VIEW RENDERING ---
  const renderContent = () => {
    if (initializing) return <LoadingSpinner />;

    switch(activeTab) {
      case 'home':
        return (
          <div className="flex flex-col lg:flex-row gap-6 p-3 lg:p-6 animate-in fade-in duration-300 overflow-hidden min-h-full">
             {/* Left: Calendar (Flexible) */}
             <div className="flex-1 min-h-[500px] flex flex-col shadow-sm rounded-2xl overflow-hidden">
                <Calendar 
                  events={filteredEvents} 
                  onDateSelect={handleOpenModal}
                  onDeleteEvent={handleDeleteEvent}
                  onEditEvent={openEditModal}
                  theme={theme}
                  accentColor={accentColor}
                  searchQuery={searchQuery}
                  categories={categories}
                  lang={lang}
                />
             </div>
             {/* Right: Todos (Fixed Width on Desktop) */}
             <div className="w-full lg:w-96 flex-shrink-0 flex flex-col min-h-[400px]">
                <TodoList 
                    todos={filteredTodos}
                    onAddTodo={handleAddTodo}
                    onEditTodo={handleEditTodo}
                    onToggleTodo={handleToggleTodo}
                    onDeleteTodo={handleDeleteTodo}
                    onTogglePin={handleTogglePin}
                    onChangeColor={handleChangeTodoColor}
                    theme={theme}
                    accentColor={accentColor}
                    searchQuery={searchQuery}
                    categories={categories}
                />
             </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="h-full flex flex-col p-3 lg:p-6 animate-in fade-in duration-300">
             <Calendar 
              events={filteredEvents} 
              onDateSelect={handleOpenModal}
              onDeleteEvent={handleDeleteEvent}
              onEditEvent={openEditModal}
              theme={theme}
              accentColor={accentColor}
              searchQuery={searchQuery}
              categories={categories}
              lang={lang}
            />
          </div>
        );
      case 'todo':
        return (
          <div className="h-full p-3 lg:p-6 overflow-y-auto animate-in fade-in duration-300">
             <div className="max-w-4xl mx-auto h-full flex flex-col">
                <div className="mb-6">
                    <h2 className={`text-3xl font-bold ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>Task-uri</h2>
                    <p className={`${theme === 'neon' ? 'text-slate-400' : 'text-slate-500'}`}>Gestionează lista ta de priorități</p>
                </div>
                <div className="flex-1 min-h-0">
                    <TodoList 
                        todos={filteredTodos}
                        onAddTodo={handleAddTodo}
                        onEditTodo={handleEditTodo}
                        onToggleTodo={handleToggleTodo}
                        onDeleteTodo={handleDeleteTodo}
                        onTogglePin={handleTogglePin}
                        onChangeColor={handleChangeTodoColor}
                        theme={theme}
                        accentColor={accentColor}
                        searchQuery={searchQuery}
                        categories={categories}
                    />
                </div>
             </div>
          </div>
        );
      case 'settings':
        return (
          <div className="h-full p-3 lg:p-6 overflow-y-auto animate-in fade-in duration-300">
             <div className="max-w-3xl mx-auto space-y-6">
                 <div className="mb-6">
                    <h2 className={`text-3xl font-bold ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>{t.settings.title}</h2>
                    <p className={`${theme === 'neon' ? 'text-slate-400' : 'text-slate-500'}`}>{t.settings.subtitle}</p>
                </div>

                {/* Profile Card */}
                <div className={`p-6 rounded-2xl border ${theme === 'neon' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-full bg-slate-100 text-slate-600`}>
                            <UserIcon size={24} />
                        </div>
                        <div>
                            <h3 className={`font-bold text-lg ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>{t.settings.profile}</h3>
                            <p className="text-sm text-slate-500">{t.settings.profileDesc}</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className={`text-sm font-medium ${theme === 'neon' ? 'text-slate-400' : 'text-slate-700'}`}>{t.settings.yourName}</label>
                        <input 
                             type="text"
                             value={userName}
                             onChange={(e) => handleUpdateUserName(e.target.value)}
                             className={`w-full p-3 rounded-xl border transition-all ${
                                 theme === 'neon' 
                                 ? 'bg-slate-800 border-slate-700 text-white focus:ring-cyan-500 focus:border-cyan-500' 
                                 : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500'
                             }`}
                        />
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
                                title="Language"
                            >
                                <option value="ro" className="text-slate-900">Română</option>
                                <option value="en" className="text-slate-900">English</option>
                                <option value="es" className="text-slate-900">Español</option>
                                <option value="fr" className="text-slate-900">Français</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                <Globe size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appearance Card */}
                <div className={`p-6 rounded-2xl border ${theme === 'neon' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-full bg-slate-100 text-slate-600`}>
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h3 className={`font-bold text-lg ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>{t.settings.appearance}</h3>
                            <p className="text-sm text-slate-500">{t.settings.appearanceDesc}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-6">
                        <span className={`font-medium ${theme === 'neon' ? 'text-slate-300' : 'text-slate-700'}`}>{t.settings.theme}</span>
                        <ThemeSwitcher currentTheme={theme} onThemeChange={handleThemeChange} />
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <span className={`font-medium ${theme === 'neon' ? 'text-slate-300' : 'text-slate-700'}`}>
                            {t.settings.accentColor}
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
                             <input 
                                 type="text"
                                 placeholder={t.settings.categoryPlaceholder}
                                 value={newCategoryName}
                                 onChange={(e) => setNewCategoryName(e.target.value)}
                                 className={`flex-1 p-2.5 rounded-lg border text-sm transition-all ${
                                     theme === 'neon' 
                                     ? 'bg-slate-800 border-slate-700 text-white focus:ring-cyan-500 focus:border-cyan-500' 
                                     : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500'
                                 }`}
                             />
                             <div 
                                className="relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 shadow-sm flex-shrink-0"
                                style={{ borderColor: theme === 'neon' ? '#334155' : '#e2e8f0' }}
                             >
                                 <input
                                     type="color"
                                     value={newCategoryColor}
                                     onChange={(e) => setNewCategoryColor(e.target.value)}
                                     className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 cursor-pointer border-none"
                                 />
                             </div>
                             <button
                                type="button"
                                onClick={handleAddCategory}
                                disabled={!newCategoryName.trim()}
                                className="px-4 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all hover:opacity-90 disabled:opacity-50 flex-shrink-0"
                                style={{ backgroundColor: accentColor }}
                             >
                                {t.settings.addBtn}
                             </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                             {categories.map(cat => (
                                 <div 
                                    key={cat.id}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm"
                                    style={{ backgroundColor: `${cat.color}15`, borderColor: cat.color }}
                                 >
                                     <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                     <span className="text-sm font-medium" style={{ color: theme === 'neon' ? 'white' : 'inherit' }}>{cat.name}</span>
                                     <button 
                                        onClick={() => handleDeleteCategory(cat.id)}
                                        className="ml-1 text-slate-400 hover:text-red-500 transition-colors"
                                        disabled={categories.length <= 1}
                                        title={categories.length <= 1 ? t.settings.cannotDeleteLast : t.settings.deleteCategory}
                                     >
                                         <X size={14} />
                                     </button>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>

                {/* Data Card */}
                <div className={`p-6 rounded-2xl border ${theme === 'neon' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-full bg-slate-100 text-slate-600`}>
                            <Download size={24} />
                        </div>
                        <div>
                            <h3 className={`font-bold text-lg ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>{t.settings.dataTitle}</h3>
                            <p className="text-sm text-slate-500">{t.settings.dataDesc}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                         <div className={`p-4 rounded-xl text-center border ${theme === 'neon' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                             <p className={`text-2xl font-bold ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>{events.length}</p>
                             <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t.settings.events}</p>
                         </div>
                         <div className={`p-4 rounded-xl text-center border ${theme === 'neon' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                             <p className={`text-2xl font-bold ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>{todos.length}</p>
                             <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t.settings.tasks}</p>
                         </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <button 
                                onClick={handleExport}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                                    theme === 'neon' 
                                    ? 'bg-slate-800 hover:bg-slate-700 text-cyan-400' 
                                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                                }`}
                            >
                                <Download size={18} /> {t.settings.backupBtn}
                            </button>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                style={{ backgroundColor: accentColor }}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-white shadow-lg hover:opacity-90`}
                            >
                                <Upload size={18} /> {t.settings.restoreBtn}
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                accept=".json,application/json,text/plain,*/*" 
                                className="hidden" 
                                onChange={handleFileChange}
                            />
                        </div>
                        {importError && (
                            <div className="text-xs text-red-500 flex items-center gap-1 justify-center">
                                <AlertCircle size={12} /> {importError}
                            </div>
                        )}
                        
                        <button 
                            onClick={handleShare}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white transition-all shadow-md mt-4 ${
                                copied 
                                ? 'bg-green-500 hover:bg-green-600' 
                                : theme === 'neon' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-800 hover:bg-slate-900'
                            }`}
                        >
                            {copied ? <Check size={20} /> : <Share2 size={20} />}
                            {copied ? t.settings.copied : t.settings.shareBtn}
                        </button>
                    </div>

                    {/* Notifications Test */}
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <h4 className={`font-medium mb-3 ${theme === 'neon' ? 'text-slate-300' : 'text-slate-700'}`}>Notifications</h4>
                        <button
                          onClick={testNotification}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                              theme === 'neon'
                              ? 'bg-slate-800 hover:bg-slate-700 text-cyan-400'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
                          }`}
                        >
                          Test Push Notification
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={20} /> {t.settings.logout}
                        </button>
                    </div>
                </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  // --- SIDEBAR STYLES ---
  const sidebarClass = theme === 'neon' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${getThemeBackground()}`}>
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
         <div 
           className="fixed inset-0 bg-black/50 z-40 lg:hidden"
           onClick={() => setIsSidebarOpen(false)}
         />
      )}

      {/* SIDEBAR NAVIGATION */}
      <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          theme={theme}
          accentColor={accentColor}
          lang={lang}
      />

      {/* RIGHT PANEL: HEADER + CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          
          {/* HEADER BAR (FIXED) */}
          <Header 
              setIsSidebarOpen={setIsSidebarOpen}
              theme={theme}
              accentColor={accentColor}
              handleAccentChange={handleAccentChange}
              handleThemeChange={handleThemeChange}
              userName={userName}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isEditingName={isEditingName}
              setIsEditingName={setIsEditingName}
              tempName={tempName}
              setTempName={setTempName}
              saveNameEdit={saveNameEdit}
              lang={lang}
          />

          {/* MAIN SCROLLABLE CONTENT */}
          <main className="flex-1 overflow-y-auto">
             {renderContent()}
          </main>

      </div>

      {/* GLOBAL FLOATING CHAT WIDGET */}
      <ChatAssistant 
        userName={userName || 'Prieten'}
        events={events}
        todos={todos}
        categories={categories}
        onAddEvent={handleSaveEvent}
        onAddTodo={handleAddTodo}
        onDeleteEvent={handleDeleteEventByTitle}
        onToggleTodo={handleToggleTodoByText}
        theme={theme}
        accentColor={accentColor}
        onAccentChange={handleAccentChange}
        incomingMessage={aiMessage}
        lastCompletedTask={lastCompletedTask}
        onUpdateUserName={handleUpdateUserName}
      />

      {/* Global Modals (Calendar Interactions) */}
      <EventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        initialDate={selectedDate}
        accentColor={accentColor}
        categories={categories}
      />

      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateEvent}
        event={editingEvent}
        accentColor={accentColor}
        categories={categories}
      />
    </div>
  );
};

export default App;
