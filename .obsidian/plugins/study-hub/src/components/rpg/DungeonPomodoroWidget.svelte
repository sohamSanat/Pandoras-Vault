<script lang="ts">
    import { studyHubStore } from '../../store';
    import { Castle, Sparkles, Flame, Shield, Footprints } from 'lucide-svelte';

    export let currentModeId: 'pomodoro' | 'shortBreak' | 'longBreak';

    $: dungeon = $studyHubStore.rpg?.dungeon || {
        active: true,
        dungeonName: 'The Pointer Ruins',
        floor: 1,
        totalFloors: 4,
        bossHp: 100,
        maxBossHp: 100
    };

    let encounters = [
        "⛺ You reached a Campfire! Rest well and restore focus HP.",
        "🧙‍♂️ A travelling merchant offers you an Algorithmic Elixir (+10 Focus).",
        "💎 You discovered an Ancient Cache of Gold Coins in the ruins!",
        "🔮 The dungeon air hums with recursive energy. Stay determined!"
    ];

    $: currentEncounter = encounters[dungeon.floor % encounters.length];
</script>

<div class="dungeon-widget {currentModeId === 'shortBreak' ? 'break-encounter' : ''}">
    <div class="dungeon-header">
        <div class="dungeon-title-box">
            <Castle size={14} color="#00f3ff" />
            <span class="dungeon-name">{dungeon.dungeonName}</span>
        </div>

        <div class="floor-badge">
            <Footprints size={12} /> Floor {dungeon.floor} / {dungeon.totalFloors}
        </div>
    </div>

    {#if currentModeId === 'shortBreak' || currentModeId === 'longBreak'}
        <div class="encounter-box">
            <span class="encounter-tag">REST SITE ENCOUNTER</span>
            <p class="encounter-msg">{currentEncounter}</p>
        </div>
    {:else}
        <div class="dungeon-progress-row">
            <div class="floor-dots">
                {#each Array(dungeon.totalFloors) as _, i}
                    <span class="floor-dot {i + 1 <= dungeon.floor ? 'cleared' : ''} {i + 1 === dungeon.floor ? 'current' : ''}"></span>
                {/each}
            </div>
            <span class="dungeon-sub">Defeat floor guardians by focusing!</span>
        </div>
    {/if}
</div>

<style>
    .dungeon-widget {
        background: rgba(0, 243, 255, 0.04);
        border: 1px dashed rgba(0, 243, 255, 0.3);
        border-radius: 10px;
        padding: 10px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 10px;
        transition: all 0.3s ease;
    }

    .dungeon-widget.break-encounter {
        background: rgba(16, 185, 129, 0.08);
        border-color: rgba(16, 185, 129, 0.4);
        border-style: solid;
        box-shadow: 0 0 15px rgba(16, 185, 129, 0.15);
    }

    .dungeon-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .dungeon-title-box {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .dungeon-name {
        font-size: 0.8em;
        font-weight: 700;
        color: #fff;
    }

    .floor-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.7em;
        font-weight: 700;
        color: #00f3ff;
        background: rgba(0, 243, 255, 0.12);
        padding: 2px 6px;
        border-radius: 6px;
    }

    .dungeon-progress-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .floor-dots {
        display: flex;
        gap: 4px;
    }

    .floor-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.15);
        transition: all 0.2s ease;
    }

    .floor-dot.cleared {
        background: #00f3ff;
        box-shadow: 0 0 6px #00f3ff;
    }

    .floor-dot.current {
        background: #ffd700;
        box-shadow: 0 0 8px #ffd700;
        animation: pulseFloor 1.5s infinite;
    }

    @keyframes pulseFloor {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }

    .dungeon-sub {
        font-size: 0.7em;
        color: var(--text-muted);
    }

    .encounter-box {
        background: rgba(0, 0, 0, 0.4);
        border-radius: 6px;
        padding: 8px 10px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .encounter-tag {
        font-size: 0.65em;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: #10b981;
    }

    .encounter-msg {
        font-size: 0.76em;
        color: #fff;
        margin: 0;
        line-height: 1.3;
    }
</style>
