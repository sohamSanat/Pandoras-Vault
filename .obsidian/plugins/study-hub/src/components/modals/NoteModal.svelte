<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { X } from 'lucide-svelte';
    import { studyHubStore, addSubjectNote } from '../../store';
    import { openOrCreateNote, getNoteTemplate } from '../../utils/vault';
    import type { App } from 'obsidian';

    export let app: App;

    const dispatch = createEventDispatcher();

    let title = '';
    let courseId = $studyHubStore.courses[0]?.id || '';

    async function handleSubmit() {
        if (!title.trim() || !courseId) return;

        const cleanTitle = title.trim();
        const course = $studyHubStore.courses.find(c => c.id === courseId);
        const courseName = course ? course.title : 'General';
        const filePath = `07 Notes/${courseName}/${cleanTitle}.md`;

        // Add to store
        addSubjectNote({
            title: cleanTitle,
            courseId,
            filePath
        });

        // Create and open note in Obsidian
        await openOrCreateNote(app, filePath, getNoteTemplate(cleanTitle, courseName));

        dispatch('close');
    }
</script>

<div class="modal-backdrop" on:click={() => dispatch('close')}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-card" on:click|stopPropagation>
        <div class="modal-header">
            <h3>New Study Note</h3>
            <button class="close-btn" on:click={() => dispatch('close')}>
                <X size={18} />
            </button>
        </div>

        <form on:submit|preventDefault={handleSubmit}>
            <div class="form-group">
                <label for="note-title">Note Title</label>
                <input 
                    id="note-title" 
                    type="text" 
                    bind:value={title} 
                    placeholder="e.g. Graph Traversal Algorithms, Calculus Integrals" 
                    required 
                    autofocus
                />
            </div>

            <div class="form-group">
                <label for="note-course">Subject / Course</label>
                <select id="note-course" bind:value={courseId}>
                    {#each $studyHubStore.courses as c}
                        <option value={c.id}>{c.title}</option>
                    {/each}
                </select>
            </div>

            <div class="modal-actions">
                <button type="button" class="btn-secondary" on:click={() => dispatch('close')}>Cancel</button>
                <button type="submit" class="btn-primary">Create & Open Note</button>
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
