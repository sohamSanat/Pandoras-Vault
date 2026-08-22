<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { X, Volume2, VolumeX } from 'lucide-svelte';
    import { studyHubStore, updatePomodoroSettings } from '../../store';
    import { playChimeSound } from '../../utils/audio';

    const dispatch = createEventDispatcher();

    let workMinutes = $studyHubStore.pomodoro?.workMinutes || 25;
    let shortBreakMinutes = $studyHubStore.pomodoro?.shortBreakMinutes || 5;
    let longBreakMinutes = $studyHubStore.pomodoro?.longBreakMinutes || 15;
    let soundEnabled = $studyHubStore.pomodoro?.soundEnabled ?? true;

    function handleSubmit() {
        updatePomodoroSettings({
            workMinutes: Number(workMinutes) || 25,
            shortBreakMinutes: Number(shortBreakMinutes) || 5,
            longBreakMinutes: Number(longBreakMinutes) || 15,
            soundEnabled
        });
        dispatch('close');
    }

    function testSound() {
        playChimeSound();
    }
</script>

<div class="modal-backdrop" on:click={() => dispatch('close')}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-card" on:click|stopPropagation>
        <div class="modal-header">
            <h3>Pomodoro Settings</h3>
            <button class="close-btn" on:click={() => dispatch('close')}>
                <X size={18} />
            </button>
        </div>

        <form on:submit|preventDefault={handleSubmit}>
            <div class="form-row">
                <div class="form-group">
                    <label for="work-min">Focus (min)</label>
                    <input id="work-min" type="number" min="1" max="180" bind:value={workMinutes} required />
                </div>

                <div class="form-group">
                    <label for="short-min">Short Break (min)</label>
                    <input id="short-min" type="number" min="1" max="60" bind:value={shortBreakMinutes} required />
                </div>

                <div class="form-group">
                    <label for="long-min">Long Break (min)</label>
                    <input id="long-min" type="number" min="1" max="90" bind:value={longBreakMinutes} required />
                </div>
            </div>

            <div class="sound-row">
                <label class="checkbox-label">
                    <input type="checkbox" bind:checked={soundEnabled} />
                    <span>Play Audio Chime when finished</span>
                </label>

                {#if soundEnabled}
                    <button type="button" class="btn-test-sound" on:click={testSound}>
                        <Volume2 size={14} /> Test
                    </button>
                {/if}
            </div>

            <div class="modal-actions">
                <button type="button" class="btn-secondary" on:click={() => dispatch('close')}>Cancel</button>
                <button type="submit" class="btn-primary">Save Settings</button>
            </div>
        </form>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-card {
        background: #111;
        border: 1px solid var(--background-modifier-border);
        border-radius: 12px;
        width: 90%;
        max-width: 440px;
        padding: 24px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 1px solid var(--background-modifier-border);
        padding-bottom: 12px;
    }

    .modal-header h3 {
        margin: 0;
        color: #00f3ff;
        font-size: 1.2em;
    }

    .close-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
    }

    .form-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 20px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    label {
        font-size: 0.8em;
        color: var(--text-muted);
        font-weight: 500;
    }

    input[type="number"] {
        background: #18181b;
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        padding: 8px 10px;
        color: var(--text-normal);
        font-size: 0.95em;
    }

    input:focus {
        outline: none;
        border-color: #00f3ff;
    }

    .sound-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px dashed var(--background-modifier-border);
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85em;
        color: var(--text-normal);
        cursor: pointer;
    }

    .btn-test-sound {
        background: var(--background-secondary);
        border: 1px solid var(--background-modifier-border);
        color: var(--text-muted);
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 0.8em;
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
    }

    .btn-test-sound:hover {
        color: var(--text-normal);
        background: var(--background-modifier-hover);
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
    }

    .btn-secondary {
        background: transparent;
        border: 1px solid var(--background-modifier-border);
        color: var(--text-muted);
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
    }

    .btn-primary {
        background: #00f3ff;
        border: none;
        color: #000;
        font-weight: 600;
        padding: 8px 18px;
        border-radius: 6px;
        cursor: pointer;
    }

    .btn-primary:hover {
        opacity: 0.9;
    }
</style>
