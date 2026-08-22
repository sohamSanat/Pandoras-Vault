<script lang="ts">
    import { CheckSquare, Square, Plus, Trash2, Edit2, Check, X, Sparkles } from 'lucide-svelte';
    import { 
        studyHubStore, 
        addMiniTodo, 
        toggleMiniTodo, 
        deleteMiniTodo, 
        editMiniTodo,
        clearCompletedMiniTodos,
        clearAllMiniTodos 
    } from '../store';

    let newTodoText = '';
    let isAdding = false;
    let editingId: string | null = null;
    let editText = '';

    function handleAdd() {
        if (!newTodoText.trim()) return;
        addMiniTodo(newTodoText);
        newTodoText = '';
        isAdding = false;
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            handleAdd();
        } else if (e.key === 'Escape') {
            isAdding = false;
            newTodoText = '';
        }
    }

    function startEditing(id: string, currentText: string) {
        editingId = id;
        editText = currentText;
    }

    function saveEdit() {
        if (editingId && editText.trim()) {
            editMiniTodo(editingId, editText);
        }
        editingId = null;
        editText = '';
    }

    function handleEditKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            editingId = null;
            editText = '';
        }
    }

    $: totalCount = $studyHubStore.miniTodos.length;
    $: completedCount = $studyHubStore.miniTodos.filter(t => t.completed).length;
    $: hasCompleted = completedCount > 0;
</script>

<div class="list-card">
    <div class="list-header">
        <div class="header-title-box">
            <h3 class="list-title">Mini-To-Do's</h3>
            {#if totalCount > 0}
                <span class="count-pill">{completedCount}/{totalCount}</span>
            {/if}
        </div>

        <div class="header-actions">
            {#if hasCompleted}
                <button type="button" class="action-link" on:click={clearCompletedMiniTodos} title="Clear all completed items">
                    Clear Done
                </button>
            {/if}
            {#if totalCount > 0}
                <button type="button" class="action-link danger" on:click={clearAllMiniTodos} title="Delete all items">
                    Clear All
                </button>
            {/if}
        </div>
    </div>

    {#if !isAdding}
        <button type="button" class="new-item-btn" on:click={() => isAdding = true}>
            <Plus size={14} /> New Mini To-Do
        </button>
    {:else}
        <div class="inline-add-box">
            <input 
                type="text" 
                bind:value={newTodoText} 
                on:keydown={handleKeyDown} 
                placeholder="Type todo and press Enter..." 
                autofocus
            />
            <div class="inline-actions">
                <button type="button" class="btn-sm btn-primary" on:click={handleAdd}>Add</button>
                <button type="button" class="btn-sm btn-cancel" on:click={() => { isAdding = false; newTodoText = ''; }}>Cancel</button>
            </div>
        </div>
    {/if}

    <div class="list-content">
        {#if $studyHubStore.miniTodos.length === 0}
            <div class="empty-text">No mini to-dos. Click "+ New Mini To-Do" above to add your first task!</div>
        {:else}
            {#each $studyHubStore.miniTodos as todo (todo.id)}
                <div class="todo-row">
                    {#if editingId === todo.id}
                        <!-- Inline Edit Input -->
                        <div class="inline-edit-box">
                            <input 
                                type="text" 
                                bind:value={editText} 
                                on:keydown={handleEditKeyDown}
                                autofocus
                            />
                            <button type="button" class="edit-btn save" on:click={saveEdit} title="Save">
                                <Check size={14} />
                            </button>
                            <button type="button" class="edit-btn cancel" on:click={() => editingId = null} title="Cancel">
                                <X size={14} />
                            </button>
                        </div>
                    {:else}
                        <!-- Standard Item Display -->
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div class="todo-item" class:completed={todo.completed} on:click={() => toggleMiniTodo(todo.id)}>
                            <div class="checkbox">
                                {#if todo.completed}
                                    <CheckSquare size={16} color="#00f3ff" />
                                {:else}
                                    <Square size={16} color="var(--text-muted)" />
                                {/if}
                            </div>
                            <span class="todo-text">{todo.text}</span>
                        </div>

                        <div class="row-actions">
                            <button type="button" class="row-btn edit-btn" on:click|stopPropagation={() => startEditing(todo.id, todo.text)} title="Edit item">
                                <Edit2 size={13} />
                            </button>
                            <button type="button" class="row-btn delete-btn" on:click|stopPropagation={() => deleteMiniTodo(todo.id)} title="Delete item">
                                <Trash2 size={13} />
                            </button>
                        </div>
                    {/if}
                </div>
            {/each}
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
        gap: 6px;
        background: rgba(0, 243, 255, 0.03);
        border: 1px solid rgba(0, 243, 255, 0.2);
        padding: 10px;
        border-radius: 8px;
    }

    .inline-add-box input {
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

    .inline-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
    }

    .btn-sm {
        padding: 4px 10px;
        font-size: 0.75em;
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
        display: flex;
        flex-direction: column;
        gap: 4px;
        overflow-y: auto;
        flex: 1;
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

    .todo-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 8px;
        border-radius: 6px;
        transition: background-color 0.15s ease;
    }

    .todo-row:hover {
        background: rgba(255, 255, 255, 0.02);
    }

    .todo-item {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        user-select: none;
        flex: 1;
    }

    .checkbox {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .todo-text {
        font-size: 0.88em;
        color: var(--text-normal);
        transition: all 0.2s ease;
    }

    .todo-item.completed .todo-text {
        text-decoration: line-through;
        opacity: 0.4;
    }

    .todo-item:hover .todo-text {
        color: #00f3ff;
    }

    .inline-edit-box {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
    }

    .inline-edit-box input {
        flex: 1;
        background: #11141a;
        border: 1px solid #00f3ff;
        border-radius: 4px;
        padding: 4px 8px;
        color: var(--text-normal);
        font-size: 0.85em;
    }

    .row-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        opacity: 0.4;
        transition: opacity 0.15s ease;
    }

    .todo-row:hover .row-actions {
        opacity: 1;
    }

    .row-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        border-radius: 4px;
        transition: color 0.15s ease, background-color 0.15s ease;
    }

    .row-btn:hover {
        background: rgba(255, 255, 255, 0.06);
    }

    .row-btn.edit-btn:hover {
        color: #00f3ff;
    }

    .row-btn.delete-btn:hover {
        color: #ef4444;
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
