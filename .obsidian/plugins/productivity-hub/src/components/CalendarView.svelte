<script lang="ts">
    import type { Task, Project } from "../store";
    import { getDateKey, getWeekDates } from "../store";

    let { tasks, projects, onAddTask } = $props<{
        tasks: Task[];
        projects: Project[];
        onAddTask: (
            dateStr: string,
            title: string,
            projectId: string | null,
        ) => void;
    }>();

    let weekOffset = $state(0);
    let addingForDate = $state<string | null>(null);
    let newTaskTitle = $state("");
    let newTaskProject = $state("");

    let weekDates = $derived(getWeekDates(weekOffset));

    let dateRangeLabel = $derived(
        (() => {
            if (!weekDates.length) return "";
            const first = weekDates[0];
            const last = weekDates[weekDates.length - 1];

            const fMonth = first.toLocaleString("default", { month: "short" });
            const lMonth = last.toLocaleString("default", { month: "short" });

            if (fMonth === lMonth) {
                return `${fMonth} ${first.getDate()} - ${last.getDate()}, ${first.getFullYear()}`;
            }
            if (first.getFullYear() === last.getFullYear()) {
                return `${fMonth} ${first.getDate()} - ${lMonth} ${last.getDate()}, ${first.getFullYear()}`;
            }
            return `${fMonth} ${first.getDate()}, ${first.getFullYear()} - ${lMonth} ${last.getDate()}, ${last.getFullYear()}`;
        })(),
    );

    function goToToday() {
        weekOffset = 0;
    }

    function startAdding(dateStr: string) {
        addingForDate = dateStr;
        newTaskTitle = "";
        newTaskProject = "";
    }

    function submitTask() {
        if (addingForDate && newTaskTitle.trim()) {
            onAddTask(
                addingForDate,
                newTaskTitle.trim(),
                newTaskProject || null,
            );
        }
        addingForDate = null;
    }

    function cancelAdding() {
        addingForDate = null;
    }

    // svelte-ignore state_referenced_locally
    let todayKey = getDateKey(new Date());

    function getTasksForDate(dateObj: Date): (Task & { project?: Project })[] {
        const key = getDateKey(dateObj);
        return tasks
            .filter((t) => t.dueDate === key && t.status !== "completed")
            .map((t) => ({
                ...t,
                project: t.projectId
                    ? projects.find((p) => p.id === t.projectId)
                    : undefined,
            }));
    }
</script>

<div class="calendar-view">
    <div class="calendar-nav">
        <div class="calendar-nav-left">
            <h3>{dateRangeLabel}</h3>
        </div>
        <div class="calendar-nav-right">
            <button class="nav-btn" onclick={goToToday}> Today</button>
            <button
                class="nav-btn-icon"
                onclick={() => weekOffset--}
                title="Previous week">‹</button
            >
            <button
                class="nav-btn-icon"
                onclick={() => weekOffset++}
                title="Next week">›</button
            >
        </div>
    </div>

    <div class="calendar-grid">
        {#each weekDates as date, i}
            {@const dateStr = getDateKey(date)}
            {@const isToday = dateStr === todayKey}
            {@const dayTasks = getTasksForDate(date)}

            <div class="calendar-day-col" class:is-today={isToday}>
                <div class="day-header">
                    <div class="day-name">
                        {date.toLocaleString("default", { weekday: "short" })}
                    </div>
                    <div class="day-number">{date.getDate()}</div>
                    <button
                        class="day-add-btn"
                        onclick={() => startAdding(dateStr)}
                        title="Add task for this day">+</button
                    >
                </div>

                <div class="day-content">
                    {#if addingForDate === dateStr}
                        <div class="inline-add-box">
                            <input
                                type="text"
                                class="inline-add-input"
                                bind:value={newTaskTitle}
                                placeholder="Task title..."
                                autofocus
                                onkeydown={(e) => {
                                    if (e.key === "Enter") submitTask();
                                    if (e.key === "Escape") cancelAdding();
                                }}
                            />
                            <select
                                class="inline-add-select"
                                bind:value={newTaskProject}
                            >
                                <option value="">No Project</option>
                                {#each projects as p}
                                    <option value={p.id}>{p.title}</option>
                                {/each}
                            </select>
                            <div class="inline-add-actions">
                                <button class="btn-save" onclick={submitTask}
                                    >Save</button
                                >
                                <button
                                    class="btn-cancel"
                                    onclick={cancelAdding}>✕</button
                                >
                            </div>
                        </div>
                    {/if}

                    {#each dayTasks as task}
                        <div
                            class="cal-task-item"
                            style={task.project
                                ? `border-left-color: ${task.project.color};`
                                : ""}
                        >
                            <div class="cal-task-title">{task.title}</div>
                            {#if task.project}
                                <div
                                    class="cal-task-project"
                                    style="color: {task.project.color}"
                                >
                                    {task.project.title}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>
