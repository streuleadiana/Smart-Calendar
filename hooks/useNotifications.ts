import { useEffect, useRef } from 'react';
import { CalendarEvent } from '../types';

export const useNotifications = (events: CalendarEvent[]) => {
  const notifiedEvents = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!('Notification' in window)) return;

    const checkUpcomingEvents = () => {
      const now = new Date();
      // Look forward 15 minutes
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60000);

      events.forEach(event => {
        if (!event.date) return;
        
        // Ensure event is not allDay, because allDay means we might not know what exact start time means
        if (event.allDay) return;

        const eventDate = new Date(event.date);
        
        // If event is within the next 15 minutes and hasn't been notified yet
        if (
          eventDate > now && 
          eventDate <= fifteenMinutesFromNow && 
          !notifiedEvents.current.has(event.id)
        ) {
           notifiedEvents.current.add(event.id);
           
           if (Notification.permission === 'granted') {
             try {
                new Notification(`Upcoming Event: ${event.title}`, {
                    body: `Your event starts at ${eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
                    icon: '/icon.svg'
                });
             } catch (err) {
                 console.error("Failed to show notification", err);
             }
           }
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkUpcomingEvents, 60000);
    // Also check immediately
    checkUpcomingEvents();

    return () => clearInterval(interval);
  }, [events]);

  const testNotification = () => {
    if (!('Notification' in window)) {
        alert("Notifications are not supported in this browser.");
        return;
    }

    if (Notification.permission === 'granted') {
        new Notification("Test Notification", {
            body: "Notifications are working successfully!",
            icon: '/icon.svg'
        });
    } else {
        alert("Notification permission not granted. Please go to Settings and check permissions.");
    }
  };

  return { testNotification };
};
