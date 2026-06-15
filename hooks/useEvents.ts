import { CalendarEvent } from '../types';
import * as storage from '../utils/storage';

export const useEvents = (
  events: CalendarEvent[],
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>,
  triggerAiMessage: (msg: string) => void
) => {
  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    if (eventData.time) {
      const conflict = events.find(e => 
        e.date === eventData.date && 
        e.time === eventData.time
      );
      if (conflict) {
        triggerAiMessage(`⚠️ Atenție! Te-ai suprapus cu evenimentul '${conflict.title}' la ora ${eventData.time}. Sper că te poți clona! 👯‍♂️`);
      }
    }

    const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        ...eventData
    };
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    storage.saveEvents(updatedEvents);
  };

  const handleUpdateEvent = (id: string, eventData: Partial<CalendarEvent>) => {
    const updatedEvents = events.map(e => {
        if (e.id === id) {
            return { ...e, ...eventData };
        }
        return e;
    });
    setEvents(updatedEvents);
    storage.saveEvents(updatedEvents);
    if (eventData.title) {
        triggerAiMessage(`Eveniment actualizat: ${eventData.title} ✏️`);
    }
  };

  const handleDeleteEvent = (id: string) => {
    const updatedEvents = events.filter(e => e.id !== id);
    setEvents(updatedEvents);
    storage.saveEvents(updatedEvents);
  };

  const handleDeleteEventByTitle = (titleFragment: string): boolean => {
    const target = titleFragment.toLowerCase();
    const event = events.find(e => e.title.toLowerCase().includes(target));
    if (event) {
      handleDeleteEvent(event.id);
      return true;
    }
    return false;
  };

  return {
    handleSaveEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleDeleteEventByTitle
  };
};
