
import React, { useState, useRef, useEffect } from 'react';
import { CalendarEvent, Todo, Theme } from '../types';
import { MessageCircle, X, Send, User as UserIcon, Mic, Sparkles, Camera, GripHorizontal, Settings, Save, Palette } from 'lucide-react';

interface ChatAssistantProps {
  userName: string;
  events: CalendarEvent[];
  todos: Todo[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onAddTodo: (text: string, isPinned: boolean, color?: string) => void;
  onDeleteEvent: (title: string) => boolean;
  onToggleTodo: (text: string) => boolean;
  theme: Theme;
  accentColor: string;
  onAccentChange: (color: string) => void;
  incomingMessage: { text: string; id: string } | null;
  lastCompletedTask: string | null;
  onUpdateUserName: (name: string) => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Maps for Natural Language Processing
const EVENT_COLORS: {[key: string]: string} = {
  'rosu': 'bg-red-500', 'roșu': 'bg-red-500',
  'albastru': 'bg-blue-500',
  'verde': 'bg-green-500',
  'galben': 'bg-yellow-500', 'amber': 'bg-amber-500',
  'portocaliu': 'bg-orange-500',
  'mov': 'bg-purple-500', 'violet': 'bg-purple-500',
  'roz': 'bg-pink-500',
  'gri': 'bg-slate-500',
  'turcoaz': 'bg-teal-500',
  'indigo': 'bg-indigo-500'
};

const TASK_COLORS: {[key: string]: string} = {
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
  events, 
  todos, 
  onAddEvent, 
  onAddTodo, 
  onDeleteEvent,
  onToggleTodo,
  theme, 
  accentColor,
  onAccentChange,
  incomingMessage,
  lastCompletedTask,
  onUpdateUserName
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Identity State
  const [assistantName, setAssistantName] = useState(() => localStorage.getItem('assistant_name') || "Olli");
  const [assistantAvatar, setAssistantAvatar] = useState(() => localStorage.getItem('assistant_avatar') || "🦉");
  const [showSettings, setShowSettings] = useState(false);
  
  // Local state for user name editing
  const [localUserName, setLocalUserName] = useState(userName);

  // Dimensions & Resizing
  const [dimensions, setDimensions] = useState({ width: 400, height: 500 });
  const isResizing = useRef(false);

  // Dragging State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize position
  useEffect(() => {
    if (typeof window !== 'undefined') {
        setPosition({
            x: window.innerWidth - dimensions.width - 20,
            y: window.innerHeight - dimensions.height - 80
        });
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
    
    if (text.match(/^(ce am|gaseste|cauta|arata)/)) {
        result.intent = 'query';
        result.title = text.replace(/^(ce am|gaseste|cauta|arata)/, '').trim();
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
    const colorMap = result.type === 'event' ? EVENT_COLORS : TASK_COLORS;
    for (const [name, val] of Object.entries(colorMap)) {
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
            // Simplified Query Logic
            const searchTerm = parsed.title.replace('azi', '').replace('maine', '').trim();
            const found = events.filter(e => e.title.toLowerCase().includes(searchTerm) || e.date === parsed.date);
            setLastFoundEvents(found);
            
            if (found.length > 0) {
                responseText = `Am găsit ${found.length} evenimente:\n${found.map(e => `🔹 ${e.title} (${e.date} ${e.time || ''})`).join('\n')}`;
            } else {
                const pendingTodos = todos.filter(t => !t.completed && t.text.toLowerCase().includes(searchTerm));
                if (pendingTodos.length > 0) {
                     responseText = `Ai ${pendingTodos.length} task-uri:\n${pendingTodos.map(t => `▫️ ${t.text}`).join('\n')}`;
                } else {
                    responseText = `Nu am găsit nimic relevant pentru "${parsed.title}".`;
                }
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

            onAddEvent({
                title: parsed.title,
                date: parsed.date!,
                time: parsed.time,
                type: 'personal', // Default type
                color: parsed.color
            });
            responseText = `Rezolvat! 📅 "${parsed.title}" pe ${parsed.date}${parsed.time ? ` la ${parsed.time}` : ''}.`;
        }
        else if (parsed.intent === 'add_task') {
            onAddTodo(parsed.title, parsed.isPinned, parsed.color);
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
        setIsAnalyzing(false);
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

  // --- MOUSE HANDLERS (RESIZE & DRAG) ---

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isResizing.current = true;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = dimensions.width;
    const startH = dimensions.height;
    const startXPos = position.x;
    const startYPos = position.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
        if (!isResizing.current) return;
        
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        let newW = startW - deltaX;
        let newH = startH - deltaY;

        // Constraints
        if (newW < 300) newW = 300;
        if (newH < 400) newH = 400;
        if (newW > 800) newW = 800;
        if (newH > 800) newH = 800;

        // Since resizing from Top-Left, we move the X/Y position to keep Bottom-Right anchored visually (relative to the window)
        // New Pos = Old Pos + (Old Size - New Size)
        // Example: If width shrinks by 10px (deltaX +10), position must move RIGHT by 10px.
        const newX = startXPos + (startW - newW);
        const newY = startYPos + (startH - newH);

        setDimensions({ width: newW, height: newH });
        setPosition({ x: newX, y: newY });
    };

    const onMouseUp = () => {
        isResizing.current = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleDragMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      setPosition({
        x: moveEvent.clientX - dragOffset.current.x,
        y: moveEvent.clientY - dragOffset.current.y
      });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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
                style={{ 
                    left: position.x, 
                    top: position.y,
                    width: dimensions.width,
                    height: dimensions.height 
                }}
                className={`fixed z-[9999] rounded-2xl shadow-2xl border flex flex-col mb-4 overflow-hidden animate-in zoom-in-95 duration-200 ${containerClass}`}
            >
                {/* Resize Handle (Top-Left) */}
                <div
                    onMouseDown={handleResizeMouseDown}
                    className="absolute top-0 left-0 w-8 h-8 z-50 cursor-nwse-resize flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
                    title="Resize"
                >
                    <div className={`w-3 h-3 border-t-2 border-l-2 ml-1 mt-1 ${isNeon ? 'border-cyan-500' : 'border-slate-400'}`}></div>
                </div>

                {/* Header (Draggable) */}
                <div 
                    onMouseDown={handleDragMouseDown}
                    className={`p-4 border-b flex justify-between items-center cursor-move select-none transition-colors duration-300 ${headerBg}`}
                >
                    <div className="flex items-center gap-2 pointer-events-none pl-4">
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
                            onClick={() => setShowSettings(!showSettings)} 
                            className="opacity-60 hover:opacity-100 p-1 rounded-full transition-colors hover:bg-black/10"
                            title="Assistant Settings"
                        >
                            <Settings size={18} />
                        </button>
                        <GripHorizontal size={18} className="opacity-40" />
                        <button onClick={() => setIsOpen(false)} className="opacity-60 hover:opacity-100 p-1 rounded-full hover:bg-black/10"><X size={18} /></button>
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

        {/* Launcher */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Hidden File Input */}
            <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={() => {}} // Placeholder for now
            />

            <button 
                onClick={toggleChat} 
                className={`pointer-events-auto w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 group hover:opacity-90`}
                style={{ backgroundColor: accentColor }}
            >
                {isOpen ? <X size={28} /> : (
                    <div className="relative">
                        <MessageCircle size={28} className="transition-transform group-hover:rotate-12" />
                        {hasNotification && !isOpen && (
                            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
                            </span>
                        )}
                    </div>
                )}
            </button>
        </div>
    </>
  );
};
