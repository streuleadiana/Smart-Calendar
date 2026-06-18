
import React, { useState, useRef, useEffect } from 'react';
import { CalendarEvent, Todo, Theme } from '../types';
import { MessageCircle, X, Send, User as UserIcon, Mic, Sparkles, Camera, GripHorizontal, Settings, Save, Palette, Maximize2, Minimize2 } from 'lucide-react';

interface ChatAssistantProps {
  userName: string;
  assistantName: string;
  setAssistantName: (name: string) => void;
  assistantAvatar: string;
  setAssistantAvatar: (avatar: string) => void;
  events: CalendarEvent[];
  todos: Todo[];
  categories?: { id: string; name: string; color: string }[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onAddTodo: (text: string, isPinned: boolean, categoryId?: string, color?: string) => void;
  onDeleteEvent: (title: string) => boolean;
  onToggleTodo: (text: string) => boolean;
  theme: Theme;
  accentColor: string;
  onAccentChange: (color: string) => void;
  incomingMessage: { text: string; id: string } | null;
  lastCompletedTask: string | null;
  onUpdateUserName: (name: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  hasNotification: boolean;
  setHasNotification: (hasNotification: boolean) => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Maps for Natural Language Processing
// ... existing imports ...
const COLOR_MAP: {[key: string]: string} = {
  'rosu': '#ef4444', 'roșu': '#ef4444',
  'albastru': '#3b82f6',
  'verde': '#22c55e',
  'galben': '#eab308', 'amber': '#f59e0b',
  'portocaliu': '#f97316',
  'mov': '#a855f7', 'violet': '#a855f7',
  'roz': '#ec4899',
  'gri': '#64748b',
  'turcoaz': '#14b8a6',
  'indigo': '#6366f1'
};

const AVATARS = ["🦉", "🤖", "👽", "🦊", "🐱", "🦁", "🦄", "🧙‍♂️", "🧠", "💼", "👨‍💻", "👩‍💻"];

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ 
  userName,
  assistantName,
  setAssistantName,
  assistantAvatar,
  setAssistantAvatar,
  events, 
  todos, 
  onAddEvent, 
  onAddTodo, 
  onDeleteEvent,
  onToggleTodo,
  theme, 
  accentColor,
  incomingMessage,
  lastCompletedTask,
  onUpdateUserName,
  isOpen,
  setIsOpen,
  hasNotification,
  setHasNotification
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Identity State
  const [showSettings, setShowSettings] = useState(false);
  
  // Local state for user name editing
  const [localUserName, setLocalUserName] = useState(userName);

  // Expanded State
  const [isExpanded, setIsExpanded] = useState(false);

  // Dragging State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize position
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        setPosition({
            x: Math.max(16, window.innerWidth - 400 - 24),
            y: Math.max(16, window.innerHeight - 500 - 80)
        });

        return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Sync localUserName
  useEffect(() => {
    setLocalUserName(userName);
  }, [userName]);

  // Short Term Memory
  const [lastFoundEvents, setLastFoundEvents] = useState<CalendarEvent[]>([]);
  
  const isNeon = theme === 'neon';
  const isPastel = theme === 'pastel';

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: '1',
      text: `Salut, ${userName || 'prietene'}! 👋 
Eu sunt ${assistantName} ${assistantAvatar}.

Poți să-mi vorbești liber! Încearcă:
📅 "Pune ședință luni la 10 cu roșu"
📝 "Task cumpărături urgent"
❓ "Ce am mâine?"`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const saveIdentity = () => {
    localStorage.setItem('assistant_name', assistantName);
    localStorage.setItem('assistant_avatar', assistantAvatar);
    setShowSettings(false);
    
    setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        text: `Identitate actualizată! Acum sunt ${assistantName} ${assistantAvatar}. Cu ce te pot ajuta?`,
        sender: 'bot',
        timestamp: new Date()
    }]);
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setLocalUserName(newName);
    onUpdateUserName(newName);
    localStorage.setItem('app_username', newName);
  };

  // Handle proactive messages
  useEffect(() => {
    if (incomingMessage) {
      setMessages(prev => [...prev, {
        id: incomingMessage.id,
        text: incomingMessage.text,
        sender: 'bot',
        timestamp: new Date()
      }]);
      setHasNotification(true);
    }
  }, [incomingMessage]);

  // Handle Task Celebration
  useEffect(() => {
    if (lastCompletedTask) {
        const taskName = lastCompletedTask.split('::')[0];
        const celebrations = [
            "Bravo! 🎉 Încă un task tăiat de pe listă!",
            "Ești pe val! 🌊",
            "Productivitate maximă! 🚀",
            "Excelent! Continuă tot așa! 💪",
            `Ai terminat "${taskName}". Super! ⭐`,
        ];
        
        setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            text: celebrations[Math.floor(Math.random() * celebrations.length)],
            sender: 'bot',
            timestamp: new Date()
        }]);
        setHasNotification(true);
    }
  }, [lastCompletedTask]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !showSettings) scrollToBottom();
  }, [messages, isOpen, showSettings]);

  const toggleChat = () => {
    if (!isOpen) setHasNotification(false);
    setIsOpen(!isOpen);
  };

  // --- NLP LOGIC ---

  const parseNaturalLanguage = (input: string) => {
    const text = input.toLowerCase().trim();
    
    let result = {
      intent: 'unknown',
      title: '',
      date: undefined as string | undefined,
      time: undefined as string | undefined,
      color: undefined as string | undefined,
      type: 'task' as 'event' | 'task',
      isPinned: false,
    };

    // 1. Detect Explicit Intent (Delete/Query)
    if (text.match(/^(sterge|șterge|anuleaza|delete)/)) {
        result.intent = 'delete';
        result.title = text.replace(/^(sterge|șterge|anuleaza|delete)/, '').trim();
        return result;
    }
    
    if (text.match(/^(ce am|gaseste|găsește|cauta|căuta|arata|arată|cand am|când am)/)) {
        result.intent = 'query';
        result.title = text.replace(/^(ce am|gaseste|găsește|cauta|căuta|arata|arată|cand am|când am)/, '').trim();
        
        // Check for specific date queries within search
        if (result.title.match(/(azi|mâine|maine)/)) {
            if (result.title.includes('azi')) result.date = new Date().toISOString().split('T')[0];
            else {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                result.date = tomorrow.toISOString().split('T')[0];
            }
            result.title = result.title.replace(/(azi|mâine|maine|-|pe)/g, '').trim();
        }
        
        return result;
    }

    // 2. Add Logic
    let processedText = text;
    const now = new Date();

    // Remove filler verbs
    processedText = processedText.replace(/^(adauga|pune|creeaza|baga|noteaza|set)\s+/, '');
    
    // A. Detect "Task" keyword -> Force task
    if (processedText.includes('task') || processedText.includes('to-do')) {
        result.type = 'task';
        result.intent = 'add_task';
        processedText = processedText.replace(/task|to-do/g, '');
    } else {
        // Default to task, upgrade to event if date/time found
        result.intent = 'add_task';
    }

    // B. Detect Date
    let dateFound: Date | null = null;
    
    // Relative days
    if (processedText.match(/\b(azi|astazi)\b/)) {
        dateFound = new Date();
        processedText = processedText.replace(/\b(azi|astazi)\b/, '');
    } else if (processedText.match(/\b(maine|mâine)\b/)) {
        dateFound = new Date();
        dateFound.setDate(now.getDate() + 1);
        processedText = processedText.replace(/\b(maine|mâine)\b/, '');
    } else if (processedText.match(/\b(poimaine|poimâine)\b/)) {
        dateFound = new Date();
        dateFound.setDate(now.getDate() + 2);
        processedText = processedText.replace(/\b(poimaine|poimâine)\b/, '');
    } else {
        // Weekdays
        const daysMap: {[key: string]: number} = {
            'duminica': 0, 'duminică': 0,
            'luni': 1, 
            'marti': 2, 'marți': 2,
            'miercuri': 3, 
            'joi': 4, 
            'vineri': 5, 
            'sambata': 6, 'sâmbătă': 6
        };
        
        for (const [dayName, dayIndex] of Object.entries(daysMap)) {
            if (processedText.includes(dayName)) {
                const currentDay = now.getDay();
                let diff = dayIndex - currentDay;
                if (diff < 0) diff += 7; // Next occurrence
                // If diff is 0 (today), assume today (or user can say "lunea viitoare", but keep simple)
                
                dateFound = new Date();
                dateFound.setDate(now.getDate() + diff);
                processedText = processedText.replace(new RegExp(`\\b${dayName}\\b`), '');
                break; 
            }
        }
    }
    
    // Specific Date (e.g., "pe 25")
    const dateMatch = processedText.match(/\bpe\s+(\d{1,2})\b/);
    if (!dateFound && dateMatch) {
         const day = parseInt(dateMatch[1]);
         dateFound = new Date();
         dateFound.setDate(day);
         if (day < now.getDate()) {
             dateFound.setMonth(now.getMonth() + 1); // Next month
         }
         processedText = processedText.replace(dateMatch[0], '');
    }

    if (dateFound) {
        const year = dateFound.getFullYear();
        const month = String(dateFound.getMonth() + 1).padStart(2, '0');
        const day = String(dateFound.getDate()).padStart(2, '0');
        result.date = `${year}-${month}-${day}`;
        result.intent = 'add_event'; // Found a date -> likely event
        result.type = 'event';
    }

    // C. Detect Time
    const timeMatch = processedText.match(/\b(?:la|ora)\s*(\d{1,2}(?:[:.]\d{2})?)\b/);
    if (timeMatch) {
        let t = timeMatch[1].replace('.', ':');
        if (!t.includes(':')) t += ":00";
        if (t.length === 4) t = "0" + t; // 9:00 -> 09:00
        result.time = t;
        result.intent = 'add_event';
        result.type = 'event';
        processedText = processedText.replace(timeMatch[0], '');
    }

    // D. Detect Color
    for (const [name, val] of Object.entries(COLOR_MAP)) {
        if (processedText.includes(name)) {
            result.color = val;
            processedText = processedText.replace(new RegExp(`\\b(cu|culoare)?\\s*${name}\\b`), '');
            break;
        }
    }

    // E. Detect "Urgent" / Pin
    if (processedText.match(/\b(urgent|important|pin)\b/)) {
        result.isPinned = true;
        processedText = processedText.replace(/\b(urgent|important|pin)\b/, '');
    }

    // F. Cleanup Prepositions and Clean Title
    processedText = processedText.replace(/\b(pe|la|cu)\b/g, '');
    result.title = processedText.replace(/\s+/g, ' ').trim();
    
    if (!result.title) result.title = result.type === 'event' ? 'Eveniment' : 'Task nou';

    return result;
  };

  // --- HANDLERS ---

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsAnalyzing(true);

    setTimeout(() => {
        try {
            const parsed = parseNaturalLanguage(userMsg.text);
            let responseText = '';

            if (parsed.intent === 'delete') {
                const success = onDeleteEvent(parsed.title);
                if (success) {
                    responseText = `Am șters evenimentul "${parsed.title}". 🗑️`;
                } else {
                    const taskSuccess = onToggleTodo(parsed.title);
                    responseText = taskSuccess 
                        ? `Nu am găsit eveniment, dar am bifat task-ul "${parsed.title}".` 
                        : `Nu găsesc "${parsed.title}" să-l șterg.`;
                }
            } 
            else if (parsed.intent === 'query') {
                const searchTerm = parsed.title.toLowerCase();
                
                // Search in Events
                const foundEvents = events.filter(e => {
                    if (parsed.date && e.date === parsed.date && !searchTerm) return true;
                    if (!searchTerm) return false;
                    
                    const titleMatch = e.title.toLowerCase().includes(searchTerm);
                    const catMatch = categories?.find(c => c.id === e.categoryId)?.name.toLowerCase().includes(searchTerm);
                    
                    if (parsed.date) {
                        return e.date === parsed.date && (titleMatch || catMatch);
                    }
                    return titleMatch || catMatch;
                });

                // Search in Todos
                const foundTodos = todos.filter(t => {
                    if (!searchTerm || t.completed) return false;
                    const textMatch = t.text.toLowerCase().includes(searchTerm);
                    const catMatch = categories?.find(c => c.id === t.categoryId)?.name.toLowerCase().includes(searchTerm);
                    return textMatch || catMatch;
                });
                
                setLastFoundEvents(foundEvents);
                
                const totalFound = foundEvents.length + foundTodos.length;
                
                if (totalFound > 0) {
                    let text = `Am găsit ${totalFound} potriviri pentru "${parsed.title || 'perioadă'}":\n`;
                    if (foundEvents.length > 0) {
                        text += `\n**📅 Evenimente (${foundEvents.length}):**\n` + foundEvents.map(e => `🔹 ${e.title} (${e.date} ${e.time || ''})`).join('\n');
                    }
                    if (foundTodos.length > 0) {
                        text += `\n\n**✅ Task-uri active (${foundTodos.length}):**\n` + foundTodos.map(t => `▫️ ${t.text}`).join('\n');
                    }
                    responseText = text;
                } else {
                    responseText = `Nu am găsit niciun eveniment sau o sarcină care să se potrivească cu "${parsed.title || 'criteriile tale'}". 🤷‍♂️`;
                }
            }
            else if (parsed.intent === 'add_event') {
                if (!parsed.date) {
                    // Fallback date if logic missed it (shouldn't happen often)
                    const d = new Date();
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    parsed.date = `${year}-${month}-${day}`;
                }

                // Try to match color hex back to categoryId, if any
                let catId: string | undefined = undefined;
                if (categories && parsed.color) {
                    const cat = categories.find(c => c.color === parsed.color);
                    if (cat) catId = cat.id;
                } else if (categories && categories.length > 0) {
                    catId = categories[0].id; // Default category
                }

                onAddEvent({
                    title: parsed.title,
                    date: parsed.date!,
                    time: parsed.time,
                    categoryId: catId,
                    color: (!catId && parsed.color) ? parsed.color : undefined
                });
                responseText = `Rezolvat! 📅 "${parsed.title}" pe ${parsed.date}${parsed.time ? ` la ${parsed.time}` : ''}.`;
            }
            else if (parsed.intent === 'add_task') {
                let catId: string | undefined = undefined;
                if (categories && parsed.color) {
                    const cat = categories.find(c => c.color === parsed.color);
                    if (cat) catId = cat.id;
                }

                onAddTodo(parsed.title, parsed.isPinned, catId, (!catId && parsed.color) ? parsed.color : undefined);
                responseText = `Am adăugat la to-do: "${parsed.title}"${parsed.isPinned ? ' 📌' : ''}${parsed.color ? ' 🎨' : ''}.`;
            } else {
                responseText = "Scuze, nu am înțeles. Poți încerca altfel?";
            }

            const botMsg: Message = {
                id: crypto.randomUUID(),
                text: responseText,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("ChatAssistant Error:", error);
            const errorMsg: Message = {
                id: crypto.randomUUID(),
                text: "Eroare: Nu m-am putut conecta la server. Poate am atins limita API?",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsAnalyzing(false);
        }
    }, 400);
  };

  const handleVoiceInput = () => {
    if (isListening || isAnalyzing) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browserul tău nu suportă comenzi vocale.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ro-RO';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.start();
    } catch (error) {
      setIsListening(false);
    }
  };

  // --- DRAG HANDLERS ---
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    
    // Identify clientX and clientY
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragOffset.current = {
      x: clientX - position.x,
      y: clientY - position.y
    };

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      
      const moveClientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : (moveEvent as MouseEvent).clientX;
      const moveClientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : (moveEvent as MouseEvent).clientY;

      setPosition({
        x: moveClientX - dragOffset.current.x,
        y: moveClientY - dragOffset.current.y
      });
    };

    const handleEnd = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  };

  // Styles
  const containerClass = isNeon 
    ? 'bg-slate-900 border-slate-800 shadow-cyan-500/20' 
    : isPastel 
      ? 'bg-[#fffbf0] border-orange-200 shadow-orange-500/10' 
      : 'bg-white border-slate-200';
      
  const botMsgClass = isNeon
    ? 'bg-slate-800 border-slate-700 text-cyan-50'
    : isPastel
      ? 'bg-white border-orange-100 text-stone-700'
      : 'bg-white border-slate-200 text-slate-700';

  const headerBg = theme === 'neon' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800';

  return (
    <>
        {/* Chat Window */}
        {isOpen && (
            <div 
                style={isMobile ? {} : { 
                    left: position.x, 
                    top: position.y
                }}
                className={`fixed z-[9999] rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 transition-all ${containerClass} bottom-40 right-4 sm:bottom-24 sm:right-6 sm:bottom-auto sm:right-auto ${
                    isExpanded 
                        ? 'w-[calc(100vw-2rem)] sm:w-[500px] md:w-[600px] h-[80vh] sm:h-[700px]' 
                        : 'w-[calc(100vw-2rem)] sm:w-80 md:w-96 max-h-[70vh] sm:h-[500px]'
                }`}
            >
                {/* Header (Draggable) */}
                <div 
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                    className={`p-4 border-b flex justify-between items-center select-none transition-colors duration-300 ${headerBg} cursor-move`}
                >
                    <div className="flex items-center gap-2 pointer-events-none pl-2">
                        <div className="text-2xl animate-bounce">
                            {assistantAvatar}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm flex items-center gap-1">
                                {assistantName}
                                <Sparkles size={12} className={isNeon ? 'text-yellow-300' : 'text-yellow-400'} />
                            </h3>
                            <span className={`flex items-center gap-1 text-[10px] font-medium opacity-80`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : isAnalyzing ? 'bg-yellow-500 animate-pulse' : 'bg-green-400'}`}></span>
                                {isListening ? 'Ascult...' : isAnalyzing ? 'Analizez...' : 'Online'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }} 
                            className="opacity-60 hover:opacity-100 p-1 rounded-full transition-colors hover:bg-black/10"
                            title="Assistant Settings"
                        >
                            <Settings size={18} strokeWidth={1.5} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} 
                            className="opacity-60 hover:opacity-100 p-1 rounded-full transition-colors hover:bg-black/10 hidden sm:block"
                            title={isExpanded ? "Collapse" : "Expand"}
                        >
                            {isExpanded ? <Minimize2 size={18} strokeWidth={1.5} /> : <Maximize2 size={18} strokeWidth={1.5} />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="opacity-60 hover:opacity-100 p-1 rounded-full hover:bg-black/10"><X size={18} strokeWidth={1.5} /></button>
                    </div>
                </div>

                {showSettings ? (
                    // --- SETTINGS MODE ---
                    <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isNeon ? 'bg-slate-950 text-white' : 'bg-white/50 text-slate-800'}`}>
                        <h4 className="font-bold text-sm text-center mb-4">Personalizează Asistentul</h4>
                        
                        {/* USER NAME EDIT */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold opacity-70">Numele Tău</label>
                            <input 
                                type="text" 
                                value={localUserName} 
                                onChange={handleUserNameChange}
                                className={`w-full p-2 rounded-lg text-sm border focus:ring-2 outline-none ${
                                    isNeon ? 'bg-slate-800 border-slate-700 focus:ring-cyan-500' : 'bg-white border-slate-200 focus:ring-indigo-500'
                                }`}
                                placeholder="ex: Alex"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold opacity-70">Nume Asistent</label>
                            <input 
                                type="text" 
                                value={assistantName} 
                                onChange={(e) => setAssistantName(e.target.value)}
                                className={`w-full p-2 rounded-lg text-sm border focus:ring-2 outline-none ${
                                    isNeon ? 'bg-slate-800 border-slate-700 focus:ring-cyan-500' : 'bg-white border-slate-200 focus:ring-indigo-500'
                                }`}
                                placeholder="ex: Jarvis"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold opacity-70">Avatar</label>
                            <div className="grid grid-cols-4 gap-2">
                                {AVATARS.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => setAssistantAvatar(emoji)}
                                        className={`text-2xl p-2 rounded-lg transition-all hover:scale-110 ${
                                            assistantAvatar === emoji 
                                            ? (isNeon ? 'bg-slate-700 ring-2 ring-cyan-500' : 'bg-indigo-50 ring-2 ring-indigo-500')
                                            : (isNeon ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-50 border border-slate-100')
                                        }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={saveIdentity}
                            className={`w-full mt-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-white hover:opacity-90 shadow-md`}
                            style={{ backgroundColor: accentColor }}
                        >
                            <Save size={16} />
                            Salvează Modificările
                        </button>
                    </div>
                ) : (
                    // --- CHAT MODE ---
                    <>
                        <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${isNeon ? 'bg-slate-950' : 'bg-transparent'}`}>
                            {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-sm overflow-hidden border ${isNeon ? 'border-slate-700 bg-slate-800' : 'border-white/50 bg-white'}`}>
                                {msg.sender === 'user' ? <UserIcon size={14} /> : assistantAvatar}
                                </div>
                                <div 
                                    className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm whitespace-pre-line ${
                                    msg.sender === 'user' ? `text-white rounded-tr-none` : `${botMsgClass} rounded-tl-none`
                                    }`}
                                    style={msg.sender === 'user' ? { backgroundColor: accentColor } : {}}
                                >
                                {msg.text}
                                </div>
                            </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className={`p-3 border-t ${isNeon ? 'bg-slate-900 border-slate-700' : 'bg-white/50 backdrop-blur-sm border-slate-100'}`}>
                            <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isListening ? "Te ascult..." : isAnalyzing ? "Așteaptă puțin..." : "Scrie aici..."}
                                disabled={isAnalyzing}
                                className={`w-full pl-4 pr-24 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 transition-all ${
                                    isNeon ? 'bg-slate-800 border-slate-700 text-white focus:ring-cyan-500 placeholder:text-slate-500' : 'bg-white border-slate-200 focus:ring-indigo-500/50'
                                } ${isListening ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                            />
                            <div className="absolute right-1.5 flex items-center gap-1">
                                <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isListening || isAnalyzing}
                                className={`p-1.5 rounded-full transition-all ${isNeon ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-400 hover:text-primary hover:bg-slate-100'}`}
                                title="Upload Schedule Image"
                                >
                                <Camera size={18} />
                                </button>

                                <button type="button" onClick={handleVoiceInput} disabled={isListening || isAnalyzing} className={`p-1.5 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:bg-slate-100'}`}><Mic size={18} /></button>
                                <button 
                                    type="submit" 
                                    disabled={!input.trim() || isAnalyzing} 
                                    className={`p-1.5 text-white rounded-full transition-all shadow-sm ${input.trim() ? '' : 'bg-slate-300 cursor-not-allowed'}`}
                                    style={input.trim() ? { backgroundColor: accentColor } : {}}
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                            </div>
                        </form>
                    </>
                )}
            </div>
        )}

        {/* Hidden File Input for Camera tool in Chat */}
        <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={() => {}} // Placeholder for now
        />
    </>
  );
};
