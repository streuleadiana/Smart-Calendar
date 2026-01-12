import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from './components/Calendar';
import { TodoList } from './components/TodoList';
import { EventModal } from './components/EventModal';
import { EditEventModal } from './components/EditEventModal';
import { ChatAssistant } from './components/ChatAssistant';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { CalendarEvent, Todo, Theme } from './types';
import * as storage from './utils/storage';
import { 
  LogOut, Layout, Settings, ArrowRight, Sparkles, 
  Calendar as CalendarIcon, CheckSquare, MessageCircle, 
  Download, Upload, Share2, Check, User as UserIcon, AlertCircle,
  Menu, Home, Search, Pencil
} from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'todo' | 'settings'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // User & Identity
  const [userName, setUserName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  
  // Name Editing in Header
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Data
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [theme, setTheme] = useState<Theme>('modern');
  const [accentColor, setAccentColor] = useState<string>('#4F46E5'); // Default Indigo Hex
  const [initializing, setInitializing] = useState(true);

  // AI & Gamification State
  const [aiMessage, setAiMessage] = useState<{text: string, id: string} | null>(null);
  const [lastCompletedTask, setLastCompletedTask] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Edit Event State
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Settings State (for Import/Export feedback)
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerAiMessage = (text: string) => {
    setAiMessage({ text, id: crypto.randomUUID() });
  };

  useEffect(() => {
    // 1. Check for logged in user name
    const storedName = localStorage.getItem('app_username');
    if (storedName) {
        setUserName(storedName);
    }

    // 2. Load other data from local storage
    const storedEvents = storage.getEvents();
    const storedTodos = storage.getTodos();
    const storedTheme = storage.getTheme();
    const storedAccent = localStorage.getItem('app_accent_color');
    
    if (storedEvents) setEvents(storedEvents);
    if (storedTodos) setTodos(storedTodos);
    if (storedTheme) setTheme(storedTheme);
    if (storedAccent) setAccentColor(storedAccent);
    
    setInitializing(false);
  }, []);

  const handleStartApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const name = nameInput.trim();
    localStorage.setItem('app_username', name);
    setUserName(name);
  };

  const handleUpdateUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem('app_username', name);
  };
  
  const saveNameEdit = () => {
    if (tempName.trim()) {
        handleUpdateUserName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('app_username');
    setUserName(null);
    setNameInput('');
    sessionStorage.removeItem('olli_greeted');
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    storage.saveTheme(newTheme);
  };

  const handleAccentChange = (newColor: string) => {
    setAccentColor(newColor);
    localStorage.setItem('app_accent_color', newColor);
  };

  // --- SEARCH FILTERING ---
  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (e.type && e.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

    // Fixed typo: chatset -> charset
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `smart-calendar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
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
      } catch (err) {
        setImportError("Fișier invalid! Te rog încarcă un backup .json valid.");
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

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    if (eventData.time) {
      const conflict = events.find(e => 
        e.date === eventData.date && 
        e.time === eventData.time
      );
      if (conflict) {
        triggerAiMessage(`⚠️ Atenție! Te-ai suprapus cu evenimentul '${conflict.title}' la ora ${eventData.time}. Sper că te poți clona! 👯‍♂️`);
      }
    }

    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      ...eventData
    };
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    storage.saveEvents(updatedEvents);
  };

  const handleUpdateEvent = (id: string, title: string, time?: string, endTime?: string) => {
    const updatedEvents = events.map(e => {
        if (e.id === id) {
            return { ...e, title, time, endTime };
        }
        return e;
    });
    setEvents(updatedEvents);
    storage.saveEvents(updatedEvents);
    setIsEditModalOpen(false);
    triggerAiMessage(`Eveniment actualizat: ${title} ✏️`);
  };

  const openEditModal = (event: CalendarEvent) => {
      setEditingEvent(event);
      setIsEditModalOpen(true);
  };

  const handleDeleteEvent = (id: string) => {
    const updatedEvents = events.filter(e => e.id !== id);
    setEvents(updatedEvents);
    storage.saveEvents(updatedEvents);
  };

  const handleDeleteEventByTitle = (titleFragment: string): boolean => {
    const target = titleFragment.toLowerCase();
    const event = events.find(e => e.title.toLowerCase().includes(target));
    if (event) {
      handleDeleteEvent(event.id);
      return true;
    }
    return false;
  };

  // --- TODO HANDLERS ---
  const handleAddTodo = (text: string, isPinned: boolean = false, color?: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      isPinned,
      color
    };
    const newList = [newTodo, ...todos].sort((a, b) => {
        if (a.isPinned === b.isPinned) return 0;
        return a.isPinned ? -1 : 1;
    });
    setTodos(newList);
    storage.saveTodos(newList);
  };

  const handleToggleTodo = (id: string) => {
    let completedTaskName: string | null = null;
    const updatedTodos = todos.map(t => {
      if (t.id === id) {
        const newStatus = !t.completed;
        if (newStatus) completedTaskName = t.text;
        return { ...t, completed: newStatus };
      }
      return t;
    });
    setTodos(updatedTodos);
    storage.saveTodos(updatedTodos);

    if (completedTaskName) {
        // @ts-ignore
        if (window.confetti) window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setLastCompletedTask(`${completedTaskName}::${Date.now()}`);
    }
  };

  const handleTogglePin = (id: string) => {
    const updated = todos.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t);
    updated.sort((a, b) => {
        if (a.isPinned === b.isPinned) return 0;
        return a.isPinned ? -1 : 1;
    });
    setTodos(updated);
    storage.saveTodos(updated);
  };

  const handleChangeTodoColor = (id: string, color: string) => {
    const updated = todos.map(t => t.id === id ? { ...t, color: color } : t);
    setTodos(updated);
    storage.saveTodos(updated);
  };

  const handleToggleTodoByText = (textFragment: string): boolean => {
    const target = textFragment.toLowerCase();
    const todo = todos.find(t => t.text.toLowerCase().includes(target));
    if (todo) {
      handleToggleTodo(todo.id);
      return true;
    }
    return false;
  };

  const handleDeleteTodo = (id: string) => {
    const updatedTodos = todos.filter(t => t.id !== id);
    setTodos(updatedTodos);
    storage.saveTodos(updatedTodos);
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
                    <div className="text-left">
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Cum te numești?</label>
                        <input 
                            type="text" 
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            placeholder="ex: Alex"
                            className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-lg"
                            autoFocus
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={!nameInput.trim()}
                        className={`w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg bg-indigo-600 hover:bg-indigo-700`}
                    >
                        <span>Începe</span>
                        <ArrowRight size={20} />
                    </button>
                </form>
             </div>
        </div>
    );
  }

  // --- VIEW RENDERING ---
  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return (
          <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 animate-in fade-in duration-300 overflow-hidden min-h-full">
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
                />
             </div>
             {/* Right: Todos (Fixed Width on Desktop) */}
             <div className="w-full lg:w-96 flex-shrink-0 flex flex-col min-h-[400px]">
                <TodoList 
                    todos={filteredTodos}
                    onAddTodo={handleAddTodo}
                    onToggleTodo={handleToggleTodo}
                    onDeleteTodo={handleDeleteTodo}
                    onTogglePin={handleTogglePin}
                    onChangeColor={handleChangeTodoColor}
                    theme={theme}
                    accentColor={accentColor}
                    searchQuery={searchQuery}
                />
             </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="h-full flex flex-col p-4 md:p-6 animate-in fade-in duration-300">
             <Calendar 
              events={filteredEvents} 
              onDateSelect={handleOpenModal}
              onDeleteEvent={handleDeleteEvent}
              onEditEvent={openEditModal}
              theme={theme}
              accentColor={accentColor}
              searchQuery={searchQuery}
            />
          </div>
        );
      case 'todo':
        return (
          <div className="h-full p-4 md:p-6 overflow-y-auto animate-in fade-in duration-300">
             <div className="max-w-4xl mx-auto h-full flex flex-col">
                <div className="mb-6">
                    <h2 className={`text-3xl font-bold ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>Task-uri</h2>
                    <p className={`${theme === 'neon' ? 'text-slate-400' : 'text-slate-500'}`}>Gestionează lista ta de priorități</p>
                </div>
                <div className="flex-1 min-h-0">
                    <TodoList 
                        todos={filteredTodos}
                        onAddTodo={handleAddTodo}
                        onToggleTodo={handleToggleTodo}
                        onDeleteTodo={handleDeleteTodo}
                        onTogglePin={handleTogglePin}
                        onChangeColor={handleChangeTodoColor}
                        theme={theme}
                        accentColor={accentColor}
                        searchQuery={searchQuery}
                    />
                </div>
             </div>
          </div>
        );
      case 'settings':
        return (
          <div className="h-full p-4 md:p-6 overflow-y-auto animate-in fade-in duration-300">
             <div className="max-w-3xl mx-auto space-y-6">
                <div className="mb-6">
                    <h2 className={`text-3xl font-bold ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>Setări</h2>
                    <p className={`${theme === 'neon' ? 'text-slate-400' : 'text-slate-500'}`}>Personalizează experiența ta</p>
                </div>

                {/* Profile Card */}
                <div className={`p-6 rounded-2xl border ${theme === 'neon' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-full bg-slate-100 text-slate-600`}>
                            <UserIcon size={24} />
                        </div>
                        <div>
                            <h3 className={`font-bold text-lg ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>Profil</h3>
                            <p className="text-sm text-slate-500">Gestionează numele tău</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className={`text-sm font-medium ${theme === 'neon' ? 'text-slate-400' : 'text-slate-700'}`}>Numele Tău</label>
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

                {/* Appearance Card */}
                <div className={`p-6 rounded-2xl border ${theme === 'neon' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-full bg-slate-100 text-slate-600`}>
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h3 className={`font-bold text-lg ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>Aspect</h3>
                            <p className="text-sm text-slate-500">Teme și moduri de afișare</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-6">
                        <span className={`font-medium ${theme === 'neon' ? 'text-slate-300' : 'text-slate-700'}`}>Temă Generală</span>
                        <ThemeSwitcher currentTheme={theme} onThemeChange={handleThemeChange} />
                    </div>

                    <p className={`text-sm ${theme === 'neon' ? 'text-slate-500' : 'text-slate-400'}`}>
                        * Culoarea de accent se poate schimba acum din bara de sus!
                    </p>
                </div>

                {/* Data Card */}
                <div className={`p-6 rounded-2xl border ${theme === 'neon' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-full bg-slate-100 text-slate-600`}>
                            <Download size={24} />
                        </div>
                        <div>
                            <h3 className={`font-bold text-lg ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>Date & Export</h3>
                            <p className="text-sm text-slate-500">Datele sunt salvate local</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                         <div className={`p-4 rounded-xl text-center border ${theme === 'neon' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                             <p className={`text-2xl font-bold ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>{events.length}</p>
                             <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Evenimente</p>
                         </div>
                         <div className={`p-4 rounded-xl text-center border ${theme === 'neon' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                             <p className={`text-2xl font-bold ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>{todos.length}</p>
                             <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Task-uri</p>
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
                                <Download size={18} /> Backup
                            </button>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                style={{ backgroundColor: accentColor }}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-white shadow-lg hover:opacity-90`}
                            >
                                <Upload size={18} /> Restore
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                accept=".json" 
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
                            {copied ? 'Copiat!' : 'Share Program Săptămânal'}
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={20} /> Deconectare
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
  const sidebarWidth = isSidebarOpen ? 'w-64' : 'w-20';
  
  const headerBg = theme === 'neon' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const searchBg = theme === 'neon' ? 'bg-slate-800 text-white placeholder:text-slate-500' : 'bg-slate-100 text-slate-800 placeholder:text-slate-400';

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${getThemeBackground()}`}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside className={`${sidebarWidth} flex-shrink-0 flex flex-col border-r z-20 transition-all duration-300 ${sidebarClass}`}>
        <div className="p-4 flex flex-col h-full">
            {/* Header / Toggle */}
            <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} mb-8`}>
              {isSidebarOpen && (
                <div className="flex items-center gap-2 animate-in fade-in duration-300">
                    <div 
                        className={`p-1.5 rounded-lg text-white shadow-lg`}
                        style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}
                    >
                        <Layout size={20} />
                    </div>
                    <span className={`text-lg font-bold ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>
                        SmartCal
                    </span>
                </div>
              )}
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-1.5 rounded-lg transition-colors ${theme === 'neon' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                 <Menu size={20} />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="space-y-2 flex-1">
                {[
                    { id: 'home', icon: Home, label: 'Acasă' },
                    { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
                    { id: 'todo', icon: CheckSquare, label: 'Task-uri' },
                    { id: 'settings', icon: Settings, label: 'Setări' }
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)} 
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-medium cursor-pointer ${!isSidebarOpen ? 'justify-center' : ''} ${
                            activeTab !== item.id 
                            ? (theme === 'neon' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')
                            : ''
                        }`}
                        style={activeTab === item.id ? {
                            color: accentColor,
                            backgroundColor: `${accentColor}15` // 15 = ~8% opacity hex
                        } : {}}
                        title={item.label}
                    >
                        <item.icon size={22} /> {isSidebarOpen && <span>{item.label}</span>}
                    </button>
                ))}
            </nav>

            {/* Footer Buttons */}
            <div className={`mt-auto pt-4 border-t ${theme === 'neon' ? 'border-slate-800' : 'border-slate-100'} space-y-3`}>
                <a 
                href="https://www.buymeacoffee.com/dianastreulea" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center gap-2 w-full bg-[#FFF6C3] hover:bg-[#FDE68A] border border-[#FDE68A] text-gray-900 font-bold rounded-xl transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${isSidebarOpen ? 'py-3 px-4 justify-center' : 'p-3 justify-center aspect-square'}`}
                title="Susține proiectul!"
                >
                <span className="text-xl">💖</span>
                {isSidebarOpen && <span className="text-xs font-bold whitespace-nowrap">Susține proiectul!</span>}
                </a>

                <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLScMZLG3xZVGMHgKMq_QXSzQG35tDYwrtoeXLgtHyKbqD4bR5Q/viewform?usp=header"
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center gap-2 w-full rounded-xl font-semibold border transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
                    theme === 'neon' 
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                } ${isSidebarOpen ? 'py-3 px-4 justify-center' : 'p-3 justify-center aspect-square'}`}
                title="Feedback"
                >
                <span className="text-lg">💬</span>
                {isSidebarOpen && <span className="text-xs">Feedback</span>}
                </a>
            </div>
        </div>
      </aside>

      {/* RIGHT PANEL: HEADER + CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          
          {/* HEADER BAR (FIXED) */}
          <header className={`h-16 flex items-center justify-between px-6 border-b shrink-0 z-10 ${headerBg}`}>
            {/* Left: Greeting + Name Edit */}
            <div className="flex items-center gap-3">
                 <span className={`text-lg ${theme === 'neon' ? 'text-slate-300' : 'text-slate-500'}`}>Salut,</span>
                 {isEditingName ? (
                    <input 
                        autoFocus
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={saveNameEdit}
                        onKeyDown={(e) => e.key === 'Enter' && saveNameEdit()}
                        className={`text-lg font-bold bg-transparent border-b-2 outline-none py-0.5 px-1 w-32 ${
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
                        className={`text-lg font-bold flex items-center gap-2 group transition-colors ${
                            theme === 'neon' ? 'text-white' : 'text-slate-800'
                        }`}
                        style={{ color: isEditingName ? undefined : undefined }} // Reset
                        title="Click to edit name"
                    >
                        <span className="group-hover:opacity-80 transition-opacity">{userName}</span>
                        <Pencil size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                )}
            </div>

            {/* Middle: Search Bar */}
            <div className="flex-1 max-w-md mx-4 hidden md:block">
                <div className={`relative flex items-center rounded-xl overflow-hidden px-4 py-2 ${searchBg}`}>
                    <Search size={18} className="opacity-50 mr-2" />
                    <input 
                        type="text"
                        placeholder="Caută evenimente, task-uri..."
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
                    title="Change Accent Color"
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
      />

      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateEvent}
        event={editingEvent}
        theme={theme}
        accentColor={accentColor}
      />
    </div>
  );
};

export default App;