import type { Flashcard, Sm2Rating } from '../types/flashcard';
import { formatDateIso } from './dateUtils';

/**
 * Calculates updated SM-2 parameters for a flashcard based on recall quality.
 * Quality ratings:
 * 0: Again (complete blackout)
 * 1: Hard (recalled with significant effort)
 * 2: Good (recalled with slight hesitation)
 * 3: Easy (instant perfect recall)
 */
export function processSm2Review(card: Flashcard, rating: Sm2Rating): Flashcard {
    let { repetitions = 0, interval = 0, easeFactor = 2.5 } = card;

    // Convert 0-3 rating to SM-2's traditional 0-5 scale for ease calculation
    const sm2Score = rating === 0 ? 1 : rating === 1 ? 3 : rating === 2 ? 4 : 5;

    // Update Ease Factor
    easeFactor = easeFactor + (0.1 - (5 - sm2Score) * (0.08 + (5 - sm2Score) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    if (rating < 2) {
        // Failed / Hard reset
        repetitions = 0;
        interval = 1;
    } else {
        // Successful recall
        if (repetitions === 0) {
            interval = 1;
        } else if (repetitions === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }
        repetitions += 1;

        if (rating === 3) {
            // Easy bonus
            interval = Math.round(interval * 1.2);
        }
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    return {
        ...card,
        repetitions,
        interval,
        easeFactor: Number(easeFactor.toFixed(2)),
        nextReviewDate: formatDateIso(nextDate),
        lastReviewedAt: formatDateIso(new Date())
    };
}
