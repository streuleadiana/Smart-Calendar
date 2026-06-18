import { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { db, auth, cleanPayload } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';

export const useEvents = (
  triggerAiMessage?: (msg: string) => void
) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (!auth.currentUser) {
        setEvents([]);
        return;
    }
    const eventsQuery = query(collection(db, 'events'), where('userId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
        const loadedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CalendarEvent[];
        setEvents(loadedEvents);
    }, (error) => {
        console.error("Events sync failed", error);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleSaveEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (eventData.time) {
      const conflict = events.find(e => 
        e.date === eventData.date && 
        e.time === eventData.time
      );
      if (conflict && triggerAiMessage) {
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
        if (eventData.title && triggerAiMessage) {
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
    events,
    handleSaveEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleDeleteEventByTitle
  };
};
