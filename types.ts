
export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO Date String YYYY-MM-DD
  time?: string; // HH:mm Start Time
  endTime?: string; // HH:mm End Time (Optional)
  color?: string; // HEX color string
  categoryId?: string; // matches Category id
  description?: string; // Event description
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  isPinned?: boolean;
  color?: string; // HEX color string
  categoryId?: string; // matches Category id
}

export interface User {
  name: string;
  email: string;
}

export type Theme = 'modern' | 'neon' | 'pastel';
