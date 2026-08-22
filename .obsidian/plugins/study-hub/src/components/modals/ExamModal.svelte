<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { X } from 'lucide-svelte';
    import { studyHubStore, addExam } from '../../store';
    import { formatDateIso } from '../../utils/dateUtils';

    const dispatch = createEventDispatcher();

    let title = '';
    let courseId = $studyHubStore.courses[0]?.id || '';
    let examDate = formatDateIso(new Date());
    let isPast = false;

    function handleSubmit() {
        if (!title.trim() || !courseId) return;

        addExam({
            title: title.trim(),
            courseId,
            examDate,
            isPast
        });

        dispatch('close');
    }
</script>

<div class="modal-backdrop" on:click={() => dispatch('close')}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-card" on:click|stopPropagation>
        <div class="modal-header">
            <h3>New Exam</h3>
            <button class="close-btn" on:click={() => dispatch('close')}>
                <X size={18} />
            </button>
        </div>

        <form on:submit|preventDefault={handleSubmit}>
            <div class="form-group">
                <label for="exam-title">Exam Title</label>
                <input 
                    id="exam-title" 
                    type="text" 
                    bind:value={title} 
                    placeholder="e.g. Midterm Exam, Finals Part 1" 
                    required 
                    autofocus
                />
            </div>

            <div class="form-group">
                <label for="exam-course">Subject / Course</label>
                <select id="exam-course" bind:value={courseId}>
                    {#each $studyHubStore.courses as c}
                        <option value={c.id}>{c.title}</option>
                    {/each}
                </select>
            </div>

            <div class="form-row">
                <div class="form-group" style="flex: 1;">
                    <label for="exam-date">Exam Date</label>
                    <input id="exam-date" type="date" bind:value={examDate} required />
                </div>

                <div class="form-group" style="flex: 1;">
                    <label for="exam-status">Status</label>
                    <select id="exam-status" bind:value={isPast}>
                        <option value={false}>Upcoming</option>
                        <option value={true}>Past</option>
                    </select>
                </div>
            </div>

            <div class="modal-actions">
                <button type="button" class="btn-secondary" on:click={() => dispatch('close')}>Cancel</button>
                <button type="submit" class="btn-primary">Add Exam</button>
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

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
    }

    .form-row {
        display: flex;
        gap: 12px;
    }

    label {
        font-size: 0.85em;
        color: var(--text-muted);
        font-weight: 500;
    }

    input[type="text"], input[type="date"], select {
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

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 20px;
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
