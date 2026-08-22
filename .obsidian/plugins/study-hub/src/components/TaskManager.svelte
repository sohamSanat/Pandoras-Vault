<script lang="ts">
    import { CheckSquare, Square, Plus, Trash2, Edit2, Check, X, Tag, Calendar, AlertCircle, Layers } from 'lucide-svelte';
    import { 
        studyHubStore, 
        toggleTask, 
        advanceTaskStatus, 
        deleteTask, 
        addTask, 
        editTask,
        clearCompletedTasks,
        clearAllTasks 
    } from '../store';
    import { isDateInThisWeek, formatFriendlyDate, formatDateIso } from '../utils/dateUtils';
    import TaskModal from './modals/TaskModal.svelte';

    let tabs = ['All Tasks', 'This Week', 'Unrelated Task', 'Priority Board'];
    let activeTab = tabs[0];
    let showTaskModal = false;

    // Quick Add Bar state
    let quickText = '';
    let quickCourseId = '';
    let quickPriority: 'Low' | 'Medium' | 'High' = 'Medium';
    let quickDate = formatDateIso(new Date());

    // Inline Edit State
    let editingId: string | null = null;
    let editText = '';
    let editCourseId = '';
    let editPriority: 'Low' | 'Medium' | 'High' = 'Medium';
    let editDate = '';

    function getCourse(courseId?: string) {
        if (!courseId) return null;
        return $studyHubStore.courses.find(c => c.id === courseId);
    }

    function handleQuickAdd() {
        if (!quickText.trim()) return;
        addTask({
            text: quickText.trim(),
            courseId: quickCourseId || undefined,
            priority: quickPriority,
            date: quickDate || formatDateIso(new Date()),
            status: 'Not Started',
            completed: false
        });
        quickText = '';
    }

    function handleQuickKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            handleQuickAdd();
        }
    }

    function startEdit(task: any) {
        editingId = task.id;
        editText = task.text;
        editCourseId = task.courseId || '';
        editPriority = task.priority || 'Medium';
        editDate = task.date || formatDateIso(new Date());
    }

    function saveEdit() {
        if (editingId && editText.trim()) {
            editTask(editingId, {
                text: editText.trim(),
                courseId: editCourseId || undefined,
                priority: editPriority,
                date: editDate
            });
        }
        editingId = null;
    }

    $: filteredTasks = (() => {
        const all = $studyHubStore.tasks || [];
        if (activeTab === 'All Tasks') {
            return all;
        } else if (activeTab === 'This Week') {
            return all.filter(t => isDateInThisWeek(t.date));
        } else if (activeTab === 'Unrelated Task') {
            return all.filter(t => !t.courseId);
        } else if (activeTab === 'Priority Board') {
            const priorityWeight: Record<string, number> = { High: 1, Medium: 2, Low: 3 };
            return [...all].sort((a, b) => (priorityWeight[a.priority] || 4) - (priorityWeight[b.priority] || 4));
        }
        return all;
    })();

    $: hasCompletedInView = filteredTasks.some(t => t.completed);
</script>

{#if showTaskModal}
    <TaskModal on:close={() => showTaskModal = false} />
{/if}

<div class="task-manager-card">
    <div class="tm-header">
        <div class="header-left">
            <h3 class="tm-title">Task-Manager</h3>
            <span class="count-pill">{filteredTasks.length} tasks</span>
        </div>

        <div class="header-actions">
            {#if hasCompletedInView}
                <button type="button" class="action-link" on:click={clearCompletedTasks} title="Clear completed tasks">
                    Clear Done
                </button>
            {/if}
            {#if filteredTasks.length > 0}
                <button type="button" class="action-link danger" on:click={clearAllTasks} title="Delete all tasks">
                    Clear All
                </button>
            {/if}
        </div>
    </div>

    <div class="tm-tabs">
        {#each tabs as tab}
            <button 
                type="button"
                class="tab-btn {activeTab === tab ? 'active' : ''}"
                on:click={() => activeTab = tab}
            >
                <CheckSquare size={14} class="tab-icon"/> {tab}
            </button>
        {/each}
    </div>

    <div class="task-list">
        {#if filteredTasks.length === 0}
            <div class="empty-state-box">
                <Layers size={24} color="rgba(0, 243, 255, 0.4)" />
                <span class="empty-title">No tasks in "{activeTab}"</span>
                <span class="empty-subtitle">Use the quick add bar below or click "+ Advanced" to create a task</span>
            </div>
        {:else}
            {#each filteredTasks as task (task.id)}
                {@const course = getCourse(task.courseId)}
                <div class="task-row">
                    {#if editingId === task.id}
                        <!-- Inline Edit Task Row -->
                        <div class="inline-edit-task-row">
                            <input type="text" class="edit-text-input" bind:value={editText} placeholder="Task title" />
                            <select bind:value={editCourseId} class="edit-select">
                                <option value="">No Course</option>
                                {#each $studyHubStore.courses as c}
                                    <option value={c.id}>{c.title}</option>
                                {/each}
                            </select>
                            <select bind:value={editPriority} class="edit-select">
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                            <input type="date" class="edit-date-input" bind:value={editDate} />
                            <button type="button" class="btn-icon-save" on:click={saveEdit} title="Save">
                                <Check size={14} />
                            </button>
                            <button type="button" class="btn-icon-cancel" on:click={() => editingId = null} title="Cancel">
                                <X size={14} />
                            </button>
                        </div>
                    {:else}
                        <!-- Normal Task Row -->
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div class="task-left" class:completed={task.completed} on:click={() => toggleTask(task.id)}>
                            <div class="checkbox">
                                {#if task.completed}
                                    <CheckSquare size={16} color="#00f3ff" />
                                {:else}
                                    <Square size={16} color="var(--text-muted)" />
                                {/if}
                            </div>
                            <span class="task-text">{task.text}</span>
                        </div>

                        <div class="task-right">
                            {#if course}
                                <div class="tag course-tag">
                                    {course.title}
                                </div>
                            {/if}

                            <div class="tag priority-tag {task.priority.toLowerCase()}">
                                {task.priority}
                            </div>

                            <div class="date-text">
                                {formatFriendlyDate(task.date)}
                            </div>

                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <div 
                                class="tag status-tag {task.status === 'In Progress' ? 'progress' : task.status === 'Completed' ? 'completed' : 'not-started'}"
                                on:click|stopPropagation={() => advanceTaskStatus(task.id)}
                                title="Click to cycle status"
                            >
                                <span class="dot"></span>
                                {task.status}
                            </div>

                            <button type="button" class="icon-btn edit-btn" on:click|stopPropagation={() => startEdit(task)} title="Edit Task">
                                <Edit2 size={13} />
                            </button>

                            <button type="button" class="icon-btn delete-btn" on:click|stopPropagation={() => deleteTask(task.id)} title="Delete Task">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    {/if}
                </div>
            {/each}
        {/if}
    </div>

    <!-- Quick Inline Add Task Bar -->
    <div class="quick-add-bar">
        <input 
            type="text" 
            placeholder="+ Quick add task (Press Enter to save)..." 
            bind:value={quickText}
            on:keydown={handleQuickKeyDown}
        />
        <select bind:value={quickCourseId} title="Assign Course">
            <option value="">No Course</option>
            {#each $studyHubStore.courses as c}
                <option value={c.id}>{c.title}</option>
            {/each}
        </select>
        <select bind:value={quickPriority} title="Priority">
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
        </select>
        <button type="button" class="btn-quick-add" on:click={handleQuickAdd}>Add</button>
        <button type="button" class="btn-modal-open" on:click={() => showTaskModal = true} title="Open detailed modal">
            <Plus size={14} /> Advanced
        </button>
    </div>
</div>

<style>
    .task-manager-card {
        background-color: #080808;
        border: 1px solid var(--background-modifier-border);
        border-radius: 8px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        width: 100%;
        margin-top: 10px;
    }

    .tm-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--background-modifier-border);
        padding-bottom: 12px;
        margin-bottom: 16px;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .tm-title {
        font-family: var(--font-interface);
        font-size: 1.2em;
        font-weight: 600;
        letter-spacing: 0.1em;
        margin: 0;
        color: #00f3ff;
        text-shadow: 0 0 8px rgba(0, 243, 255, 0.4);
    }

    .count-pill {
        font-size: 0.72em;
        background: rgba(0, 243, 255, 0.12);
        color: #00f3ff;
        padding: 2px 8px;
        border-radius: 10px;
        font-weight: 700;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .action-link {
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 0.75em;
        cursor: pointer;
        transition: color 0.15s ease;
    }

    .action-link:hover {
        color: #00f3ff;
        text-decoration: underline;
    }

    .action-link.danger:hover {
        color: #ef4444;
    }

    .tm-tabs {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--background-modifier-border);
        flex-wrap: wrap;
    }

    .tab-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 0.88em;
        font-weight: 500;
        padding: 8px 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        transition: color 0.2s ease;
    }

    .tab-btn:hover {
        color: var(--text-normal);
    }

    .tab-btn.active {
        color: #00f3ff;
        border-bottom-color: #00f3ff;
    }

    .task-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
        min-height: 80px;
    }

    .empty-state-box {
        padding: 32px 16px;
        text-align: center;
        background: rgba(255, 255, 255, 0.015);
        border: 1px dashed rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
    }

    .empty-title {
        color: var(--text-normal);
        font-size: 0.9em;
        font-weight: 600;
    }

    .empty-subtitle {
        color: var(--text-muted);
        font-size: 0.78em;
    }

    .task-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 10px;
        border-radius: 6px;
        border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
        transition: background-color 0.15s ease;
    }
    
    .task-row:hover {
        background: rgba(255, 255, 255, 0.02);
    }

    .task-left {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        user-select: none;
        flex: 1;
    }

    .task-left.completed .task-text {
        text-decoration: line-through;
        opacity: 0.4;
    }

    .task-text {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--text-normal);
        transition: color 0.2s;
    }

    .task-left:hover .task-text {
        color: #00f3ff;
    }

    .task-right {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .tag {
        font-size: 0.72em;
        padding: 2px 8px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 4px;
        font-weight: 600;
    }

    .course-tag {
        background: rgba(255, 255, 255, 0.04);
        color: var(--text-normal);
        border: 1px solid var(--background-modifier-border);
    }

    .priority-tag.high {
        background-color: rgba(239, 68, 68, 0.15);
        color: #ef4444;
    }
    .priority-tag.medium {
        background-color: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
    }
    .priority-tag.low {
        background-color: rgba(59, 130, 246, 0.15);
        color: #3b82f6;
    }

    .date-text {
        font-size: 0.75em;
        color: var(--text-muted);
        min-width: 75px;
        text-align: right;
    }

    .status-tag {
        background-color: var(--background-secondary);
        color: var(--text-muted);
        border: 1px solid var(--background-modifier-border);
        min-width: 85px;
        cursor: pointer;
        user-select: none;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .status-tag:hover {
        border-color: var(--text-normal);
    }

    .status-tag .dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background-color: var(--text-muted);
    }

    .status-tag.progress {
        background-color: rgba(245, 158, 11, 0.1);
        border-color: rgba(245, 158, 11, 0.2);
        color: #f59e0b;
    }
    .status-tag.progress .dot {
        background-color: #f59e0b;
    }

    .status-tag.completed {
        background-color: rgba(16, 185, 129, 0.1);
        border-color: rgba(16, 185, 129, 0.2);
        color: #10b981;
    }
    .status-tag.completed .dot {
        background-color: #10b981;
    }

    .icon-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        opacity: 0.3;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        border-radius: 4px;
        transition: all 0.15s ease;
    }

    .task-row:hover .icon-btn {
        opacity: 1;
    }

    .icon-btn.edit-btn:hover {
        color: #00f3ff;
        background: rgba(0, 243, 255, 0.1);
    }

    .icon-btn.delete-btn:hover {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
    }

    /* Quick Add Bar */
    .quick-add-bar {
        display: flex;
        gap: 8px;
        align-items: center;
        padding-top: 12px;
        border-top: 1px solid var(--background-modifier-border);
        flex-wrap: wrap;
    }

    .quick-add-bar input[type="text"] {
        flex: 2;
        min-width: 200px;
        background: #11141a;
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        padding: 7px 12px;
        color: var(--text-normal);
        font-size: 0.85em;
    }

    .quick-add-bar input[type="text"]:focus {
        outline: none;
        border-color: #00f3ff;
    }

    .quick-add-bar select {
        background: #11141a;
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        padding: 7px 10px;
        color: var(--text-muted);
        font-size: 0.82em;
    }

    .btn-quick-add {
        background: #00f3ff;
        color: #000;
        border: none;
        font-weight: 700;
        padding: 7px 14px;
        border-radius: 6px;
        font-size: 0.82em;
        cursor: pointer;
    }

    .btn-modal-open {
        display: flex;
        align-items: center;
        gap: 4px;
        background: transparent;
        border: 1px dashed var(--background-modifier-border);
        color: var(--text-muted);
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 0.8em;
        cursor: pointer;
    }

    .btn-modal-open:hover {
        border-color: #00f3ff;
        color: #00f3ff;
    }

    /* Inline Edit Task Row */
    .inline-edit-task-row {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
    }

    .edit-text-input {
        flex: 2;
        background: #11141a;
        border: 1px solid #00f3ff;
        border-radius: 4px;
        padding: 4px 8px;
        color: var(--text-normal);
        font-size: 0.85em;
    }

    .edit-select, .edit-date-input {
        background: #11141a;
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        padding: 4px 6px;
        color: var(--text-normal);
        font-size: 0.8em;
    }

    .btn-icon-save {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 4px;
        padding: 4px;
        cursor: pointer;
    }

    .btn-icon-cancel {
        background: transparent;
        color: var(--text-muted);
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        padding: 4px;
        cursor: pointer;
    }
</style>
