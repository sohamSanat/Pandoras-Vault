<script lang="ts">
    import type { Project } from '../store';
    import { getDueDateStatus, isPastDue } from '../store';

    let { project, taskCounts, onComplete, onDelete } = $props<{
        project: Project,
        taskCounts: { total: number; completed: number; incomplete: number },
        onComplete: () => void,
        onDelete: () => void,
    }>();

    let showMenu = $state(false);

    let progressPct = $derived(taskCounts.total === 0 ? 0 : Math.round((taskCounts.completed / taskCounts.total) * 100));
    
    let isCompleted = $derived(project.status === 'completed');
    let isOverdue   = $derived(project.dueDate ? isPastDue(project.dueDate) && !isCompleted : false);
    let dueStatus   = $derived(getDueDateStatus(project.dueDate));
</script>

<svelte:window onclick={() => (showMenu = false)} />

<div class="project-card" class:is-completed={isCompleted} class:is-overdue={isOverdue}>
    <div class="project-header">
        <div class="project-title-row">
            <span class="project-color-dot" style="background-color: {project.color}"></span>
            <span class="project-title">{project.title}</span>
        </div>
        
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="project-menu-wrap" onclick={(e) => e.stopPropagation()}>
            <button class="menu-btn" onclick={() => (showMenu = !showMenu)}>···</button>
            {#if showMenu}
                <div class="menu-dropdown">
                    {#if !isCompleted}
                        <button class="menu-item" onclick={() => { showMenu = false; onComplete(); }}>✓ Mark complete</button>
                    {/if}
                    <button class="menu-item danger" onclick={() => { showMenu = false; onDelete(); }}>Delete project</button>
                </div>
            {/if}
        </div>
    </div>

    <div class="project-meta">
        <div class="meta-item">
            <span class="meta-icon">Due: </span> 
            <span class={isOverdue ? 'overdue-text' : ''}>{dueStatus}</span>
        </div>
        <div class="meta-item">
            <span class="meta-icon"></span> {taskCounts.incomplete} tasks remaining
        </div>
    </div>

    <div class="project-progress">
        <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width: {progressPct}%; background-color: {project.color}"></div>
        </div>
        <div class="progress-text">{progressPct}% ({taskCounts.completed}/{taskCounts.total})</div>
    </div>
</div>
