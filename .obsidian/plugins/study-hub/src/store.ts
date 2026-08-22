import { writable, get } from 'svelte/store';
import type { Plugin } from 'obsidian';
import { Notice } from 'obsidian';
import type { 
    StudyHubData, 
    Course, 
    AssignmentItem, 
    ExamItem, 
    ResourceItem, 
    SubjectNoteItem, 
    MiniTodo, 
    ReminderItem, 
    TaskItem, 
    TimetableRow, 
    LifeBalanceData, 
    PomodoroSettings,
    RpgDataState,
    RedeemedVoucher,
    VoucherReward,
    Flashcard,
    Sm2Rating,
    SpeedDuelMonster,
    CourseGradeItem,
    PastSemesterRecord,
    CgpaDataState
} from './types';
import { formatDateIso } from './utils/dateUtils';
import { 
    createInitialRpgState, 
    calculateLevelInfo, 
    getPlayerTitle, 
    getCourseTitle, 
    generateDailyQuests 
} from './utils/rpgEngine';
import { processSm2Review } from './utils/sm2Engine';
import { PRESEEDED_FLASHCARDS, DEFAULT_SPEED_MONSTERS } from './utils/flashcardParser';
import { createDefaultCgpaState, calculateSemesterSgpa, calculateCumulativeCgpa, solveRequiredSeeScores } from './utils/cgpaEngine';
import { playChimeSound } from './utils/audio';

const todayIso = formatDateIso(new Date());

export const DEFAULT_DATA: StudyHubData = {
    courses: [
        { id: 'math', title: 'Mathematics', icon: 'Calculator', folderPath: '07 Notes/Courses/Mathematics' },
        { id: 'oop', title: 'OOP', icon: 'Code', folderPath: '07 Notes/Courses/OOP' },
        { id: 'ds', title: 'Data Structure', icon: 'Network', folderPath: '07 Notes/Courses/Data Structure' },
        { id: 'software', title: 'Software', icon: 'SquareTerminal', folderPath: '07 Notes/Courses/Software' },
        { id: 'cs', title: 'Computer Science', icon: 'Monitor', folderPath: '07 Notes/Courses/Computer Science' }
    ],
    assignments: [
        { id: 'a1', courseId: 'math', title: 'Calculus Problem Set 1', dueDate: todayIso, completed: true, priority: 'High' },
        { id: 'a2', courseId: 'oop', title: 'OOP Inheritance Lab', dueDate: todayIso, completed: true, priority: 'Medium' },
        { id: 'a3', courseId: 'oop', title: 'OOP Polymorphism Project', dueDate: todayIso, completed: false, priority: 'High' },
        { id: 'a4', courseId: 'ds', title: 'Binary Tree Traversal', dueDate: todayIso, completed: true, priority: 'High' },
        { id: 'a5', courseId: 'ds', title: 'Graph Shortest Path', dueDate: todayIso, completed: false, priority: 'Medium' },
        { id: 'a6', courseId: 'software', title: 'Software Architecture Diagram', dueDate: todayIso, completed: true, priority: 'Medium' },
        { id: 'a7', courseId: 'software', title: 'CI/CD Pipeline Setup', dueDate: todayIso, completed: true, priority: 'High' },
        { id: 'a8', courseId: 'software', title: 'Unit Testing Suite', dueDate: todayIso, completed: false, priority: 'Low' },
        { id: 'a9', courseId: 'cs', title: 'Update Project Documentation', dueDate: todayIso, completed: true, priority: 'High' },
        { id: 'a10', courseId: 'cs', title: 'Process Scheduling Algorithm', dueDate: todayIso, completed: false, priority: 'Medium' }
    ],
    exams: [
        { id: 'e1', courseId: 'math', title: 'Mathematics Midterm Exam', examDate: todayIso, isPast: false },
        { id: 'e2', courseId: 'oop', title: 'OOP Practical Exam', examDate: todayIso, isPast: false },
        { id: 'e3', courseId: 'cs', title: 'CS Theory Exam', examDate: todayIso, isPast: false }
    ],
    resources: [
        { id: 'r1', courseId: 'cs', title: 'Clean Code PDF', urlOrPath: 'https://github.com', type: 'book' },
        { id: 'r2', courseId: 'math', title: 'Calculus Early Transcendentals', urlOrPath: '', type: 'book' }
    ],
    notes: [
        { id: 'n1', courseId: 'cs', title: 'Operating Systems Overview', filePath: '07 Notes/Courses/Computer Science/OS.md', createdAt: todayIso }
    ],
    miniTodos: [
        { id: 't1', text: "Organize the desk", completed: false },
        { id: 't2', text: "Order protein supplements", completed: false },
        { id: 't3', text: "Buy Hyperfocus book", completed: false },
        { id: 't4', text: "Need highlighter for sketching", completed: false },
        { id: 't5', text: "Desk mat", completed: false }
    ],
    reminders: [
        { id: 'rem1', title: "Meetup with friends", date: todayIso, completed: false },
        { id: 'rem2', title: "Night out with friends", date: todayIso, completed: false },
        { id: 'rem3', title: "Jay's birthday", date: todayIso, completed: false }
    ],
    tasks: [
        { id: 'task1', text: "Update Project Documentation", courseId: "cs", priority: "High", date: todayIso, status: "In Progress", completed: false },
        { id: 'task2', text: "Schedule Team Building Event", courseId: "", priority: "Low", date: todayIso, status: "Not Started", completed: false },
        { id: 'task3', text: "Prepare Quarterly Report", courseId: "software", priority: "Medium", date: todayIso, status: "In Progress", completed: false },
        { id: 'task4', text: "Get Practical Review From Teacher", courseId: "math", priority: "High", date: todayIso, status: "Not Started", completed: false },
        { id: 'task5', text: "Finish Desk Setup", courseId: "", priority: "Medium", date: todayIso, status: "In Progress", completed: false },
        { id: 'task6', text: "Birthday party items", courseId: "", priority: "Low", date: todayIso, status: "Not Started", completed: false }
    ],
    timetable: [
        {
            time: "8:00 - 9:00",
            days: [
                { courseId: "cs" },
                { courseId: "cs" },
                { courseId: "cs" },
                { courseId: "software" },
                { courseId: "cs" }
            ]
        },
        {
            time: "9:00 - 10:00",
            days: [
                { courseId: "cs" },
                { courseId: "cs" },
                { courseId: "software" },
                { courseId: "software" },
                { courseId: "cs" }
            ]
        },
        {
            time: "10:00 - 11:00",
            days: [
                { courseId: "software" },
                { courseId: "cs" },
                { courseId: "oop" },
                { courseId: "software" },
                { courseId: "software" }
            ]
        },
        {
            time: "11:00 - 12:00",
            days: [null, null, null, null, null]
        },
        {
            time: "12:00 - 1:00",
            days: [
                { courseId: "math" },
                { courseId: "math" },
                { courseId: "ds" },
                { courseId: "oop" },
                { courseId: "math" }
            ]
        },
        {
            time: "1:00 - 2:00",
            days: [
                { courseId: "ds" },
                { courseId: "math" },
                { courseId: "ds" },
                { courseId: "oop" },
                { courseId: "ds" }
            ]
        },
        {
            time: "2:00 - 3:00",
            days: [
                { courseId: "oop" },
                { courseId: "math" },
                { courseId: "ds" },
                { courseId: "oop" },
                { courseId: "oop" }
            ]
        }
    ],
    lifeBalance: {
        labels: ['Career', 'Relationship', 'Growth', 'Lifestyle', 'Physical Health', 'Money', 'Family'],
        values: [8, 5, 9, 6, 7, 5, 8]
    },
    pomodoro: {
        workMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        soundEnabled: true,
        completedSessions: 4
    },
    rpg: createInitialRpgState(),
    flashcards: {
        cards: PRESEEDED_FLASHCARDS,
        totalDuelsWon: 0,
        totalCardsReviewed: 0
    },
    cgpa: createDefaultCgpaState(),
    settings: {
        coursesFolder: '07 Notes/Courses',
        assignmentsFolder: '07 Notes/Assignments',
        resourcesFolder: '07 Notes/Resources',
        notesFolder: '07 Notes/Lecture Notes',
        examsFolder: '07 Notes/Exams'
    }
};

let pluginInstance: Plugin | null = null;
export const studyHubStore = writable<StudyHubData>(DEFAULT_DATA);

export function initStudyHubStore(plugin: Plugin, savedData: any) {
    pluginInstance = plugin;
    if (savedData) {
        const merged: StudyHubData = Object.assign({}, DEFAULT_DATA, savedData);
        if (!merged.courses || merged.courses.length === 0) merged.courses = DEFAULT_DATA.courses;
        if (!merged.assignments) merged.assignments = DEFAULT_DATA.assignments;
        if (!merged.exams) merged.exams = DEFAULT_DATA.exams;
        if (!merged.resources) merged.resources = DEFAULT_DATA.resources;
        if (!merged.notes) merged.notes = DEFAULT_DATA.notes;
        if (!merged.miniTodos) merged.miniTodos = DEFAULT_DATA.miniTodos;
        if (!merged.reminders) merged.reminders = DEFAULT_DATA.reminders;
        if (!merged.tasks) merged.tasks = DEFAULT_DATA.tasks;
        if (!merged.timetable) merged.timetable = DEFAULT_DATA.timetable;
        if (!merged.lifeBalance) merged.lifeBalance = DEFAULT_DATA.lifeBalance;
        if (!merged.pomodoro) merged.pomodoro = DEFAULT_DATA.pomodoro;
        if (!merged.settings) merged.settings = DEFAULT_DATA.settings;
        
        // Ensure Flashcards & CGPA are initialized
        if (!merged.flashcards || !merged.flashcards.cards || merged.flashcards.cards.length === 0) {
            merged.flashcards = {
                cards: PRESEEDED_FLASHCARDS,
                totalDuelsWon: 0,
                totalCardsReviewed: 0
            };
        }
        if (!merged.cgpa) {
            merged.cgpa = createDefaultCgpaState();
        }

        // Ensure RPG state is initialized and valid
        if (!merged.rpg) {
            merged.rpg = createInitialRpgState();
        } else {
            const initial = createInitialRpgState();
            merged.rpg = Object.assign({}, initial, merged.rpg);
            if (!merged.rpg.vouchers || merged.rpg.vouchers.length === 0) merged.rpg.vouchers = initial.vouchers;
            if (!merged.rpg.buffs || merged.rpg.buffs.length === 0) merged.rpg.buffs = initial.buffs;
            if (!merged.rpg.activeBosses || merged.rpg.activeBosses.length === 0) merged.rpg.activeBosses = initial.activeBosses;
            if (!merged.rpg.quests || merged.rpg.quests.length === 0) merged.rpg.quests = initial.quests;
        }

        // Daily Quest Auto-refresh check
        const currentIso = formatDateIso(new Date());
        if (merged.rpg.lastActiveDate !== currentIso) {
            // Update streak
            const lastDate = new Date(merged.rpg.lastActiveDate);
            const today = new Date(currentIso);
            const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
            
            if (diffDays === 1) {
                merged.rpg.streakDays += 1;
            } else if (diffDays > 1) {
                // Check if streak shield is equipped
                const hasShield = merged.rpg.buffs.some(b => b.id === 'buff-shield' && b.isActive);
                if (hasShield && merged.rpg.streakShields > 0) {
                    merged.rpg.streakShields -= 1;
                    new Notice('🛡️ Streak Shield protected your daily study streak!');
                } else {
                    merged.rpg.streakDays = 1;
                }
            }
            merged.rpg.lastActiveDate = currentIso;
            merged.rpg.quests = generateDailyQuests(currentIso);
        }

        studyHubStore.set(merged);
    } else {
        studyHubStore.set(DEFAULT_DATA);
    }
}

export async function persistStore() {
    if (pluginInstance) {
        const current = get(studyHubStore);
        await pluginInstance.saveData(current);
    }
}

// ----------------------------------------------------
// 🎮 RPG ENGINE ACTIONS (XP, Coins, Quests, Bosses, Shop)
// ----------------------------------------------------

export function awardRpgXp(
    actionType: 'assignment' | 'note' | 'pomodoro' | 'exam' | 'concept' | 'todo' | 'flashcard' | 'duel' | 'cgpa',
    courseId?: string,
    customXp?: number,
    customCoins?: number
) {
    studyHubStore.update(s => {
        if (!s.rpg) s.rpg = createInitialRpgState();
        const rpg = s.rpg;

        // 1. Calculate base rewards
        let baseXp = 50;
        let baseCoins = 20;
        let actionLabel = 'Action Complete';

        if (actionType === 'assignment') {
            baseXp = 100;
            baseCoins = 40;
            actionLabel = '📝 Assignment Done';
        } else if (actionType === 'note') {
            baseXp = 50;
            baseCoins = 25;
            actionLabel = '📚 Lecture Note Added';
        } else if (actionType === 'pomodoro') {
            baseXp = 75;
            baseCoins = 35;
            actionLabel = '🍅 Pomodoro Focus Complete';
            // Check double espresso buff
            const espressoActive = rpg.buffs.some(b => b.id === 'buff-espresso' && b.isActive);
            if (espressoActive) {
                baseXp = Math.round(baseXp * 1.5);
            }
        } else if (actionType === 'exam') {
            baseXp = 300;
            baseCoins = 120;
            actionLabel = '🏆 Exam Conquered';
        } else if (actionType === 'concept') {
            baseXp = 60;
            baseCoins = 30;
            actionLabel = '✨ Concept Node Mastered';
        } else if (actionType === 'todo') {
            baseXp = 25;
            baseCoins = 10;
            actionLabel = '⚡ Mini-Todo Checked';
        } else if (actionType === 'flashcard') {
            baseXp = 40;
            baseCoins = 15;
            actionLabel = '🧠 Flashcard Recall Active';
        } else if (actionType === 'duel') {
            baseXp = 90;
            baseCoins = 45;
            actionLabel = '⚔️ Arena Duel Victory';
        } else if (actionType === 'cgpa') {
            baseXp = 45;
            baseCoins = 20;
            actionLabel = '📊 CGPA Target Calculated';
        }

        if (customXp !== undefined) baseXp = customXp;
        if (customCoins !== undefined) baseCoins = customCoins;

        // Check time dilation buff for extra coins
        const dilationActive = rpg.buffs.some(b => b.id === 'buff-dilation' && b.isActive);
        if (dilationActive) {
            baseCoins = Math.round(baseCoins * 1.25);
        }

        // 2. Combo Multiplier calculation (within 3 hours)
        const now = Date.now();
        const diffHours = (now - (rpg.lastActionTimestamp || 0)) / (1000 * 60 * 60);
        if (diffHours <= 3) {
            rpg.comboMultiplier = Math.min(2.0, parseFloat((rpg.comboMultiplier + 0.1).toFixed(1)));
        } else {
            rpg.comboMultiplier = 1.0;
        }
        rpg.lastActionTimestamp = now;

        const earnedXp = Math.round(baseXp * rpg.comboMultiplier);
        const earnedCoins = Math.round(baseCoins * rpg.comboMultiplier);

        const oldLevel = rpg.level;
        rpg.totalXp += earnedXp;
        rpg.coins += earnedCoins;

        // Update overall level
        const levelInfo = calculateLevelInfo(rpg.totalXp);
        rpg.level = levelInfo.level;
        rpg.currentTitle = getPlayerTitle(rpg.level);

        // 3. Update Subject Skill Tree if courseId provided
        if (courseId) {
            if (!rpg.courseSkills[courseId]) {
                const course = s.courses.find(c => c.id === courseId);
                rpg.courseSkills[courseId] = {
                    courseId,
                    level: 1,
                    xp: 0,
                    title: getCourseTitle(course?.title || courseId, 1)
                };
            }
            const courseSkill = rpg.courseSkills[courseId];
            courseSkill.xp += earnedXp;
            const courseLevelInfo = calculateLevelInfo(courseSkill.xp);
            const oldCourseLevel = courseSkill.level;
            courseSkill.level = courseLevelInfo.level;
            const courseObj = s.courses.find(c => c.id === courseId);
            courseSkill.title = getCourseTitle(courseObj?.title || courseId, courseSkill.level);

            if (courseSkill.level > oldCourseLevel) {
                new Notice(`🌟 Course Level Up! ${courseObj?.title || courseId} is now Lv. ${courseSkill.level} (${courseSkill.title})!`);
            }
        }

        // 4. Deal Boss Damage
        const dmg = Math.round(earnedXp * 0.6);
        if (rpg.activeBosses) {
            rpg.activeBosses.forEach(boss => {
                if (!boss.isDefeated && (!boss.courseId || boss.courseId === courseId)) {
                    boss.currentHp = Math.max(0, boss.currentHp - dmg);
                    if (boss.currentHp === 0) {
                        boss.isDefeated = true;
                        rpg.totalXp += boss.rewardXp;
                        rpg.coins += boss.rewardCoins;
                        new Notice(`⚔️ BOSS DEFEATED: ${boss.title}! Loot: +${boss.rewardXp} XP, +${boss.rewardCoins} Gold Coins! 🪙`);
                    }
                }
            });
        }

        // 5. Update Quest Progress
        if (rpg.quests) {
            rpg.quests.forEach(q => {
                if (!q.isClaimed) {
                    if (actionType === 'pomodoro' && q.category === 'pomodoro') q.currentCount += 1;
                    if (actionType === 'todo' && q.category === 'todo') q.currentCount += 1;
                    if (actionType === 'note' && (q.category === 'note' || q.category === 'general')) q.currentCount += 1;
                    if (actionType === 'concept' && (q.category === 'concept' || q.category === 'note')) q.currentCount += 1;
                    if (actionType === 'assignment' && (q.category === 'assignment' || q.category === 'todo')) q.currentCount += 1;
                    if (actionType === 'flashcard' && (q.category === 'flashcard' || q.category === 'note')) q.currentCount += 1;
                    if (actionType === 'duel' && (q.category === 'duel' || q.category === 'flashcard')) q.currentCount += 1;
                    if (actionType === 'cgpa' && q.category === 'cgpa') q.currentCount += 1;
                }
            });
        }

        // Show level-up notice
        if (rpg.level > oldLevel) {
            playChimeSound();
            new Notice(`🎉 LEVEL UP! You reached Level ${rpg.level} (${rpg.currentTitle})! 🚀`);
        } else {
            const comboText = rpg.comboMultiplier > 1.0 ? ` (${rpg.comboMultiplier}x Combo!)` : '';
            new Notice(`${actionLabel}: +${earnedXp} XP, +${earnedCoins} Coins${comboText}`);
        }

        return s;
    });
    persistStore();
}

export function rerollQuests() {
    studyHubStore.update(s => {
        if (!s.rpg) s.rpg = createInitialRpgState();
        const todayIso = formatDateIso(new Date());
        const seedOffset = Math.floor(Math.random() * 10000) + 1;
        s.rpg.quests = generateDailyQuests(todayIso, seedOffset);
        new Notice('🎲 Daily Quests Rerolled! 4 fresh challenges generated!');
        return s;
    });
    persistStore();
}

export function resetPlayerAndBosses() {
    studyHubStore.update(s => {
        s.rpg = createInitialRpgState();
        new Notice('🔄 Player Level, XP and all 15 Bosses reset to 100% default!');
        return s;
    });
    persistStore();
}

export function buyVoucher(voucherId: string) {
    studyHubStore.update(s => {
        if (!s.rpg) return s;
        const voucher = s.rpg.vouchers.find(v => v.id === voucherId);
        if (!voucher) return s;

        if (s.rpg.coins < voucher.cost) {
            new Notice(`❌ Not enough Gold Coins! You need ${voucher.cost - s.rpg.coins} more.`);
            return s;
        }

        s.rpg.coins -= voucher.cost;
        const redeemed: RedeemedVoucher = {
            id: 'red_' + Date.now(),
            voucherId: voucher.id,
            title: voucher.title,
            icon: voucher.icon,
            cost: voucher.cost,
            redeemedAt: new Date().toISOString(),
            isEnjoyed: false
        };
        s.rpg.inventory = [redeemed, ...s.rpg.inventory];
        playChimeSound();
        new Notice(`🛍️ Purchased "${voucher.title}"! Added to your Inventory.`);
        return s;
    });
    persistStore();
}

export function redeemVoucher(redemptionId: string) {
    studyHubStore.update(s => {
        if (!s.rpg) return s;
        const item = s.rpg.inventory.find(i => i.id === redemptionId);
        if (item) {
            item.isEnjoyed = true;
            new Notice(`🎉 Enjoy your reward: "${item.title}"! Well earned!`);
        }
        return s;
    });
    persistStore();
}

export function createCustomVoucher(title: string, cost: number, icon: string, description: string) {
    if (!title.trim()) return;
    studyHubStore.update(s => {
        if (!s.rpg) s.rpg = createInitialRpgState();
        const newVoucher: VoucherReward = {
            id: 'v_custom_' + Date.now(),
            title: title.trim(),
            cost: Math.max(50, cost || 100),
            icon: icon || 'Gift',
            category: 'custom',
            description: description.trim() || 'Custom real-life reward',
            isCustom: true
        };
        s.rpg.vouchers = [...s.rpg.vouchers, newVoucher];
        new Notice(`✨ Added Custom Reward "${title}" to Voucher Shop!`);
        return s;
    });
    persistStore();
}

export function deleteCustomVoucher(voucherId: string) {
    studyHubStore.update(s => {
        if (!s.rpg) return s;
        s.rpg.vouchers = s.rpg.vouchers.filter(v => v.id !== voucherId);
        return s;
    });
    persistStore();
}

export function claimQuestReward(questId: string) {
    studyHubStore.update(s => {
        if (!s.rpg) return s;
        const quest = s.rpg.quests.find(q => q.id === questId);
        if (quest && !quest.isClaimed && quest.currentCount >= quest.targetCount) {
            quest.isClaimed = true;
            s.rpg.totalXp += quest.rewardXp;
            s.rpg.coins += quest.rewardCoins;
            playChimeSound();
            new Notice(`🏆 Quest Claimed: "${quest.title}" (+${quest.rewardXp} XP, +${quest.rewardCoins} Coins)!`);
            
            const levelInfo = calculateLevelInfo(s.rpg.totalXp);
            s.rpg.level = levelInfo.level;
            s.rpg.currentTitle = getPlayerTitle(s.rpg.level);
        }
        return s;
    });
    persistStore();
}

export function toggleFocusBuff(buffId: string) {
    studyHubStore.update(s => {
        if (!s.rpg) return s;
        const buff = s.rpg.buffs.find(b => b.id === buffId);
        if (buff) {
            if (s.rpg.level < buff.unlockLevel) {
                new Notice(`🔒 Unlocks at Level ${buff.unlockLevel}!`);
                return s;
            }
            buff.isActive = !buff.isActive;
            new Notice(`${buff.isActive ? '⚡ Activated' : 'Deactivated'} ${buff.name}`);
        }
        return s;
    });
    persistStore();
}

export function createRaidBoss(title: string, courseId: string, maxHp: number, deadlineDate: string) {
    studyHubStore.update(s => {
        if (!s.rpg) s.rpg = createInitialRpgState();
        const newBoss = {
            id: 'boss_' + Date.now(),
            title: title.trim(),
            subtitle: 'Academic Milestone Boss',
            courseId,
            maxHp: maxHp || 500,
            currentHp: maxHp || 500,
            deadlineDate: deadlineDate || formatDateIso(new Date()),
            rewardXp: Math.round((maxHp || 500) * 2),
            rewardCoins: Math.round((maxHp || 500) * 0.7),
            isDefeated: false,
            bossType: 'golem' as const
        };
        s.rpg.activeBosses = [newBoss, ...s.rpg.activeBosses];
        new Notice(`⚔️ New Raid Boss "${title}" Summoned!`);
        return s;
    });
    persistStore();
}

// ----------------------------------------------------
// Core Study Hub Standard Store Actions
// ----------------------------------------------------

// Courses
export function addCourse(course: Omit<Course, 'id'>) {
    const id = 'course_' + Date.now();
    studyHubStore.update(s => {
        s.courses = [...s.courses, { ...course, id }];
        return s;
    });
    persistStore();
}

export function editCourse(courseId: string, updates: Partial<Course>) {
    studyHubStore.update(s => {
        const c = s.courses.find(item => item.id === courseId);
        if (c) {
            Object.assign(c, updates);
        }
        return s;
    });
    persistStore();
}

export function deleteCourse(courseId: string) {
    studyHubStore.update(s => {
        s.courses = s.courses.filter(c => c.id !== courseId);
        s.assignments = s.assignments.filter(a => a.courseId !== courseId);
        s.exams = s.exams.filter(e => e.courseId !== courseId);
        s.notes = s.notes.filter(n => n.courseId !== courseId);
        s.resources = s.resources.filter(r => r.courseId !== courseId);
        s.tasks = s.tasks.filter(t => t.courseId !== courseId);
        return s;
    });
    persistStore();
}

// Assignments
export function addAssignment(item: Omit<AssignmentItem, 'id'>) {
    const id = 'a_' + Date.now();
    studyHubStore.update(s => {
        const newAssignment: AssignmentItem = { ...item, id };
        s.assignments = [newAssignment, ...s.assignments];
        
        // Also mirror to Task Manager
        const newTask: TaskItem = {
            id: 'task_' + id,
            text: item.title,
            courseId: item.courseId,
            priority: item.priority,
            date: item.dueDate,
            status: item.completed ? 'Completed' : 'In Progress',
            completed: item.completed
        };
        s.tasks = [newTask, ...s.tasks];
        
        return s;
    });
    persistStore();
}

export function editAssignment(id: string, updates: Partial<AssignmentItem>) {
    studyHubStore.update(s => {
        const item = s.assignments.find(a => a.id === id);
        if (item) {
            Object.assign(item, updates);
            const task = s.tasks.find(t => t.id === 'task_' + id);
            if (task) {
                if (updates.title !== undefined) task.text = updates.title;
                if (updates.courseId !== undefined) task.courseId = updates.courseId;
                if (updates.priority !== undefined) task.priority = updates.priority;
                if (updates.dueDate !== undefined) task.date = updates.dueDate;
                if (updates.completed !== undefined) {
                    task.completed = updates.completed;
                    task.status = updates.completed ? 'Completed' : 'In Progress';
                }
            }
        }
        return s;
    });
    persistStore();
}

export function toggleAssignment(id: string) {
    let completedCourseId = '';
    let isNowCompleted = false;
    studyHubStore.update(s => {
        const item = s.assignments.find(a => a.id === id);
        if (item) {
            item.completed = !item.completed;
            isNowCompleted = item.completed;
            completedCourseId = item.courseId;
            // Sync with mirrored task if exists
            const task = s.tasks.find(t => t.id === 'task_' + id || (t.text === item.title && t.courseId === item.courseId));
            if (task) {
                task.completed = item.completed;
                task.status = item.completed ? 'Completed' : 'In Progress';
            }
        }
        return s;
    });
    persistStore();

    if (isNowCompleted) {
        awardRpgXp('assignment', completedCourseId);
    }
}

export function deleteAssignment(id: string) {
    studyHubStore.update(s => {
        s.assignments = s.assignments.filter(a => a.id !== id);
        s.tasks = s.tasks.filter(t => t.id !== 'task_' + id);
        return s;
    });
    persistStore();
}

export function clearCompletedAssignments() {
    studyHubStore.update(s => {
        s.assignments = s.assignments.filter(a => !a.completed);
        s.tasks = s.tasks.filter(t => !t.completed);
        return s;
    });
    persistStore();
}

// Exams
export function addExam(item: Omit<ExamItem, 'id'>) {
    const id = 'e_' + Date.now();
    studyHubStore.update(s => {
        s.exams = [...s.exams, { ...item, id }];
        return s;
    });
    persistStore();
}

export function editExam(id: string, updates: Partial<ExamItem>) {
    studyHubStore.update(s => {
        const item = s.exams.find(e => e.id === id);
        if (item) {
            Object.assign(item, updates);
        }
        return s;
    });
    persistStore();
}

export function toggleExamStatus(id: string) {
    studyHubStore.update(s => {
        const item = s.exams.find(e => e.id === id);
        if (item) {
            item.isPast = !item.isPast;
        }
        return s;
    });
    persistStore();
}

export function deleteExam(id: string) {
    studyHubStore.update(s => {
        s.exams = s.exams.filter(e => e.id !== id);
        return s;
    });
    persistStore();
}

export function clearPastExams() {
    studyHubStore.update(s => {
        s.exams = s.exams.filter(e => !e.isPast);
        return s;
    });
    persistStore();
}

// Notes
export function addSubjectNote(item: Omit<SubjectNoteItem, 'id' | 'createdAt'>) {
    const id = 'n_' + Date.now();
    studyHubStore.update(s => {
        s.notes = [{ ...item, id, createdAt: formatDateIso(new Date()) }, ...s.notes];
        return s;
    });
    persistStore();
    awardRpgXp('note', item.courseId);
}

export function deleteSubjectNote(id: string) {
    studyHubStore.update(s => {
        s.notes = s.notes.filter(n => n.id !== id);
        return s;
    });
    persistStore();
}

// Resources
export function addResource(item: Omit<ResourceItem, 'id'>) {
    const id = 'r_' + Date.now();
    studyHubStore.update(s => {
        s.resources = [{ ...item, id }, ...s.resources];
        return s;
    });
    persistStore();
}

export function deleteResource(id: string) {
    studyHubStore.update(s => {
        s.resources = s.resources.filter(r => r.id !== id);
        return s;
    });
    persistStore();
}

// Mini To-dos
export function addMiniTodo(text: string) {
    if (!text.trim()) return;
    const id = 'todo_' + Date.now();
    studyHubStore.update(s => {
        s.miniTodos = [...s.miniTodos, { id, text: text.trim(), completed: false, createdAt: formatDateIso(new Date()) }];
        return s;
    });
    persistStore();
}

export function editMiniTodo(id: string, text: string) {
    if (!text.trim()) return;
    studyHubStore.update(s => {
        const item = s.miniTodos.find(t => t.id === id);
        if (item) {
            item.text = text.trim();
        }
        return s;
    });
    persistStore();
}

export function toggleMiniTodo(id: string) {
    let isNowCompleted = false;
    studyHubStore.update(s => {
        const item = s.miniTodos.find(t => t.id === id);
        if (item) {
            item.completed = !item.completed;
            isNowCompleted = item.completed;
        }
        return s;
    });
    persistStore();

    if (isNowCompleted) {
        awardRpgXp('todo');
    }
}

export function deleteMiniTodo(id: string) {
    studyHubStore.update(s => {
        s.miniTodos = s.miniTodos.filter(t => t.id !== id);
        return s;
    });
    persistStore();
}

export function clearCompletedMiniTodos() {
    studyHubStore.update(s => {
        s.miniTodos = s.miniTodos.filter(t => !t.completed);
        return s;
    });
    persistStore();
}

export function clearAllMiniTodos() {
    studyHubStore.update(s => {
        s.miniTodos = [];
        return s;
    });
    persistStore();
}

// Reminders
export function addReminder(title: string, date: string) {
    if (!title.trim()) return;
    const id = 'rem_' + Date.now();
    studyHubStore.update(s => {
        s.reminders = [...s.reminders, { id, title: title.trim(), date: date || formatDateIso(new Date()), completed: false }];
        return s;
    });
    persistStore();
}

export function editReminder(id: string, updates: Partial<ReminderItem>) {
    studyHubStore.update(s => {
        const item = s.reminders.find(r => r.id === id);
        if (item) {
            Object.assign(item, updates);
        }
        return s;
    });
    persistStore();
}

export function toggleReminder(id: string) {
    studyHubStore.update(s => {
        const item = s.reminders.find(r => r.id === id);
        if (item) item.completed = !item.completed;
        return s;
    });
    persistStore();
}

export function deleteReminder(id: string) {
    studyHubStore.update(s => {
        s.reminders = s.reminders.filter(r => r.id !== id);
        return s;
    });
    persistStore();
}

export function clearCompletedReminders() {
    studyHubStore.update(s => {
        s.reminders = s.reminders.filter(r => !r.completed);
        return s;
    });
    persistStore();
}

export function clearAllReminders() {
    studyHubStore.update(s => {
        s.reminders = [];
        return s;
    });
    persistStore();
}

// Tasks (Task Manager)
export function addTask(item: Omit<TaskItem, 'id'>) {
    const id = 'task_' + Date.now();
    studyHubStore.update(s => {
        const newTask: TaskItem = { ...item, id };
        s.tasks = [newTask, ...s.tasks];
        
        // If courseId is provided, also add as Assignment to keep them synced
        if (item.courseId) {
            s.assignments = [
                {
                    id: 'a_' + id,
                    courseId: item.courseId,
                    title: item.text,
                    dueDate: item.date,
                    completed: item.completed,
                    priority: item.priority
                },
                ...s.assignments
            ];
        }
        return s;
    });
    persistStore();
}

export function editTask(id: string, updates: Partial<TaskItem>) {
    studyHubStore.update(s => {
        const task = s.tasks.find(t => t.id === id);
        if (task) {
            Object.assign(task, updates);
            const assignment = s.assignments.find(a => a.id === 'a_' + id);
            if (assignment) {
                if (updates.text !== undefined) assignment.title = updates.text;
                if (updates.courseId !== undefined) assignment.courseId = updates.courseId;
                if (updates.priority !== undefined) assignment.priority = updates.priority;
                if (updates.date !== undefined) assignment.dueDate = updates.date;
                if (updates.completed !== undefined) assignment.completed = updates.completed;
            }
        }
        return s;
    });
    persistStore();
}

export function toggleTask(id: string) {
    let completedCourseId = '';
    let isNowCompleted = false;
    studyHubStore.update(s => {
        const task = s.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            isNowCompleted = task.completed;
            completedCourseId = task.courseId || '';
            task.status = task.completed ? 'Completed' : 'In Progress';
            
            // Sync with assignments
            const assignment = s.assignments.find(a => a.id === 'a_' + id || (a.title === task.text && a.courseId === task.courseId));
            if (assignment) {
                assignment.completed = task.completed;
            }
        }
        return s;
    });
    persistStore();

    if (isNowCompleted) {
        awardRpgXp('assignment', completedCourseId);
    }
}

export function advanceTaskStatus(id: string) {
    let completedCourseId = '';
    let isNowCompleted = false;
    studyHubStore.update(s => {
        const task = s.tasks.find(t => t.id === id);
        if (task) {
            if (task.status === 'Not Started') {
                task.status = 'In Progress';
                task.completed = false;
            } else if (task.status === 'In Progress') {
                task.status = 'Completed';
                task.completed = true;
                isNowCompleted = true;
                completedCourseId = task.courseId || '';
            } else {
                task.status = 'Not Started';
                task.completed = false;
            }
            
            const assignment = s.assignments.find(a => a.id === 'a_' + id || (a.title === task.text && a.courseId === task.courseId));
            if (assignment) {
                assignment.completed = task.completed;
            }
        }
        return s;
    });
    persistStore();

    if (isNowCompleted) {
        awardRpgXp('assignment', completedCourseId);
    }
}

export function deleteTask(id: string) {
    studyHubStore.update(s => {
        s.tasks = s.tasks.filter(t => t.id !== id);
        s.assignments = s.assignments.filter(a => a.id !== 'a_' + id);
        return s;
    });
    persistStore();
}

export function clearCompletedTasks() {
    studyHubStore.update(s => {
        s.tasks = s.tasks.filter(t => !t.completed);
        s.assignments = s.assignments.filter(a => !a.completed);
        return s;
    });
    persistStore();
}

export function clearAllTasks() {
    studyHubStore.update(s => {
        s.tasks = [];
        return s;
    });
    persistStore();
}

// Life Balance
export function updateLifeBalanceValue(index: number, val: number) {
    studyHubStore.update(s => {
        if (s.lifeBalance && s.lifeBalance.values && index >= 0 && index < s.lifeBalance.values.length) {
            s.lifeBalance.values[index] = Math.max(0, Math.min(10, val));
        }
        return s;
    });
    persistStore();
}

// Pomodoro Settings & Session Log
export function updatePomodoroSettings(settings: Partial<PomodoroSettings>) {
    studyHubStore.update(s => {
        s.pomodoro = Object.assign({}, s.pomodoro, settings);
        return s;
    });
    persistStore();
}

export function incrementPomodoroSession(courseId?: string) {
    studyHubStore.update(s => {
        s.pomodoro.completedSessions = (s.pomodoro.completedSessions || 0) + 1;
        return s;
    });
    persistStore();
    awardRpgXp('pomodoro', courseId);
}

// Timetable
export function updateTimetableSlot(rowIndex: number, dayIndex: number, slot: { courseId: string; customName?: string } | null) {
    studyHubStore.update(s => {
        if (s.timetable[rowIndex] && s.timetable[rowIndex].days) {
            s.timetable[rowIndex].days[dayIndex] = slot;
        }
        return s;
    });
    persistStore();
}

export function addTimetableRow(timeLabel: string) {
    studyHubStore.update(s => {
        const time = timeLabel.trim() || 'New Period';
        s.timetable = [...s.timetable, { time, days: [null, null, null, null, null] }];
        return s;
    });
    persistStore();
}

export function deleteTimetableRow(rowIndex: number) {
    studyHubStore.update(s => {
        s.timetable = s.timetable.filter((_, idx) => idx !== rowIndex);
        return s;
    });
    persistStore();
}

export function updateTimetableRowTime(rowIndex: number, newTime: string) {
    studyHubStore.update(s => {
        if (s.timetable[rowIndex]) {
            s.timetable[rowIndex].time = newTime.trim() || s.timetable[rowIndex].time;
        }
        return s;
    });
    persistStore();
}

export function clearAllTimetableSlots() {
    studyHubStore.update(s => {
        s.timetable = s.timetable.map(row => ({
            time: row.time,
            days: [null, null, null, null, null]
        }));
        return s;
    });
    persistStore();
}

export function resetTimetableToDefault() {
    studyHubStore.update(s => {
        s.timetable = DEFAULT_DATA.timetable;
        return s;
    });
    persistStore();
}

// 🧠 Flashcards & SM-2 Spaced Repetition Actions
export function recordFlashcardReview(cardId: string, rating: Sm2Rating) {
    let reviewedCourseId: string | undefined;

    studyHubStore.update(s => {
        if (!s.flashcards) {
            s.flashcards = { cards: PRESEEDED_FLASHCARDS, totalDuelsWon: 0, totalCardsReviewed: 0 };
        }
        s.flashcards.totalCardsReviewed = (s.flashcards.totalCardsReviewed || 0) + 1;

        const cardIdx = s.flashcards.cards.findIndex(c => c.id === cardId);
        if (cardIdx !== -1) {
            const card = s.flashcards.cards[cardIdx];
            reviewedCourseId = card.courseId;
            s.flashcards.cards[cardIdx] = processSm2Review(card, rating);
        }
        return s;
    });
    persistStore();

    if (rating >= 2) {
        awardRpgXp('flashcard', reviewedCourseId);
    }
}

export function recordDuelVictory(monster: SpeedDuelMonster) {
    studyHubStore.update(s => {
        if (!s.flashcards) {
            s.flashcards = { cards: PRESEEDED_FLASHCARDS, totalDuelsWon: 0, totalCardsReviewed: 0 };
        }
        s.flashcards.totalDuelsWon = (s.flashcards.totalDuelsWon || 0) + 1;
        s.flashcards.lastDuelMonsterId = monster.id;
        return s;
    });
    persistStore();
    awardRpgXp('duel', undefined, monster.rewardXp, monster.rewardCoins);
}

export function addNewFlashcard(newCard: Partial<Flashcard>) {
    const today = formatDateIso(new Date());
    const card: Flashcard = {
        id: `fc-${Date.now()}`,
        courseId: newCard.courseId || 'ds',
        courseTitle: newCard.courseTitle || 'Data Structure',
        question: newCard.question || 'Question',
        answer: newCard.answer || 'Answer',
        options: newCard.options,
        correctOptionIndex: newCard.correctOptionIndex ?? 0,
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        nextReviewDate: today
    };

    studyHubStore.update(s => {
        if (!s.flashcards) {
            s.flashcards = { cards: PRESEEDED_FLASHCARDS, totalDuelsWon: 0, totalCardsReviewed: 0 };
        }
        s.flashcards.cards = [card, ...s.flashcards.cards];
        return s;
    });
    persistStore();
    new Notice(`✨ Flashcard created for ${card.courseTitle}!`);
}

export function deleteFlashcard(cardId: string) {
    studyHubStore.update(s => {
        if (s.flashcards) {
            s.flashcards.cards = s.flashcards.cards.filter(c => c.id !== cardId);
        }
        return s;
    });
    persistStore();
}

// 📊 Indian Engineering CGPA & Grade Predictor Actions
export function updateCgpaTargets(targetDegreeCgpa: number, targetSemesterSgpa: number) {
    studyHubStore.update(s => {
        if (!s.cgpa) s.cgpa = createDefaultCgpaState();
        s.cgpa.targetDegreeCgpa = targetDegreeCgpa;
        s.cgpa.targetSemesterSgpa = targetSemesterSgpa;
        return s;
    });
    persistStore();
}

export function updateCourseGradeItem(courseId: string, updates: Partial<CourseGradeItem>) {
    studyHubStore.update(s => {
        if (!s.cgpa) s.cgpa = createDefaultCgpaState();
        const idx = s.cgpa.currentSemesterCourses.findIndex(c => c.id === courseId);
        if (idx !== -1) {
            s.cgpa.currentSemesterCourses[idx] = Object.assign({}, s.cgpa.currentSemesterCourses[idx], updates);
        }
        return s;
    });
    persistStore();
}

export function addCourseGradeItem(item: CourseGradeItem) {
    studyHubStore.update(s => {
        if (!s.cgpa) s.cgpa = createDefaultCgpaState();
        s.cgpa.currentSemesterCourses = [...s.cgpa.currentSemesterCourses, item];
        return s;
    });
    persistStore();
}

export function deleteCourseGradeItem(id: string) {
    studyHubStore.update(s => {
        if (s.cgpa) {
            s.cgpa.currentSemesterCourses = s.cgpa.currentSemesterCourses.filter(c => c.id !== id);
        }
        return s;
    });
    persistStore();
}

export function updatePastSemester(semesterNumber: number, sgpa: number, credits: number) {
    studyHubStore.update(s => {
        if (!s.cgpa) s.cgpa = createDefaultCgpaState();
        const idx = s.cgpa.pastSemesters.findIndex(p => p.semesterNumber === semesterNumber);
        if (idx !== -1) {
            s.cgpa.pastSemesters[idx] = { semesterNumber, sgpa, totalCredits: credits, semesterName: `Semester ${semesterNumber}` };
        } else {
            s.cgpa.pastSemesters = [...s.cgpa.pastSemesters, { semesterNumber, sgpa, totalCredits: credits, semesterName: `Semester ${semesterNumber}` }];
            s.cgpa.pastSemesters.sort((a, b) => a.semesterNumber - b.semesterNumber);
        }
        return s;
    });
    persistStore();
}

