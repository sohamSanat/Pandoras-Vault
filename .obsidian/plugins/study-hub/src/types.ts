import type { RpgDataState } from './types/rpg';
import type { FlashcardState } from './types/flashcard';
import type { CgpaDataState } from './types/cgpa';

export * from './types/rpg';
export * from './types/flashcard';
export * from './types/cgpa';

export interface Course {
    id: string;
    title: string;
    icon: string; // 'Calculator' | 'Code' | 'Network' | 'SquareTerminal' | 'Monitor' | etc.
    folderPath?: string;
    color?: string;
}

export interface AssignmentItem {
    id: string;
    courseId: string;
    title: string;
    dueDate: string; // YYYY-MM-DD
    completed: boolean;
    priority: 'High' | 'Medium' | 'Low';
    description?: string;
}

export interface ExamItem {
    id: string;
    courseId: string;
    title: string;
    examDate: string; // YYYY-MM-DD
    isPast: boolean;
    score?: string;
}

export interface ResourceItem {
    id: string;
    courseId: string;
    title: string;
    urlOrPath: string;
    type: 'link' | 'book' | 'pdf' | 'doc';
}

export interface SubjectNoteItem {
    id: string;
    courseId: string;
    title: string;
    filePath: string;
    createdAt: string;
}

export interface MiniTodo {
    id: string;
    text: string;
    completed: boolean;
    createdAt?: string;
}

export interface ReminderItem {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    completed: boolean;
}

export interface TaskItem {
    id: string;
    text: string;
    courseId?: string; // empty if unrelated
    priority: 'High' | 'Medium' | 'Low';
    date: string; // YYYY-MM-DD
    status: 'Not Started' | 'In Progress' | 'Completed';
    completed: boolean;
}

export interface TimetableSlot {
    courseId: string;
    customName?: string;
    room?: string;
}

export interface TimetableRow {
    time: string;
    days: (TimetableSlot | null)[]; // 5 days (Mon-Fri)
}

export interface LifeBalanceData {
    labels: string[];
    values: number[]; // 0 to 10
}

export interface PomodoroSettings {
    workMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    soundEnabled: boolean;
    completedSessions: number;
}

export interface StudyHubData {
    courses: Course[];
    assignments: AssignmentItem[];
    exams: ExamItem[];
    resources: ResourceItem[];
    notes: SubjectNoteItem[];
    miniTodos: MiniTodo[];
    reminders: ReminderItem[];
    tasks: TaskItem[];
    timetable: TimetableRow[];
    lifeBalance: LifeBalanceData;
    pomodoro: PomodoroSettings;
    rpg?: RpgDataState;
    flashcards?: FlashcardState;
    cgpa?: CgpaDataState;
    settings: {
        coursesFolder: string;
        assignmentsFolder: string;
        resourcesFolder: string;
        notesFolder: string;
        examsFolder: string;
    };
}
