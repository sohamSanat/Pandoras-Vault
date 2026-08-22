<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { X, Calendar, FileText, CheckSquare, List, Sparkles } from 'lucide-svelte';
    import { studyHubStore, addAssignment, addExam, addReminder } from '../../store';
    import { formatDateIso } from '../../utils/dateUtils';

    export let initialDate: string = formatDateIso(new Date());

    const dispatch = createEventDispatcher();

    let eventType: 'assignment' | 'exam' | 'reminder' = 'assignment';
    let title = '';
    let selectedCourseId = $studyHubStore.courses[0]?.id || '';
    let priority: 'Low' | 'Medium' | 'High' = 'High';
    let date = initialDate || formatDateIso(new Date());

    function handleSave() {
        if (!title.trim()) return;

        if (eventType === 'assignment') {
            addAssignment({
                title: title.trim(),
                courseId: selectedCourseId,
                dueDate: date,
                priority,
                completed: false
            });
        } else if (eventType === 'exam') {
            addExam({
                title: title.trim(),
                courseId: selectedCourseId,
                examDate: date,
                isPast: false
            });
        } else if (eventType === 'reminder') {
            addReminder(title.trim(), date);
        }

        dispatch('close');
    }
</script>

<div class="modal-backdrop" on:click={() => dispatch('close')}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-card" on:click|stopPropagation>
        <div class="modal-header">
            <div class="header-title-box">
                <Calendar size={18} color="#00f3ff" />
                <h3>Schedule Academic Event</h3>
            </div>
            <button type="button" class="close-btn" on:click={() => dispatch('close')}>
                <X size={18} />
            </button>
        </div>

        <form on:submit|preventDefault={handleSave}>
            <!-- Event Type Selector -->
            <div class="type-selector">
                <button 
                    type="button" 
                    class="type-btn {eventType === 'assignment' ? 'active' : ''}" 
                    on:click={() => eventType = 'assignment'}
                >
                    <CheckSquare size={14} /> Assignment
                </button>
                <button 
                    type="button" 
                    class="type-btn {eventType === 'exam' ? 'active' : ''}" 
                    on:click={() => eventType = 'exam'}
                >
                    <FileText size={14} /> Exam
                </button>
                <button 
                    type="button" 
                    class="type-btn {eventType === 'reminder' ? 'active' : ''}" 
                    on:click={() => eventType = 'reminder'}
                >
                    <List size={14} /> Reminder
                </button>
            </div>

            <div class="form-group">
                <label for="event-title">Title</label>
                <input 
                    id="event-title" 
                    type="text" 
                    bind:value={title} 
                    placeholder={eventType === 'assignment' ? 'e.g. Calculus Problem Set 2' : eventType === 'exam' ? 'e.g. Midterm Lab Exam' : 'e.g. Study Group Session'}
                    autofocus 
                    required 
                />
            </div>

            {#if eventType !== 'reminder'}
                <div class="form-group">
                    <label for="event-course">Subject / Course</label>
                    <select id="event-course" bind:value={selectedCourseId}>
                        {#each $studyHubStore.courses as c}
                            <option value={c.id}>{c.title}</option>
                        {/each}
                    </select>
                </div>
            {/if}

            <div class="form-row">
                <div class="form-group" style="flex: 1;">
                    <label for="event-date">Date</label>
                    <input id="event-date" type="date" bind:value={date} required />
                </div>

                {#if eventType === 'assignment'}
                    <div class="form-group" style="width: 120px;">
                        <label for="event-priority">Priority</label>
                        <select id="event-priority" bind:value={priority}>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                {/if}
            </div>

            <div class="modal-actions">
                <button type="button" class="btn-secondary" on:click={() => dispatch('close')}>Cancel</button>
                <button type="submit" class="btn-primary">Add to Calendar</button>
            </div>
        </form>
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
        border: 1px solid rgba(0, 243, 255, 0.35);
        border-radius: 14px;
        width: 90%;
        max-width: 440px;
        padding: 22px;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 243, 255, 0.12);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--background-modifier-border);
        padding-bottom: 12px;
        margin-bottom: 16px;
    }

    .header-title-box {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .header-title-box h3 {
        margin: 0;
        color: #00f3ff;
        font-size: 1.15em;
    }

    .close-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
    }

    .type-selector {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        margin-bottom: 16px;
        background: rgba(255, 255, 255, 0.02);
        padding: 4px;
        border-radius: 8px;
        border: 1px solid var(--background-modifier-border);
    }

    .type-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background: transparent;
        border: 1px solid transparent;
        color: var(--text-muted);
        padding: 6px 8px;
        border-radius: 6px;
        font-size: 0.8em;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .type-btn.active {
        background: rgba(0, 243, 255, 0.15);
        border-color: rgba(0, 243, 255, 0.4);
        color: #00f3ff;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 14px;
    }

    .form-row {
        display: flex;
        gap: 10px;
    }

    label {
        font-size: 0.8em;
        color: var(--text-muted);
        font-weight: 600;
    }

    input, select {
        background: #11141a;
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        padding: 8px 10px;
        color: var(--text-normal);
        font-size: 0.88em;
    }

    input:focus, select:focus {
        outline: none;
        border-color: #00f3ff;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 20px;
    }

    .btn-secondary {
        background: transparent;
        border: 1px solid var(--background-modifier-border);
        color: var(--text-muted);
        padding: 7px 14px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.82em;
    }

    .btn-primary {
        background: #00f3ff;
        border: none;
        color: #000;
        font-weight: 700;
        padding: 7px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.82em;
    }

    .btn-primary:hover {
        opacity: 0.9;
    }
</style>
