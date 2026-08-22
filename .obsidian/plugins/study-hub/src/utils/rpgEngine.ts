import type { 
    RpgDataState, 
    CourseSkillTree, 
    VoucherReward, 
    FocusBuff, 
    RaidBoss, 
    QuestItem, 
    DungeonState 
} from '../types/rpg';
import { formatDateIso } from './dateUtils';

export const LEVEL_THRESHOLDS = [
    0,     // Lv 1
    200,   // Lv 2
    500,   // Lv 3
    900,   // Lv 4
    1400,  // Lv 5
    2000,  // Lv 6
    2800,  // Lv 7
    3800,  // Lv 8
    5000,  // Lv 9
    6500,  // Lv 10
    8500,  // Lv 11
    11000, // Lv 12
    14000, // Lv 13
    18000, // Lv 14
    23000, // Lv 15
    30000  // Lv 16+
];

export function calculateLevelInfo(totalXp: number): { 
    level: number; 
    currentLevelXp: number; 
    xpForNextLevel: number; 
    progressPercent: number 
} {
    let level = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (totalXp >= LEVEL_THRESHOLDS[i]) {
            level = i + 1;
        } else {
            break;
        }
    }

    const currentBaseXp = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextBaseXp = LEVEL_THRESHOLDS[level] || (currentBaseXp + 5000);
    const currentLevelXp = Math.max(0, totalXp - currentBaseXp);
    const xpForNextLevel = Math.max(1, nextBaseXp - currentBaseXp);
    const progressPercent = Math.min(100, Math.floor((currentLevelXp / xpForNextLevel) * 100));

    return { level, currentLevelXp, xpForNextLevel, progressPercent };
}

export function getPlayerTitle(level: number): string {
    if (level >= 15) return 'Grandmaster Polymath 🌌';
    if (level >= 12) return 'Omniscient Luminary ⚡';
    if (level >= 10) return 'Cyberpunk Archmage 🔮';
    if (level >= 8) return 'Algorithm Knight ⚔️';
    if (level >= 6) return 'Code Artisan 🛠️';
    if (level >= 4) return 'Knowledge Seeker 📜';
    if (level >= 2) return 'Disciplined Initiate 🎯';
    return 'Freshman Scholar 🎓';
}

export function getCourseTitle(courseTitle: string, level: number): string {
    const name = courseTitle.toLowerCase();
    if (name.includes('data structure') || name.includes('ds') || name.includes('dsa')) {
        if (level >= 10) return 'Pointer Paladin';
        if (level >= 7) return 'Tree Master';
        if (level >= 5) return 'Recursion Ranger';
        if (level >= 3) return 'Array Adept';
        return 'Big-O Novice';
    }
    if (name.includes('oop') || name.includes('object')) {
        if (level >= 10) return 'Architecture Architect';
        if (level >= 7) return 'Polymorph Mage';
        if (level >= 5) return 'Inheritance Knight';
        if (level >= 3) return 'Encapsulator';
        return 'Class Apprentice';
    }
    if (name.includes('math')) {
        if (level >= 10) return 'Pure Math Titan';
        if (level >= 7) return 'Differential Druid';
        if (level >= 5) return 'Matrix Manipulator';
        if (level >= 3) return 'Calculus Warrior';
        return 'Number Scribe';
    }
    if (name.includes('computer') || name.includes('cs') || name.includes('software')) {
        if (level >= 10) return 'Systems Overlord';
        if (level >= 7) return 'Protocol Pilot';
        if (level >= 5) return 'Thread Weaver';
        if (level >= 3) return 'Kernel Voyager';
        return 'Terminal Initiate';
    }
    if (level >= 10) return 'Grand Scholar';
    if (level >= 5) return 'Subject Expert';
    return 'Subject Explorer';
}

export function getDefaultVouchers(): VoucherReward[] {
    return [
        {
            id: 'v1',
            title: '1 Hour of Gaming',
            icon: 'Gamepad2',
            cost: 500,
            category: 'entertainment',
            description: 'Guilt-free gaming session of your favorite game.'
        },
        {
            id: 'v2',
            title: 'Order a Delicious Pizza / Meal',
            icon: 'Pizza',
            cost: 1500,
            category: 'food',
            description: 'Treat yourself to your favorite takeout meal or pizza.'
        },
        {
            id: 'v3',
            title: 'Watch an Episode / Movie',
            icon: 'Film',
            cost: 300,
            category: 'entertainment',
            description: 'Sit back and enjoy a new movie or anime/series episode.'
        },
        {
            id: 'v4',
            title: '30-Minute Power Nap',
            icon: 'Moon',
            cost: 200,
            category: 'rest',
            description: 'Recharge your energy with a deep, uninterrupted nap.'
        },
        {
            id: 'v5',
            title: 'Coffee / Boba Milk Tea',
            icon: 'Coffee',
            cost: 250,
            category: 'food',
            description: 'Grab a specialty coffee, matcha, or boba tea.'
        }
    ];
}

export function getDefaultBuffs(): FocusBuff[] {
    return [
        {
            id: 'buff-espresso',
            name: 'Double Espresso Buff',
            icon: 'Coffee',
            description: '+50% XP earned from all Pomodoro study sessions.',
            unlockLevel: 4,
            isActive: false
        },
        {
            id: 'buff-shield',
            name: 'Streak Shield',
            icon: 'ShieldCheck',
            description: 'Preserves your study streak even if you miss a day.',
            unlockLevel: 8,
            isActive: true
        },
        {
            id: 'buff-dilation',
            name: 'Time Dilation & Cyber Aura',
            icon: 'Zap',
            description: 'Provides +25% bonus Gold Coins on all completed items.',
            unlockLevel: 12,
            isActive: false
        }
    ];
}

export function getDefaultBosses(): RaidBoss[] {
    const today = new Date();
    const addDays = (days: number) => {
        const d = new Date(today);
        d.setDate(today.getDate() + days);
        return formatDateIso(d);
    };

    return [
        {
            id: 'boss-dsa',
            title: 'The Big-O Hydra',
            subtitle: 'Complexity Sovereign of Algorithms',
            courseId: 'ds',
            maxHp: 600,
            currentHp: 600,
            deadlineDate: addDays(7),
            rewardXp: 1200,
            rewardCoins: 450,
            isDefeated: false,
            bossType: 'hydra'
        },
        {
            id: 'boss-oop',
            title: 'The Compiler Dragon',
            subtitle: 'Ancient Scourge of Architecture',
            courseId: 'oop',
            maxHp: 800,
            currentHp: 800,
            deadlineDate: addDays(14),
            rewardXp: 1600,
            rewardCoins: 600,
            isDefeated: false,
            bossType: 'dragon'
        },
        {
            id: 'boss-math',
            title: 'The Matrix Colossus',
            subtitle: 'Unyielding Sentinel of Linear Algebra',
            courseId: 'math',
            maxHp: 750,
            currentHp: 750,
            deadlineDate: addDays(21),
            rewardXp: 1500,
            rewardCoins: 550,
            isDefeated: false,
            bossType: 'golem'
        },
        {
            id: 'boss-cs-deadlock',
            title: 'The Deadlock Demon',
            subtitle: 'Lord of Race Conditions & Mutexes',
            courseId: 'cs',
            maxHp: 900,
            currentHp: 900,
            deadlineDate: addDays(28),
            rewardXp: 1800,
            rewardCoins: 700,
            isDefeated: false,
            bossType: 'demon'
        },
        {
            id: 'boss-software-segfault',
            title: 'The Segfault Reaper',
            subtitle: 'Phantom of Null Pointers & Stack Smashing',
            courseId: 'software',
            maxHp: 850,
            currentHp: 850,
            deadlineDate: addDays(35),
            rewardXp: 1700,
            rewardCoins: 650,
            isDefeated: false,
            bossType: 'reaper'
        },
        {
            id: 'boss-kraken-distributed',
            title: 'The Distributed Kraken',
            subtitle: 'Terror of Consensus & Network Partitions',
            courseId: 'cs',
            maxHp: 1000,
            currentHp: 1000,
            deadlineDate: addDays(42),
            rewardXp: 2000,
            rewardCoins: 800,
            isDefeated: false,
            bossType: 'kraken'
        },
        {
            id: 'boss-turing-wizard',
            title: 'The Turing Archmage',
            subtitle: 'Master of Undecidability & Automata',
            courseId: 'cs',
            maxHp: 1100,
            currentHp: 1100,
            deadlineDate: addDays(49),
            rewardXp: 2200,
            rewardCoins: 850,
            isDefeated: false,
            bossType: 'wizard'
        },
        {
            id: 'boss-gradient-cyborg',
            title: 'The Gradient Overlord',
            subtitle: 'Titan of Optimization & Neural Drift',
            courseId: 'cs',
            maxHp: 1200,
            currentHp: 1200,
            deadlineDate: addDays(56),
            rewardXp: 2400,
            rewardCoins: 950,
            isDefeated: false,
            bossType: 'cyborg'
        },
        {
            id: 'boss-acid-titan',
            title: 'The Acid Transaction Titan',
            subtitle: 'Keeper of Relational Isolation & Locks',
            courseId: 'software',
            maxHp: 950,
            currentHp: 950,
            deadlineDate: addDays(63),
            rewardXp: 1900,
            rewardCoins: 750,
            isDefeated: false,
            bossType: 'titan'
        },
        {
            id: 'boss-kernel-phoenix',
            title: 'The Kernel Phoenix',
            subtitle: 'Reborn Through Infinite Bootloops',
            courseId: 'cs',
            maxHp: 1050,
            currentHp: 1050,
            deadlineDate: addDays(70),
            rewardXp: 2100,
            rewardCoins: 800,
            isDefeated: false,
            bossType: 'phoenix'
        },
        {
            id: 'boss-quantum-lich',
            title: 'The Quantum Lich',
            subtitle: "Weaver of Superposition & Shor's Algorithm",
            courseId: 'math',
            maxHp: 1300,
            currentHp: 1300,
            deadlineDate: addDays(77),
            rewardXp: 2600,
            rewardCoins: 1000,
            isDefeated: false,
            bossType: 'lich'
        },
        {
            id: 'boss-cerberus-cache',
            title: 'The Cache Invalidation Cerberus',
            subtitle: 'Hound of Multithreaded Chaos',
            courseId: 'software',
            maxHp: 1150,
            currentHp: 1150,
            deadlineDate: addDays(84),
            rewardXp: 2300,
            rewardCoins: 900,
            isDefeated: false,
            bossType: 'cerberus'
        },
        {
            id: 'boss-asymptotic-chimera',
            title: 'The Asymptotic Chimera',
            subtitle: 'Amalgam of NP-Complete Reductions',
            courseId: 'ds',
            maxHp: 1400,
            currentHp: 1400,
            deadlineDate: addDays(91),
            rewardXp: 2800,
            rewardCoins: 1100,
            isDefeated: false,
            bossType: 'chimera'
        },
        {
            id: 'boss-crypto-behemoth',
            title: 'The Cryptographic Behemoth',
            subtitle: 'Guardian of Elliptic Curves & ZK-Proofs',
            courseId: 'cs',
            maxHp: 1500,
            currentHp: 1500,
            deadlineDate: addDays(98),
            rewardXp: 3000,
            rewardCoins: 1200,
            isDefeated: false,
            bossType: 'beast'
        },
        {
            id: 'boss-semester-leviathan',
            title: 'The Capstone Leviathan',
            subtitle: 'The Ultimate Final Sovereign of All Courses',
            maxHp: 2000,
            currentHp: 2000,
            deadlineDate: addDays(105),
            rewardXp: 4000,
            rewardCoins: 1600,
            isDefeated: false,
            bossType: 'dragon'
        }
    ];
}

// ----------------------------------------------------
// 📜 MASSIVE MASTER QUEST CATALOG & DAILY SEED ENGINE
// ----------------------------------------------------

export interface QuestTemplate {
    templateId: string;
    title: string;
    description: string;
    category: 'pomodoro' | 'todo' | 'note' | 'concept' | 'streak' | 'assignment' | 'flashcard' | 'duel' | 'cgpa' | 'general';
    type: 'daily' | 'weekly';
    targetCount: number;
    rewardXp: number;
    rewardCoins: number;
    icon?: string;
}

export const MASTER_QUEST_POOL: QuestTemplate[] = [
    // --- 🍅 FOCUS & DEEP WORK (POMODORO) ---
    {
        templateId: 'pomo_1',
        title: "Scholar's Focus",
        description: "Complete at least 1 Pomodoro focus session today.",
        category: 'pomodoro',
        type: 'daily',
        targetCount: 1,
        rewardXp: 80,
        rewardCoins: 40
    },
    {
        templateId: 'pomo_2',
        title: "Hyperfocus Mastery",
        description: "Complete 3 full Pomodoro focus rounds.",
        category: 'pomodoro',
        type: 'daily',
        targetCount: 3,
        rewardXp: 180,
        rewardCoins: 85
    },
    {
        templateId: 'pomo_3',
        title: "Deep Work Devotee",
        description: "Log 2 uninterrupted Pomodoro study intervals.",
        category: 'pomodoro',
        type: 'daily',
        targetCount: 2,
        rewardXp: 130,
        rewardCoins: 60
    },
    {
        templateId: 'pomo_4',
        title: "Midnight Coder Sprint",
        description: "Complete 1 dedicated focus session on technical coursework.",
        category: 'pomodoro',
        type: 'daily',
        targetCount: 1,
        rewardXp: 85,
        rewardCoins: 40
    },
    {
        templateId: 'pomo_5',
        title: "Endurance Protocol",
        description: "Complete 4 Pomodoro focus sessions throughout the day.",
        category: 'pomodoro',
        type: 'daily',
        targetCount: 4,
        rewardXp: 240,
        rewardCoins: 110
    },
    {
        templateId: 'pomo_6',
        title: "Zen State of Mind",
        description: "Complete 2 clean Pomodoro blocks with zero distractions.",
        category: 'pomodoro',
        type: 'daily',
        targetCount: 2,
        rewardXp: 140,
        rewardCoins: 65
    },
    {
        templateId: 'pomo_7',
        title: "Cognitive Sprint",
        description: "Lock in and finish 1 intense 25-minute Pomodoro block.",
        category: 'pomodoro',
        type: 'daily',
        targetCount: 1,
        rewardXp: 75,
        rewardCoins: 35
    },
    {
        templateId: 'pomo_8',
        title: "The Focused Mind",
        description: "Log at least 3 Pomodoro sessions across any subject.",
        category: 'pomodoro',
        type: 'daily',
        targetCount: 3,
        rewardXp: 190,
        rewardCoins: 90
    },

    // --- ⚡ TASKS, MINI-TODOS & ORGANIZATION ---
    {
        templateId: 'todo_1',
        title: "Bug Squasher",
        description: "Check off 2 quick mini-todos or task manager items.",
        category: 'todo',
        type: 'daily',
        targetCount: 2,
        rewardXp: 65,
        rewardCoins: 30
    },
    {
        templateId: 'todo_2',
        title: "Clean Desk Protocol",
        description: "Complete 3 items in your task manager or mini to-do list.",
        category: 'todo',
        type: 'daily',
        targetCount: 3,
        rewardXp: 95,
        rewardCoins: 45
    },
    {
        templateId: 'todo_3',
        title: "Sprint Backlog Zero",
        description: "Check off 4 pending tasks or mini-todos.",
        category: 'todo',
        type: 'daily',
        targetCount: 4,
        rewardXp: 130,
        rewardCoins: 65
    },
    {
        templateId: 'todo_4',
        title: "Agile Standup",
        description: "Knock out your top 2 priority tasks for today.",
        category: 'todo',
        type: 'daily',
        targetCount: 2,
        rewardXp: 75,
        rewardCoins: 35
    },
    {
        templateId: 'todo_5',
        title: "Checklist Crusher",
        description: "Complete 3 quick actionable items across your courses.",
        category: 'todo',
        type: 'daily',
        targetCount: 3,
        rewardXp: 90,
        rewardCoins: 40
    },
    {
        templateId: 'todo_6',
        title: "Productivity Surge",
        description: "Finish 5 tasks or mini-todos today.",
        category: 'todo',
        type: 'daily',
        targetCount: 5,
        rewardXp: 160,
        rewardCoins: 75
    },
    {
        templateId: 'todo_7',
        title: "Efficiency Engine",
        description: "Mark 2 tasks completed in your task manager.",
        category: 'todo',
        type: 'daily',
        targetCount: 2,
        rewardXp: 70,
        rewardCoins: 35
    },
    {
        templateId: 'todo_8',
        title: "Daily Task Sweep",
        description: "Sweep and complete 3 pending todo items.",
        category: 'todo',
        type: 'daily',
        targetCount: 3,
        rewardXp: 85,
        rewardCoins: 40
    },

    // --- 📚 NOTES, LECTURE CODEX & KNOWLEDGE SCRIBING ---
    {
        templateId: 'note_1',
        title: "Knowledge Scribe",
        description: "Create or review a course lecture note in Obsidian.",
        category: 'note',
        type: 'daily',
        targetCount: 1,
        rewardXp: 75,
        rewardCoins: 35
    },
    {
        templateId: 'note_2',
        title: "Algorithm Codex",
        description: "Document or expand 2 technical notes on your courses.",
        category: 'note',
        type: 'daily',
        targetCount: 2,
        rewardXp: 130,
        rewardCoins: 60
    },
    {
        templateId: 'note_3',
        title: "Digital Grimoire",
        description: "Write or update 1 lecture note with key code concepts.",
        category: 'note',
        type: 'daily',
        targetCount: 1,
        rewardXp: 80,
        rewardCoins: 40
    },
    {
        templateId: 'note_4',
        title: "Summary Architect",
        description: "Synthesize 2 course notes into high-yield summaries.",
        category: 'note',
        type: 'daily',
        targetCount: 2,
        rewardXp: 135,
        rewardCoins: 65
    },
    {
        templateId: 'note_5',
        title: "Active Recall Scribe",
        description: "Create 1 new subject note testing your recall of concepts.",
        category: 'note',
        type: 'daily',
        targetCount: 1,
        rewardXp: 85,
        rewardCoins: 40
    },
    {
        templateId: 'note_6',
        title: "Vault Scholar",
        description: "Add or review 3 course notes in your academic vault.",
        category: 'note',
        type: 'daily',
        targetCount: 3,
        rewardXp: 170,
        rewardCoins: 80
    },
    {
        templateId: 'note_7',
        title: "Theory Breakdown",
        description: "Break down 1 complex engineering concept into structured notes.",
        category: 'note',
        type: 'daily',
        targetCount: 1,
        rewardXp: 90,
        rewardCoins: 45
    },

    // --- 🧠 FLASHCARDS, ACTIVE RECALL & SPEED DUELS ---
    {
        templateId: 'fc_1',
        title: "Flashcard Gladiator",
        description: "Review 4 active recall flashcards in the Flashcard Arena.",
        category: 'flashcard',
        type: 'daily',
        targetCount: 4,
        rewardXp: 85,
        rewardCoins: 40
    },
    {
        templateId: 'fc_2',
        title: "Speed Duel Champion",
        description: "Win 1 Speed Duel against an academic quiz monster.",
        category: 'duel',
        type: 'daily',
        targetCount: 1,
        rewardXp: 110,
        rewardCoins: 50
    },
    {
        templateId: 'fc_3',
        title: "Memory Palace Drill",
        description: "Complete 6 Spaced Repetition flashcard reviews.",
        category: 'flashcard',
        type: 'daily',
        targetCount: 6,
        rewardXp: 120,
        rewardCoins: 55
    },
    {
        templateId: 'fc_4',
        title: "Arena Duelist",
        description: "Slay 2 quiz monsters in 60-second Speed Duels.",
        category: 'duel',
        type: 'daily',
        targetCount: 2,
        rewardXp: 160,
        rewardCoins: 75
    },
    {
        templateId: 'fc_5',
        title: "Deck Builder",
        description: "Create 1 new active recall flashcard for your syllabus.",
        category: 'flashcard',
        type: 'daily',
        targetCount: 1,
        rewardXp: 70,
        rewardCoins: 35
    },
    {
        templateId: 'fc_6',
        title: "Flawless Recall",
        description: "Review 5 flashcards with High (Good/Easy) ratings.",
        category: 'flashcard',
        type: 'daily',
        targetCount: 5,
        rewardXp: 105,
        rewardCoins: 50
    },
    {
        templateId: 'fc_7',
        title: "Boss Slayer Training",
        description: "Win 1 Flashcard Duel and review 3 cards.",
        category: 'duel',
        type: 'daily',
        targetCount: 1,
        rewardXp: 115,
        rewardCoins: 55
    },

    // --- ✨ 3D CONCEPT MAPS & NEURAL GRAPH ---
    {
        templateId: 'concept_1',
        title: "Neural Navigator",
        description: "Explore or add 1 concept node in the 3D Concept Map.",
        category: 'concept',
        type: 'daily',
        targetCount: 1,
        rewardXp: 75,
        rewardCoins: 35
    },
    {
        templateId: 'concept_2',
        title: "Graph Synthesizer",
        description: "Link 2 concept nodes together in the 3D course space.",
        category: 'concept',
        type: 'daily',
        targetCount: 2,
        rewardXp: 110,
        rewardCoins: 50
    },
    {
        templateId: 'concept_3',
        title: "Concept Cartographer",
        description: "Open and examine the 3D Knowledge Graph for any subject.",
        category: 'concept',
        type: 'daily',
        targetCount: 1,
        rewardXp: 65,
        rewardCoins: 30
    },
    {
        templateId: 'concept_4',
        title: "Mind Map Architect",
        description: "Master 2 concept connections in your visual graph.",
        category: 'concept',
        type: 'daily',
        targetCount: 2,
        rewardXp: 125,
        rewardCoins: 60
    },

    // --- 📝 COURSEWORK, LABS & ASSIGNMENTS ---
    {
        templateId: 'assign_1',
        title: "Assignment Striker",
        description: "Check off 1 completed assignment or problem set.",
        category: 'assignment',
        type: 'daily',
        targetCount: 1,
        rewardXp: 120,
        rewardCoins: 55
    },
    {
        templateId: 'assign_2',
        title: "Double Lab Strike",
        description: "Complete 2 assignments or practical lab exercises.",
        category: 'assignment',
        type: 'daily',
        targetCount: 2,
        rewardXp: 220,
        rewardCoins: 100
    },
    {
        templateId: 'assign_3',
        title: "Deadline Dominator",
        description: "Submit or finish 1 pending coursework assignment.",
        category: 'assignment',
        type: 'daily',
        targetCount: 1,
        rewardXp: 125,
        rewardCoins: 60
    },
    {
        templateId: 'assign_4',
        title: "Lab Manual Complete",
        description: "Complete 1 practical code lab or homework item.",
        category: 'assignment',
        type: 'daily',
        targetCount: 1,
        rewardXp: 130,
        rewardCoins: 60
    },

    // --- 📊 STRATEGY, CGPA & PLANNING ---
    {
        templateId: 'cgpa_1',
        title: "CGPA Strategist",
        description: "Simulate your CIE/SEE target marks in CGPA Orbit.",
        category: 'cgpa',
        type: 'daily',
        targetCount: 1,
        rewardXp: 75,
        rewardCoins: 35
    },
    {
        templateId: 'cgpa_2',
        title: "Academic Architect",
        description: "Check timetable and calculate semester score requirements.",
        category: 'cgpa',
        type: 'daily',
        targetCount: 1,
        rewardXp: 70,
        rewardCoins: 35
    }
];

// --- 👑 WEEKLY EPIC BOUNTIES ---
export const WEEKLY_BOUNTY_POOL: QuestTemplate[] = [
    {
        templateId: 'weekly_streak',
        title: "Archmage's Consistency",
        description: "Maintain an active 3+ day study streak.",
        category: 'streak',
        type: 'weekly',
        targetCount: 3,
        rewardXp: 250,
        rewardCoins: 120
    },
    {
        templateId: 'weekly_pomo_titan',
        title: "Titan of Deep Work",
        description: "Log 6 Pomodoro focus sessions this week.",
        category: 'pomodoro',
        type: 'weekly',
        targetCount: 6,
        rewardXp: 350,
        rewardCoins: 160
    },
    {
        templateId: 'weekly_tasks_century',
        title: "Centurion of Tasks",
        description: "Complete 8 tasks or mini-todos across the week.",
        category: 'todo',
        type: 'weekly',
        targetCount: 8,
        rewardXp: 300,
        rewardCoins: 140
    },
    {
        templateId: 'weekly_arena_legend',
        title: "Arena Grand Champion",
        description: "Win 4 Speed Duels in the Flashcard Arena.",
        category: 'duel',
        type: 'weekly',
        targetCount: 4,
        rewardXp: 320,
        rewardCoins: 150
    },
    {
        templateId: 'weekly_codex_master',
        title: "Codex of Alexandria",
        description: "Write or update 5 lecture notes in Obsidian.",
        category: 'note',
        type: 'weekly',
        targetCount: 5,
        rewardXp: 310,
        rewardCoins: 145
    },
    {
        templateId: 'weekly_course_striker',
        title: "Semester Juggernaut",
        description: "Clear 3 coursework assignments or practical labs.",
        category: 'assignment',
        type: 'weekly',
        targetCount: 3,
        rewardXp: 380,
        rewardCoins: 180
    },
    {
        templateId: 'weekly_five_day_streak',
        title: "Unbroken Resolve",
        description: "Maintain an unbroken 5-day study streak.",
        category: 'streak',
        type: 'weekly',
        targetCount: 5,
        rewardXp: 450,
        rewardCoins: 220
    }
];

function hashString(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function pseudoRandom(seed: number): () => number {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

/**
 * Generates 4 curated daily quests from diverse categories + 1 weekly bounty
 * deterministically seeded by dateStr (or custom seed on manual reroll).
 */
export function generateDailyQuests(dateStr: string, seedOffset: number = 0): QuestItem[] {
    const seed = hashString(dateStr) + seedOffset;
    const rng = pseudoRandom(seed);

    // Group master templates by category slots for a balanced 4-quest daily set:
    // Slot 1: Focus (pomodoro)
    // Slot 2: Tasks/Todos (todo)
    // Slot 3: Notes / Flashcards / Duels (note | flashcard | duel)
    // Slot 4: Assignments / Concepts / Strategy (assignment | concept | cgpa)
    const focusPool = MASTER_QUEST_POOL.filter(q => q.category === 'pomodoro');
    const todoPool = MASTER_QUEST_POOL.filter(q => q.category === 'todo');
    const studyPool = MASTER_QUEST_POOL.filter(q => ['note', 'flashcard', 'duel'].includes(q.category));
    const challengePool = MASTER_QUEST_POOL.filter(q => ['assignment', 'concept', 'cgpa', 'flashcard', 'duel', 'note'].includes(q.category));

    function pickOne(pool: QuestTemplate[]): QuestTemplate {
        const idx = Math.floor(rng() * pool.length);
        return pool[idx] || pool[0];
    }

    const t1 = pickOne(focusPool);
    const t2 = pickOne(todoPool);
    let t3 = pickOne(studyPool);
    while (t3.templateId === t1.templateId || t3.templateId === t2.templateId) {
        t3 = pickOne(studyPool);
    }
    let t4 = pickOne(challengePool);
    while (t4.templateId === t1.templateId || t4.templateId === t2.templateId || t4.templateId === t3.templateId) {
        t4 = pickOne(challengePool);
    }

    // Weekly bounty selection seeded by ISO week
    const weeklyIdx = Math.floor(rng() * WEEKLY_BOUNTY_POOL.length);
    const weeklyTemplate = WEEKLY_BOUNTY_POOL[weeklyIdx] || WEEKLY_BOUNTY_POOL[0];

    const makeQuestItem = (t: QuestTemplate, suffix: string): QuestItem => ({
        id: `q-${t.templateId}-${suffix}`,
        title: t.title,
        description: t.description,
        type: t.type,
        targetCount: t.targetCount,
        currentCount: 0,
        rewardXp: t.rewardXp,
        rewardCoins: t.rewardCoins,
        isClaimed: false,
        category: t.category
    });

    const suffix = seedOffset > 0 ? `${dateStr}_r${seedOffset}` : dateStr;

    return [
        makeQuestItem(t1, suffix),
        makeQuestItem(t2, suffix),
        makeQuestItem(t3, suffix),
        makeQuestItem(t4, suffix),
        makeQuestItem(weeklyTemplate, suffix)
    ];
}

export function createInitialRpgState(): RpgDataState {
    const todayIso = formatDateIso(new Date());
    return {
        level: 1,
        totalXp: 0,
        coins: 150, // Starting gift
        currentTitle: 'Freshman Scholar 🎓',
        streakDays: 1,
        lastActiveDate: todayIso,
        streakShields: 1,
        comboMultiplier: 1.0,
        lastActionTimestamp: Date.now(),
        courseSkills: {},
        vouchers: getDefaultVouchers(),
        inventory: [],
        buffs: getDefaultBuffs(),
        activeBosses: getDefaultBosses(),
        quests: generateDailyQuests(todayIso),
        dungeon: {
            active: false,
            dungeonName: 'The Pointer Ruins',
            floor: 1,
            totalFloors: 4,
            bossHp: 100,
            maxBossHp: 100
        }
    };
}

