<script lang="ts">
    import { studyHubStore } from '../../store';
    import { 
        Heart, 
        Coins, 
        Calendar,
        ChevronLeft,
        ChevronRight,
        Swords,
        Skull,
        ShieldAlert
    } from 'lucide-svelte';

    $: bosses = $studyHubStore.rpg?.activeBosses || [];
    
    let selectedBossIndex = 0;

    // Automatically follow first undefeated boss if not explicitly toggled
    $: {
        const firstUndefeated = bosses.findIndex(b => !b.isDefeated);
        if (firstUndefeated !== -1 && selectedBossIndex >= bosses.length) {
            selectedBossIndex = firstUndefeated;
        }
    }

    $: currentBoss = bosses[selectedBossIndex] || bosses[0];
    $: hpPercent = currentBoss ? Math.max(0, Math.min(100, Math.floor((currentBoss.currentHp / currentBoss.maxHp) * 100))) : 0;
    $: defeatedCount = bosses.filter(b => b.isDefeated).length;

    function getBossIcon(bossType: string): string {
        switch (bossType) {
            case 'hydra': return '🐍';
            case 'dragon': return '🐉';
            case 'golem': return '🗿';
            case 'demon': return '👹';
            case 'reaper': return '💀';
            case 'kraken': return '🦑';
            case 'wizard': return '🧙‍♂️';
            case 'cyborg': return '🤖';
            case 'titan': return '🌋';
            case 'phoenix': return '🔥';
            case 'lich': return '⚡';
            case 'cerberus': return '🐺';
            case 'chimera': return '🦅';
            case 'beast': return '🛡️';
            default: return '👹';
        }
    }

    function prevBoss() {
        if (bosses.length === 0) return;
        selectedBossIndex = (selectedBossIndex - 1 + bosses.length) % bosses.length;
    }

    function nextBoss() {
        if (bosses.length === 0) return;
        selectedBossIndex = (selectedBossIndex + 1) % bosses.length;
    }
</script>

{#if currentBoss}
    <div class="boss-battle-card {currentBoss.isDefeated ? 'defeated' : ''}">
        <!-- Boss Navigation Header -->
        <div class="boss-nav-bar">
            <div class="boss-roster-info">
                <Swords size={14} color="#ef4444" />
                <span class="roster-label">RAID BOSS GAUNTLET</span>
                <span class="roster-counter">{selectedBossIndex + 1} / {bosses.length}</span>
                {#if defeatedCount > 0}
                    <span class="slain-badge"><Skull size={10} /> {defeatedCount} Slain</span>
                {/if}
            </div>

            <div class="nav-btn-group">
                <button type="button" class="nav-btn" on:click={prevBoss} title="Previous Boss">
                    <ChevronLeft size={14} />
                </button>
                <button type="button" class="nav-btn" on:click={nextBoss} title="Next Boss">
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>

        <div class="boss-header">
            <div class="boss-avatar-wrapper">
                <span class="boss-icon">{getBossIcon(currentBoss.bossType)}</span>
            </div>

            <div class="boss-title-box">
                <div class="boss-title-row">
                    <span class="boss-name">{currentBoss.title}</span>
                    <span class="boss-badge">{currentBoss.subtitle}</span>
                </div>

                <div class="boss-meta">
                    <span class="deadline-tag">
                        <Calendar size={12} /> Target: {currentBoss.deadlineDate}
                    </span>
                    <span class="loot-tag">
                        <Coins size={12} color="#ffd700" /> +{currentBoss.rewardCoins} &bull; +{currentBoss.rewardXp} XP
                    </span>
                </div>
            </div>
        </div>

        <!-- Boss HP Bar -->
        <div class="boss-hp-section">
            <div class="hp-info-row">
                <span class="hp-label {currentBoss.isDefeated ? 'slain' : ''}">
                    {#if currentBoss.isDefeated}
                        <Skull size={12} color="#10b981" /> SLAIN IN BATTLE
                    {:else}
                        <Heart size={12} color="#ef4444" /> BOSS HP
                    {/if}
                </span>
                <span class="hp-values">{currentBoss.currentHp} / {currentBoss.maxHp} HP ({hpPercent}%)</span>
            </div>

            <div class="hp-track">
                <div 
                    class="hp-fill {hpPercent < 30 && !currentBoss.isDefeated ? 'critical' : ''} {currentBoss.isDefeated ? 'empty' : ''}" 
                    style="width: {hpPercent}%;"
                ></div>
            </div>
        </div>
    </div>
{/if}

<style>
    .boss-battle-card {
        background: linear-gradient(135deg, rgba(20, 10, 15, 0.85) 0%, rgba(10, 12, 18, 0.85) 100%);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(239, 68, 68, 0.35);
        border-radius: 14px;
        padding: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(239, 68, 68, 0.05);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
        flex: 1;
        transition: all 0.3s ease;
        box-sizing: border-box;
    }

    .boss-battle-card:hover {
        border-color: rgba(239, 68, 68, 0.55);
        box-shadow: 0 10px 35px rgba(239, 68, 68, 0.15);
    }

    .boss-battle-card.defeated {
        border-color: rgba(16, 185, 129, 0.4);
        background: rgba(10, 20, 15, 0.85);
    }

    .boss-nav-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        padding-bottom: 8px;
    }

    .boss-roster-info {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .roster-label {
        font-size: 0.76em;
        font-weight: 800;
        letter-spacing: 0.8px;
        color: #fff;
    }

    .roster-counter {
        font-size: 0.68em;
        font-weight: 700;
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        padding: 1px 6px;
        border-radius: 8px;
        border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .slain-badge {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 0.65em;
        font-weight: 700;
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
        padding: 1px 6px;
        border-radius: 8px;
        border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .nav-btn-group {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .nav-btn {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: var(--text-normal);
        border-radius: 6px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
    }

    .nav-btn:hover {
        background: rgba(239, 68, 68, 0.2);
        border-color: #ef4444;
        color: #fff;
    }

    .boss-header {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .boss-avatar-wrapper {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, rgba(10, 10, 15, 0.9) 100%);
        border: 1.5px solid rgba(239, 68, 68, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
        flex-shrink: 0;
    }

    .boss-icon {
        font-size: 1.6em;
        line-height: 1;
    }

    .boss-title-box {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }

    .boss-title-row {
        display: flex;
        align-items: baseline;
        gap: 8px;
        flex-wrap: wrap;
    }

    .boss-name {
        font-size: 0.92em;
        font-weight: 800;
        color: #fff;
        letter-spacing: 0.3px;
    }

    .boss-badge {
        font-size: 0.68em;
        color: rgba(239, 68, 68, 0.9);
        font-weight: 700;
    }

    .boss-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.72em;
        color: var(--text-muted);
        flex-wrap: wrap;
    }

    .deadline-tag, .loot-tag {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .boss-hp-section {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .hp-info-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.72em;
    }

    .hp-label {
        display: flex;
        align-items: center;
        gap: 4px;
        font-weight: 800;
        color: #ef4444;
        letter-spacing: 0.5px;
    }

    .hp-label.slain {
        color: #10b981;
    }

    .hp-values {
        font-weight: 700;
        color: var(--text-muted);
    }

    .hp-track {
        height: 8px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 4px;
        overflow: hidden;
    }

    .hp-fill {
        height: 100%;
        background: linear-gradient(90deg, #ef4444, #f59e0b);
        border-radius: 4px;
        transition: width 0.4s ease;
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
    }

    .hp-fill.critical {
        background: #ef4444;
        animation: pulseCrit 1s infinite;
    }

    .hp-fill.empty {
        background: #10b981;
    }

    @keyframes pulseCrit {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
    }
</style>
