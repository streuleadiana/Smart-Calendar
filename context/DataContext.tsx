import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { CalendarEvent, Todo, Category } from '../types';
import { onAuthStateChanged } from 'firebase/auth';

interface DataContextType {
  events: CalendarEvent[];
  todos: Todo[];
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeEvents: () => void;
    let unsubscribeTodos: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Load Events
        const eventsQuery = query(collection(db, 'events'), where('userId', '==', user.uid));
        unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
            const loadedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CalendarEvent[];
            setEvents(loadedEvents);
        });

        // Load Todos
        const todosQuery = query(collection(db, 'todos'), where('userId', '==', user.uid));
        unsubscribeTodos = onSnapshot(todosQuery, (snapshot) => {
            const loadedTodos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Todo[];
            loadedTodos.sort((a, b) => {
                if (a.isPinned === b.isPinned) return 0;
                return a.isPinned ? -1 : 1;
            });
            setTodos(loadedTodos);
        });
      } else {
        setEvents([]);
        setTodos([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeEvents) unsubscribeEvents();
      if (unsubscribeTodos) unsubscribeTodos();
    };
  }, []);

  // Preload categories from storage (they are not in DB yet)
  useEffect(() => {
    const defaultCategories: Category[] = [
      { id: '1', name: 'Muncă', color: '#3B82F6' },
      { id: '2', name: 'Personal', color: '#10B981' },
      { id: '3', name: 'Urgent', color: '#EF4444' }
    ];
    const storedCats = localStorage.getItem('app_categories');
    if (storedCats) {
      try {
        setCategories(JSON.parse(storedCats));
      } catch (e) {
        setCategories(defaultCategories);
      }
    } else {
      setCategories(defaultCategories);
    }
    setLoading(false);
  }, []);

  return (
    <DataContext.Provider value={{ events, todos, categories, setCategories, loading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
