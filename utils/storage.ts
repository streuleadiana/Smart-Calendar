import { CalendarEvent, User, Todo, Theme, Category } from '../types';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STORAGE_KEYS = {
  USER: 'smart_calendar_user',
  THEME: 'smart_calendar_theme',
  EVENTS: 'smart_calendar_events',
  TODOS: 'smart_calendar_todos',
  CATEGORIES: 'smart_calendar_categories'
};

// Internal helper to get current logged in user directly from storage
const getCurrentUserName = () => {
    return localStorage.getItem('app_username') || 'anonymous_user';
};

const getUserDocRef = () => {
    return doc(db, 'users', getCurrentUserName());
};

export const saveCategories = async (categories: Category[]): Promise<void> => {
  // Always save to localStorage as a robust fallback
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  try {
    await setDoc(getUserDocRef(), { categories }, { merge: true });
  } catch (error) {
    console.warn('Failed to save categories to Firestore (offline?):', error);
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const docSnap = await getDoc(getUserDocRef());
    if (docSnap.exists() && docSnap.data().categories) {
        return docSnap.data().categories;
    }
  } catch (error) {
    console.warn('Failed to load categories from Firestore (offline?):', error);
  }
  
  // Fallback to local storage
  const local = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  return local ? JSON.parse(local) : [];
};

export const saveUser = (user: User): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user:', error);
  }
};

export const getUser = (): User | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load user:', error);
    return null;
  }
};

export const clearUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const saveEvents = async (events: CalendarEvent[]): Promise<void> => {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  try {
    await setDoc(getUserDocRef(), { events }, { merge: true });
  } catch (error) {
    console.warn('Failed to save events to Firestore (offline?):', error);
  }
};

export const getEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const docSnap = await getDoc(getUserDocRef());
    if (docSnap.exists() && docSnap.data().events) {
        return docSnap.data().events;
    }
  } catch (error) {
    console.warn('Failed to load events from Firestore (offline?):', error);
  }
  
  // Fallback to local storage
  const local = localStorage.getItem(STORAGE_KEYS.EVENTS);
  return local ? JSON.parse(local) : [];
};

export const saveTodos = async (todos: Todo[]): Promise<void> => {
  localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
  try {
    await setDoc(getUserDocRef(), { todos }, { merge: true });
  } catch (error) {
    console.warn('Failed to save todos to Firestore (offline?):', error);
  }
};

export const getTodos = async (): Promise<Todo[]> => {
  try {
    const docSnap = await getDoc(getUserDocRef());
    if (docSnap.exists() && docSnap.data().todos) {
        return docSnap.data().todos;
    }
  } catch (error) {
    console.warn('Failed to load todos from Firestore (offline?):', error);
  }
  
  // Fallback to local storage
  const local = localStorage.getItem(STORAGE_KEYS.TODOS);
  return local ? JSON.parse(local) : [];
};

export const saveTheme = (theme: Theme): void => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

export const getTheme = (): Theme => {
  const t = localStorage.getItem(STORAGE_KEYS.THEME) as Theme;
  return t && ['modern', 'neon', 'pastel'].includes(t) ? t : 'modern';
};
