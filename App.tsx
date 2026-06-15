
import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from './components/Calendar';
import { TodoList } from './components/TodoList';
import { EventModal } from './components/EventModal';
import { EditEventModal } from './components/EditEventModal';
import { ChatAssistant } from './components/ChatAssistant';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { CalendarEvent, Todo, Theme, Category } from './types';
import * as storage from './utils/storage';
import { 
  LogOut, Layout, Settings, ArrowRight, Sparkles, 
  Calendar as CalendarIcon, CheckSquare, MessageCircle, 
  Download, Upload, Share2, Check, User as UserIcon, AlertCircle,
  Menu, Home, Search, Pencil, X, Globe
} from 'lucide-react';

type LanguageOption = 'ro' | 'en' | 'es' | 'fr';

const translations = {
  ro: {
    tabs: {
      home: 'Acasă',
      calendar: 'Calendar',
      tasks: 'Task-uri',
      settings: 'Setări'
    },
    settings: {
        title: 'Setări',
        subtitle: 'Personalizează experiența ta',
        profile: 'Profil',
        profileDesc: 'Gestionează numele tău',
        yourName: 'Numele Tău',
        languageTitle: 'Limbă / Language',
        languageDesc: 'Schimbă limba interfeței',
        appearance: 'Aspect',
        appearanceDesc: 'Teme și moduri de afișare',
        theme: 'Temă Generală',
        accentColor: 'Culoare Accent',
        categoriesTitle: 'Manager Categorii',
        categoriesDesc: 'Adaugă sau șterge categorii',
        categoryPlaceholder: 'Nume categorie nouă...',
        addBtn: 'Adaugă',
        dataTitle: 'Date & Export',
        dataDesc: 'Datele sunt salvate local',
        events: 'Evenimente',
        tasks: 'Task-uri',
        backupBtn: 'Backup',
        restoreBtn: 'Restore',
        shareBtn: 'Share Program Săptămânal',
        copied: 'Copiat!',
        logout: 'Deconectare',
        cannotDeleteLast: 'Nu poți șterge ultima categorie',
        deleteCategory: 'Șterge categorie'
    },
    header: {
        greeting: 'Salut,',
        shareTooltip: 'Alege o culoare',
        searchPlaceholder: 'Caută...'
    }
  },
  en: {
    tabs: {
      home: 'Home',
      calendar: 'Calendar',
      tasks: 'Tasks',
      settings: 'Settings'
    },
    settings: {
        title: 'Settings',
        subtitle: 'Customize your experience',
        profile: 'Profile',
        profileDesc: 'Manage your name',
        yourName: 'Your Name',
        languageTitle: 'Language',
        languageDesc: 'Change interface language',
        appearance: 'Appearance',
        appearanceDesc: 'Themes and display modes',
        theme: 'General Theme',
        accentColor: 'Accent Color',
        categoriesTitle: 'Categories Manager',
        categoriesDesc: 'Add or remove categories',
        categoryPlaceholder: 'New category name...',
        addBtn: 'Add',
        dataTitle: 'Data & Export',
        dataDesc: 'Data is saved locally',
        events: 'Events',
        tasks: 'Tasks',
        backupBtn: 'Backup',
        restoreBtn: 'Restore',
        shareBtn: 'Share Weekly Schedule',
        copied: 'Copied!',
        logout: 'Logout',
        cannotDeleteLast: 'Cannot delete last category',
        deleteCategory: 'Delete category'
    },
    header: {
        greeting: 'Hello,',
        shareTooltip: 'Choose a color',
        searchPlaceholder: 'Search...'
    }
  },
  es: {
    tabs: {
      home: 'Inicio',
      calendar: 'Calendario',
      tasks: 'Tareas',
      settings: 'Ajustes'
    },
    settings: {
        title: 'Ajustes',
        subtitle: 'Personaliza tu experiencia',
        profile: 'Perfil',
        profileDesc: 'Gestiona tu nombre',
        yourName: 'Tu Nombre',
        languageTitle: 'Idioma / Language',
        languageDesc: 'Cambiar idioma de la interfaz',
        appearance: 'Apariencia',
        appearanceDesc: 'Temas y modos de visualización',
        theme: 'Tema General',
        accentColor: 'Color de Acento',
        categoriesTitle: 'Gestor de Categorías',
        categoriesDesc: 'Añadir o eliminar categorías',
        categoryPlaceholder: 'Nombre de nueva categoría...',
        addBtn: 'Añadir',
        dataTitle: 'Datos y Exportación',
        dataDesc: 'Los datos se guardan localmente',
        events: 'Eventos',
        tasks: 'Tareas',
        backupBtn: 'Copia de seguridad',
        restoreBtn: 'Restaurar',
        shareBtn: 'Compartir Horario Semanal',
        copied: '¡Copiado!',
        logout: 'Cerrar Sesión',
        cannotDeleteLast: 'No se puede eliminar la última categoría',
        deleteCategory: 'Eliminar categoría'
    },
    header: {
        greeting: 'Hola,',
        shareTooltip: 'Elige un color',
        searchPlaceholder: 'Buscar...'
    }
  },
  fr: {
    tabs: {
      home: 'Accueil',
      calendar: 'Calendrier',
      tasks: 'Tâches',
      settings: 'Paramètres'
    },
    settings: {
        title: 'Paramètres',
        subtitle: 'Personnalisez votre expérience',
        profile: 'Profil',
        profileDesc: 'Gérez votre nom',
        yourName: 'Votre Nom',
        languageTitle: 'Langue / Language',
        languageDesc: 'Changer la langue de l\'interface',
        appearance: 'Apparence',
        appearanceDesc: 'Thèmes et modes d\'affichage',
        theme: 'Thème Général',
        accentColor: 'Couleur d\'Accent',
        categoriesTitle: 'Gestionnaire de Catégories',
        categoriesDesc: 'Ajouter ou supprimer des catégories',
        categoryPlaceholder: 'Nom de la nouvelle catégorie...',
        addBtn: 'Ajouter',
        dataTitle: 'Données et Export',
        dataDesc: 'Les données sont sauvegardées localement',
        events: 'Événements',
        tasks: 'Tâches',
        backupBtn: 'Sauvegarde',
        restoreBtn: 'Restaurer',
        shareBtn: 'Partager le programme hebdomadaire',
        copied: 'Copié !',
        logout: 'Déconnexion',
        cannotDeleteLast: 'Impossible de supprimer la dernière catégorie',
        deleteCategory: 'Supprimer la catégorie'
    },
    header: {
        greeting: 'Bonjour,',
        shareTooltip: 'Choisissez une couleur',
        searchPlaceholder: 'Rechercher...'
    }
  }
};

const App: React.FC = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'todo' | 'settings'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // User & Identity
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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#10B981');
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
    
    const storedLang = localStorage.getItem('app_lang') as LanguageOption | null;
    if (storedLang && translations[storedLang]) {
        setLang(storedLang);
    }

    // 2. Load other data from local storage
    const storedEvents = storage.getEvents();
    const storedTodos = storage.getTodos();
    const storedTheme = storage.getTheme();
    const storedAccent = localStorage.getItem('app_accent_color');
    const storedCategories = storage.getCategories();
    
    if (storedEvents) setEvents(storedEvents);
    if (storedTodos) setTodos(storedTodos);
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
    
    setInitializing(false);
  }, []);

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

  const handleUpdateEvent = (id: string, eventData: Partial<CalendarEvent>) => {
    const updatedEvents = events.map(e => {
        if (e.id === id) {
            return { ...e, ...eventData };
        }
        return e;
    });
    setEvents(updatedEvents);
    storage.saveEvents(updatedEvents);
    setIsEditModalOpen(false);
    if (eventData.title) {
        triggerAiMessage(`Eveniment actualizat: ${eventData.title} ✏️`);
    }
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
  const handleAddTodo = (text: string, isPinned: boolean = false, categoryId?: string, color?: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      isPinned,
      categoryId,
      color
    };
    const newList = [newTodo, ...todos].sort((a, b) => {
        if (a.isPinned === b.isPinned) return 0;
        return a.isPinned ? -1 : 1;
    });
    setTodos(newList);
    storage.saveTodos(newList);
  };

  const handleEditTodo = (id: string, text: string, categoryId?: string, color?: string) => {
    const updated = todos.map(t => t.id === id ? { ...t, text, categoryId, color } : t);
    setTodos(updated);
    storage.saveTodos(updated);
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
  // On mobile always w-64, on desktop w-64 or w-20
  const sidebarWidth = isSidebarOpen ? 'w-64' : 'w-64 lg:w-20';
  
  const headerBg = theme === 'neon' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const searchBg = theme === 'neon' ? 'bg-slate-800 text-white placeholder:text-slate-500' : 'bg-slate-100 text-slate-800 placeholder:text-slate-400';

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
      <aside className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 ${sidebarWidth} flex-shrink-0 flex flex-col border-r transition-all duration-300 ${sidebarClass}`}>
        <div className="p-4 flex flex-col h-full overflow-y-auto">
            {/* Header / Toggle */}
            <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-between lg:justify-center'} mb-8`}>
              <div className={`flex items-center gap-2 animate-in fade-in duration-300 ${!isSidebarOpen ? 'lg:hidden' : ''}`}>
                  <div 
                      className={`p-1.5 rounded-lg text-white shadow-lg`}
                      style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}
                  >
                      <Layout size={20} />
                  </div>
                  <span className={`text-lg font-bold ${theme === 'neon' ? 'text-white' : 'text-slate-800'}`}>
                      Smart Calendar
                  </span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-1.5 rounded-lg transition-colors hidden lg:block ${theme === 'neon' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                 <Menu size={20} />
              </button>
              {/* Close button for mobile inside sidebar */}
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className={`p-1.5 rounded-lg transition-colors lg:hidden ${theme === 'neon' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                 <Menu size={20} />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="space-y-2 flex-1">
                {[
                    { id: 'home', icon: Home, label: t.tabs.home },
                    { id: 'calendar', icon: CalendarIcon, label: t.tabs.calendar },
                    { id: 'todo', icon: CheckSquare, label: t.tabs.tasks },
                    { id: 'settings', icon: Settings, label: t.tabs.settings }
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
                        <item.icon size={22} /> <span className={!isSidebarOpen ? 'lg:hidden' : ''}>{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Footer Buttons */}
            <div className={`mt-auto pt-4 border-t ${theme === 'neon' ? 'border-slate-800' : 'border-slate-100'} space-y-3`}>
                <a 
                href="https://www.buymeacoffee.com/dianastreulea" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center gap-2 w-full bg-[#FFF6C3] hover:bg-[#FDE68A] border border-[#FDE68A] text-gray-900 font-bold rounded-xl transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${isSidebarOpen ? 'py-3 px-4 justify-center' : 'p-3 py-3 px-4 lg:p-3 lg:aspect-square justify-center'}`}
                title="Susține proiectul!"
                >
                <span className="text-xl">💖</span>
                <span className={`text-xs font-bold whitespace-nowrap ${!isSidebarOpen ? 'lg:hidden' : ''}`}>Susține proiectul!</span>
                </a>

                <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLScMZLG3xZVGMHgKMq_QXSzQG35tDYwrtoeXLgtHyKbqD4bR5Q/viewform?usp=header"
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center gap-2 w-full rounded-xl font-semibold border transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
                    theme === 'neon' 
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                } ${isSidebarOpen ? 'py-3 px-4 justify-center' : 'p-3 py-3 px-4 lg:p-3 lg:aspect-square justify-center'}`}
                title="Feedback"
                >
                <span className="text-lg">💬</span>
                <span className={`text-xs ${!isSidebarOpen ? 'lg:hidden' : ''}`}>Feedback</span>
                </a>
            </div>
        </div>
      </aside>

      {/* RIGHT PANEL: HEADER + CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          
          {/* HEADER BAR (FIXED) */}
          <header className={`h-16 flex items-center justify-between px-4 lg:px-6 border-b shrink-0 z-10 ${headerBg}`}>
            {/* Left: Hamburger + Greeting + Name Edit */}
            <div className="flex items-center gap-2 sm:gap-3">
                 <button 
                   onClick={() => setIsSidebarOpen(true)}
                   className={`lg:hidden p-1.5 rounded-lg transition-colors ${theme === 'neon' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
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
