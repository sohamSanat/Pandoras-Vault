// ─── Data Types ──────────────────────────────────────────────────────────────

export interface Habit {
    id: string;
    title: string;
    icon: string;
    frequency: number; // times per week (1–7)
    color: string;
}

export interface Task {
    id: string;
    title: string;
    icon: string;
    projectId: string | null;
    status: 'not-started' | 'in-progress' | 'completed';
    dueDate: string | null; // "YYYY-MM-DD"
    createdAt: string; // ISO string
}

export interface Project {
    id: string;
    title: string;
    dueDate: string | null; // "YYYY-MM-DD"
    status: 'active' | 'completed';
    color: string;
}

/** dateKey → array of habit IDs completed on that day */
export interface HabitLogs {
    [dateKey: string]: string[];
}

export interface HubData {
    habits: Habit[];
    tasks: Task[];
    projects: Project[];
    habitLogs: HabitLogs;
}

export const DEFAULT_DATA: HubData = {
    habits: [],
    tasks: [],
    projects: [],
    habitLogs: {},
};

// ─── Date Utilities ───────────────────────────────────────────────────────────

/** Returns "YYYY-MM-DD" for any Date (local time). */
export function getDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** Returns today's date key in local time. */
export function getTodayKey(): string {
    return getDateKey(new Date());
}

/** Returns yesterday's date key in local time. */
export function getYesterdayKey(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getDateKey(d);
}

/** Returns an array of 7 Dates starting from Mon of the given week offset. */
export function getWeekDates(weekOffset: number = 0): Date[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay(); // 0 = Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

// ─── ID Generation ────────────────────────────────────────────────────────────

export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// ─── Habit Helpers ────────────────────────────────────────────────────────────

/**
 * Calculates the current streak for a habit.
 * If completed today, counts backward from today.
 * Otherwise counts backward from yesterday.
 */
export function calculateStreak(habitId: string, habitLogs: HabitLogs): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayKey = getDateKey(today);
    const completedToday = (habitLogs[todayKey] ?? []).includes(habitId);

    const checkDate = new Date(today);
    if (!completedToday) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    let streak = 0;
    for (let i = 0; i < 365; i++) {
        const key = getDateKey(checkDate);
        if ((habitLogs[key] ?? []).includes(habitId)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
}

/**
 * Counts how many times a habit was completed in the current Mon–Sun week.
 */
export function getWeekCompletions(habitId: string, habitLogs: HabitLogs): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekDates = getWeekDates(0);
    let count = 0;
    for (const d of weekDates) {
        if (d > today) break;
        if ((habitLogs[getDateKey(d)] ?? []).includes(habitId)) count++;
    }
    return count;
}

// ─── Task / Project Helpers ───────────────────────────────────────────────────

/**
 * Returns a human-readable due date string.
 * e.g. "due today!", "2 days overdue", "due in 3 days"
 */
export function getDueDateText(dueDate: string | null): string {
    if (!dueDate) return 'No due date';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate + 'T00:00:00');
    const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
    if (diffDays === 0) return 'due today!';
    if (diffDays === -1) return '1 day overdue';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 1) return 'due tomorrow';
    return `due in ${diffDays} days`;
}

/**
 * Returns a short status string for project cards.
 * e.g. "3 days overdue", "5 days to go", "due today"
 */
export function getDueDateStatus(dueDate: string | null): string {
    if (!dueDate) return 'No due date set';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate + 'T00:00:00');
    const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
    if (diffDays === 0) return 'due today';
    if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} to go`;
}

/**
 * Returns true if a dueDate string (YYYY-MM-DD) is strictly in the past.
 */
export function isPastDue(dueDate: string | null): boolean {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate + 'T00:00:00') < today;
}
