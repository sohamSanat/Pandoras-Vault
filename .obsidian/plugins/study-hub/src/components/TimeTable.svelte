<script lang="ts">
    import { 
        Clock, 
        Hexagon, 
        Plus, 
        Trash2, 
        Edit2, 
        Check, 
        X, 
        RotateCcw, 
        Monitor, 
        Code, 
        Calculator, 
        Network, 
        SquareTerminal, 
        FileText 
    } from 'lucide-svelte';
    import { 
        studyHubStore, 
        addTimetableRow, 
        deleteTimetableRow, 
        updateTimetableRowTime, 
        clearAllTimetableSlots, 
        resetTimetableToDefault 
    } from '../store';
    import type { App } from 'obsidian';
    import TimetableSlotModal from './modals/TimetableSlotModal.svelte';

    export let app: App;

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const iconMap: Record<string, any> = {
        Calculator,
        Code,
        Network,
        SquareTerminal,
        Monitor
    };

    let selectedSlot: { rowIndex: number; dayIndex: number; dayName: string; timeSlot: string } | null = null;
    let isAddingRow = false;
    let newTimeLabel = '';

    let editingRowIndex: number | null = null;
    let editRowTime = '';

    function getCourseInfo(courseId?: string) {
        if (!courseId) return null;
        const course = $studyHubStore.courses.find(c => c.id === courseId);
        if (!course) return null;
        return {
            name: course.title,
            Icon: iconMap[course.icon] || FileText
        };
    }

    function handleCellClick(rowIndex: number, dayIndex: number, timeSlot: string) {
        selectedSlot = {
            rowIndex,
            dayIndex,
            dayName: daysOfWeek[dayIndex],
            timeSlot
        };
    }

    function handleAddRow() {
        if (!newTimeLabel.trim()) return;
        addTimetableRow(newTimeLabel.trim());
        newTimeLabel = '';
        isAddingRow = false;
    }

    function startEditRow(index: number, currentTime: string) {
        editingRowIndex = index;
        editRowTime = currentTime;
    }

    function saveEditRow() {
        if (editingRowIndex !== null && editRowTime.trim()) {
            updateTimetableRowTime(editingRowIndex, editRowTime.trim());
        }
        editingRowIndex = null;
    }
</script>

{#if selectedSlot}
    <TimetableSlotModal 
        {app}
        rowIndex={selectedSlot.rowIndex}
        dayIndex={selectedSlot.dayIndex}
        dayName={selectedSlot.dayName}
        timeSlot={selectedSlot.timeSlot}
        on:close={() => selectedSlot = null}
    />
{/if}

<div class="timetable-wrapper">
    <div class="tt-header">
        <div class="header-left">
            <h2 class="tt-title">TimeTable</h2>
            <span class="count-pill">{$studyHubStore.timetable.length} periods</span>
        </div>

        <div class="header-actions">
            <button type="button" class="tt-action-btn" on:click={() => isAddingRow = !isAddingRow}>
                <Plus size={13} /> Add Period
            </button>
            <button type="button" class="tt-action-btn danger" on:click={clearAllTimetableSlots} title="Clear all classes">
                Clear All Slots
            </button>
            <button type="button" class="tt-action-btn" on:click={resetTimetableToDefault} title="Reset to standard template">
                <RotateCcw size={12} /> Reset
            </button>
        </div>
    </div>

    {#if isAddingRow}
        <div class="add-row-bar">
            <input 
                type="text" 
                placeholder="Time Period (e.g. 5:00 - 6:00 PM, Lab Session)" 
                bind:value={newTimeLabel}
                on:keydown={(e) => e.key === 'Enter' && handleAddRow()}
                autofocus
            />
            <button type="button" class="btn-save-row" on:click={handleAddRow}>Save Period</button>
            <button type="button" class="btn-cancel-row" on:click={() => isAddingRow = false}>Cancel</button>
        </div>
    {/if}

    <div class="tt-grid-container">
        <div class="tt-grid">
            <!-- Header Row -->
            <div class="tt-cell tt-header-cell">
                <Clock size={14} color="#00f3ff" />
                Time
            </div>
            {#each daysOfWeek as day}
                <div class="tt-cell tt-header-cell">
                    <Hexagon size={14} color="var(--text-muted)" />
                    {day}
                </div>
            {/each}

            <!-- Data Rows -->
            {#each $studyHubStore.timetable as row, rIndex}
                <!-- Time Column with Edit/Delete options on hover -->
                <div class="tt-cell tt-time-cell">
                    {#if editingRowIndex === rIndex}
                        <div class="inline-time-edit">
                            <input type="text" bind:value={editRowTime} on:keydown={(e) => e.key === 'Enter' && saveEditRow()} />
                            <button type="button" class="mini-btn check" on:click={saveEditRow}><Check size={12} /></button>
                            <button type="button" class="mini-btn close" on:click={() => editingRowIndex = null}><X size={12} /></button>
                        </div>
                    {:else}
                        <span class="time-label">{row.time}</span>
                        <div class="row-controls">
                            <button type="button" class="ctrl-btn" on:click={() => startEditRow(rIndex, row.time)} title="Edit time">
                                <Edit2 size={11} />
                            </button>
                            <button type="button" class="ctrl-btn del" on:click={() => deleteTimetableRow(rIndex)} title="Delete row">
                                <Trash2 size={11} />
                            </button>
                        </div>
                    {/if}
                </div>
                
                <!-- Day Columns -->
                {#each row.days as slot, dIndex}
                    {@const courseInfo = slot ? getCourseInfo(slot.courseId) : null}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div 
                        class="tt-cell tt-data-cell {slot ? 'occupied' : 'empty'}" 
                        on:click={() => handleCellClick(rIndex, dIndex, row.time)}
                        title="Click to edit {daysOfWeek[dIndex]} {row.time}"
                    >
                        {#if slot && courseInfo}
                            {@const CourseIcon = courseInfo.Icon}
                            <div class="course-content">
                                <svelte:component this={CourseIcon} size={14} color="#00f3ff" />
                                <span class="slot-text">{slot.customName || courseInfo.name}</span>
                            </div>
                        {:else if slot && slot.customName}
                            <div class="course-content">
                                <FileText size={14} color="var(--text-muted)" />
                                <span class="slot-text">{slot.customName}</span>
                            </div>
                        {:else}
                            <span class="slot-empty-placeholder">+</span>
                        {/if}
                    </div>
                {/each}
            {/each}
        </div>
    </div>
</div>

<style>
    .timetable-wrapper {
        background-color: #080808;
        border: 1px solid var(--background-modifier-border);
        border-radius: 8px;
        padding: 24px;
        width: 100%;
        display: flex;
        flex-direction: column;
        margin-top: 20px;
    }

    .tt-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--background-modifier-border);
        padding-bottom: 12px;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 10px;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .tt-title {
        font-family: var(--font-interface);
        font-size: 1.25em;
        font-weight: 600;
        letter-spacing: 0.15em;
        margin: 0;
        color: #00f3ff;
        text-shadow: 0 0 8px rgba(0, 243, 255, 0.4);
        text-transform: uppercase;
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
        gap: 8px;
    }

    .tt-action-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--background-modifier-border);
        color: var(--text-muted);
        padding: 5px 10px;
        border-radius: 6px;
        font-size: 0.78em;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .tt-action-btn:hover {
        border-color: #00f3ff;
        color: #00f3ff;
    }

    .tt-action-btn.danger:hover {
        border-color: #ef4444;
        color: #ef4444;
    }

    .add-row-bar {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        background: rgba(0, 243, 255, 0.03);
        border: 1px solid rgba(0, 243, 255, 0.2);
        padding: 10px;
        border-radius: 8px;
    }

    .add-row-bar input {
        flex: 1;
        background: #11141a;
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        padding: 6px 12px;
        color: var(--text-normal);
        font-size: 0.85em;
    }

    .btn-save-row {
        background: #00f3ff;
        color: #000;
        border: none;
        font-weight: 700;
        padding: 6px 14px;
        border-radius: 6px;
        font-size: 0.8em;
        cursor: pointer;
    }

    .btn-cancel-row {
        background: transparent;
        border: 1px solid var(--background-modifier-border);
        color: var(--text-muted);
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 0.8em;
        cursor: pointer;
    }

    .tt-grid-container {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 243, 255, 0.4) rgba(255, 255, 255, 0.03);
        border: 1px solid var(--background-modifier-border);
        border-radius: 8px;
    }

    .tt-grid {
        display: grid;
        grid-template-columns: 140px repeat(5, minmax(160px, 1fr));
        min-width: 940px;
    }

    .tt-cell {
        padding: 10px 14px;
        border-right: 1px solid var(--background-modifier-border);
        border-bottom: 1px solid var(--background-modifier-border);
        font-size: 0.85em;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        min-height: 48px;
    }

    .tt-header-cell {
        gap: 8px;
        background-color: #0b0e14;
        font-weight: 700;
        color: var(--text-normal);
    }

    .tt-time-cell {
        font-weight: 600;
        color: var(--text-muted);
        background: rgba(255, 255, 255, 0.015);
        justify-content: space-between;
        position: relative;
    }

    .time-label {
        font-size: 0.85em;
    }

    .row-controls {
        display: flex;
        gap: 2px;
        opacity: 0;
        transition: opacity 0.15s ease;
    }

    .tt-time-cell:hover .row-controls {
        opacity: 1;
    }

    .ctrl-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 3px;
    }

    .ctrl-btn:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #00f3ff;
    }

    .ctrl-btn.del:hover {
        color: #ef4444;
    }

    .inline-time-edit {
        display: flex;
        align-items: center;
        gap: 4px;
        width: 100%;
    }

    .inline-time-edit input {
        width: 80px;
        background: #11141a;
        border: 1px solid #00f3ff;
        border-radius: 3px;
        padding: 2px 4px;
        font-size: 0.8em;
        color: #fff;
    }

    .mini-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 2px;
        display: flex;
    }

    .mini-btn.check { color: #10b981; }
    .mini-btn.close { color: var(--text-muted); }

    .tt-data-cell {
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .tt-data-cell:hover {
        background-color: rgba(0, 243, 255, 0.06);
    }

    .tt-data-cell.occupied {
        background: rgba(0, 243, 255, 0.03);
    }

    .course-content {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--text-normal);
        font-weight: 600;
    }

    .slot-text {
        font-size: 0.88em;
    }

    .slot-empty-placeholder {
        color: transparent;
        font-size: 1.2em;
        width: 100%;
        text-align: center;
        user-select: none;
    }

    .tt-data-cell:hover .slot-empty-placeholder {
        color: rgba(0, 243, 255, 0.4);
    }
</style>
