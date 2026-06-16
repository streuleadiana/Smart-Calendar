import { CalendarEvent } from '../types';
import { db, auth, cleanPayload } from '../lib/firebase';
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

    if (!auth.currentUser) {
        console.error("User not authenticated");
        return;
    }

    try {
        const payload = cleanPayload({
            ...eventData,
            userId: auth.currentUser.uid
        });
        await addDoc(collection(db, 'events'), payload);
    } catch (error) {
        console.error("Error adding event:", error);
    }
  };

  const handleUpdateEvent = async (id: string, eventData: Partial<CalendarEvent>) => {
    if (!auth.currentUser) return;
    try {
        const eventRef = doc(db, 'events', id);
        const payload = cleanPayload(eventData);
        await updateDoc(eventRef, payload);
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
