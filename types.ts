
export type EventType = 'work' | 'personal' | 'study' | 'urgent' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO Date String YYYY-MM-DD
  time?: string; // HH:mm Start Time
  endTime?: string; // HH:mm End Time (Optional)
  color?: string; // Tailwind class (e.g. bg-red-500) - Optional, overrides category default
  type: EventType;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  isPinned?: boolean;
  color?: string; // Tailwind bg class for priority/category
}

export interface User {
  name: string;
  email: string;
}

export type Theme = 'modern' | 'neon' | 'pastel';
