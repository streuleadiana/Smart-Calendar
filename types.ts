
export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO Date String YYYY-MM-DD
  endDate?: string; // ISO Date String YYYY-MM-DD
  time?: string; // HH:mm Start Time
  endTime?: string; // HH:mm End Time (Optional)
  color?: string; // HEX color string
  categoryId?: string; // matches Category id
  description?: string; // Event description
  recurrence?: 'none' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
  notifyMe?: boolean;
  notificationOffset?: number; // in minutes
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  isPinned?: boolean;
  color?: string; // HEX color string
  categoryId?: string; // matches Category id
  deadlineDate?: string; // ISO Date String YYYY-MM-DD
  notificationOffset?: number; // in minutes
  recurrence?: 'none' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
}

export interface User {
  name: string;
  email: string;
}

export type Theme = 'modern' | 'neon' | 'soft';
export type FontOption = 'inter' | 'nunito' | 'quicksand' | 'caveat' | 'poppins' | 'playfair' | 'oswald' | 'system';
