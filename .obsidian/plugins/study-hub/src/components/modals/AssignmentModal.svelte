<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { X } from 'lucide-svelte';
    import { studyHubStore, addAssignment } from '../../store';
    import { openOrCreateNote, getAssignmentTemplate } from '../../utils/vault';
    import { formatDateIso } from '../../utils/dateUtils';
    import type { App } from 'obsidian';

    export let app: App;
    export let preselectedCourseId: string = '';

    const dispatch = createEventDispatcher();

    let title = '';
    let courseId = preselectedCourseId || ($studyHubStore.courses[0]?.id || '');
    let dueDate = formatDateIso(new Date());
    let priority: 'High' | 'Medium' | 'Low' = 'High';
    let createNote = true;

    async function handleSubmit() {
        if (!title.trim() || !courseId) return;

        const cleanTitle = title.trim();
        const course = $studyHubStore.courses.find(c => c.id === courseId);
        const courseName = course ? course.title : 'General';

        addAssignment({
            title: cleanTitle,
            courseId,
            dueDate,
            completed: false,
            priority
        });

        if (createNote) {
            const path = `07 Notes/Assignments/${courseName} - ${cleanTitle}.md`;
            await openOrCreateNote(app, path, getAssignmentTemplate(cleanTitle, courseName, dueDate));
        }

        dispatch('close');
    }
</script>

<div class="modal-backdrop" on:click={() => dispatch('close')}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-card" on:click|stopPropagation>
        <div class="modal-header">
            <h3>New Assignment</h3>
            <button class="close-btn" on:click={() => dispatch('close')}>
                <X size={18} />
            </button>
        </div>

        <form on:submit|preventDefault={handleSubmit}>
            <div class="form-group">
                <label for="assign-title">Assignment Title</label>
                <input 
                    id="assign-title" 
                    type="text" 
                    bind:value={title} 
                    placeholder="e.g. Lab Report 3, Problem Set #4" 
                    required 
                    autofocus
                />
            </div>

            <div class="form-group">
                <label for="assign-course">Subject / Course</label>
                <select id="assign-course" bind:value={courseId}>
                    {#each $studyHubStore.courses as c}
                        <option value={c.id}>{c.title}</option>
                    {/each}
                </select>
            </div>

            <div class="form-row">
                <div class="form-group" style="flex: 1;">
                    <label for="assign-due">Due Date</label>
                    <input id="assign-due" type="date" bind:value={dueDate} required />
                </div>

                <div class="form-group" style="flex: 1;">
                    <label for="assign-priority">Priority</label>
                    <select id="assign-priority" bind:value={priority}>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
            </div>

            <div class="checkbox-group">
                <label class="checkbox-label">
                    <input type="checkbox" bind:checked={createNote} />
                    <span>Create and open assignment note in vault</span>
                </label>
            </div>

            <div class="modal-actions">
                <button type="button" class="btn-secondary" on:click={() => dispatch('close')}>Cancel</button>
                <button type="submit" class="btn-primary">Add Assignment</button>
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

    .checkbox-group {
        margin-top: 8px;
        margin-bottom: 16px;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85em;
        color: var(--text-muted);
        cursor: pointer;
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
