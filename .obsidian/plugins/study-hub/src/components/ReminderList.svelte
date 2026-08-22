<script lang="ts">
    import { List, Plus, Trash2, Calendar, CheckSquare, Square, Edit2, Check, X } from 'lucide-svelte';
    import { 
        studyHubStore, 
        addReminder, 
        toggleReminder, 
        deleteReminder, 
        editReminder,
        clearCompletedReminders,
        clearAllReminders 
    } from '../store';
    import { formatFriendlyDate, formatDateIso } from '../utils/dateUtils';

    let isAdding = false;
    let newTitle = '';
    let newDate = formatDateIso(new Date());

    let editingId: string | null = null;
    let editTitle = '';
    let editDate = '';

    function handleAdd() {
        if (!newTitle.trim()) return;
        addReminder(newTitle, newDate);
        newTitle = '';
        isAdding = false;
    }

    function setQuickDate(offsetDays: number) {
        const d = new Date();
        d.setDate(d.getDate() + offsetDays);
        newDate = formatDateIso(d);
    }

    function startEdit(id: string, currentTitle: string, currentDate: string) {
        editingId = id;
        editTitle = currentTitle;
        editDate = currentDate;
    }

    function saveEdit() {
        if (editingId && editTitle.trim()) {
            editReminder(editingId, { title: editTitle.trim(), date: editDate });
        }
        editingId = null;
    }

    $: totalCount = $studyHubStore.reminders.length;
    $: completedCount = $studyHubStore.reminders.filter(r => r.completed).length;
    $: hasCompleted = completedCount > 0;
</script>

<div class="list-card">
    <div class="list-header">
        <div class="header-title-box">
            <h3 class="list-title">Reminder / Events</h3>
            {#if totalCount > 0}
                <span class="count-pill">{completedCount}/{totalCount}</span>
            {/if}
        </div>

        <div class="header-actions">
            {#if hasCompleted}
                <button type="button" class="action-link" on:click={clearCompletedReminders} title="Clear completed reminders">
                    Clear Done
                </button>
            {/if}
            {#if totalCount > 0}
                <button type="button" class="action-link danger" on:click={clearAllReminders} title="Delete all reminders">
                    Clear All
                </button>
            {/if}
        </div>
    </div>

    {#if !isAdding}
        <button type="button" class="new-item-btn" on:click={() => isAdding = true}>
            <Plus size={14} /> New Reminder / Event
        </button>
    {:else}
        <div class="inline-add-box">
            <input 
                type="text" 
                bind:value={newTitle} 
                placeholder="Event title (e.g. Meetup, Submission deadline)" 
                autofocus
            />
            <div class="date-row">
                <div class="quick-chips">
                    <button type="button" class="chip-btn" on:click={() => setQuickDate(0)}>Today</button>
                    <button type="button" class="chip-btn" on:click={() => setQuickDate(1)}>Tomorrow</button>
                    <button type="button" class="chip-btn" on:click={() => setQuickDate(7)}>+7 Days</button>
                </div>
                <input type="date" bind:value={newDate} />
            </div>
            <div class="inline-actions">
                <button type="button" class="btn-sm btn-primary" on:click={handleAdd}>Add Event</button>
                <button type="button" class="btn-sm btn-cancel" on:click={() => isAdding = false}>Cancel</button>
            </div>
        </div>
    {/if}

    <div class="list-content">
        {#if $studyHubStore.reminders.length === 0}
            <div class="empty-text">No reminders scheduled. Click "+ New Reminder" above to add one!</div>
        {:else}
            <div class="reminder-list">
                {#each $studyHubStore.reminders as rem (rem.id)}
                    <div class="reminder-row">
                        {#if editingId === rem.id}
                            <!-- Inline Edit Mode -->
                            <div class="edit-reminder-box">
                                <input type="text" bind:value={editTitle} />
                                <input type="date" bind:value={editDate} />
                                <div class="edit-actions">
                                    <button type="button" class="edit-btn save" on:click={saveEdit} title="Save">
                                        <Check size={14} />
                                    </button>
                                    <button type="button" class="edit-btn cancel" on:click={() => editingId = null} title="Cancel">
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        {:else}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <div class="reminder-left" on:click={() => toggleReminder(rem.id)}>
                                <div class="checkbox">
                                    {#if rem.completed}
                                        <CheckSquare size={15} color="#00f3ff" />
                                    {:else}
                                        <Square size={15} color="var(--text-muted)" />
                                    {/if}
                                </div>
                                <span class="reminder-text" class:completed={rem.completed}>
                                    {rem.title}
                                </span>
                            </div>

                            <div class="reminder-right">
                                <span class="date-badge">
                                    {formatFriendlyDate(rem.date)}
                                </span>
                                <button type="button" class="action-btn edit-btn" on:click|stopPropagation={() => startEdit(rem.id, rem.title, rem.date)} title="Edit reminder">
                                    <Edit2 size={13} />
                                </button>
                                <button type="button" class="action-btn delete-btn" on:click|stopPropagation={() => deleteReminder(rem.id)} title="Delete reminder">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .list-card {
        background-color: #080808;
        border: 1px solid var(--background-modifier-border);
        border-radius: 8px;
        padding: 20px;
        height: 100%;
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--background-modifier-border);
        padding-bottom: 12px;
        margin-bottom: 14px;
    }

    .header-title-box {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .list-title {
        font-family: var(--font-interface);
        font-size: 1.15em;
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
        padding: 2px 6px;
        border-radius: 10px;
        font-weight: 700;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 10px;
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

    .new-item-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px dashed var(--background-modifier-border);
        color: var(--text-muted);
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 0.82em;
        font-weight: 500;
        cursor: pointer;
        margin-bottom: 12px;
        align-self: flex-start;
        transition: all 0.2s ease;
    }

    .new-item-btn:hover {
        background: rgba(0, 243, 255, 0.08);
        border-color: #00f3ff;
        color: #00f3ff;
    }

    .inline-add-box {
        margin-bottom: 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: rgba(0, 243, 255, 0.03);
        border: 1px solid rgba(0, 243, 255, 0.2);
        padding: 12px;
        border-radius: 8px;
    }

    .inline-add-box input[type="text"], .inline-add-box input[type="date"] {
        background: #11141a;
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        padding: 8px 10px;
        color: var(--text-normal);
        font-size: 0.85em;
    }

    .inline-add-box input:focus {
        outline: none;
        border-color: #00f3ff;
    }

    .date-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .quick-chips {
        display: flex;
        gap: 4px;
    }

    .chip-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--background-modifier-border);
        color: var(--text-muted);
        font-size: 0.72em;
        padding: 3px 8px;
        border-radius: 12px;
        cursor: pointer;
    }

    .chip-btn:hover {
        border-color: #00f3ff;
        color: #00f3ff;
    }

    .inline-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 4px;
    }

    .btn-sm {
        padding: 4px 12px;
        font-size: 0.78em;
        border-radius: 4px;
        cursor: pointer;
    }

    .btn-sm.btn-primary {
        background: #00f3ff;
        border: none;
        color: #000;
        font-weight: 700;
    }

    .btn-sm.btn-cancel {
        background: transparent;
        border: 1px solid var(--background-modifier-border);
        color: var(--text-muted);
    }

    .list-content {
        flex: 1;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 243, 255, 0.3) transparent;
    }

    .empty-text {
        font-size: 0.85em;
        color: var(--text-muted);
        font-style: italic;
        padding: 16px 0;
        text-align: center;
    }

    .reminder-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .reminder-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        border-radius: 6px;
        transition: background-color 0.15s ease;
    }

    .reminder-row:hover {
        background: rgba(255, 255, 255, 0.02);
    }

    .reminder-left {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        user-select: none;
        flex: 1;
    }

    .reminder-text {
        font-size: 0.88em;
        color: var(--text-normal);
        transition: all 0.2s ease;
    }

    .reminder-text.completed {
        text-decoration: line-through;
        opacity: 0.4;
    }

    .reminder-left:hover .reminder-text {
        color: #00f3ff;
    }

    .reminder-right {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .date-badge {
        font-size: 0.72em;
        color: var(--text-muted);
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--background-modifier-border);
        padding: 2px 6px;
        border-radius: 4px;
    }

    .action-btn {
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

    .reminder-row:hover .action-btn {
        opacity: 1;
    }

    .action-btn.edit-btn:hover {
        color: #00f3ff;
        background: rgba(0, 243, 255, 0.1);
    }

    .action-btn.delete-btn:hover {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
    }

    .edit-reminder-box {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
    }

    .edit-reminder-box input[type="text"] {
        flex: 2;
        background: #11141a;
        border: 1px solid #00f3ff;
        border-radius: 4px;
        padding: 4px 8px;
        color: var(--text-normal);
        font-size: 0.85em;
    }

    .edit-reminder-box input[type="date"] {
        flex: 1;
        background: #11141a;
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        padding: 4px 6px;
        color: var(--text-normal);
        font-size: 0.8em;
    }

    .edit-actions {
        display: flex;
        gap: 4px;
    }

    .edit-btn.save {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 4px;
        padding: 4px;
        cursor: pointer;
    }

    .edit-btn.cancel {
        background: transparent;
        color: var(--text-muted);
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        padding: 4px;
        cursor: pointer;
    }
</style>
