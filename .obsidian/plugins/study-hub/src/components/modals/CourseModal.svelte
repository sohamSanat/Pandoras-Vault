<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { X, Calculator, Code, Network, SquareTerminal, Monitor, BookOpen, PenTool, Brain, Atom } from 'lucide-svelte';
    import { addCourse } from '../../store';
    import { openOrCreateNote, getCourseTemplate } from '../../utils/vault';
    import type { App } from 'obsidian';

    export let app: App;

    const dispatch = createEventDispatcher();

    let title = '';
    let selectedIcon = 'Calculator';

    const iconOptions = [
        { name: 'Calculator', Icon: Calculator },
        { name: 'Code', Icon: Code },
        { name: 'Network', Icon: Network },
        { name: 'SquareTerminal', Icon: SquareTerminal },
        { name: 'Monitor', Icon: Monitor },
        { name: 'BookOpen', Icon: BookOpen },
        { name: 'PenTool', Icon: PenTool },
        { name: 'Brain', Icon: Brain },
        { name: 'Atom', Icon: Atom }
    ];

    async function handleSubmit() {
        if (!title.trim()) return;
        const cleanTitle = title.trim();
        const folderPath = `07 Notes/Courses/${cleanTitle}`;
        
        // Add to store
        addCourse({
            title: cleanTitle,
            icon: selectedIcon,
            folderPath
        });

        // Create main course note in Obsidian
        const notePath = `${folderPath}/${cleanTitle}.md`;
        await openOrCreateNote(app, notePath, getCourseTemplate(cleanTitle));

        dispatch('close');
    }
</script>

<div class="modal-backdrop" on:click={() => dispatch('close')}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-card" on:click|stopPropagation>
        <div class="modal-header">
            <h3>Add New Course</h3>
            <button class="close-btn" on:click={() => dispatch('close')}>
                <X size={18} />
            </button>
        </div>

        <form on:submit|preventDefault={handleSubmit}>
            <div class="form-group">
                <label for="course-title">Course Title</label>
                <input 
                    id="course-title" 
                    type="text" 
                    bind:value={title} 
                    placeholder="e.g. Physics II, Machine Learning" 
                    required 
                    autofocus
                />
            </div>

            <div class="form-group">
                <label>Select Icon</label>
                <div class="icon-selector">
                    {#each iconOptions as opt}
                        {@const OptIcon = opt.Icon}
                        <button 
                            type="button" 
                            class="icon-choice {selectedIcon === opt.name ? 'active' : ''}" 
                            on:click={() => selectedIcon = opt.name}
                        >
                            <svelte:component this={OptIcon} size={20} />
                        </button>
                    {/each}
                </div>
            </div>

            <div class="modal-actions">
                <button type="button" class="btn-secondary" on:click={() => dispatch('close')}>Cancel</button>
                <button type="submit" class="btn-primary">Create Course</button>
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
        letter-spacing: 0.05em;
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

    input {
        background: #18181b;
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        padding: 10px 14px;
        color: var(--text-normal);
        font-size: 0.95em;
    }

    input:focus {
        outline: none;
        border-color: #00f3ff;
    }

    .icon-selector {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;
    }

    .icon-choice {
        background: #18181b;
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        padding: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--text-muted);
        transition: all 0.2s ease;
    }

    .icon-choice:hover {
        background: var(--background-modifier-hover);
        color: var(--text-normal);
    }

    .icon-choice.active {
        border-color: #00f3ff;
        color: #00f3ff;
        background: rgba(0, 243, 255, 0.1);
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
        transition: opacity 0.2s ease;
    }

    .btn-primary:hover {
        opacity: 0.9;
    }
</style>
