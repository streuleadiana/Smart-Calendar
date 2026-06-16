import { CalendarEvent } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export const useEvents = (
  events: CalendarEvent[],
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>,
  triggerAiMessage: (msg: string) => void
) => {
  const handleSaveEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (eventData.time) {
      const conflict = events.find(e => 
        e.date === eventData.date && 
        e.time === eventData.time
      );
      if (conflict) {
        triggerAiMessage(`⚠️ Atenție! Te-ai suprapus cu evenimentul '${conflict.title}' la ora ${eventData.time}. Sper că te poți clona! 👯‍♂️`);
      }
    }

    try {
        await addDoc(collection(db, 'events'), {
            ...eventData,
            userId: auth.currentUser?.uid
        });
    } catch (error) {
        console.error("Error adding event:", error);
    }
  };

  const handleUpdateEvent = async (id: string, eventData: Partial<CalendarEvent>) => {
    try {
        const eventRef = doc(db, 'events', id);
        await updateDoc(eventRef, eventData);
        if (eventData.title) {
            triggerAiMessage(`Eveniment actualizat: ${eventData.title} ✏️`);
        }
    } catch (error) {
        console.error("Error updating event:", error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
        await deleteDoc(doc(db, 'events', id));
    } catch (error) {
        console.error("Error deleting event:", error);
    }
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
