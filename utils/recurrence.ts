import { CalendarEvent } from '../types';

export const expandEventsForDateRange = (events: CalendarEvent[], startDate: Date, endDate: Date): CalendarEvent[] => {
    const instances: CalendarEvent[] = [];
    
    events.forEach(e => {
        if (!e.date) return;
        
        // Single Day / No Recurrence
        if ((!e.endDate || e.endDate === e.date) && (!e.recurrence || e.recurrence === 'none')) {
            const startObj = new Date(e.date + 'T00:00:00');
            const searchStart = new Date(startDate);
            searchStart.setHours(0, 0, 0, 0);
            const searchEnd = new Date(endDate);
            searchEnd.setHours(23, 59, 59, 999);
            
            if (startObj >= searchStart && startObj <= searchEnd) {
                instances.push(e);
            }
            return;
        }

        // Multi-day and/or Recurring
        const startObj = new Date(e.date + 'T00:00:00');
        const endObj = new Date((e.endDate || e.date) + 'T00:00:00');
        const durationDays = Math.round((endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24));

        const searchStart = new Date(startDate);
        searchStart.setHours(0, 0, 0, 0);
        const searchEnd = new Date(endDate);
        searchEnd.setHours(23, 59, 59, 999);

        // Figure out the date range we actually need to iterate through
        let iterStart = new Date(startObj);
        let iterEnd = new Date(searchEnd);
        
        if (!e.recurrence || e.recurrence === 'none') {
             // If NOT recurring, just return the original event if it overlaps the search window
             if (endObj >= searchStart && startObj <= searchEnd) {
                  instances.push(e);
             }
             return;
        }

        if (iterStart > iterEnd) return; // Event starts after search window

        // Limit iterEnd to something reasonable (e.g., searchEnd) to prevent infinite loops
        iterEnd = new Date(Math.min(iterEnd.getTime(), searchEnd.getTime()));
        
        // Let's iterate day by day to find STARTs of recurrences!
        for (let baseDayObj = new Date(iterStart); baseDayObj <= iterEnd; baseDayObj.setDate(baseDayObj.getDate() + 1)) {
            let isMatch = false;
            switch (e.recurrence) {
                case 'daily':
                    isMatch = true;
                    break;
                case 'weekly':
                    isMatch = baseDayObj.getDay() === startObj.getDay();
                    break;
                case 'bi-weekly':
                    if (baseDayObj.getDay() === startObj.getDay()) {
                        const diffDays = Math.round((baseDayObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24));
                        isMatch = diffDays % 14 === 0;
                    }
                    break;
                case 'monthly':
                    isMatch = baseDayObj.getDate() === startObj.getDate();
                    break;
                case 'yearly':
                    isMatch = baseDayObj.getDate() === startObj.getDate() && baseDayObj.getMonth() === startObj.getMonth();
                    break;
            }

            if (isMatch) {
                const y = baseDayObj.getFullYear();
                const m = String(baseDayObj.getMonth() + 1).padStart(2, '0');
                const dStr = String(baseDayObj.getDate()).padStart(2, '0');
                const startDateStr = `${y}-${m}-${dStr}`;

                // Calculate End Date
                const instanceEndObj = new Date(baseDayObj);
                instanceEndObj.setDate(instanceEndObj.getDate() + durationDays);
                const ey = instanceEndObj.getFullYear();
                const em = String(instanceEndObj.getMonth() + 1).padStart(2, '0');
                const edStr = String(instanceEndObj.getDate()).padStart(2, '0');
                const endDateStr = `${ey}-${em}-${edStr}`;
                
                // Only include if this specific occurrence overlaps with the target search window
                if (instanceEndObj >= searchStart && baseDayObj <= searchEnd) {
                    instances.push({
                        ...e,
                        id: e.id, 
                        date: startDateStr, 
                        endDate: endDateStr 
                    });
                }
            }
        }
    });

    return instances;
};
export const checkRecurrence = (targetDateStr: string, e: CalendarEvent): boolean => {
    // 1. If it's a multi-day event, we check if targetDateStr falls within the base date range
    if (targetDateStr >= e.date && targetDateStr <= (e.endDate || e.date)) {
        return true;
    }

    // 2. If it has no recurrence, it doesn't match
    if (!e.recurrence || e.recurrence === 'none') {
        return false;
    }

    // 3. Prevent matching dates before the START of the event
    if (targetDateStr < e.date) {
        return false;
    }

    const startObj = new Date(e.date);
    const targetObj = new Date(targetDateStr);
    
    // For multi-day events, calculate the duration in days
    const endObj = new Date(e.endDate || e.date);
    const durationDays = Math.round((endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check if target matches any generated date of the recurrence
    for (let i = 0; i <= durationDays; i++) {
        const baseDayObj = new Date(startObj);
        baseDayObj.setDate(startObj.getDate() + i);
        
        if (targetObj < baseDayObj) continue;

        let isMatch = false;
        switch (e.recurrence) {
            case 'daily':
                isMatch = true;
                break;
            case 'weekly':
                isMatch = targetObj.getDay() === baseDayObj.getDay();
                break;
            case 'bi-weekly':
                if (targetObj.getDay() === baseDayObj.getDay()) {
                    const diffDays = Math.round((targetObj.getTime() - baseDayObj.getTime()) / (1000 * 60 * 60 * 24));
                    isMatch = diffDays % 14 === 0;
                }
                break;
            case 'monthly':
                isMatch = targetObj.getDate() === baseDayObj.getDate();
                break;
            case 'yearly':
                isMatch = targetObj.getDate() === baseDayObj.getDate() && targetObj.getMonth() === baseDayObj.getMonth();
                break;
        }
        
        if (isMatch) return true;
    }
    
    return false;
};
