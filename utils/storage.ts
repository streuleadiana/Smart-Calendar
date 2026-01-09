
import { CalendarEvent, User, Todo, Theme } from '../types';

const STORAGE_KEYS = {
  USER: 'smart_calendar_user',
  EVENTS: 'smart_calendar_events',
  TODOS: 'smart_calendar_todos',
  THEME: 'smart_calendar_theme',
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

export const saveEvents = (events: CalendarEvent[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to save events:', error);
  }
};

export const getEvents = (): CalendarEvent[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load events:', error);
    return [];
  }
};

export const saveTodos = (todos: Todo[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
  } catch (error) {
    console.error('Failed to save todos:', error);
  }
};

export const getTodos = (): Todo[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TODOS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load todos:', error);
    return [];
  }
};

export const saveTheme = (theme: Theme): void => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

export const getTheme = (): Theme => {
  const t = localStorage.getItem(STORAGE_KEYS.THEME) as Theme;
  return t && ['modern', 'neon', 'pastel'].includes(t) ? t : 'modern';
};
