import { CalendarEvent, User, Todo, Theme, Category, FontOption } from '../types';
import { auth, db, cleanPayload } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STORAGE_KEYS = {
  USER: 'smart_calendar_user',
  THEME: 'smart_calendar_theme',
  EVENTS: 'smart_calendar_events',
  TODOS: 'smart_calendar_todos',
  CATEGORIES: 'smart_calendar_categories'
};

// Internal helper to get current logged in user
const getCurrentUserId = () => {
    return auth.currentUser?.uid || 'anonymous_user';
};

const getUserDocRef = () => {
    return doc(db, 'users', getCurrentUserId());
};

export const saveCategories = async (categories: Category[]): Promise<void> => {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  if (!auth.currentUser) return;
  try {
    const payload = cleanPayload({ categories });
    await setDoc(getUserDocRef(), payload, { merge: true });
  } catch (error) {
    console.warn('Failed to save categories to Firestore (offline?):', error);
  }
};

export const getCategories = async (): Promise<Category[]> => {
  if (auth.currentUser) {
      try {
        const docSnap = await getDoc(getUserDocRef());
        if (docSnap.exists() && docSnap.data().categories) {
            return docSnap.data().categories;
        }
      } catch (error) {
        console.warn('Failed to load categories from Firestore (offline?):', error);
      }
  }
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

export const saveTheme = (theme: Theme): void => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

export const getTheme = (): Theme => {
  const t = localStorage.getItem(STORAGE_KEYS.THEME) as Theme;
  return t && ['modern', 'neon', 'soft'].includes(t) ? t : 'modern';
};

export const saveFont = (font: FontOption): void => {
  localStorage.setItem('smart_calendar_font', font);
};

export const getFont = (): FontOption => {
  const f = localStorage.getItem('smart_calendar_font') as FontOption;
  return f && ['inter', 'nunito', 'quicksand', 'caveat'].includes(f) ? f : 'inter';
};
