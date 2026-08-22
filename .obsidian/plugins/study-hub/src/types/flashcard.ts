export type Sm2Rating = 0 | 1 | 2 | 3; // 0: Again, 1: Hard, 2: Good, 3: Easy

export interface Flashcard {
    id: string;
    courseId: string;
    courseTitle: string;
    question: string;
    answer: string;
    options?: string[]; // For Speed Duel multiple choice
    correctOptionIndex?: number;
    sourceFilePath?: string;
    
    // SM-2 Spaced Repetition Parameters
    repetitions: number;
    interval: number; // in days
    easeFactor: number; // default 2.5
    nextReviewDate: string; // ISO YYYY-MM-DD
    lastReviewedAt?: string;
}

export interface SpeedDuelMonster {
    id: string;
    name: string;
    title: string;
    icon: string; // emoji or icon
    maxHp: number;
    currentHp: number;
    rewardXp: number;
    rewardCoins: number;
    timeLimitSeconds: number;
}

export interface FlashcardState {
    cards: Flashcard[];
    lastDuelMonsterId?: string;
    totalDuelsWon: number;
    totalCardsReviewed: number;
}
