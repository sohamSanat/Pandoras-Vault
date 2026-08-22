<script lang="ts">
    import { 
        Calendar, 
        CalendarDays, 
        ChevronLeft, 
        ChevronRight, 
        FileText, 
        CheckSquare, 
        Square, 
        Plus,
        Trash2,
        Calculator,
        Code,
        Network,
        SquareTerminal,
        Monitor
    } from 'lucide-svelte';
    import { 
        studyHubStore, 
        toggleAssignment, 
        deleteAssignment, 
        deleteExam, 
        toggleExamStatus, 
        deleteReminder, 
        toggleReminder 
    } from '../store';
    import { getWeekDays, isSameDay, formatDateIso } from '../utils/dateUtils';
    import type { App } from 'obsidian';
    import ScheduleEventModal from './modals/ScheduleEventModal.svelte';

    export let app: App;

    let referenceDate = new Date();
    let showScheduleModal = false;
    let selectedDateForSchedule = formatDateIso(new Date());

    const iconMap: Record<string, any> = {
        Calculator,
        Code,
        Network,
        SquareTerminal,
        Monitor
    };

    $: weekDays = getWeekDays(referenceDate);

    $: dateRangeText = (() => {
        if (weekDays.length === 0) return '';
        const start = weekDays[0].date;
        const end = weekDays[6].date;
        const startMonth = start.toLocaleString('default', { month: 'short' });
        const endMonth = end.toLocaleString('default', { month: 'short' });
        const year = end.getFullYear();
        if (startMonth === endMonth) {
            return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${year}`;
        }
        return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`;
    })();

    function prevWeek() {
        const next = new Date(referenceDate);
        next.setDate(next.getDate() - 7);
        referenceDate = next;
    }

    function nextWeek() {
        const next = new Date(referenceDate);
        next.setDate(next.getDate() + 7);
        referenceDate = next;
    }

    function goToday() {
        referenceDate = new Date();
    }

    function getCourse(courseId: string) {
        return $studyHubStore.courses.find(c => c.id === courseId);
    }

    function getCourseIcon(courseId?: string) {
        if (!courseId) return FileText;
        const c = $studyHubStore.courses.find(item => item.id === courseId);
        if (!c || !c.icon) return FileText;
        return iconMap[c.icon] || FileText;
    }

    function getItemsForDay(dateStr: string) {
        const assignments = $studyHubStore.assignments.filter(a => isSameDay(a.dueDate, dateStr) && !a.completed);
        const exams = $studyHubStore.exams.filter(e => isSameDay(e.examDate, dateStr) && !e.isPast);
        const reminders = $studyHubStore.reminders.filter(r => isSameDay(r.date, dateStr));
        return { assignments, exams, reminders };
    }

    function handleAddForDay(dateStr: string) {
        selectedDateForSchedule = dateStr;
        showScheduleModal = true;
    }
</script>

{#if showScheduleModal}
    <ScheduleEventModal 
        initialDate={selectedDateForSchedule}
        on:close={() => showScheduleModal = false} 
    />
{/if}

<div class="calendar-wrapper">
    <div class="cal-header">
        <h2 class="cal-title">Academic-Calendar</h2>
    </div>

    <!-- Toolbar -->
    <div class="cal-toolbar">
        <div class="cal-date-range">
            {dateRangeText}
        </div>
        <div class="cal-actions">
            <button type="button" class="ghost-btn" on:click={() => handleAddForDay(formatDateIso(new Date()))}>
                <Plus size={14} /> Schedule Event
            </button>
            <div class="nav-group">
                <button type="button" class="icon-btn" on:click={prevWeek} title="Previous Week">
                    <ChevronLeft size={16}/>
                </button>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <span class="today-text" on:click={goToday} title="Jump to Today">Today</span>
                <button type="button" class="icon-btn" on:click={nextWeek} title="Next Week">
                    <ChevronRight size={16}/>
                </button>
            </div>
        </div>
    </div>

    <!-- Grid -->
    <div class="cal-grid-container">
        <div class="cal-grid">
            {#each weekDays as day}
                {@const dayItems = getItemsForDay(day.dateString)}
                <div class="cal-col {day.isWeekend ? 'weekend' : ''}">
                    <!-- Column Header -->
                    <div class="col-header">
                        <span class="day-name">{day.name}</span>
                        <div class="day-date-wrapper {day.isCurrent ? 'current' : ''}">
                            <span class="day-date">{day.dayNumber}</span>
                        </div>
                    </div>

                    <!-- Tasks & Events for this day -->
                    <div class="col-tasks">
                        <!-- Exams -->
                        {#each dayItems.exams as exam (exam.id)}
                            {@const course = getCourse(exam.courseId)}
                            <div class="task-card exam-card">
                                <div class="task-header-row">
                                    <div class="task-title">
                                        <FileText size={13} color="#00f3ff" />
                                        <span>{exam.title}</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        class="card-del-btn" 
                                        on:click|stopPropagation={() => deleteExam(exam.id)} 
                                        title="Delete Exam"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>

                                {#if course}
                                    {@const CourseIcon = getCourseIcon(exam.courseId)}
                                    <div class="task-course">
                                        <svelte:component this={CourseIcon} size={12} color="var(--text-muted)" />
                                        {course.title}
                                    </div>
                                {/if}
                                <div class="task-type-tag exam-tag">Exam</div>
                            </div>
                        {/each}

                        <!-- Assignments -->
                        {#each dayItems.assignments as assign (assign.id)}
                            {@const course = getCourse(assign.courseId)}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <div class="task-card" on:click={() => toggleAssignment(assign.id)}>
                                <div class="task-header-row">
                                    <div class="task-title" class:completed={assign.completed}>
                                        {#if assign.completed}
                                            <CheckSquare size={13} color="#10b981" />
                                        {:else}
                                            <Square size={13} color="var(--text-muted)" />
                                        {/if}
                                        <span>{assign.title}</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        class="card-del-btn" 
                                        on:click|stopPropagation={() => deleteAssignment(assign.id)} 
                                        title="Delete Assignment"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>

                                {#if course}
                                    {@const CourseIcon = getCourseIcon(assign.courseId)}
                                    <div class="task-course">
                                        <svelte:component this={CourseIcon} size={12} color="var(--text-muted)" />
                                        {course.title}
                                    </div>
                                {/if}
                                <div class="task-footer-row">
                                    <div class="task-type-tag">Assignment</div>
                                    <div class="task-status-tag {assign.completed ? 'completed' : 'not-started'}">
                                        <span class="dot"></span>
                                        {assign.completed ? 'Done' : 'Pending'}
                                    </div>
                                </div>
                            </div>
                        {/each}

                        <!-- Reminders -->
                        {#each dayItems.reminders as rem (rem.id)}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <div class="task-card reminder-card" on:click={() => toggleReminder(rem.id)}>
                                <div class="task-header-row">
                                    <div class="task-title" class:completed={rem.completed}>
                                        &bull; {rem.title}
                                    </div>
                                    <button 
                                        type="button" 
                                        class="card-del-btn" 
                                        on:click|stopPropagation={() => deleteReminder(rem.id)} 
                                        title="Delete Reminder"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                                <div class="task-type-tag reminder-tag">Reminder</div>
                            </div>
                        {/each}

                        <!-- Add slot button -->
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div class="empty-day-slot" on:click={() => handleAddForDay(day.dateString)} title="Add event to {day.name}">
                            <span>+</span>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .calendar-wrapper {
        background-color: #080808;
        border: 1px solid var(--background-modifier-border);
        border-radius: 8px;
        padding: 24px;
        width: 100%;
        display: flex;
        flex-direction: column;
        margin-top: 20px;
    }

    .cal-header {
        margin-bottom: 16px;
    }

    .cal-title {
        font-family: var(--font-interface);
        font-size: 1.25em;
        font-weight: 600;
        letter-spacing: 0.15em;
        margin: 0;
        color: #00f3ff;
        text-shadow: 0 0 8px rgba(0, 243, 255, 0.4);
        text-transform: uppercase;
    }

    .cal-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 12px;
    }

    .cal-date-range {
        font-weight: 700;
        font-size: 1.05em;
        color: var(--text-normal);
        font-family: var(--font-interface);
    }

    .cal-actions {
        display: flex;
        align-items: center;
        gap: 14px;
    }

    .ghost-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(0, 243, 255, 0.08);
        border: 1px solid rgba(0, 243, 255, 0.35);
        color: #00f3ff;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 0.82em;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .ghost-btn:hover {
        background: #00f3ff;
        color: #000;
    }

    .nav-group {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--text-muted);
        font-size: 0.85em;
    }

    .icon-btn {
        background: transparent;
        border: 1px solid var(--background-modifier-border);
        color: var(--text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border-radius: 4px;
    }

    .icon-btn:hover {
        background-color: var(--background-modifier-hover);
        color: var(--text-normal);
    }

    .today-text {
        font-weight: 600;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid var(--background-modifier-border);
    }

    .today-text:hover {
        border-color: #00f3ff;
        color: #00f3ff;
    }

    .cal-grid-container {
        overflow-x: auto;
        border: 1px solid var(--background-modifier-border);
        border-radius: 8px;
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 243, 255, 0.4) rgba(255, 255, 255, 0.03);
    }

    .cal-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(170px, 1fr));
        min-width: 1100px;
        min-height: 0;
    }

    .cal-col {
        border-right: 1px solid var(--background-modifier-border);
        display: flex;
        flex-direction: column;
        min-height: 0;
        background: #080808;
    }
    
    .cal-col:last-child {
        border-right: none;
    }

    .cal-col.weekend {
        background-color: rgba(255, 255, 255, 0.015);
    }

    .col-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        border-bottom: 1px solid var(--background-modifier-border);
        background: #0b0e14;
    }

    .day-name {
        font-size: 0.82em;
        color: var(--text-muted);
        font-weight: 600;
    }

    .day-date-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        font-size: 0.78em;
        color: var(--text-normal);
    }

    .day-date-wrapper.current {
        background-color: #00f3ff;
        color: #000;
        font-weight: 800;
    }

    .col-tasks {
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-height: 80px;
    }

    .task-card {
        background-color: #11141a;
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        padding: 8px 10px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        transition: transform 0.15s ease, border-color 0.15s ease;
    }

    .task-card:hover {
        transform: translateY(-1px);
        border-color: rgba(0, 243, 255, 0.4);
    }

    .task-header-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 6px;
    }

    .card-del-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        opacity: 0;
        cursor: pointer;
        padding: 2px;
        display: flex;
        align-items: center;
        border-radius: 3px;
        transition: all 0.15s ease;
    }

    .task-card:hover .card-del-btn {
        opacity: 0.6;
    }

    .card-del-btn:hover {
        opacity: 1 !important;
        color: #ef4444 !important;
        background: rgba(239, 68, 68, 0.15);
    }

    .exam-card {
        border-color: rgba(0, 243, 255, 0.35);
        background: rgba(0, 243, 255, 0.04);
    }

    .reminder-card {
        border-color: rgba(245, 158, 11, 0.3);
        background: rgba(245, 158, 11, 0.04);
    }

    .task-title {
        font-size: 0.82em;
        font-weight: 600;
        color: var(--text-normal);
        display: flex;
        align-items: center;
        gap: 6px;
        line-height: 1.3;
    }

    .task-title.completed {
        text-decoration: line-through;
        opacity: 0.4;
    }

    .task-course {
        font-size: 0.72em;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .task-footer-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 2px;
    }

    .task-type-tag {
        font-size: 0.65em;
        background-color: rgba(255, 255, 255, 0.05);
        color: var(--text-muted);
        padding: 1px 5px;
        border-radius: 4px;
        align-self: flex-start;
        text-transform: uppercase;
        font-weight: 600;
    }

    .exam-tag {
        background-color: rgba(0, 243, 255, 0.15);
        color: #00f3ff;
    }

    .reminder-tag {
        background-color: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
    }

    .task-status-tag {
        font-size: 0.68em;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background-color: rgba(255, 255, 255, 0.03);
        padding: 1px 6px;
        border-radius: 10px;
        border: 1px solid var(--background-modifier-border);
    }

    .task-status-tag .dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
    }

    .task-status-tag.completed {
        background-color: rgba(16, 185, 129, 0.1);
        border-color: rgba(16, 185, 129, 0.25);
        color: #10b981;
    }
    .task-status-tag.completed .dot {
        background-color: #10b981;
    }

    .task-status-tag.not-started {
        color: var(--text-muted);
    }
    .task-status-tag.not-started .dot {
        background-color: var(--text-muted);
    }

    .empty-day-slot {
        display: flex;
        align-items: center;
        justify-content: center;
        color: transparent;
        cursor: pointer;
        height: 26px;
        border-radius: 4px;
        transition: all 0.2s ease;
        margin-top: auto;
    }

    .empty-day-slot:hover {
        background-color: rgba(0, 243, 255, 0.06);
        color: #00f3ff;
    }
</style>
