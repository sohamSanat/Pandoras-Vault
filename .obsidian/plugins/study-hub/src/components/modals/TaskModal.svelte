<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { X } from 'lucide-svelte';
    import { studyHubStore, addTask } from '../../store';
    import { formatDateIso } from '../../utils/dateUtils';

    const dispatch = createEventDispatcher();

    let text = '';
    let courseId = '';
    let priority: 'High' | 'Medium' | 'Low' = 'High';
    let date = formatDateIso(new Date());
    let status: 'Not Started' | 'In Progress' | 'Completed' = 'Not Started';

    function handleSubmit() {
        if (!text.trim()) return;

        addTask({
            text: text.trim(),
            courseId: courseId || undefined,
            priority,
            date,
            status,
            completed: status === 'Completed'
        });

        dispatch('close');
    }
</script>

<div class="modal-backdrop" on:click={() => dispatch('close')}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-card" on:click|stopPropagation>
        <div class="modal-header">
            <h3>New Task</h3>
            <button class="close-btn" on:click={() => dispatch('close')}>
                <X size={18} />
            </button>
        </div>

        <form on:submit|preventDefault={handleSubmit}>
            <div class="form-group">
                <label for="task-text">Task Description</label>
                <input 
                    id="task-text" 
                    type="text" 
                    bind:value={text} 
                    placeholder="e.g. Finish chapter 4 practice problems" 
                    required 
                    autofocus
                />
            </div>

            <div class="form-group">
                <label for="task-course">Linked Course (Optional)</label>
                <select id="task-course" bind:value={courseId}>
                    <option value="">-- None (Unrelated Task) --</option>
                    {#each $studyHubStore.courses as c}
                        <option value={c.id}>{c.title}</option>
                    {/each}
                </select>
            </div>

            <div class="form-row">
                <div class="form-group" style="flex: 1;">
                    <label for="task-date">Due Date</label>
                    <input id="task-date" type="date" bind:value={date} required />
                </div>

                <div class="form-group" style="flex: 1;">
                    <label for="task-priority">Priority</label>
                    <select id="task-priority" bind:value={priority}>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="task-status">Status</label>
                <select id="task-status" bind:value={status}>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            <div class="modal-actions">
                <button type="button" class="btn-secondary" on:click={() => dispatch('close')}>Cancel</button>
                <button type="submit" class="btn-primary">Add Task</button>
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
