
import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from './components/Calendar';
import { TodoList } from './components/TodoList';
import { EventModal } from './components/EventModal';
import { EditEventModal } from './components/EditEventModal';
import { TaskModal } from './components/TaskModal';
import { FeedbackModal } from './components/FeedbackModal';
import { ChatAssistant } from './components/ChatAssistant';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { SettingsView } from './components/SettingsView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { NotesView } from './components/NotesView';
import { MoodView } from './components/MoodView';
import { VisionView } from './components/VisionView';
import { UniversalAddButton } from './components/UniversalAddButton';
import { BottomNav } from './components/BottomNav';
import { UpdateNotifier } from './components/UpdateNotifier';
import { CalendarEvent, Todo, Theme, Category, FontOption, Note, MoodLog, VisionBoardItem, WishlistItem } from './types';
import * as storage from './utils/storage';
import { LanguageOption, translations } from './utils/translations';
import { requestNotificationPermission, auth, googleProvider, db, storage as firebaseStorage } from './lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useSwipeable } from 'react-swipeable';
import { useNotifications } from './hooks/useNotifications';
import { useEvents } from './hooks/useEvents';
import { useTodos } from './hooks/useTodos';
import { useNotes } from './hooks/useNotes';
import { LoadingSpinner } from './components/LoadingSpinner';
import { 
  LogOut, Layout, Settings, ArrowRight, Sparkles, 
  Calendar as CalendarIcon, CheckSquare, MessageCircle, 
  Download, Upload, Share2, Check, User as UserIcon, AlertCircle,
  Menu, Home, Search, Pencil, X, Globe
} from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  const [currentView, setCurrentView] = useState<'home' | 'calendar' | 'tasks' | 'settings' | 'notes' | 'moods' | 'vision'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data State
  const [userName, setUserName] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  
  const [noteCategoryColors, setNoteCategoryColors] = useState<Record<string, string>>({});
  const [noteCategories, setNoteCategories] = useState<string[]>(["📓 Jurnal", "🛒 Cumpărături", "💡 Idei", "✈️ Travel"]);
  
  // Mascot Identity
  const [assistantName, setAssistantName] = useState(() => localStorage.getItem('assistant_name') || "Olli");
  const [assistantAvatar, setAssistantAvatar] = useState(() => localStorage.getItem('assistant_avatar') || "🦉");


  const handleUpdateAssistantName = (name: string) => {
    setAssistantName(name);
    localStorage.setItem('assistant_name', name);
  };

  const handleUpdateAssistantAvatar = (avatar: string) => {
    setAssistantAvatar(avatar);
    localStorage.setItem('assistant_avatar', avatar);
  };
  
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
  const [font, setFont] = useState<FontOption>('system');
  
  // AI & Gamification State
  const [aiMessage, setAiMessage] = useState<{text: string, id: string} | null>(null);
  const [lastCompletedTask, setLastCompletedTask] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasChatNotification, setHasChatNotification] = useState(false);

  const triggerAiMessage = (message: string) => {
    setAiMessage({ text: message, id: crypto.randomUUID() });
  };

  const {
      events,
      handleSaveEvent,
      handleUpdateEvent,
      handleDeleteEvent,
      handleDeleteEventByTitle
  } = useEvents(triggerAiMessage);

  // Data
  const [todos, setTodos] = useState<Todo[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [visionItems, setVisionItems] = useState<VisionBoardItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const { testNotification } = useNotifications(events, todos);
  const [categories, setCategories] = useState<Category[]>([]);
  const [initializing, setInitializing] = useState(true);

  const {
      handleAddTodo,
      handleEditTodo,
      handleToggleTodo,
      handleTogglePin,
      handleChangeTodoColor,
      handleToggleTodoByText,
      handleDeleteTodo
  } = useTodos(todos, setTodos, setLastCompletedTask);

  const {
      handleSaveNote,
      handleUpdateNote,
      handleDeleteNote
  } = useNotes();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Edit Event State
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Todo | null>(null);

  // Feedback Modal State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Settings State (for Import/Export feedback)
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState<'day' | 'week' | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#10B981');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const savePreferences = async (updates: any) => {
    if (!auth.currentUser) return;
    try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), updates, { merge: true });
    } catch (error) {
        console.error("Failed to save preferences:", error);
    }
  };

  const handleUpdateCategoryColor = (folder: string, color: string) => {
    const updated = { ...noteCategoryColors, [folder]: color };
    setNoteCategoryColors(updated);
    savePreferences({ noteCategoryColors: updated });
  };

  const handleAddNoteCategory = (folder: string, color: string) => {
    const newCategories = [...noteCategories, folder];
    setNoteCategories(newCategories);
    const newColors = { ...noteCategoryColors, [folder]: color };
    setNoteCategoryColors(newColors);
    savePreferences({ customNoteCategories: newCategories, noteCategoryColors: newColors });
  };

  const handleEditNoteCategory = (oldFolder: string, newFolder: string, newColor: string) => {
    let updatedCategories = noteCategories;
    if (oldFolder !== newFolder) {
      updatedCategories = noteCategories.map(c => c === oldFolder ? newFolder : c);
      setNoteCategories(updatedCategories);
    }
    const newColors = { ...noteCategoryColors };
    if (oldFolder !== newFolder) {
      delete newColors[oldFolder];
    }
    newColors[newFolder] = newColor;
    setNoteCategoryColors(newColors);
    savePreferences({ customNoteCategories: updatedCategories, noteCategoryColors: newColors });
    
    if (oldFolder !== newFolder) {
      notes.forEach(note => {
        if (note.folder === oldFolder) {
            handleUpdateNote(note.id, note.title, note.content, newFolder, note.color);
        }
      });
    }
  };

  const handleSaveVisionItem = async (item: Omit<VisionBoardItem, 'id' | 'createdAt'>) => {
    if (!auth.currentUser) return;
    try {
        const itemRef = doc(collection(db, 'users', auth.currentUser.uid, 'visionBoard'));
        const payload: any = { ...item, id: itemRef.id, createdAt: Date.now() };
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
        await setDoc(itemRef, payload);
    } catch (error) {
        console.error("Failed to save vision item:", error);
    }
  };

  const handleDeleteVisionItem = async (id: string, imageUrl?: string) => {
    try {
        if (!auth.currentUser) return;
        if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
             const imageRef = ref(firebaseStorage, imageUrl);
             await deleteObject(imageRef);
        }
        const itemRef = doc(db, 'users', auth.currentUser.uid, 'visionBoard', id);
        await deleteDoc(itemRef);
    } catch (error) {
        console.error("Failed to delete vision item", error);
    }
  };

  const handleSaveWishlistItem = async (item: Omit<WishlistItem, 'id' | 'createdAt' | 'isPurchased'>) => {
    if (!auth.currentUser) return;
    try {
        const itemRef = doc(collection(db, 'users', auth.currentUser.uid, 'wishlist'));
        const payload: any = { ...item, id: itemRef.id, isPurchased: false, createdAt: Date.now() };
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
        await setDoc(itemRef, payload);
    } catch (error) {
        console.error("Failed to save wishlist item:", error);
    }
  };

  const handleUpdateWishlistItem = async (id: string, updates: Partial<WishlistItem>) => {
    if (!auth.currentUser) return;
    try {
        const itemRef = doc(db, 'users', auth.currentUser.uid, 'wishlist', id);
        const payload: any = { ...updates };
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
        await updateDoc(itemRef, payload);
    } catch (error) {
        console.error("Failed to update wishlist item:", error);
    }
  };

  const handleDeleteWishlistItem = async (id: string, imageUrl?: string) => {
    try {
        if (!auth.currentUser) return;
        if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
             const imageRef = ref(firebaseStorage, imageUrl);
             await deleteObject(imageRef);
        }
        const itemRef = doc(db, 'users', auth.currentUser.uid, 'wishlist', id);
        await deleteDoc(itemRef);
    } catch (error) {
        console.error("Failed to delete wishlist item:", error);
    }
  };

  const handleSaveMoodLog = async (log: Omit<MoodLog, 'id'>) => {
    if (!auth.currentUser) return;
    try {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const localDateString = log.date || `${year}-${month}-${day}`;

        const moodRef = doc(db, 'users', auth.currentUser.uid, 'moodLogs', localDateString);

        const moodMap: Record<string, { moodEmoji: string, moodLabel: string, color: string }> = {
          'great': { moodEmoji: '😄', moodLabel: 'Super', color: '#fef08a' },
          'good': { moodEmoji: '🙂', moodLabel: 'Bine', color: '#bbf7d0' },
          'neutral': { moodEmoji: '😐', moodLabel: 'Normal', color: '#bfdbfe' },
          'bad': { moodEmoji: '😔', moodLabel: 'Rău', color: '#c084fc' },
          'awful': { moodEmoji: '😢', moodLabel: 'Groaznic', color: '#fecaca' },

          'amazing': { moodEmoji: '🤩', moodLabel: 'Excelent', color: '#fef08a' },
          'happy': { moodEmoji: '😊', moodLabel: 'Bine', color: '#bbf7d0' },
          'meh': { moodEmoji: '😐', moodLabel: 'Meh', color: '#bfdbfe' },
          'sad': { moodEmoji: '😔', moodLabel: 'Trist', color: '#c084fc' },
          'terrible': { moodEmoji: '😫', moodLabel: 'Groaznic', color: '#fecaca' },
        };

        const incomingMood = (log as any).mood;
        let moodEmoji = log.moodEmoji;
        let moodLabel = log.moodLabel;
        let color = log.color;
        let journalNote = log.journalNote || (log as any).note || '';

        if (incomingMood && moodMap[incomingMood]) {
            const mapped = moodMap[incomingMood];
            moodEmoji = mapped.moodEmoji;
            moodLabel = mapped.moodLabel;
            color = mapped.color;
        }

        const moodData: any = {
            id: localDateString,
            date: localDateString,
            moodEmoji: moodEmoji || '✨',
            moodLabel: moodLabel || 'Normal',
            color: color || '#bfdbfe',
            journalNote: journalNote || ''
        };

        if (incomingMood) {
            moodData.mood = incomingMood;
        }

        await setDoc(moodRef, moodData, { merge: true });
    } catch (error) {
        console.error("Failed to save mood log:", error);
    }
  };

  const handleDeleteNoteCategory = async (folder: string) => {
    try {
        const newCategories = noteCategories.filter(c => c !== folder);
        setNoteCategories(newCategories);
        const newColors = { ...noteCategoryColors };
        delete newColors[folder];
        setNoteCategoryColors(newColors);
        
        if (auth.currentUser) {
           await updateDoc(doc(db, 'users', auth.currentUser.uid), {
               customNoteCategories: newCategories,
               noteCategoryColors: newColors
           });
        }
    } catch (error) {
        console.error("Error deleting note category:", error);
    }
    
    notes.forEach(note => {
      if (note.folder === folder) {
          handleUpdateNote(note.id, note.title, note.content, "Toate", note.color);
      }
    });
  };

  useEffect(() => {
    let unsubscribeTodos: () => void;
    let unsubscribeNotes: () => void;
    let unsubscribeMoods: () => void;
    let unsubscribeVision: () => void;
    let unsubscribeWishlist: () => void;
    let unsubscribeUser: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
            setUserName(user.displayName || 'Utilizator');
            
            // Subscriptions per user
            const userDocRef = doc(db, 'users', user.uid);
            unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.themeColor) {
                        setAccentColor(data.themeColor);
                        localStorage.setItem('app_accent_color', data.themeColor);
                    }
                    if (data.theme) {
                        setTheme(data.theme as Theme);
                        storage.saveTheme(data.theme as Theme);
                    }
                    if (data.lang) {
                        setLang(data.lang as LanguageOption);
                        localStorage.setItem('app_lang', data.lang);
                    }
                    if (data.mascot) {
                        setUserName(data.mascot);
                    }
                    if (data.profilePicture !== undefined) {
                        setProfilePicture(data.profilePicture);
                    }
                    if (data.font) {
                        setFont(data.font as FontOption);
                        storage.saveFont(data.font as FontOption);
                    }
                    if (data.noteCategoryColors) {
                        setNoteCategoryColors(data.noteCategoryColors);
                    }
                    if (data.customNoteCategories) {
                        setNoteCategories(data.customNoteCategories);
                    }
                } else {
                     // First-time login, set defaults
                     setDoc(userDocRef, {
                        themeColor: localStorage.getItem('app_accent_color') || '#4F46E5',
                        theme: storage.getTheme() || 'modern',
                        mascot: user.displayName || 'Utilizator',
                        lang: localStorage.getItem('app_lang') || 'ro',
                        profilePicture: null,
                        font: storage.getFont() || 'system',
                        noteCategoryColors: {},
                        customNoteCategories: ["📓 Jurnal", "🛒 Cumpărături", "💡 Idei", "✈️ Travel"]
                     }, { merge: true });
                }
            });

            const todosQuery = query(collection(db, 'todos'), where('userId', '==', user.uid));
            unsubscribeTodos = onSnapshot(todosQuery, (snapshot) => {
                const loadedTodos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Todo[];
                // Sort pinned first
                loadedTodos.sort((a, b) => {
                    if (a.isPinned === b.isPinned) return 0;
                    return a.isPinned ? -1 : 1;
                });
                setTodos(loadedTodos);
            }, (error) => {
                console.error("Todos sync failed", error);
            });

            const notesQuery = query(collection(db, 'notes'), where('userId', '==', user.uid));
            unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
                const loadedNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Note[];
                loadedNotes.sort((a, b) => b.createdAt - a.createdAt);
                setNotes(loadedNotes);
            }, (error) => {
                console.error("Notes sync failed", error);
            });

            const moodLogsRef = collection(db, 'users', user.uid, 'moodLogs');
            unsubscribeMoods = onSnapshot(moodLogsRef, (snapshot) => {
                const loadedMoods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MoodLog[];
                setMoodLogs(loadedMoods);
            }, (error) => {
                console.error("Moods sync failed", error);
            });

            const visionRef = collection(db, 'users', user.uid, 'visionBoard');
            unsubscribeVision = onSnapshot(visionRef, (snapshot) => {
                const loadedVision = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as VisionBoardItem[];
                loadedVision.sort((a, b) => b.createdAt - a.createdAt);
                setVisionItems(loadedVision);
            }, (error) => {
                console.error("Vision Board sync failed", error);
            });

            const wishlistRef = collection(db, 'users', user.uid, 'wishlist');
            unsubscribeWishlist = onSnapshot(wishlistRef, (snapshot) => {
                const loadedWishlist = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WishlistItem[];
                loadedWishlist.sort((a, b) => b.createdAt - a.createdAt);
                setWishlistItems(loadedWishlist);
            }, (error) => {
                console.error("Wishlist sync failed", error);
            });

            await loadUserData();
        } else {
            setUserName(null);
            setTodos([]);
            setNotes([]);
            setMoodLogs([]);
            setVisionItems([]);
            setWishlistItems([]);
            setInitializing(false);
            if (unsubscribeTodos) unsubscribeTodos();
            if (unsubscribeNotes) unsubscribeNotes();
            if (unsubscribeMoods) unsubscribeMoods();
            if (unsubscribeVision) unsubscribeVision();
            if (unsubscribeWishlist) unsubscribeWishlist();
            if (unsubscribeUser) unsubscribeUser();
        }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeTodos) unsubscribeTodos();
        if (unsubscribeNotes) unsubscribeNotes();
        if (unsubscribeMoods) unsubscribeMoods();
        if (unsubscribeVision) unsubscribeVision();
        if (unsubscribeWishlist) unsubscribeWishlist();
        if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const loadUserData = async () => {
        const storedLang = localStorage.getItem('app_lang') as LanguageOption | null;
        if (storedLang && translations[storedLang]) {
            setLang(storedLang);
        }

        try {
            const categoriesData = await storage.getCategories();
            if (categoriesData && categoriesData.length > 0) {
              setCategories(categoriesData);
            } else {
              const defaults = [
                { id: crypto.randomUUID(), name: 'Work', color: '#4F46E5' },
                { id: crypto.randomUUID(), name: 'Personal', color: '#10B981' },
                { id: crypto.randomUUID(), name: 'Study', color: '#F59E0B' },
                { id: crypto.randomUUID(), name: 'Urgent', color: '#EF4444' }
              ];
              setCategories(defaults);
              storage.saveCategories(defaults);
            }
        } catch (error) {
            console.warn("Offline or timeout reached loading categories.");
            const localCats = localStorage.getItem('smart_calendar_categories');
            if (localCats) setCategories(JSON.parse(localCats));
        }
        
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
            await savePreferences({ mascot: name });
        } catch (error) {
            console.error("Failed to update display name:", error);
        }
    }
  };

  const handleUpdateProfilePicture = async (base64Image: string | null) => {
    setProfilePicture(base64Image);
    if (auth.currentUser) {
        await savePreferences({ profilePicture: base64Image });
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
    savePreferences({ theme: newTheme });
  };

  const handleLangChange = (newLang: LanguageOption) => {
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
    savePreferences({ lang: newLang });
  };

  const handleAccentChange = (newColor: string) => {
    setAccentColor(newColor);
    localStorage.setItem('app_accent_color', newColor);
    savePreferences({ themeColor: newColor });
  };

  const handleFontChange = (newFont: FontOption) => {
    setFont(newFont);
    storage.saveFont(newFont);
    savePreferences({ font: newFont });
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

  const handleUpdateCategory = (id: string, name: string, color: string) => {
    const updated = categories.map(c => 
      c.id === id ? { ...c, name: name.trim(), color } : c
    );
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

  const handleShareDay = async () => {
    const now = new Date();
    
    const todayEvents = events
      .filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === now.getFullYear() && 
               d.getMonth() === now.getMonth() && 
               d.getDate() === now.getDate();
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let text = `📅 *Programul meu astăzi*:\n\n`;

    if (todayEvents.length === 0) {
      text += "Nu am evenimente programate.";
    } else {
      todayEvents.forEach((e, index) => {
        const dateObj = new Date(e.date);
        const dayShort = dateObj.toLocaleDateString('ro-RO', { weekday: 'short' });
        const dateFormatted = dateObj.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' });
        text += `▫️ ${dayShort.charAt(0).toUpperCase() + dayShort.slice(1)} ${dateFormatted}: ${e.title} ${e.time ? `(${e.time})` : ''}`;
        if (index < todayEvents.length - 1) text += '\n';
      });
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedState('day');
      setTimeout(() => setCopiedState(null), 2000);
    } catch (err) {
      console.error("Failed to copy day schedule", err);
    }
  };

  const handleShareWeek = async () => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const upcoming = events
      .filter(e => {
        const d = new Date(e.date);
        const startOfToday = new Date(now);
        startOfToday.setHours(0,0,0,0);
        return d >= startOfToday && d <= nextWeek;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let text = `📅 *Programul meu săptămâna asta*:\n\n`;

    if (upcoming.length === 0) {
      text += "Nu am evenimente programate.";
    } else {
      upcoming.forEach((e, index) => {
        const dateObj = new Date(e.date);
        const dayShort = dateObj.toLocaleDateString('ro-RO', { weekday: 'short' });
        const dateFormatted = dateObj.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' });
        text += `▫️ ${dayShort.charAt(0).toUpperCase() + dayShort.slice(1)} ${dateFormatted}: ${e.title} ${e.time ? `(${e.time})` : ''}`;
        if (index < upcoming.length - 1) text += '\n';
      });
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedState('week');
      setTimeout(() => setCopiedState(null), 2000);
    } catch (err) {
      console.error("Failed to copy week schedule", err);
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
      case 'soft': return 'bg-[#fff5f7]'; // Pale, elegant pink/cream
      default: return 'bg-slate-100';
    }
  };

  const sidebarSwipeHandlers = useSwipeable({
    onSwipedRight: () => {
      // Only open sidebar via swipe on tablet+ if desired, though standard is mobile.
      // We are removing mobile sidebar entirely.
      if (window.innerWidth >= 768) setIsSidebarOpen(true);
    },
    onSwipedLeft: () => {
      if (isSidebarOpen) setIsSidebarOpen(false);
    },
    trackMouse: false,
    delta: 40,
  });

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Define Font Class
  const getFontClass = () => {
     switch(font) {
        case 'quicksand': return 'font-quicksand';
        case 'playfair': return 'font-playfair';
        case 'caveat': return 'font-caveat';
        default: return 'font-system';
     }
  };

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

    switch(currentView) {
      case 'home':
        return (
          <HomeDashboard 
             events={filteredEvents}
             todos={filteredTodos}
             visionItems={visionItems}
             moodLogs={moodLogs}
             onSaveMood={handleSaveMoodLog}
             onSaveNote={handleSaveNote}
             setCurrentView={setCurrentView}
             theme={theme}
             accentColor={accentColor}
             lang={lang}
             categories={categories}
             onTodoToggle={handleToggleTodo}
             onAddEventClick={() => {
                 setSelectedDate(new Date());
                 setIsModalOpen(true);
             }}
             onAddTaskClick={() => {
                 setEditingTask(null);
                 setIsTaskModalOpen(true);
             }}
             onEditEventClick={openEditModal}
             onDeleteEventClick={handleDeleteEvent}
             onEditTaskClick={(task) => {
                 setEditingTask(task);
                 setIsTaskModalOpen(true);
             }}
             onDeleteTaskClick={handleDeleteTodo}
             noteCategories={noteCategories}
             noteCategoryColors={noteCategoryColors}
          />
        );
      case 'calendar':
        return (
          <div className="w-full flex flex-col p-3 lg:p-6 pb-24 md:pb-0 animate-in fade-in duration-300">
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
              todos={filteredTodos}
              onAddTaskClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
              }}
              onEditTaskClick={(task) => {
                  setEditingTask(task);
                  setIsTaskModalOpen(true);
              }}
              onToggleTodo={handleToggleTodo}
              onDeleteTodo={handleDeleteTodo}
              onTogglePin={handleTogglePin}
              onChangeColor={handleChangeTodoColor}
            />
          </div>
        );
      case 'notes':
        return (
          <NotesView
            notes={notes}
            theme={theme}
            accentColor={accentColor}
            lang={lang}
            categories={noteCategories}
            categoryColors={noteCategoryColors}
            onUpdateCategoryColor={handleUpdateCategoryColor}
            onAddCategory={handleAddNoteCategory}
            onEditCategory={handleEditNoteCategory}
            onDeleteCategory={handleDeleteNoteCategory}
            onSaveNote={handleSaveNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
          />
        );
      case 'moods':
        return (
          <MoodView
            moodLogs={moodLogs}
            onSaveMood={handleSaveMoodLog}
            theme={theme}
            accentColor={accentColor}
          />
        );
      case 'vision':
        return (
          <VisionView
             visionItems={visionItems}
             wishlistItems={wishlistItems}
             onAddVisionItem={handleSaveVisionItem}
             onDeleteVisionItem={handleDeleteVisionItem}
             onAddWishlistItem={handleSaveWishlistItem}
             onUpdateWishlistItem={handleUpdateWishlistItem}
             onDeleteWishlistItem={handleDeleteWishlistItem}
             theme={theme}
             accentColor={accentColor}
          />
        );
      case 'settings':
        return (
          <SettingsView
             theme={theme}
             accentColor={accentColor}
             lang={lang}
             font={font}
             handleFontChange={handleFontChange}
             userName={userName}
             handleUpdateUserName={handleUpdateUserName}
             profilePicture={profilePicture}
             handleUpdateProfilePicture={handleUpdateProfilePicture}
             assistantName={assistantName}
             handleUpdateAssistantName={handleUpdateAssistantName}
             assistantAvatar={assistantAvatar}
             handleUpdateAssistantAvatar={handleUpdateAssistantAvatar}
             categories={categories}
             newCategoryName={newCategoryName}
             setNewCategoryName={setNewCategoryName}
             newCategoryColor={newCategoryColor}
             setNewCategoryColor={setNewCategoryColor}
             handleAddCategory={handleAddCategory}
             handleUpdateCategory={handleUpdateCategory}
             handleDeleteCategory={handleDeleteCategory}
             handleLangChange={handleLangChange}
             handleLogout={handleLogout}
             eventsCount={events.length}
             todosCount={todos.length}
             handleExport={handleExport}
             handleFileChange={handleFileChange}
             fileInputRef={fileInputRef}
             importError={importError}
             handleShareDay={handleShareDay}
             handleShareWeek={handleShareWeek}
             copiedState={copiedState}
             testNotification={testNotification}
             setIsFeedbackModalOpen={setIsFeedbackModalOpen}
             handleAccentChange={handleAccentChange}
             handleThemeChange={handleThemeChange}
          />
        );
      default: return null;
    }
  };

  // --- SIDEBAR STYLES ---
  const sidebarClass = theme === 'neon' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  return (
    <div {...sidebarSwipeHandlers} className={`flex min-h-screen transition-colors duration-300 ${getThemeBackground()} ${getFontClass()}`}>
      
      {/* Mobile Overlay (Tablet/Desktop when Sidebar is open) */}
      {isSidebarOpen && (
         <div 
           className="fixed inset-0 bg-black/50 z-40 hidden md:block lg:hidden"
           onClick={() => setIsSidebarOpen(false)}
         />
      )}

      {/* SIDEBAR NAVIGATION - Hidden on mobile */}
      <div className="hidden md:flex">
          <Sidebar 
              currentView={currentView}
              setCurrentView={setCurrentView}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              theme={theme}
              accentColor={accentColor}
              lang={lang}
              handleLogout={handleLogout}
          />
      </div>

      {/* RIGHT PANEL: HEADER + CONTENT */}
      <div className="flex-1 flex flex-col min-h-screen relative pb-24 md:pb-0">
          
          {/* HEADER BAR (FIXED) */}
          <Header 
              setIsSidebarOpen={setIsSidebarOpen}
              theme={theme}
              accentColor={accentColor}
              handleThemeChange={handleThemeChange}
              userName={userName}
              profilePicture={profilePicture}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isEditingName={isEditingName}
              setIsEditingName={setIsEditingName}
              tempName={tempName}
              setTempName={setTempName}
              saveNameEdit={saveNameEdit}
              lang={lang}
              isChatOpen={isChatOpen}
              setIsChatOpen={setIsChatOpen}
              hasChatNotification={hasChatNotification}
              setHasChatNotification={setHasChatNotification}
              setCurrentView={setCurrentView}
          />

          {/* MAIN CONFIGURABLE CONTENT */}
          <main className="flex-1 flex flex-col relative pb-6">
             {renderContent()}
          </main>

      </div>

      <UniversalAddButton
        onSaveNote={handleSaveNote}
        onAddTask={() => setIsTaskModalOpen(true)}
        onAddEvent={() => {
            setSelectedDate(new Date());
            setIsModalOpen(true);
        }}
        onSaveMood={handleSaveMoodLog}
        onSaveWishlist={handleSaveWishlistItem}
        theme={theme}
        accentColor={accentColor}
        moodLogs={moodLogs}
        noteCategories={noteCategories}
        noteCategoryColors={noteCategoryColors}
      />

      {/* BOTTOM NAVIGATION (Mobile Only) */}
      <BottomNav
          currentView={currentView}
          setCurrentView={setCurrentView}
          theme={theme}
          accentColor={accentColor}
          lang={lang}
      />

      {/* GLOBAL FLOATING CHAT WIDGET */}
      <ChatAssistant 
        userName={userName || 'Prieten'}
        assistantName={assistantName}
        setAssistantName={handleUpdateAssistantName}
        assistantAvatar={assistantAvatar}
        setAssistantAvatar={handleUpdateAssistantAvatar}
        events={events}
        todos={todos}
        categories={categories}
        onAddEvent={handleSaveEvent}
        onAddTodo={handleAddTodo}
        onDeleteEvent={handleDeleteEventByTitle}
        onToggleTodo={handleToggleTodoByText}
        theme={theme}
        accentColor={accentColor}
        incomingMessage={aiMessage}
        lastCompletedTask={lastCompletedTask}
        onUpdateUserName={handleUpdateUserName}
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        hasNotification={hasChatNotification}
        setHasNotification={setHasChatNotification}
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

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={(text, categoryId, color, deadlineDate, notificationOffset, recurrence) => {
           if (editingTask) {
               handleEditTodo(editingTask.id, text, categoryId, color, deadlineDate, notificationOffset, recurrence);
           } else {
               handleAddTodo(text, false, categoryId, color, deadlineDate, notificationOffset, recurrence);
           }
        }}
        theme={theme}
        accentColor={accentColor}
        categories={categories}
        lang={lang}
        initialTask={editingTask || undefined}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        theme={theme}
      />

      <UpdateNotifier theme={theme} accentColor={accentColor} />
    </div>
  );
};

export default App;
