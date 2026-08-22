import type { Flashcard, SpeedDuelMonster } from '../types/flashcard';
import { formatDateIso } from './dateUtils';
import type { App } from 'obsidian';

const today = formatDateIso(new Date());

export const DEFAULT_SPEED_MONSTERS: SpeedDuelMonster[] = [
    {
        id: 'monster-glitch',
        name: 'Glitch Goblin',
        title: 'Imp of Null Pointer Exceptions',
        icon: '👾',
        maxHp: 100,
        currentHp: 100,
        rewardXp: 150,
        rewardCoins: 50,
        timeLimitSeconds: 60
    },
    {
        id: 'monster-segfault',
        name: 'Segmentation Fault Daemon',
        title: 'Terror of Unallocated Memory',
        icon: '👹',
        maxHp: 160,
        currentHp: 160,
        rewardXp: 240,
        rewardCoins: 80,
        timeLimitSeconds: 60
    },
    {
        id: 'monster-recursion',
        name: 'Recursion Spectre',
        title: 'Haunter of the Call Stack',
        icon: '👻',
        maxHp: 130,
        currentHp: 130,
        rewardXp: 200,
        rewardCoins: 65,
        timeLimitSeconds: 60
    },
    {
        id: 'monster-matrix',
        name: 'Eigenvector Golem',
        title: 'Colossus of Linear Algebra',
        icon: '🗿',
        maxHp: 200,
        currentHp: 200,
        rewardXp: 300,
        rewardCoins: 110,
        timeLimitSeconds: 60
    }
];

export const PRESEEDED_FLASHCARDS: Flashcard[] = [
    // DSA
    {
        id: 'fc-dsa-1',
        courseId: 'ds',
        courseTitle: 'Data Structure',
        question: 'What is the average and worst-case time complexity of QuickSort?',
        answer: 'Average: O(n log n), Worst-case: O(n²) when the pivot chosen is consistently the smallest or largest element.',
        options: ['O(n log n) and O(n²)', 'O(n) and O(n log n)', 'O(1) and O(n)', 'O(n²) and O(n³)'],
        correctOptionIndex: 0,
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        nextReviewDate: today
    },
    {
        id: 'fc-dsa-2',
        courseId: 'ds',
        courseTitle: 'Data Structure',
        question: 'In a Binary Search Tree (BST), what traversal yields elements in sorted ascending order?',
        answer: 'In-order traversal (Left -> Root -> Right).',
        options: ['In-order Traversal', 'Pre-order Traversal', 'Post-order Traversal', 'Level-order Traversal'],
        correctOptionIndex: 0,
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        nextReviewDate: today
    },
    {
        id: 'fc-dsa-3',
        courseId: 'ds',
        courseTitle: 'Data Structure',
        question: 'Which algorithm finds the Shortest Path in a weighted graph with non-negative edge weights?',
        answer: 'Dijkstra\'s Algorithm using a Min-Priority Queue with O((V + E) log V) time.',
        options: ['Dijkstra\'s Algorithm', 'Kruskal\'s Algorithm', 'Floyd-Warshall', 'Tarjan\'s Algorithm'],
        correctOptionIndex: 0,
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        nextReviewDate: today
    },
    {
        id: 'fc-dsa-4',
        courseId: 'ds',
        courseTitle: 'Data Structure',
        question: 'What is the maximum number of children an AVL tree node can balance with height difference |h_L - h_R|?',
        answer: 'The balance factor must be at most 1 (i.e. -1, 0, or +1).',
        options: ['At most 1', 'At most 2', 'At most 3', 'Unlimited'],
        correctOptionIndex: 0,
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        nextReviewDate: today
    },

    // OOP
    {
        id: 'fc-oop-1',
        courseId: 'oop',
        courseTitle: 'OOP',
        question: 'What OOP mechanism allows a derived class to provide a specific implementation of a method declared in its base class?',
        answer: 'Method Overriding (Dynamic/Runtime Polymorphism via virtual methods and vtables).',
        options: ['Method Overriding', 'Method Overloading', 'Encapsulation', 'Static Binding'],
        correctOptionIndex: 0,
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        nextReviewDate: today
    },
    {
        id: 'fc-oop-2',
        courseId: 'oop',
        courseTitle: 'OOP',
        question: 'What does the "L" in SOLID design principles stand for?',
        answer: 'Liskov Substitution Principle (Objects of a superclass should be replaceable with objects of a subclass without breaking behavior).',
        options: ['Liskov Substitution', 'Linear Inheritance', 'Layered Abstraction', 'Late Binding'],
        correctOptionIndex: 0,
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        nextReviewDate: today
    },
    {
        id: 'fc-oop-3',
        courseId: 'oop',
        courseTitle: 'OOP',
        question: 'In C++, what happens when a base class destructor is NOT declared virtual?',
        answer: 'Deleting a derived object through a base pointer causes Undefined Behavior and Memory Leaks.',
        options: ['Memory Leaks & Undefined Behavior', 'Compilation Error', 'Automatic garbage collection', 'Stack overflow'],
        correctOptionIndex: 0,
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        nextReviewDate: today
    },

    // Mathematics
    {
        id: 'fc-math-1',
        courseId: 'math',
        courseTitle: 'Mathematics',
        question: 'What is the condition for a square matrix A to be invertible (non-singular)?',
        answer: 'The determinant det(A) must be non-zero (det(A) ≠ 0).',
        options: ['det(A) ≠ 0', 'det(A) = 0', 'Trace(A) > 0', 'Rank(A) = 0'],
        correctOptionIndex: 0,
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        nextReviewDate: today
    },
    {
        id: 'fc-math-2',
        courseId: 'math',
        courseTitle: 'Mathematics',
        question: 'According to Taylor\'s Theorem, what is the first derivative term of f(x) expanded around a?',
        answer: 'f\'(a) * (x - a)',
        options: ['f\'(a) * (x - a)', 'f\'\'(a) * (x - a)²', 'f(a) / x', 'f\'(x) * a'],
        correctOptionIndex: 0,
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        nextReviewDate: today
    },

    // Computer Science / Systems
    {
        id: 'fc-cs-1',
        courseId: 'cs',
        courseTitle: 'Computer Science',
        question: 'What are the 4 necessary conditions for a Deadlock in operating systems?',
        answer: 'Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait (Coffman Conditions).',
        options: ['Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait', 'Paging, Segmentation, Swapping, Thrashing', 'Atomic, Consistent, Isolated, Durable', 'Fetch, Decode, Execute, Writeback'],
        correctOptionIndex: 0,
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        nextReviewDate: today
    },
    {
        id: 'fc-cs-2',
        courseId: 'cs',
        courseTitle: 'Computer Science',
        question: 'What is the primary difference between a Process and a Thread?',
        answer: 'Processes have independent virtual address spaces; Threads share the address space, heap, and open files of their parent process.',
        options: ['Threads share memory address space; Processes do not', 'Processes run on GPU; Threads on CPU', 'Threads cannot be preempted', 'Processes have no stack'],
        correctOptionIndex: 0,
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        nextReviewDate: today
    }
];

/**
 * Parses markdown note content looking for Q&A or Concept definitions
 */
export function extractFlashcardsFromMarkdown(content: string, courseId: string, courseTitle: string, filePath: string): Flashcard[] {
    const cards: Flashcard[] = [];
    const lines = content.split('\n');

    // Pattern 1: Q: question \n A: answer
    for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        const nextLine = lines[i + 1].trim();

        if (/^Q:\s*(.+)/i.test(line) && /^A:\s*(.+)/i.test(nextLine)) {
            const q = line.replace(/^Q:\s*/i, '').trim();
            const a = nextLine.replace(/^A:\s*/i, '').trim();
            if (q && a) {
                cards.push({
                    id: `fc-vault-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                    courseId,
                    courseTitle,
                    question: q,
                    answer: a,
                    sourceFilePath: filePath,
                    repetitions: 0,
                    interval: 0,
                    easeFactor: 2.5,
                    nextReviewDate: today
                });
            }
        }
    }

    // Pattern 2: **Term**: Definition
    const termDefRegex = /\*\*([^*]+)\*\*:\s*([^\n]+)/g;
    let match;
    while ((match = termDefRegex.exec(content)) !== null) {
        const term = match[1].trim();
        const def = match[2].trim();
        if (term && def && def.length > 8) {
            cards.push({
                id: `fc-vault-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                courseId,
                courseTitle,
                question: `What is **${term}**?`,
                answer: def,
                sourceFilePath: filePath,
                repetitions: 0,
                interval: 0,
                easeFactor: 2.5,
                nextReviewDate: today
            });
        }
    }

    return cards;
}
