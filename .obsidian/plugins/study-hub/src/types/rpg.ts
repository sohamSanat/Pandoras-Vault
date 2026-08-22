export interface FocusBuff {
    id: string;
    name: string;
    icon: string;
    description: string;
    unlockLevel: number;
    isActive: boolean;
}

export interface VoucherReward {
    id: string;
    title: string;
    icon: string;
    cost: number;
    category: 'entertainment' | 'food' | 'rest' | 'custom';
    description: string;
    isCustom?: boolean;
}

export interface RedeemedVoucher {
    id: string;
    voucherId: string;
    title: string;
    icon: string;
    cost: number;
    redeemedAt: string; // ISO string
    isEnjoyed: boolean;
}

export interface RaidBoss {
    id: string;
    title: string;
    subtitle: string;
    courseId?: string;
    maxHp: number;
    currentHp: number;
    deadlineDate: string; // YYYY-MM-DD
    rewardXp: number;
    rewardCoins: number;
    isDefeated: boolean;
    bossType: 'dragon' | 'hydra' | 'golem' | 'demon' | 'kraken' | 'titan' | 'wizard' | 'beast' | 'phoenix' | 'cyborg' | 'lich' | 'chimera' | 'cerberus' | 'reaper';
}

export interface QuestItem {
    id: string;
    title: string;
    description: string;
    type: 'daily' | 'weekly';
    targetCount: number;
    currentCount: number;
    rewardXp: number;
    rewardCoins: number;
    isClaimed: boolean;
    category: 'pomodoro' | 'todo' | 'note' | 'concept' | 'streak' | 'assignment' | 'flashcard' | 'duel' | 'cgpa' | 'general';
    icon?: string;
}

export interface CourseSkillTree {
    courseId: string;
    level: number;
    xp: number;
    title: string;
}

export interface DungeonState {
    active: boolean;
    dungeonName: string;
    floor: number;
    totalFloors: number;
    bossHp: number;
    maxBossHp: number;
    encounterMessage?: string;
    encounterChoices?: { text: string; action: string }[];
}

export interface RpgDataState {
    level: number;
    totalXp: number;
    coins: number;
    currentTitle: string;
    streakDays: number;
    lastActiveDate: string;
    streakShields: number;
    comboMultiplier: number; // 1.0, 1.5, 2.0
    lastActionTimestamp: number;
    courseSkills: Record<string, CourseSkillTree>;
    vouchers: VoucherReward[];
    inventory: RedeemedVoucher[];
    buffs: FocusBuff[];
    activeBosses: RaidBoss[];
    quests: QuestItem[];
    dungeon: DungeonState;
}
