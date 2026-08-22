<script lang="ts">
    import type { Task, Project } from '../store';
    import { getDueDateText, isPastDue } from '../store';

    let { task, project = null, onComplete, onDelete } = $props<{
        task: Task,
        project?: Project | null,
        onComplete: () => void,
        onDelete: () => void,
    }>();

    let showMenu = $state(false);

    let isCompleted = $derived(task.status === 'completed');
    let isOverdue   = $derived(task.dueDate ? isPastDue(task.dueDate) && !isCompleted : false);
    let dueText     = $derived(getDueDateText(task.dueDate));
</script>

<svelte:window onclick={() => (showMenu = false)} />

<div class="task-card-v2" class:is-completed={isCompleted} class:is-overdue={isOverdue}>
    <div class="tc-header">
        <div class="tc-title">{task.title}</div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="tc-menu-wrap" onclick={(e) => e.stopPropagation()}>
            <button class="tc-menu-btn" onclick={() => (showMenu = !showMenu)}>···</button>
            {#if showMenu}
                <div class="tc-menu-dropdown">
                    <button class="tc-menu-item danger" onclick={() => { showMenu = false; onDelete(); }}>Delete task</button>
                </div>
            {/if}
        </div>
    </div>

    <div class="tc-details">
        {#if project}
            <div class="tc-detail-row" style="color: {project.color};">
                <span class="tc-project-name">{project.title}</span>
            </div>
        {/if}

        <div class="tc-detail-row">
            <span class="tc-status-pill">
                <span class="tc-status-dot" style="background: {isCompleted ? '#34d399' : '#fb7185'}"></span>
                {isCompleted ? 'Completed' : 'Not started'}
            </span>
        </div>

        {#if dueText}
            <div class="tc-detail-row tc-due-row" class:is-overdue={isOverdue}>
                <span class="tc-due-text">{dueText}</span>
            </div>
        {/if}
    </div>

    <button 
        class="tc-complete-btn" 
        onclick={onComplete}
        disabled={isCompleted}
    >
        {isCompleted ? 'Completed' : 'Mark as completed'}
    </button>
</div>
