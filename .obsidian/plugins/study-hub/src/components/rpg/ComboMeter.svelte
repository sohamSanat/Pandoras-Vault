<script lang="ts">
    import { studyHubStore } from '../../store';
    import { Zap, Flame } from 'lucide-svelte';

    $: multiplier = $studyHubStore.rpg?.comboMultiplier || 1.0;
    $: isHigh = multiplier >= 1.5;
    $: isMax = multiplier >= 2.0;
</script>

<div class="combo-meter {multiplier > 1.0 ? 'active' : ''} {isMax ? 'max' : ''}" title="Flow State Multiplier: Multiplies all incoming XP & Gold Coins!">
    <div class="meter-icon">
        {#if isMax}
            <Flame size={15} color="#ef4444" />
        {:else}
            <Zap size={14} color={multiplier > 1.0 ? '#f59e0b' : 'var(--text-muted)'} />
        {/if}
    </div>
    
    <div class="meter-text">
        <span class="meter-val">{multiplier.toFixed(1)}x</span>
        <span class="meter-label">{isMax ? 'MAX FLOW' : multiplier > 1.0 ? 'FLOW STATE' : 'STANDARD'}</span>
    </div>

    <!-- Mini visual meter bars -->
    <div class="meter-bars">
        <span class="bar active"></span>
        <span class="bar {multiplier >= 1.3 ? 'active' : ''}"></span>
        <span class="bar {multiplier >= 1.6 ? 'active' : ''}"></span>
        <span class="bar {isMax ? 'active max' : ''}"></span>
    </div>
</div>

<style>
    .combo-meter {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(10, 12, 16, 0.7);
        border: 1px solid var(--background-modifier-border);
        padding: 5px 12px;
        border-radius: 20px;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
    }

    .combo-meter.active {
        border-color: rgba(245, 158, 11, 0.5);
        background: rgba(245, 158, 11, 0.1);
        box-shadow: 0 0 15px rgba(245, 158, 11, 0.2);
    }

    .combo-meter.max {
        border-color: rgba(239, 68, 68, 0.6);
        background: rgba(239, 68, 68, 0.15);
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.35);
        animation: pulseMax 1.8s infinite;
    }

    @keyframes pulseMax {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.03); }
    }

    .meter-icon {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .meter-text {
        display: flex;
        align-items: baseline;
        gap: 4px;
    }

    .meter-val {
        font-size: 0.9em;
        font-weight: 800;
        color: #fff;
    }

    .combo-meter.active .meter-val {
        color: #f59e0b;
    }

    .combo-meter.max .meter-val {
        color: #ef4444;
    }

    .meter-label {
        font-size: 0.68em;
        font-weight: 700;
        letter-spacing: 0.5px;
        color: var(--text-muted);
    }

    .meter-bars {
        display: flex;
        gap: 2px;
        align-items: center;
    }

    .bar {
        width: 3px;
        height: 10px;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 2px;
        transition: all 0.2s ease;
    }

    .bar.active {
        background: #f59e0b;
        box-shadow: 0 0 4px #f59e0b;
    }

    .bar.active.max {
        background: #ef4444;
        box-shadow: 0 0 6px #ef4444;
    }
</style>
