<script lang="ts">
    import { studyHubStore, claimQuestReward, rerollQuests } from '../../store';
    import { 
        Target, 
        CheckCircle2, 
        Coins, 
        Sparkles, 
        Clock,
        Dices,
        Timer,
        CheckSquare,
        BookOpen,
        Brain,
        Swords,
        FileText,
        Calculator,
        Flame,
        Zap,
        Crown
    } from 'lucide-svelte';

    $: quests = $studyHubStore.rpg?.quests || [];
    $: claimedCount = quests.filter(q => q.isClaimed).length;
    $: totalQuests = quests.length;

    function getCategoryIcon(category: string) {
        switch (category) {
            case 'pomodoro': return Timer;
            case 'todo': return CheckSquare;
            case 'note': return BookOpen;
            case 'flashcard': return Brain;
            case 'duel': return Swords;
            case 'concept': return Sparkles;
            case 'assignment': return FileText;
            case 'cgpa': return Calculator;
            case 'streak': return Flame;
            default: return Target;
        }
    }

    function getCategoryColor(category: string) {
        switch (category) {
            case 'pomodoro': return '#f59e0b';
            case 'todo': return '#10b981';
            case 'note': return '#00f3ff';
            case 'flashcard': return '#a855f7';
            case 'duel': return '#ef4444';
            case 'concept': return '#38bdf8';
            case 'assignment': return '#f472b6';
            case 'cgpa': return '#ffd700';
            case 'streak': return '#f97316';
            default: return '#00f3ff';
        }
    }
</script>

<div class="quest-board-container">
    <div class="quest-board-header">
        <div class="header-left">
            <Target size={16} color="#00f3ff" />
            <span class="header-title">QUEST BOARD & BOUNTIES</span>
            <span class="quest-counter-badge">{claimedCount}/{totalQuests} Completed</span>
        </div>

        <div class="header-right-actions">
            <button 
                type="button" 
                class="reroll-btn" 
                on:click={rerollQuests} 
                title="Reroll daily quests for 4 fresh challenges"
            >
                <Dices size={13} /> Reroll
            </button>
            <span class="refresh-badge" title="Quests auto-refresh every calendar day">
                <Clock size={11} /> Daily Rollover
            </span>
        </div>
    </div>

    <!-- Quests List -->
    <div class="quests-list">
        {#each quests as quest (quest.id)}
            {@const isDone = quest.currentCount >= quest.targetCount}
            {@const IconComponent = getCategoryIcon(quest.category)}
            {@const iconColor = getCategoryColor(quest.category)}
            
            <div class="quest-item {quest.isClaimed ? 'claimed' : isDone ? 'completed' : ''}">
                <div class="quest-left">
                    <div class="quest-icon-wrapper" style="border-color: {iconColor}40; background: {iconColor}15;">
                        <svelte:component this={IconComponent} size={15} color={iconColor} />
                    </div>

                    <div class="quest-info">
                        <div class="quest-name-row">
                            <span class="quest-type-tag {quest.type}">
                                {quest.type.toUpperCase()}
                            </span>
                            <span class="quest-name">{quest.title}</span>
                            {#if quest.isClaimed}
                                <span class="claimed-tag"><CheckCircle2 size={12} /> Claimed</span>
                            {/if}
                        </div>
                        <span class="quest-desc">{quest.description}</span>
                        
                        <!-- Progress Track -->
                        <div class="quest-progress-row">
                            <div class="progress-bar-track">
                                <div 
                                    class="progress-bar-fill {isDone ? 'done' : ''}" 
                                    style="width: {Math.min(100, (quest.currentCount / quest.targetCount) * 100)}%;"
                                ></div>
                            </div>
                            <span class="progress-ratio">{quest.currentCount} / {quest.targetCount}</span>
                        </div>
                    </div>
                </div>

                <!-- Reward / Claim Action -->
                <div class="quest-right">
                    <div class="rewards-preview">
                        <span class="reward-pill xp">+{quest.rewardXp} XP</span>
                        <span class="reward-pill coin"><Coins size={11} color="#ffd700" /> +{quest.rewardCoins}</span>
                    </div>

                    {#if isDone && !quest.isClaimed}
                        <button 
                            type="button" 
                            class="claim-btn"
                            on:click={() => claimQuestReward(quest.id)}
                        >
                            <Sparkles size={13} /> Claim
                        </button>
                    {/if}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .quest-board-container {
        background: rgba(14, 17, 24, 0.75);
        backdrop-filter: blur(16px);
        border: 1px solid var(--background-modifier-border);
        border-radius: 14px;
        padding: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
        height: 100%;
        box-sizing: border-box;
    }

    .quest-board-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .header-title {
        font-size: 0.82em;
        font-weight: 800;
        letter-spacing: 0.8px;
        color: #fff;
    }

    .quest-counter-badge {
        font-size: 0.68em;
        font-weight: 700;
        background: rgba(0, 243, 255, 0.12);
        color: #00f3ff;
        padding: 2px 7px;
        border-radius: 10px;
        border: 1px solid rgba(0, 243, 255, 0.25);
    }

    .header-right-actions {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .reroll-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: var(--text-normal);
        font-size: 0.72em;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .reroll-btn:hover {
        background: rgba(0, 243, 255, 0.15);
        border-color: #00f3ff;
        color: #00f3ff;
        box-shadow: 0 0 10px rgba(0, 243, 255, 0.3);
    }

    .refresh-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.68em;
        color: var(--text-muted);
    }

    .quests-list {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 8px;
        flex: 1;
    }

    .quest-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--background-modifier-border);
        border-radius: 10px;
        padding: 9px 12px;
        gap: 10px;
        transition: all 0.2s ease;
    }

    .quest-item.completed:not(.claimed) {
        border-color: rgba(16, 185, 129, 0.5);
        background: rgba(16, 185, 129, 0.06);
        box-shadow: 0 0 15px rgba(16, 185, 129, 0.15);
    }

    .quest-item.claimed {
        opacity: 0.55;
    }

    .quest-left {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        min-width: 0;
    }

    .quest-icon-wrapper {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .quest-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    .quest-name-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
    }

    .quest-type-tag {
        font-size: 0.6em;
        font-weight: 800;
        letter-spacing: 0.5px;
        padding: 1px 5px;
        border-radius: 4px;
        text-align: center;
        flex-shrink: 0;
    }

    .quest-type-tag.daily {
        background: rgba(0, 243, 255, 0.15);
        color: #00f3ff;
        border: 1px solid rgba(0, 243, 255, 0.3);
    }

    .quest-type-tag.weekly {
        background: rgba(244, 114, 182, 0.15);
        color: #f472b6;
        border: 1px solid rgba(244, 114, 182, 0.3);
    }

    .quest-name {
        font-size: 0.84em;
        font-weight: 700;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .claimed-tag {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 0.68em;
        color: #10b981;
        font-weight: 600;
    }

    .quest-desc {
        font-size: 0.71em;
        color: var(--text-muted);
        line-height: 1.2;
    }

    .quest-progress-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 2px;
    }

    .progress-bar-track {
        flex: 1;
        height: 5px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 3px;
        overflow: hidden;
        max-width: 140px;
    }

    .progress-bar-fill {
        height: 100%;
        background: #00f3ff;
        border-radius: 3px;
        transition: width 0.3s ease;
    }

    .progress-bar-fill.done {
        background: #10b981;
    }

    .progress-ratio {
        font-size: 0.68em;
        font-weight: 700;
        color: var(--text-muted);
    }

    .quest-right {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
    }

    .rewards-preview {
        display: flex;
        gap: 5px;
    }

    .reward-pill {
        font-size: 0.68em;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 6px;
    }

    .reward-pill.xp {
        background: rgba(0, 243, 255, 0.1);
        color: #00f3ff;
    }

    .reward-pill.coin {
        display: flex;
        align-items: center;
        gap: 3px;
        background: rgba(255, 215, 0, 0.1);
        color: #ffd700;
    }

    .claim-btn {
        display: flex;
        align-items: center;
        gap: 5px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: #fff;
        border: none;
        padding: 5px 12px;
        border-radius: 8px;
        font-size: 0.75em;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
        animation: pulseClaim 1.5s infinite;
    }

    @keyframes pulseClaim {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.06); }
    }
</style>
