
import React, { useState, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { TodoList } from './components/TodoList';
import { EventModal } from './components/EventModal';
import { EditEventModal } from './components/EditEventModal';
import { ChatAssistant } from './components/ChatAssistant';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { SettingsModal } from './components/SettingsModal';
import { User, CalendarEvent, Todo, Theme } from './types';
import * as storage from './utils/storage';
import { LogOut, Layout, Settings, ArrowRight, Sparkles, Pencil } from 'lucide-react';

const App: React.FC = () => {
  // Simple User State
  const [userName, setUserName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  
  // Name Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [theme, setTheme] = useState<Theme>('modern');
  const [accentColor, setAccentColor] = useState<string>('blue');
  const [initializing, setInitializing] = useState(true);

  // AI State
  const [aiMessage, setAiMessage] = useState<{text: string, id: string} | null>(null);
  
  // Gamification State
  const [lastCompletedTask, setLastCompletedTask] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Edit Event State
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  // Event Handlers
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

  // Todo Handlers
  const handleAddTodo = (text: string, isPinned: boolean = false, color?: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      isPinned,
      color
    };
    
    // Sort logic: Pinned items first, then by relative insertion order
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
        if (newStatus) {
            completedTaskName = t.text;
        }
        return { ...t, completed: newStatus };
      }
      return t;
    });
    
    setTodos(updatedTodos);
    storage.saveTodos(updatedTodos);

    if (completedTaskName) {
        // @ts-ignore
        if (window.confetti) {
             // @ts-ignore
             window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        setLastCompletedTask(`${completedTaskName}::${Date.now()}`);
    }
  };

  const handleTogglePin = (id: string) => {
    const updated = todos.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t);
    // Re-sort: Pinned first
    updated.sort((a, b) => {
        if (a.isPinned === b.isPinned) return 0; // Preserve relative order
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

  const getAccentBtnClass = () => {
    switch(accentColor) {
      case 'purple': return 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30';
      case 'pink': return 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/30';
      case 'orange': return 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30';
      case 'green': return 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30';
      case 'teal': return 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/30';
      default: return 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30';
    }
  };

  const getAccentTextClass = () => {
    switch(accentColor) {
      case 'purple': return 'text-purple-600';
      case 'pink': return 'text-pink-500';
      case 'orange': return 'text-orange-500';
      case 'green': return 'text-emerald-500';
      case 'teal': return 'text-teal-500';
      default: return 'text-indigo-600';
    }
  };

  const getAccentBgLight = () => {
    switch(accentColor) {
        case 'purple': return 'bg-purple-50';
        case 'pink': return 'bg-pink-50';
        case 'orange': return 'bg-orange-50';
        case 'green': return 'bg-emerald-50';
        case 'teal': return 'bg-teal-50';
        default: return 'bg-indigo-50';
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // --- WELCOME SCREEN (Auth Replacement) ---
  if (!userName) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
             <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md text-center border border-white/20 animate-in zoom-in-95 duration-300">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-sm ${getAccentBgLight()} ${getAccentTextClass()}`}>
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
                        className={`w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg ${getAccentBtnClass()}`}
                    >
                        <span>Începe</span>
                        <ArrowRight size={20} />
                    </button>
                </form>
             </div>
        </div>
    );
  }

  // Theme Base Classes
  const getThemeBackground = () => {
    switch(theme) {
      case 'neon': return 'bg-slate-950';
      case 'pastel': return 'bg-stone-100';
      default: return 'bg-slate-50';
    }
  };

  const getHeaderStyles = () => {
    switch(theme) {
      case 'neon': return 'bg-slate-900 border-slate-800';
      case 'pastel': return 'bg-white border-orange-100';
      default: return 'bg-white border-slate-200';
    }
  };

  const getLogoStyles = () => {
    switch(theme) {
      case 'neon': return 'from-cyan-500 to-blue-600 shadow-cyan-500/20';
      case 'pastel': return 'from-orange-400 to-rose-400 shadow-orange-400/20';
      default: return 'from-primary to-secondary shadow-primary/30';
    }
  };

  const getTitleStyles = () => {
    switch(theme) {
      case 'neon': return 'from-cyan-400 to-blue-400';
      case 'pastel': return 'from-orange-500 to-rose-500';
      default: return 'from-primary to-secondary';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${getThemeBackground()}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 shadow-sm transition-colors duration-300 ${getHeaderStyles()}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className={`bg-gradient-to-br p-2 rounded-lg text-white shadow-lg ${getLogoStyles()}`}>
                <Layout size={24} />
              </div>
              <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${getTitleStyles()}`}>
                Smart Calendar
              </span>
            </div>
            
            <div className="flex items-center gap-4 md:gap-6">
              <ThemeSwitcher currentTheme={theme} onThemeChange={handleThemeChange} />
              
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'neon' 
                      ? 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800' 
                      : 'text-slate-500 hover:text-primary hover:bg-slate-100'
                    }`}
                    title="Settings"
                >
                    <Settings size={20} />
                </button>

                <div className="hidden md:flex flex-col items-end mr-3">
                    {isEditingName ? (
                        <input 
                            autoFocus
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onBlur={saveNameEdit}
                            onKeyDown={(e) => e.key === 'Enter' && saveNameEdit()}
                            className={`text-sm font-bold text-right bg-transparent border-b-2 outline-none py-0.5 px-1 w-32 ${
                                theme === 'neon' 
                                ? 'text-white border-cyan-500' 
                                : 'text-slate-800 border-indigo-500'
                            }`}
                        />
                    ) : (
                        <button
                            onClick={() => {
                                setTempName(userName || '');
                                setIsEditingName(true);
                            }}
                            className={`text-sm font-bold flex items-center gap-2 group transition-colors ${
                                theme === 'neon' ? 'text-white hover:text-cyan-400' : 'text-slate-800 hover:text-primary'
                            }`}
                            title="Click to edit name"
                        >
                            {userName}
                            <Pencil size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    )}
                </div>

                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'neon' 
                    ? 'text-slate-400 hover:text-red-400 hover:bg-red-900/20' 
                    : 'text-slate-500 hover:text-red-500 hover:bg-red-50'
                  }`}
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Calendar Section (2/3) */}
          <div className="w-full lg:w-2/3">
            <Calendar 
              events={events} 
              onDateSelect={handleOpenModal}
              onDeleteEvent={handleDeleteEvent}
              onEditEvent={openEditModal}
              theme={theme}
              accentColor={accentColor}
            />
          </div>

          {/* Todo List Section (1/3) */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 flex flex-col gap-6">
              <TodoList 
                todos={todos}
                onAddTodo={handleAddTodo}
                onToggleTodo={handleToggleTodo}
                onDeleteTodo={handleDeleteTodo}
                onTogglePin={handleTogglePin}
                onChangeColor={handleChangeTodoColor}
                theme={theme}
                accentColor={accentColor}
              />
              
              <div className={`mt-auto pt-6 border-t ${theme === 'neon' ? 'border-slate-800' : 'border-slate-200'}`}>
                 <a 
                   href="https://www.buymeacoffee.com/dianastreulea" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center justify-center gap-2 w-full bg-[#FFDD00] hover:bg-[#ffea00] text-black font-bold py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                 >
                   <span className="text-xl">💖</span>
                   <span className="text-sm font-bold">Susține proiectul!</span>
                 </a>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 mt-auto transition-colors duration-300 ${
        theme === 'neon' ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} Smart Calendar. Olli AI integrated.</p>
        </div>
      </footer>

      <EventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        initialDate={selectedDate}
      />

      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateEvent}
        event={editingEvent}
        theme={theme}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={{ name: userName || '', email: '' }}
        events={events}
        todos={todos}
        theme={theme}
        onImportData={handleImportData}
      />

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
    </div>
  );
};

export default App;
