import { useEffect, useRef } from 'react';
import { CalendarEvent, Todo } from '../types';

export const useNotifications = (events: CalendarEvent[], todos: Todo[]) => {
  const notifiedEvents = useRef<Set<string>>(new Set());
  const notifiedTodos = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!('Notification' in window)) return;

    const checkUpcoming = () => {
      const now = new Date();
      
      // 1. Check Events
      events.forEach(event => {
        if (!event.notificationOffset || event.notificationOffset <= 0 || !event.date || !event.time) return;

        const eventTime = new Date(`${event.date}T${event.time}`);
        if (isNaN(eventTime.getTime())) return;
        
        const diffMs = eventTime.getTime() - now.getTime();
        const diffMinutes = diffMs / 60000;
        
        // Notify if it's strictly between 0 and notificationOffset minutes away
        if (diffMinutes > 0 && diffMinutes <= event.notificationOffset && !notifiedEvents.current.has(event.id)) {
            notifiedEvents.current.add(event.id);
            if (Notification.permission === 'granted') {
                try {
                let offsetLabel = `${event.notificationOffset} minutes`;
                if (event.notificationOffset === 60) offsetLabel = '1 hour';
                if (event.notificationOffset === 720) offsetLabel = '12 hours';
                if (event.notificationOffset === 1440) offsetLabel = '24 hours';

                new Notification(`Upcoming Event: ${event.title}`, {
                    body: `Your event starts in ${offsetLabel} at ${event.time}.`,
                });
                } catch (err) {
                    console.error("Failed to show notification", err);
                }
            }
        }
      });

      // 2. Check Todos
      todos.forEach(todo => {
        if (!todo.notificationOffset || todo.notificationOffset <= 0 || !todo.deadlineDate || todo.completed) return;

        // Deadline is at 23:59:59 of the deadlineDate.
        const deadlineTime = new Date(`${todo.deadlineDate}T23:59:59`);
        if (isNaN(deadlineTime.getTime())) return;

        const diffMs = deadlineTime.getTime() - now.getTime();
        const diffMinutes = diffMs / 60000;

        // Notify if it's strictly between 0 and notificationOffset minutes away
        if (diffMinutes > 0 && diffMinutes <= todo.notificationOffset && !notifiedTodos.current.has(todo.id)) {
            notifiedTodos.current.add(todo.id);
            if (Notification.permission === 'granted') {
                try {
                    let offsetLabel = `${todo.notificationOffset} minutes`;
                    if (todo.notificationOffset === 60) offsetLabel = '1 hour';
                    if (todo.notificationOffset === 720) offsetLabel = '12 hours';
                    if (todo.notificationOffset === 1440) offsetLabel = '24 hours';

                    new Notification(`Task Deadline Approaching`, {
                        body: `"${todo.text}" is due in ${offsetLabel} on ${todo.deadlineDate}.`,
                    });
                } catch (err) {
                    console.error("Failed to show notification", err);
                }
            }
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkUpcoming, 60000);
    // Also check immediately
    checkUpcoming();

    return () => clearInterval(interval);
  }, [events, todos]);

  const testNotification = () => {
    if (!('Notification' in window)) {
        alert("Notifications are not supported in this browser.");
        return;
    }

    if (Notification.permission === 'granted') {
        new Notification("Test Notification", {
            body: "Notifications are working successfully!",
        });
    } else {
        alert("Notification permission not granted. Please go to Settings and check permissions.");
    }
  };

  return { testNotification };
};
