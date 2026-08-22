export interface CalendarDay {
    name: string;      // "Mon", "Tue", etc.
    dayNumber: number; // 28
    dateString: string;// "2025-04-28"
    isCurrent: boolean;// today
    isWeekend: boolean;
    date: Date;
}

export function formatDateIso(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
    // Expects YYYY-MM-DD or readable string
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    }
    return new Date(dateStr);
}

export function isSameDay(d1: Date | string, d2: Date | string): boolean {
    const date1 = typeof d1 === 'string' ? parseDate(d1) : d1;
    const date2 = typeof d2 === 'string' ? parseDate(d2) : d2;
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

export function getWeekDays(referenceDate: Date = new Date()): CalendarDay[] {
    const today = new Date();
    // Clone reference date
    const curr = new Date(referenceDate);
    // Find Monday of the week (day 1). If today is Sunday (0), it's 7.
    const dayOfWeek = curr.getDay() === 0 ? 7 : curr.getDay();
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - (dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekDays: CalendarDay[] = [];

    for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        
        const isCurrent = isSameDay(day, today);
        const isWeekend = i === 5 || i === 6; // Sat, Sun

        weekDays.push({
            name: dayNames[i],
            dayNumber: day.getDate(),
            dateString: formatDateIso(day),
            isCurrent,
            isWeekend,
            date: day
        });
    }

    return weekDays;
}

export function isDateInThisWeek(dateStr: string): boolean {
    if (!dateStr) return false;
    const target = parseDate(dateStr);
    const week = getWeekDays(new Date());
    const startOfWeek = week[0].date;
    const endOfWeek = new Date(week[6].date);
    endOfWeek.setHours(23, 59, 59, 999);

    return target >= startOfWeek && target <= endOfWeek;
}

export function formatFriendlyDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = parseDate(dateStr);
    const today = new Date();
    
    if (isSameDay(date, today)) return 'Today';
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (isSameDay(date, tomorrow)) return 'Tomorrow';
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (isSameDay(date, yesterday)) return 'Yesterday';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
