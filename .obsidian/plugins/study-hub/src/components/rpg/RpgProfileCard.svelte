<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { studyHubStore } from '../../store';
    import { calculateLevelInfo } from '../../utils/rpgEngine';
    import { 
        Coins, 
        Flame, 
        ShieldCheck, 
        ShoppingBag, 
        GitFork, 
        Zap
    } from 'lucide-svelte';

    const dispatch = createEventDispatcher();

    $: rpg = $studyHubStore.rpg || {
        level: 1,
        totalXp: 0,
        coins: 150,
        currentTitle: 'Freshman Scholar 🎓',
        streakDays: 1,
        streakShields: 1,
        comboMultiplier: 1.0
    };

    $: levelInfo = calculateLevelInfo(rpg.totalXp);
    $: comboActive = (rpg.comboMultiplier || 1.0) > 1.0;
</script>

<div class="rpg-profile-card">
    <div class="profile-header">
        <div class="avatar-wrapper">
            <div class="avatar-ring">
                <span class="avatar-emoji">🧙‍♂️</span>
            </div>
            <div class="level-badge" title="Character Level">
                Lv. {levelInfo.level}
            </div>
        </div>

        <div class="profile-info">
            <div class="player-title-row">
                <span class="player-title">{rpg.currentTitle}</span>
                {#if comboActive}
                    <span class="combo-pill" title="Flow State Multiplier Active!">
                        <Zap size={12} /> {rpg.comboMultiplier}x Flow
                    </span>
                {/if}
            </div>

            <!-- XP Progress Bar -->
            <div class="xp-bar-container">
                <div class="xp-bar-track">
                    <div 
                        class="xp-bar-fill" 
                        style="width: {levelInfo.progressPercent}%;"
                    ></div>
                </div>
                <div class="xp-text-row">
                    <span class="xp-label">XP Progress</span>
                    <span class="xp-numbers">{levelInfo.currentLevelXp} / {levelInfo.xpForNextLevel} XP ({levelInfo.progressPercent}%)</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Currency & Stats Row -->
    <div class="stats-row">
        <div class="stat-pill coins" title="Gold Coins earned from tasks">
            <Coins size={15} color="#ffd700" />
            <span class="stat-val">{rpg.coins}</span>
            <span class="stat-label">Coins</span>
        </div>

        <div class="stat-pill streak" title="Daily study streak">
            <Flame size={15} color="#f97316" />
            <span class="stat-val">{rpg.streakDays}</span>
            <span class="stat-label">Day Streak</span>
        </div>

        <div class="stat-pill shield" title="Streak Shields available">
            <ShieldCheck size={15} color="#00f3ff" />
            <span class="stat-val">{rpg.streakShields || 0}</span>
            <span class="stat-label">Shields</span>
        </div>
    </div>

    <!-- Quick Action Launchers -->
    <div class="rpg-actions-row">
        <button 
            type="button" 
            class="rpg-btn shop-btn"
            on:click={() => dispatch('openShop')}
        >
            <ShoppingBag size={14} /> Voucher Shop
        </button>

        <button 
            type="button" 
            class="rpg-btn skills-btn"
            on:click={() => dispatch('openSkillTrees')}
        >
            <GitFork size={14} /> Subject Skills
        </button>
    </div>
</div>

<style>
    .rpg-profile-card {
        background: rgba(14, 17, 24, 0.75);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(0, 243, 255, 0.25);
        border-radius: 14px;
        padding: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(0, 243, 255, 0.04);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
        flex: 1;
        transition: border-color 0.3s ease;
    }

    .rpg-profile-card:hover {
        border-color: rgba(0, 243, 255, 0.45);
    }

    .profile-header {
        display: flex;
        align-items: center;
        gap: 14px;
    }

    .avatar-wrapper {
        position: relative;
        flex-shrink: 0;
    }

    .avatar-ring {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0, 243, 255, 0.2) 0%, rgba(10, 15, 25, 0.8) 100%);
        border: 2px solid #00f3ff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 15px rgba(0, 243, 255, 0.3);
    }

    .avatar-emoji {
        font-size: 1.6em;
        line-height: 1;
    }

    .level-badge {
        position: absolute;
        bottom: -4px;
        right: -4px;
        background: #00f3ff;
        color: #000;
        font-size: 0.7em;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 10px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
    }

    .profile-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
    }

    .player-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .player-title {
        font-size: 0.95em;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 0.2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .combo-pill {
        display: flex;
        align-items: center;
        gap: 4px;
        background: linear-gradient(135deg, #f59e0b, #ef4444);
        color: #fff;
        font-size: 0.7em;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
        animation: pulseCombo 1.5s infinite;
    }

    @keyframes pulseCombo {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }

    .xp-bar-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .xp-bar-track {
        height: 7px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 4px;
        overflow: hidden;
        position: relative;
    }

    .xp-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #00f3ff, #10b981);
        border-radius: 4px;
        transition: width 0.4s ease-out;
        box-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
    }

    .xp-text-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.72em;
        color: var(--text-muted);
    }

    .stats-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
    }

    .stat-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--background-modifier-border);
        padding: 6px 10px;
        border-radius: 8px;
    }

    .stat-val {
        font-size: 0.9em;
        font-weight: 700;
        color: #fff;
    }

    .stat-label {
        font-size: 0.7em;
        color: var(--text-muted);
    }

    .rpg-actions-row {
        display: flex;
        gap: 8px;
    }

    .rpg-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--background-modifier-border);
        color: #fff;
        padding: 7px 12px;
        border-radius: 8px;
        font-size: 0.8em;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .shop-btn:hover {
        background: rgba(255, 215, 0, 0.15);
        border-color: #ffd700;
        color: #ffd700;
        box-shadow: 0 0 12px rgba(255, 215, 0, 0.2);
    }

    .skills-btn:hover {
        background: rgba(0, 243, 255, 0.15);
        border-color: #00f3ff;
        color: #00f3ff;
        box-shadow: 0 0 12px rgba(0, 243, 255, 0.2);
    }
</style>
