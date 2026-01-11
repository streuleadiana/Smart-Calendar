
import React, { useState, useRef, useEffect } from 'react';
import { CalendarEvent, Todo, Theme } from '../types';
import { MessageCircle, X, Send, User as UserIcon, Mic, Sparkles, Camera, Image as ImageIcon, GripHorizontal } from 'lucide-react';

interface ChatAssistantProps {
  events: CalendarEvent[];
  todos: Todo[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onAddTodo: (text: string, isPinned: boolean, color?: string) => void;
  onDeleteEvent: (title: string) => boolean;
  onToggleTodo: (text: string) => boolean;
  theme: Theme;
  incomingMessage: { text: string; id: string } | null;
  lastCompletedTask: string | null;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const COLOR_MAP: {[key: string]: string} = {
  'rosu': 'bg-red-500',
  'roșu': 'bg-red-500',
  'albastru': 'bg-blue-500',
  'verde': 'bg-green-500',
  'galben': 'bg-yellow-500',
  'amber': 'bg-amber-500',
  'portocaliu': 'bg-orange-500',
  'mov': 'bg-purple-500',
  'violet': 'bg-purple-500',
  'roz': 'bg-pink-500',
  'gri': 'bg-slate-500',
  'turcoaz': 'bg-teal-500',
  'indigo': 'bg-indigo-500'
};

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ 
  events, 
  todos, 
  onAddEvent, 
  onAddTodo,
  onDeleteEvent,
  onToggleTodo,
  theme, 
  incomingMessage,
  lastCompletedTask
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNotification, setHasNotification] = useState(false); // New state for badge
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Dragging State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize position to bottom-right on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
        setPosition({
            x: window.innerWidth - 360,
            y: window.innerHeight - 500
        });
    }
  }, []);

  // --- SHORT TERM MEMORY ---
  const [lastFoundEvents, setLastFoundEvents] = useState<CalendarEvent[]>([]);
  
  const isNeon = theme === 'neon';
  const isPastel = theme === 'pastel';
  const botName = "Olli";
  const botAvatar = "🦉";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Salut! Sunt ${botName} ${botAvatar}. \n• Folosește "Adaugă" pentru evenimente.\n• Folosește "Task" pentru to-do.\n• Poți încărca o poză cu orarul tău! 📸`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle proactive messages (General)
  useEffect(() => {
    if (incomingMessage) {
      const newMessage: Message = {
        id: incomingMessage.id,
        text: incomingMessage.text,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      // Do not auto-open, just notify
      setHasNotification(true);
    }
  }, [incomingMessage]);

  // Handle Task Celebration
  useEffect(() => {
    if (lastCompletedTask) {
        // Extract task name from "TaskName::Timestamp" format
        const taskName = lastCompletedTask.split('::')[0];
        
        const celebrations = [
            "Bravo! 🎉 Încă un task tăiat de pe listă!",
            "Ești pe val! 🌊",
            "Productivitate maximă! 🚀",
            "Excelent! Continuă tot așa! 💪",
            `Ai terminat "${taskName}". Super! ⭐`,
            "One down, more to go! 🎯"
        ];
        
        const randomMsg = celebrations[Math.floor(Math.random() * celebrations.length)];
        
        const botMsg: Message = {
            id: crypto.randomUUID(),
            text: randomMsg,
            sender: 'bot',
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMsg]);
        // Do not auto-open, just notify
        setHasNotification(true);
    }
  }, [lastCompletedTask]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Handle opening/closing
  const toggleChat = () => {
    if (!isOpen) {
        setHasNotification(false); // Clear notification when opening
    }
    setIsOpen(!isOpen);
  };

  // --- DATE PARSING UTILS ---

  const getFormattedDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDate = (text: string): string | null => {
    const today = new Date();
    const lower = text.toLowerCase();
    
    if (lower.includes('azi')) return getFormattedDate(today);
    
    if (lower.includes('maine') || lower.includes('mâine')) {
      const d = new Date(today);
      d.setDate(today.getDate() + 1);
      return getFormattedDate(d);
    }

    const days: {[key: string]: number} = {
      'duminica': 0, 'duminică': 0, 'luni': 1, 'marti': 2, 'marți': 2, 
      'miercuri': 3, 'joi': 4, 'vineri': 5, 'sambata': 6, 'sâmbătă': 6
    };
    
    for (const [dayName, idx] of Object.entries(days)) {
        if (lower.includes(dayName)) {
             const currentDayIndex = today.getDay();
             let daysUntil = idx - currentDayIndex;
             if (daysUntil <= 0) daysUntil += 7;
             const targetDate = new Date(today);
             targetDate.setDate(today.getDate() + daysUntil);
             return getFormattedDate(targetDate);
        }
    }

    const match = text.match(/\b(\d{1,2})\b/);
    if (match) {
        const day = parseInt(match[1]);
        if (day > 0 && day <= 31) {
            const d = new Date(today.getFullYear(), today.getMonth(), day);
            return getFormattedDate(d);
        }
    }

    return null;
  };

  // --- MAIN LOGIC ENGINE ---

  const processQuery = (text: string, isOCR: boolean = false): string => {
    let lowerText = text.toLowerCase().trim();

    // ---------------------------------------------------------
    // OCR PRE-PROCESSING
    // ---------------------------------------------------------
    if (isOCR) {
        const addVerbs = ['adauga', 'adaugă', 'pune', 'creeaza', 'creează', 'set', 'add'];
        const hasVerb = addVerbs.some(v => lowerText.startsWith(v));
        
        if (!hasVerb) {
            const potentialDate = parseDate(lowerText);
            if (potentialDate) {
                lowerText = `adauga ${lowerText}`;
                text = `Adauga ${text}`;
            }
        }
    }

    // ---------------------------------------------------------
    // PRIORITY 1: DELETION
    // ---------------------------------------------------------
    if (lowerText.startsWith('sterge') || lowerText.startsWith('șterge') || lowerText.startsWith('anuleaza')) {
        const target = lowerText.replace(/sterge|șterge|anuleaza/g, '').trim();
        if (!target) return "Ce anume vrei să șterg? (ex: 'Sterge sedinta')";
        
        const success = onDeleteEvent(target);
        if (success) {
            return `Am șters evenimentul "${target}" din calendar. 🗑️`;
        } else {
            const taskSuccess = onToggleTodo(target);
            if(taskSuccess) return `Nu am găsit eveniment, dar am bifat task-ul "${target}".`;
            return `Nu găsesc "${target}" nici la evenimente, nici la task-uri.`;
        }
    }

    // ---------------------------------------------------------
    // PRIORITY 2: TASKS
    // ---------------------------------------------------------
    if (['gata', 'bifeaza', 'terminat', 'check'].some(k => lowerText.startsWith(k))) {
        const target = lowerText.replace(/gata|bifeaza|terminat|check/g, '').replace('cu', '').trim();
        const success = onToggleTodo(target);
        return success ? `Bravo! Am marcat "${target}" ca rezolvat. ✅` : `Nu găsesc task-ul "${target}".`;
    }

    if (lowerText.startsWith('task') || lowerText.startsWith('to-do') || lowerText.startsWith('todo')) {
        let content = lowerText.replace(/task|to-do|todo/g, '').trim();
        
        if (!content || content.startsWith('ce') || content === 'uri') {
            const pending = todos.filter(t => !t.completed);
            if (pending.length === 0) return "Nu ai niciun task activ. Liber ca pasărea cerului! 🕊️";
            return `Ai ${pending.length} task-uri:\n${pending.map(t => `▫️ ${t.text}`).join('\n')}`;
        }

        // --- NEW TASK PARSING (PIN/COLOR) ---
        let isPinned = false;
        let selectedColor = undefined;

        // Check Priority
        if (content.match(/\b(urgent|important|pin|fixeaza)\b/i)) {
            isPinned = true;
            content = content.replace(/\b(urgent|important|pin|fixeaza)\b/gi, '').trim();
        }

        // Check Color
        for (const [colorName, colorClass] of Object.entries(COLOR_MAP)) {
            const colorRegex = new RegExp(`\\b(cu|culoare|color)?\\s*${colorName}\\b`, 'i');
            if (colorRegex.test(content)) {
                selectedColor = colorClass;
                // Remove color words from task text
                content = content.replace(new RegExp(`\\b(cu|culoare|color)?\\s*${colorName}\\b`, 'gi'), '').trim();
                break;
            }
        }
        
        onAddTodo(content, isPinned, selectedColor);
        
        let extras = "";
        if (isPinned) extras += " 📌";
        if (selectedColor) extras += " 🎨";

        return `Am adăugat la to-do: "${content}"${extras}.`;
    }

    // ---------------------------------------------------------
    // PRIORITY 3: ADD EVENT
    // ---------------------------------------------------------
    const addVerbs = ['adauga', 'adaugă', 'pune', 'creeaza', 'creează', 'set', 'add'];
    const isAddCommand = addVerbs.some(v => lowerText.startsWith(v));

    if (isAddCommand) {
        const verb = addVerbs.find(v => lowerText.startsWith(v)) || '';
        const cleanText = text.substring(verb.length).trim();

        const onIndex = cleanText.toLowerCase().indexOf(' pe ');
        const atIndex = cleanText.toLowerCase().lastIndexOf(' la ');
        
        let title = '';
        let datePart = '';
        let timePart = '';
        let endTimePart = '';
        let formattedDate: string | null = null;
        let selectedColor: string | undefined = undefined;

        // --- DETECT COLOR IN COMMAND ---
        // Iterate color map to see if present
        for (const [colorName, colorClass] of Object.entries(COLOR_MAP)) {
            // Regex to match "cu rosu", "culoare rosu", or just "rosu" if it's safe?
            // Safer: match word boundary
            const colorRegex = new RegExp(`\\b(cu|culoare|color)?\\s*${colorName}\\b`, 'i');
            if (colorRegex.test(cleanText)) {
                selectedColor = colorClass;
                // Don't remove it yet as it might mess up other parsing steps if not careful,
                // but ideally we should clean the title.
                break;
            }
        }

        // --- NEW TIME RANGE PARSING LOGIC ---
        const timeRangeRegex = /(\d{1,2}(?:[:.]\d{2})?)\s*(?:-|–|to|pana la|până la)\s*(\d{1,2}(?:[:.]\d{2})?)/i;
        const rangeMatch = cleanText.match(timeRangeRegex);

        if (rangeMatch) {
            let t1 = rangeMatch[1].replace('.', ':');
            let t2 = rangeMatch[2].replace('.', ':');
            if (!t1.includes(':')) t1 += ":00";
            if (!t2.includes(':')) t2 += ":00";
            const formatTime = (t: string) => {
                const [h, m] = t.split(':');
                return `${h.padStart(2, '0')}:${m.padEnd(2, '0').slice(0, 2)}`;
            };
            timePart = formatTime(t1);
            endTimePart = formatTime(t2);

            const textWithoutTime = cleanText.replace(rangeMatch[0], '').trim();
            const dateFound = parseDate(textWithoutTime);
            if (dateFound) {
                formattedDate = dateFound;
                title = textWithoutTime.replace(/(\bazi\b|\bmaine\b|\bluni\b|\bmarti\b|\bmiercuri\b|\bjoi\b|\bvineri\b|\bsambata\b|\bduminica\b)/gi, '')
                                       .replace(/\b(pe|in|la)\b/gi, '')
                                       .trim();
            }
        } 
        
        if (!formattedDate) {
            if (onIndex !== -1) {
                title = cleanText.substring(0, onIndex).trim();
                if (atIndex > onIndex) {
                    datePart = cleanText.substring(onIndex + 4, atIndex).trim();
                    const rest = cleanText.substring(atIndex + 4).trim();
                    const localRange = rest.match(timeRangeRegex);
                     if (localRange) {
                        // handled above usually, but fallback
                    } else {
                         timePart = rest.substring(0, 5); 
                    }
                } else {
                    datePart = cleanText.substring(onIndex + 4).trim();
                }
                formattedDate = parseDate(datePart);
            } else if (isOCR) {
                const words = cleanText.split(' ');
                for (let i = words.length - 1; i >= 0; i--) {
                    const testDate = parseDate(words[i]);
                    if (testDate) {
                        formattedDate = testDate;
                        title = words.slice(0, i).join(' ');
                        const nextWord = words[i + 1];
                        if (nextWord && nextWord.match(/\d{1,2}:?\d{2}?/)) {
                            timePart = nextWord;
                        }
                        break;
                    }
                }
            }
        }

        // Clean title of color words if found
        if (selectedColor && title) {
             for (const colorName of Object.keys(COLOR_MAP)) {
                 const regex = new RegExp(`\\b(cu|culoare|color)?\\s*${colorName}\\b`, 'gi');
                 title = title.replace(regex, '').trim();
             }
        }

        if (!title && !formattedDate) {
             return isOCR 
               ? `Am citit "${text}" dar nu am înțeles data. Încearcă să scrii "Vineri" sau "Azi" mai clar.` 
               : `Nu știu data. Zi-mi: "Adauga [Titlu] pe [Data]"`;
        }
        
        if (!title) title = "Eveniment nou";
        if (!formattedDate) return "Nu am putut identifica data.";

        onAddEvent({
            title,
            date: formattedDate,
            time: timePart || undefined,
            endTime: endTimePart || undefined,
            color: selectedColor || undefined, // Use detected color or fallback to default in logic
            type: 'work'
        });

        const timeMsg = timePart 
            ? (endTimePart ? ` între ${timePart} și ${endTimePart}` : ` la ${timePart}`) 
            : '';
            
        const colorMsg = selectedColor ? " 🎨" : "";

        return `Rezolvat! 📅 ${title} pe ${formattedDate}${timeMsg}${colorMsg}.`;
    }

    // ---------------------------------------------------------
    // PRIORITY 4: CONTEXT & SEARCH
    // ---------------------------------------------------------
    if (lastFoundEvents.length > 0) {
        if (lowerText.includes('ora') || lowerText.includes('timp') || lowerText.includes('cand')) {
            if (lastFoundEvents.length === 1) {
                const e = lastFoundEvents[0];
                return `Evenimentul "${e.title}" este la ora ${e.time || 'nespecificată'}.`;
            } else {
                return `Iată orele:\n${lastFoundEvents.map(e => `${e.title}: ${e.time || 'all-day'}`).join('\n')}`;
            }
        }
    }

    const dateQuery = parseDate(lowerText);
    if (dateQuery) {
        const found = events.filter(e => e.date === dateQuery);
        setLastFoundEvents(found);
        if (found.length === 0) return `Nu ai nimic planificat pe ${dateQuery}. Relaxează-te! 😎`;
        return `Pe ${dateQuery} ai:\n${found.map(e => `👉 ${e.title} (${e.time ? `${e.time}${e.endTime ? `-${e.endTime}` : ''}` : 'toată ziua'})`).join('\n')}`;
    }

    if (lowerText.includes('ce am') || lowerText.includes('gaseste') || lowerText.includes('cauta')) {
        const searchTerm = lowerText.replace(/ce am|gaseste|cauta/g, '').replace('azi', '').replace('maine', '').trim();
        if (searchTerm.length > 2) {
            const found = events.filter(e => e.title.toLowerCase().includes(searchTerm));
            setLastFoundEvents(found);
            if (found.length === 0) return `Nu am găsit nimic cu "${searchTerm}".`;
            return `Am găsit ${found.length} evenimente:\n${found.map(e => `🔹 ${e.title} (${e.date})`).join('\n')}`;
        }
    }

    return isOCR 
      ? `Am citit textul, dar nu pare a fi o comandă clară. Încearcă să incluzi o dată (ex: "Luni").`
      : "Scuze, nu am înțeles. Folosește 'Adauga...', 'Sterge...', 'Task...' sau întreabă-mă de o dată.";
  };

  // --- DRAG HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent) => {
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


  // --- UI HANDLERS ---

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const userMsg: Message = {
        id: crypto.randomUUID(),
        text: `📷 [Imagine încărcată: ${file.name}]`,
        sender: 'user',
        timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsAnalyzing(true);

    const loadingId = crypto.randomUUID();
    setMessages(prev => [...prev, {
        id: loadingId,
        text: "Analizez imaginea... 🧐 (Poate dura câteva secunde)",
        sender: 'bot',
        timestamp: new Date()
    }]);

    const Tesseract = (window as any).Tesseract;
    if (Tesseract) {
        Tesseract.recognize(
            file,
            'ron',
            { logger: (m: any) => console.log(m) }
        ).then(({ data: { text } }: any) => {
            setMessages(prev => prev.filter(m => m.id !== loadingId));
            const cleanText = text.replace(/\n/g, ' ').trim();
            const botResponseId = crypto.randomUUID();
            
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                text: `Am citit: "${cleanText}"`,
                sender: 'bot',
                timestamp: new Date()
            }]);

            const result = processQuery(cleanText, true);
            
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: botResponseId,
                    text: result,
                    sender: 'bot',
                    timestamp: new Date()
                }]);
                setIsAnalyzing(false);
            }, 500);

        }).catch((err: any) => {
             console.error(err);
             setMessages(prev => prev.filter(m => m.id !== loadingId));
             setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                text: "Eroare la citirea imaginii. Încearcă una mai clară.",
                sender: 'bot',
                timestamp: new Date()
            }]);
            setIsAnalyzing(false);
        });
    } else {
        setMessages(prev => prev.filter(m => m.id !== loadingId));
        setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            text: "Modulul OCR nu este încărcat.",
            sender: 'bot',
            timestamp: new Date()
        }]);
        setIsAnalyzing(false);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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

    setTimeout(() => {
      const responseText = processQuery(userMsg.text);
      const botMsg: Message = {
        id: crypto.randomUUID(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  // Styles
  const containerClass = isNeon 
    ? 'bg-slate-900 border-cyan-500/30 shadow-cyan-500/20' 
    : isPastel 
      ? 'bg-[#fffbf0] border-orange-200 shadow-orange-500/10' 
      : 'bg-white border-slate-200';
      
  const headerClass = isNeon 
    ? 'bg-slate-950 border-cyan-500/20 text-cyan-50' 
    : isPastel 
      ? 'bg-orange-50 border-orange-100 text-stone-800' 
      : 'bg-primary/5 border-primary/10 text-slate-800';

  const userMsgClass = isNeon
    ? 'bg-cyan-600 text-white'
    : isPastel
      ? 'bg-orange-400 text-white'
      : 'bg-indigo-500 text-white';

  const botMsgClass = isNeon
    ? 'bg-slate-800 border-slate-700 text-cyan-50'
    : isPastel
      ? 'bg-white border-orange-100 text-stone-700'
      : 'bg-white border-slate-200 text-slate-700';

  const buttonClass = isNeon 
    ? 'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/50' 
    : isPastel 
      ? 'bg-orange-400 hover:bg-orange-500 shadow-orange-500/30' 
      : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/30';

  return (
    // Only the launcher button is fixed, the window has dynamic position
    <>
        {/* Chat Window */}
        {isOpen && (
            <div 
                style={{ left: position.x, top: position.y }}
                className={`fixed z-[9999] w-[340px] h-[450px] rounded-2xl shadow-2xl border flex flex-col mb-4 overflow-hidden animate-in zoom-in-95 duration-200 ${containerClass}`}
            >
                {/* Header (Draggable) */}
                <div 
                    onMouseDown={handleMouseDown}
                    className={`p-4 border-b flex justify-between items-center cursor-move select-none ${headerClass}`}
                >
                    <div className="flex items-center gap-2 pointer-events-none">
                        <div className="text-2xl animate-bounce">
                            {botAvatar}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm flex items-center gap-1">
                                {botName}
                                <Sparkles size={12} className={isNeon ? 'text-yellow-300' : 'text-yellow-500'} />
                            </h3>
                            <span className={`flex items-center gap-1 text-[10px] font-medium opacity-80`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : isAnalyzing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
                                {isListening ? 'Ascult...' : isAnalyzing ? 'Analizez...' : 'Online'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <GripHorizontal size={18} className="opacity-40" />
                        <button onClick={() => setIsOpen(false)} className="opacity-60 hover:opacity-100 p-1 rounded-full"><X size={18} /></button>
                    </div>
                </div>

                {/* Messages */}
                <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${isNeon ? 'bg-slate-950' : 'bg-transparent'}`}>
                    {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-sm overflow-hidden border ${isNeon ? 'border-slate-700 bg-slate-800' : 'border-white/50 bg-white'}`}>
                        {msg.sender === 'user' ? <UserIcon size={14} /> : botAvatar}
                        </div>
                        <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm whitespace-pre-line ${
                        msg.sender === 'user' ? `${userMsgClass} rounded-tr-none` : `${botMsgClass} rounded-tl-none`
                        }`}>
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
                        <button type="submit" disabled={!input.trim() || isAnalyzing} className={`p-1.5 text-white rounded-full transition-all shadow-sm ${input.trim() ? buttonClass : 'bg-slate-300 cursor-not-allowed'}`}><Send size={16} /></button>
                    </div>
                    </div>
                </form>
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
                onChange={handleFileUpload}
            />

            <button onClick={toggleChat} className={`pointer-events-auto w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 group ${buttonClass}`}>
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
