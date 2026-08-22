<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { X, ExternalLink, Trash2 } from 'lucide-svelte';
    import { studyHubStore, updateTimetableSlot } from '../../store';
    import { openOrCreateNote, getCourseTemplate } from '../../utils/vault';
    import type { App } from 'obsidian';

    export let app: App;
    export let rowIndex: number;
    export let dayIndex: number;
    export let dayName: string;
    export let timeSlot: string;

    const dispatch = createEventDispatcher();

    const currentSlot = $studyHubStore.timetable[rowIndex]?.days[dayIndex];
    let selectedCourseId = currentSlot?.courseId || '';
    let customName = currentSlot?.customName || '';

    function handleSave() {
        if (!selectedCourseId) {
            updateTimetableSlot(rowIndex, dayIndex, null);
        } else {
            updateTimetableSlot(rowIndex, dayIndex, {
                courseId: selectedCourseId,
                customName: customName.trim() || undefined
            });
        }
        dispatch('close');
    }

    function handleClear() {
        updateTimetableSlot(rowIndex, dayIndex, null);
        dispatch('close');
    }

    async function handleOpenCourse() {
        if (!selectedCourseId) return;
        const course = $studyHubStore.courses.find(c => c.id === selectedCourseId);
        if (course) {
            const path = `07 Notes/Courses/${course.title}/${course.title}.md`;
            await openOrCreateNote(app, path, getCourseTemplate(course.title));
            dispatch('close');
        }
    }
</script>

<div class="modal-backdrop" on:click={() => dispatch('close')}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-card" on:click|stopPropagation>
        <div class="modal-header">
            <div>
                <h3>Edit Schedule Slot</h3>
                <span class="slot-subtitle">{dayName} &bull; {timeSlot}</span>
            </div>
            <button class="close-btn" on:click={() => dispatch('close')}>
                <X size={18} />
            </button>
        </div>

        <form on:submit|preventDefault={handleSave}>
            <div class="form-group">
                <label for="slot-course">Select Course / Class</label>
                <select id="slot-course" bind:value={selectedCourseId}>
                    <option value="">-- Free / Empty Slot --</option>
                    {#each $studyHubStore.courses as c}
                        <option value={c.id}>{c.title}</option>
                    {/each}
                </select>
            </div>

            {#if selectedCourseId}
                <div class="form-group">
                    <label for="slot-custom">Custom Label / Room (Optional)</label>
                    <input id="slot-custom" type="text" bind:value={customName} placeholder="e.g. Lab 204, Lecture Hall A" />
                </div>

                <div class="action-row">
                    <button type="button" class="btn-link" on:click={handleOpenCourse}>
                        <ExternalLink size={14} /> Open Course Note in Vault
                    </button>
                </div>
            {/if}

            <div class="modal-actions">
                {#if currentSlot}
                    <button type="button" class="btn-danger" on:click={handleClear}>
                        <Trash2 size={14} /> Clear Slot
                    </button>
                {/if}
                <div style="flex: 1;"></div>
                <button type="button" class="btn-secondary" on:click={() => dispatch('close')}>Cancel</button>
                <button type="submit" class="btn-primary">Save Slot</button>
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
        align-items: flex-start;
        margin-bottom: 20px;
        border-bottom: 1px solid var(--background-modifier-border);
        padding-bottom: 12px;
    }

    .modal-header h3 {
        margin: 0;
        color: #00f3ff;
        font-size: 1.2em;
    }

    .slot-subtitle {
        font-size: 0.85em;
        color: var(--text-muted);
    }

    .close-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
    }

    label {
        font-size: 0.85em;
        color: var(--text-muted);
        font-weight: 500;
    }

    input, select {
        background: #18181b;
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        padding: 10px 12px;
        color: var(--text-normal);
        font-size: 0.95em;
    }

    input:focus, select:focus {
        outline: none;
        border-color: #00f3ff;
    }

    .action-row {
        margin-bottom: 16px;
    }

    .btn-link {
        background: transparent;
        border: none;
        color: #00f3ff;
        font-size: 0.85em;
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        padding: 0;
    }

    .btn-link:hover {
        text-decoration: underline;
    }

    .modal-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 24px;
    }

    .btn-danger {
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85em;
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
