<script lang="ts">
    import { Play, Pause, RotateCcw, Settings, Award } from 'lucide-svelte';
    import { onDestroy } from 'svelte';
    import { Notice } from 'obsidian';
    import { studyHubStore, incrementPomodoroSession } from '../store';
    import { playChimeSound } from '../utils/audio';
    import PomodoroSettingsModal from './modals/PomodoroSettingsModal.svelte';
    import DungeonPomodoroWidget from './rpg/DungeonPomodoroWidget.svelte';

    let showSettingsModal = false;

    type ModeId = 'pomodoro' | 'shortBreak' | 'longBreak';
    let currentModeId: ModeId = 'pomodoro';

    $: workMin = $studyHubStore.pomodoro?.workMinutes || 25;
    $: shortMin = $studyHubStore.pomodoro?.shortBreakMinutes || 5;
    $: longMin = $studyHubStore.pomodoro?.longBreakMinutes || 15;
    $: soundEnabled = $studyHubStore.pomodoro?.soundEnabled ?? true;
    $: completedSessions = $studyHubStore.pomodoro?.completedSessions || 0;

    $: modes = [
        { id: 'pomodoro' as ModeId, label: 'Pomodoro', minutes: workMin },
        { id: 'shortBreak' as ModeId, label: 'Short Break', minutes: shortMin },
        { id: 'longBreak' as ModeId, label: 'Long Break', minutes: longMin }
    ];

    $: currentMode = modes.find(m => m.id === currentModeId) || modes[0];

    let timeLeft = 25 * 60;
    let isRunning = false;
    let timer: number | undefined;

    // Keep timeLeft in sync when minutes setting changes while not running
    $: if (!isRunning) {
        timeLeft = currentMode.minutes * 60;
    }

    function setMode(modeId: ModeId) {
        currentModeId = modeId;
        const target = modes.find(m => m.id === modeId);
        timeLeft = (target ? target.minutes : 25) * 60;
        if (isRunning) pauseTimer();
    }

    function toggleTimer() {
        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }

    function startTimer() {
        isRunning = true;
        timer = window.setInterval(() => {
            if (timeLeft > 0) {
                timeLeft -= 1;
            } else {
                handleComplete();
            }
        }, 1000);
    }

    function handleComplete() {
        pauseTimer();
        if (soundEnabled) {
            playChimeSound();
        }

        if (currentModeId === 'pomodoro') {
            incrementPomodoroSession();
            new Notice('🎉 Pomodoro Complete! Take a well-deserved break.');
            setMode('shortBreak');
        } else {
            new Notice('Break Over! Ready for another focus session?');
            setMode('pomodoro');
        }
    }

    function pauseTimer() {
        isRunning = false;
        if (timer) clearInterval(timer);
    }

    function resetTimer() {
        pauseTimer();
        timeLeft = currentMode.minutes * 60;
    }

    $: minutesStr = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    $: secondsStr = (timeLeft % 60).toString().padStart(2, '0');

    onDestroy(() => {
        if (timer) clearInterval(timer);
    });
</script>

{#if showSettingsModal}
    <PomodoroSettingsModal on:close={() => showSettingsModal = false} />
{/if}

<div class="pomodoro-container">
    <div class="mode-toggles">
        {#each modes as mode}
            <button 
                type="button"
                class="mode-btn {currentModeId === mode.id ? 'active' : ''}" 
                on:click={() => setMode(mode.id)}>
                {mode.label}
            </button>
        {/each}
    </div>

    <div class="timer-display">
        {minutesStr}:{secondsStr}
    </div>

    <div class="controls">
        <button type="button" class="start-btn" on:click={toggleTimer}>
            {isRunning ? 'Pause' : 'Start'}
        </button>
        <button type="button" class="icon-btn" on:click={resetTimer} title="Reset Timer">
            <RotateCcw size={20} />
        </button>
        <button type="button" class="icon-btn" on:click={() => showSettingsModal = true} title="Timer Settings">
            <Settings size={20} />
        </button>
    </div>

    {#if completedSessions > 0}
        <div class="sessions-badge">
            <Award size={14} color="#00f3ff" />
            <span>{completedSessions} focus session{completedSessions > 1 ? 's' : ''} completed</span>
        </div>
    {/if}

    <!-- Dungeon Pomodoro Adventure Widget -->
    <DungeonPomodoroWidget {currentModeId} />
</div>

<style>
    .pomodoro-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: rgba(14, 17, 24, 0.75);
        backdrop-filter: blur(16px);
        border: 1px solid var(--background-modifier-border);
        border-radius: 14px;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .mode-toggles {
        display: flex;
        background: rgba(255, 255, 255, 0.04);
        padding: 4px;
        border-radius: 20px;
        gap: 4px;
        margin-bottom: 16px;
        border: 1px solid var(--background-modifier-border);
    }

    .mode-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        padding: 6px 14px;
        border-radius: 16px;
        font-size: 0.8em;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .mode-btn:hover {
        color: var(--text-normal);
    }

    .mode-btn.active {
        background: #00f3ff;
        color: #000;
        box-shadow: 0 0 10px rgba(0, 243, 255, 0.4);
    }

    .timer-display {
        font-size: 3.2em;
        font-weight: 800;
        font-family: var(--font-monospace, monospace);
        color: #ffffff;
        letter-spacing: 2px;
        text-shadow: 0 0 20px rgba(0, 243, 255, 0.25);
        margin-bottom: 16px;
    }

    .controls {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
    }

    .start-btn {
        background: #00f3ff;
        color: #000000;
        border: none;
        padding: 8px 28px;
        border-radius: 20px;
        font-size: 0.95em;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 0 15px rgba(0, 243, 255, 0.3);
    }

    .start-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 20px rgba(0, 243, 255, 0.5);
    }

    .icon-btn {
        background: transparent;
        border: 1px solid var(--background-modifier-border);
        color: var(--text-muted);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .icon-btn:hover {
        color: var(--text-normal);
        border-color: #00f3ff;
    }

    .sessions-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 10px;
        font-size: 0.75em;
        color: var(--text-muted);
        background: rgba(0, 243, 255, 0.05);
        border: 1px solid rgba(0, 243, 255, 0.15);
        padding: 4px 10px;
        border-radius: 12px;
    }
</style>
