<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { 
        X, 
        Plus, 
        Trash2, 
        CheckSquare, 
        Square, 
        ExternalLink, 
        FileText, 
        BookOpen, 
        Search,
        Layers,
        Sparkles
    } from 'lucide-svelte';
    import { 
        studyHubStore, 
        toggleAssignment, 
        deleteAssignment, 
        deleteExam, 
        deleteResource, 
        deleteSubjectNote,
        clearCompletedAssignments,
        clearPastExams 
    } from '../../store';
    import { openOrCreateNote } from '../../utils/vault';
    import type { App } from 'obsidian';

    export let app: App;
    export let category: 'ASSIGNMENT' | 'RESOURCES' | 'NOTES' | 'EXAM';

    const dispatch = createEventDispatcher();
    let searchQuery = '';

    function getCourseName(courseId?: string): string {
        if (!courseId) return 'General';
        const c = $studyHubStore.courses.find(course => course.id === courseId);
        return c ? c.title : 'General';
    }

    async function handleOpenFile(filePath: string) {
        if (filePath) {
            await openOrCreateNote(app, filePath);
            dispatch('close');
        }
    }

    $: filteredAssignments = $studyHubStore.assignments.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        getCourseName(a.courseId).toLowerCase().includes(searchQuery.toLowerCase())
    );

    $: filteredExams = $studyHubStore.exams.filter(e => 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        getCourseName(e.courseId).toLowerCase().includes(searchQuery.toLowerCase())
    );

    $: filteredNotes = $studyHubStore.notes.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        getCourseName(n.courseId).toLowerCase().includes(searchQuery.toLowerCase())
    );

    $: filteredResources = $studyHubStore.resources.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        getCourseName(r.courseId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
</script>

<div class="modal-backdrop" on:click={() => dispatch('close')}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-card" on:click|stopPropagation>
        <div class="modal-header">
            <div class="header-left">
                <div class="title-row">
                    <Layers size={18} color="#00f3ff" />
                    <h3>{category}</h3>
                </div>
                <span class="category-subtitle">Manage all {category.toLowerCase()} across your courses</span>
            </div>
            <button class="close-btn" on:click={() => dispatch('close')}>
                <X size={18} />
            </button>
        </div>

        <!-- Search & Quick Filters Toolbar -->
        <div class="modal-toolbar">
            <div class="search-box">
                <Search size={14} color="var(--text-muted)" />
                <input type="text" placeholder="Search {category.toLowerCase()}..." bind:value={searchQuery} />
            </div>

            <div class="toolbar-actions">
                {#if category === 'ASSIGNMENT' && $studyHubStore.assignments.some(a => a.completed)}
                    <button type="button" class="tool-btn" on:click={clearCompletedAssignments} title="Clear all completed assignments">
                        Clear Done
                    </button>
                {/if}
                {#if category === 'EXAM' && $studyHubStore.exams.some(e => e.isPast)}
                    <button type="button" class="tool-btn" on:click={clearPastExams} title="Clear past exams">
                        Clear Past
                    </button>
                {/if}
            </div>
        </div>

        <div class="modal-content">
            {#if category === 'ASSIGNMENT'}
                {#if filteredAssignments.length === 0}
                    <div class="empty-state">No assignments found. Click "+ Add New" below to create one!</div>
                {:else}
                    <div class="item-list">
                        {#each filteredAssignments as a (a.id)}
                            <div class="list-row">
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                <div class="item-left" on:click={() => toggleAssignment(a.id)}>
                                    {#if a.completed}
                                        <CheckSquare size={16} color="#10b981" />
                                    {:else}
                                        <Square size={16} color="var(--text-muted)" />
                                    {/if}
                                    <span class="item-title" class:completed={a.completed}>{a.title}</span>
                                </div>

                                <div class="item-right">
                                    <span class="badge course-badge">{getCourseName(a.courseId)}</span>
                                    <span class="badge priority-badge {a.priority.toLowerCase()}">{a.priority}</span>
                                    <span class="due-date">{a.dueDate}</span>
                                    <button class="icon-action-btn delete-btn" on:click|stopPropagation={() => deleteAssignment(a.id)} title="Delete assignment">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}

            {:else if category === 'EXAM'}
                {#if filteredExams.length === 0}
                    <div class="empty-state">No exams found. Click "+ Add New" below to schedule one!</div>
                {:else}
                    <div class="item-list">
                        {#each filteredExams as e (e.id)}
                            <div class="list-row">
                                <div class="item-left">
                                    <FileText size={16} color="#00f3ff" />
                                    <span class="item-title">{e.title}</span>
                                </div>

                                <div class="item-right">
                                    <span class="badge course-badge">{getCourseName(e.courseId)}</span>
                                    <span class="badge status-badge {e.isPast ? 'past' : 'upcoming'}">
                                        {e.isPast ? 'Past' : 'Upcoming'}
                                    </span>
                                    <span class="due-date">{e.examDate}</span>
                                    <button class="icon-action-btn delete-btn" on:click|stopPropagation={() => deleteExam(e.id)} title="Delete exam">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}

            {:else if category === 'NOTES'}
                {#if filteredNotes.length === 0}
                    <div class="empty-state">No course notes found. Click "+ Add New" below to link one!</div>
                {:else}
                    <div class="item-list">
                        {#each filteredNotes as n (n.id)}
                            <div class="list-row">
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                <div class="item-left clickable" on:click={() => handleOpenFile(n.filePath)}>
                                    <FileText size={16} color="var(--text-normal)" />
                                    <span class="item-title">{n.title}</span>
                                </div>

                                <div class="item-right">
                                    <span class="badge course-badge">{getCourseName(n.courseId)}</span>
                                    <button class="icon-action-btn" on:click|stopPropagation={() => handleOpenFile(n.filePath)} title="Open note in Obsidian">
                                        <ExternalLink size={14} />
                                    </button>
                                    <button class="icon-action-btn delete-btn" on:click|stopPropagation={() => deleteSubjectNote(n.id)} title="Delete note link">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}

            {:else if category === 'RESOURCES'}
                {#if filteredResources.length === 0}
                    <div class="empty-state">No resources found. Click "+ Add New" below to add references!</div>
                {:else}
                    <div class="item-list">
                        {#each filteredResources as r (r.id)}
                            <div class="list-row">
                                <div class="item-left">
                                    <BookOpen size={16} color="#f59e0b" />
                                    <span class="item-title">{r.title}</span>
                                </div>

                                <div class="item-right">
                                    <span class="badge course-badge">{getCourseName(r.courseId)}</span>
                                    <span class="badge type-badge">{r.type}</span>
                                    {#if r.urlOrPath}
                                        {#if r.urlOrPath.startsWith('http')}
                                            <a href={r.urlOrPath} target="_blank" class="icon-action-btn" title="Open external link">
                                                <ExternalLink size={14} />
                                            </a>
                                        {:else}
                                            <button class="icon-action-btn" on:click|stopPropagation={() => handleOpenFile(r.urlOrPath)} title="Open note in Obsidian">
                                                <ExternalLink size={14} />
                                            </button>
                                        {/if}
                                    {/if}
                                    <button class="icon-action-btn delete-btn" on:click|stopPropagation={() => deleteResource(r.id)} title="Delete resource">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            {/if}
        </div>

        <div class="modal-footer">
            <button class="btn-primary" on:click={() => { dispatch('addNew', category); dispatch('close'); }}>
                <Plus size={14} /> Add New {category.charAt(0) + category.slice(1).toLowerCase()}
            </button>
        </div>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-card {
        background: #0b0e14;
        border: 1px solid rgba(0, 243, 255, 0.3);
        border-radius: 12px;
        width: 90%;
        max-width: 640px;
        height: 75vh;
        max-height: 75vh;
        display: flex;
        flex-direction: column;
        padding: 24px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 243, 255, 0.1);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid var(--background-modifier-border);
        padding-bottom: 14px;
        margin-bottom: 14px;
        flex-shrink: 0;
    }

    .title-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .modal-header h3 {
        margin: 0;
        color: #00f3ff;
        font-size: 1.25em;
        letter-spacing: 0.1em;
    }

    .category-subtitle {
        font-size: 0.82em;
        color: var(--text-muted);
    }

    .close-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
    }

    .modal-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
        flex-shrink: 0;
    }

    .search-box {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #11141a;
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        padding: 6px 10px;
        flex: 1;
    }

    .search-box input {
        background: transparent;
        border: none;
        color: var(--text-normal);
        font-size: 0.85em;
        width: 100%;
    }

    .search-box input:focus {
        outline: none;
    }

    .tool-btn {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--background-modifier-border);
        color: var(--text-muted);
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 0.78em;
        cursor: pointer;
    }

    .tool-btn:hover {
        border-color: #ef4444;
        color: #ef4444;
    }

    .modal-content {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding-right: 4px;
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 243, 255, 0.4) rgba(255, 255, 255, 0.03);
    }

    .modal-content::-webkit-scrollbar {
        width: 6px;
    }

    .modal-content::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 10px;
    }

    .modal-content::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, rgba(0, 243, 255, 0.4), rgba(244, 114, 182, 0.4));
        border-radius: 10px;
    }

    .empty-state {
        padding: 36px 0;
        text-align: center;
        color: var(--text-muted);
        font-size: 0.88em;
        font-style: italic;
    }

    .item-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .list-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 14px;
        background: #11141a;
        border: 1px solid var(--background-modifier-border);
        border-radius: 8px;
        transition: border-color 0.15s ease;
    }

    .list-row:hover {
        border-color: rgba(0, 243, 255, 0.3);
    }

    .item-left {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        user-select: none;
        flex: 1;
    }

    .item-left.clickable:hover .item-title {
        color: #00f3ff;
    }

    .item-title {
        font-size: 0.88em;
        color: var(--text-normal);
        font-weight: 500;
    }

    .item-title.completed {
        text-decoration: line-through;
        opacity: 0.4;
    }

    .item-right {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .badge {
        font-size: 0.72em;
        padding: 2px 7px;
        border-radius: 4px;
        font-weight: 600;
    }

    .course-badge {
        background: rgba(255, 255, 255, 0.04);
        color: var(--text-normal);
        border: 1px solid var(--background-modifier-border);
    }

    .priority-badge.high {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
    }
    .priority-badge.medium {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
    }
    .priority-badge.low {
        background: rgba(59, 130, 246, 0.15);
        color: #3b82f6;
    }

    .status-badge.upcoming {
        background: rgba(0, 243, 255, 0.15);
        color: #00f3ff;
    }
    .status-badge.past {
        background: var(--background-secondary);
        color: var(--text-muted);
    }

    .type-badge {
        background: var(--background-secondary);
        color: var(--text-muted);
        text-transform: uppercase;
    }

    .due-date {
        font-size: 0.78em;
        color: var(--text-muted);
    }

    .icon-action-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        border-radius: 4px;
        transition: color 0.15s ease;
    }

    .icon-action-btn:hover {
        color: var(--text-normal);
    }

    .delete-btn:hover {
        color: #ef4444;
    }

    .modal-footer {
        margin-top: 14px;
        border-top: 1px solid var(--background-modifier-border);
        padding-top: 14px;
        display: flex;
        justify-content: flex-end;
        flex-shrink: 0;
    }

    .btn-primary {
        background: #00f3ff;
        border: none;
        color: #000;
        font-weight: 700;
        padding: 8px 18px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85em;
    }

    .btn-primary:hover {
        opacity: 0.9;
    }
</style>
