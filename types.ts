
export type EventType = 'work' | 'personal' | 'study' | 'urgent' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO Date String YYYY-MM-DD
  time?: string; // HH:mm
  color: string;
  type: EventType;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export interface User {
  name: string;
  email: string;
}

export type Theme = 'modern' | 'neon' | 'pastel';
