<script lang="ts">
    import { onMount } from "svelte";
    import type { App } from "obsidian";
    import type ProductivityHubPlugin from "./main";
    import HabitCard from "./components/HabitCard.svelte";
    import TaskCard from "./components/TaskCard.svelte";
    import ProjectCard from "./components/ProjectCard.svelte";
    import CalendarView from "./components/CalendarView.svelte";
    import type { Habit, Task, Project, HabitLogs } from "./store";
    import {
        generateId,
        getTodayKey,
        getYesterdayKey,
        isPastDue,
    } from "./store";

    let { app, plugin } = $props<{ app: App; plugin: ProductivityHubPlugin }>();

    // ── Core data state ─────────────────────────────────────────────────────
    let habits = $state<Habit[]>([]);
    let tasks = $state<Task[]>([]);
    let projects = $state<Project[]>([]);
    let habitLogs = $state<HabitLogs>({});

    // ── Filter state ─────────────────────────────────────────────────────────
    let taskFilter = $state("today");
    let projectFilter = $state("all");

    // ── Inline form visibility ────────────────────────────────────────────────
    let showAddHabit = $state(false);
    let showAddTask = $state(false);
    let showAddProject = $state(false);

    // ── New habit form fields ─────────────────────────────────────────────────
    let nh_title = $state("");
    let nh_icon = $state("");
    let nh_frequency = $state(7);
    let nh_color = $state("#f472b6");

    // ── New task form fields ──────────────────────────────────────────────────
    let nt_title = $state("");
    let nt_projectId = $state("");
    let nt_dueDate = $state("");

    // ── New project form fields ───────────────────────────────────────────────
    let np_title = $state("");
    let np_dueDate = $state("");
    let np_color = $state("#8b5cf6");

    // ── Colour palettes ───────────────────────────────────────────────────────
    const HABIT_COLORS = [
        "#fbbf24",
        "#38bdf8",
        "#f97316",
        "#2dd4bf",
        "#f472b6",
        "#a78bfa",
        "#34d399",
        "#fb7185",
    ];
    const PROJECT_COLORS = [
        "#8b5cf6",
        "#f472b6",
        "#38bdf8",
        "#34d399",
        "#fbbf24",
        "#f97316",
        "#fb7185",
        "#2dd4bf",
    ];

    // ── Load on mount ─────────────────────────────────────────────────────────
    onMount(() => {
        habits = [...(plugin.data.habits ?? [])];
        tasks = [...(plugin.data.tasks ?? [])];
        projects = [...(plugin.data.projects ?? [])];
        habitLogs = { ...(plugin.data.habitLogs ?? {}) };
    });

    // ── Persist ───────────────────────────────────────────────────────────────
    async function save() {
        plugin.data.habits = habits;
        plugin.data.tasks = tasks;
        plugin.data.projects = projects;
        plugin.data.habitLogs = habitLogs;
        await plugin.saveHubData();
    }

    // ── Habit actions ─────────────────────────────────────────────────────────
    function toggleHabitToday(habitId: string) {
        const key = getTodayKey();
        const current = habitLogs[key] ?? [];
        habitLogs = current.includes(habitId)
            ? { ...habitLogs, [key]: current.filter((id) => id !== habitId) }
            : { ...habitLogs, [key]: [...current, habitId] };
        save();
    }

    function addHabit() {
        if (!nh_title.trim()) return;
        const habit: Habit = {
            id: generateId(),
            title: nh_title.trim(),
            icon: nh_icon || "",
            frequency: nh_frequency,
            color: nh_color,
        };
        habits = [...habits, habit];
        nh_title = "";
        nh_icon = "";
        nh_frequency = 7;
        nh_color = "#f472b6";
        showAddHabit = false;
        save();
    }

    function deleteHabit(habitId: string) {
        habits = habits.filter((h) => h.id !== habitId);
        save();
    }

    // ── Task actions ──────────────────────────────────────────────────────────
    function markTaskComplete(taskId: string) {
        tasks = tasks.map((t) =>
            t.id === taskId ? { ...t, status: "completed" as const } : t,
        );
        save();
    }

    function deleteTask(taskId: string) {
        tasks = tasks.filter((t) => t.id !== taskId);
        save();
    }

    function addTask() {
        if (!nt_title.trim()) return;
        const task: Task = {
            id: generateId(),
            title: nt_title.trim(),
            icon: "",
            projectId: nt_projectId || null,
            status: "not-started",
            dueDate: nt_dueDate || null,
            createdAt: new Date().toISOString(),
        };
        tasks = [...tasks, task];
        nt_title = "";
        nt_projectId = "";
        nt_dueDate = "";
        showAddTask = false;
        save();
    }

    // Called from CalendarView when user adds a task directly to a day
    function addCalendarTask(
        dateStr: string,
        title: string,
        projectId: string | null,
    ) {
        if (!title.trim()) return;
        const task: Task = {
            id: generateId(),
            title: title.trim(),
            icon: "",
            projectId: projectId,
            status: "not-started",
            dueDate: dateStr,
            createdAt: new Date().toISOString(),
        };
        tasks = [...tasks, task];
        save();
    }

    // ── Project actions ───────────────────────────────────────────────────────
    function markProjectComplete(projectId: string) {
        projects = projects.map((p) =>
            p.id === projectId ? { ...p, status: "completed" as const } : p,
        );
        save();
    }

    function deleteProject(projectId: string) {
        projects = projects.filter((p) => p.id !== projectId);
        save();
    }

    function addProject() {
        if (!np_title.trim()) return;
        const project: Project = {
            id: generateId(),
            title: np_title.trim(),
            dueDate: np_dueDate || null,
            status: "active",
            color: np_color,
        };
        projects = [...projects, project];
        np_title = "";
        np_dueDate = "";
        np_color = "#8b5cf6";
        showAddProject = false;
        save();
    }

    // ── Derived lookups ───────────────────────────────────────────────────────
    function getProjectForTask(task: Task): Project | null {
        if (!task.projectId) return null;
        return projects.find((p) => p.id === task.projectId) ?? null;
    }

    function getTaskCounts(projectId: string) {
        const pt = tasks.filter((t) => t.projectId === projectId);
        return {
            total: pt.length,
            completed: pt.filter((t) => t.status === "completed").length,
            incomplete: pt.filter((t) => t.status !== "completed").length,
        };
    }

    // ── Reactive filters ──────────────────────────────────────────────────────
    let todayKey = $derived(getTodayKey());
    let yesterdayKey = $derived(getYesterdayKey());

    let filteredTasks = $derived(
        (() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            switch (taskFilter) {
                case "today":
                    return tasks.filter(
                        (t) =>
                            t.dueDate === todayKey && t.status !== "completed",
                    );
                case "yesterday":
                    return tasks.filter((t) => t.dueDate === yesterdayKey);
                case "overdue":
                    return tasks.filter((t) =>
                        !t.dueDate
                            ? false
                            : isPastDue(t.dueDate) && t.status !== "completed",
                    );
                case "unrelated":
                    return tasks.filter(
                        (t) => !t.projectId && t.status !== "completed",
                    );
                case "inbox":
                    return tasks.filter(
                        (t) => !t.dueDate && t.status !== "completed",
                    );
                default:
                    return tasks.filter((t) => t.status !== "completed");
            }
        })(),
    );

    let filteredProjects = $derived(
        (() => {
            switch (projectFilter) {
                case "completed":
                    return projects.filter((p) => p.status === "completed");
                case "inbox":
                    return projects.filter(
                        (p) => !p.dueDate && p.status !== "completed",
                    );
                default:
                    return projects.filter((p) => p.status !== "completed");
            }
        })(),
    );
</script>

<div class="productivity-hub-container">
    <div class="hub-layout">
        <div class="hub-main">
            <!-- ══════════════════════════════════════════════
                 HABITS & GOALS
            ═══════════════════════════════════════════════ -->
            <div class="hub-header section-header">
                <span> HABIT-STREAK &amp; GOAL-TRACKING</span>
            </div>

            <div class="hub-habits-grid">
                {#each habits as habit (habit.id)}
                    <HabitCard
                        {habit}
                        {habitLogs}
                        onToggle={() => toggleHabitToday(habit.id)}
                        onDelete={() => deleteHabit(habit.id)}
                    />
                {/each}

                {#if showAddHabit}
                    <div class="form-card">
                        <div class="form-title">New Habit</div>
                        <input
                            class="form-input"
                            bind:value={nh_title}
                            placeholder="e.g. Morning Run"
                            onkeydown={(e) => e.key === "Enter" && addHabit()}
                        />
                        <div class="form-row">
                            <input
                                class="form-input small-input"
                                bind:value={nh_icon}
                                placeholder="Icon"
                                maxlength="2"
                                title="Paste any emoji"
                            />
                            <select
                                class="form-select"
                                bind:value={nh_frequency}
                            >
                                {#each [1, 2, 3, 4, 5, 6, 7] as f}
                                    <option value={f}>{f}× / week</option>
                                {/each}
                            </select>
                        </div>
                        <div class="form-label">Colour</div>
                        <div class="color-row">
                            {#each HABIT_COLORS as c}
                                <button
                                    class="color-dot"
                                    style="background: {c}; box-shadow: {nh_color ===
                                    c
                                        ? `0 0 0 2px #fff, 0 0 0 4px ${c}`
                                        : 'none'};"
                                    onclick={() => (nh_color = c)}
                                    title={c}
                                ></button>
                            {/each}
                        </div>
                        <div class="form-actions">
                            <button class="form-submit" onclick={addHabit}
                                >Add Habit</button
                            >
                            <button
                                class="form-cancel"
                                onclick={() => {
                                    showAddHabit = false;
                                }}>Cancel</button
                            >
                        </div>
                    </div>
                    {:else}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-interactive-supports-focus -->
                        <div
                            class="new-page-card"
                            style="min-height: 382px;"
                            onclick={() => (showAddHabit = true)}
                            role="button"
                            onkeydown={(e) =>
                                e.key === "Enter" && (showAddHabit = true)}
                        >
                            + New habit
                        </div>
                    {/if}
            </div>

            <!-- ══════════════════════════════════════════════
                 TASKS
            ═══════════════════════════════════════════════ -->
            <div class="hub-card" style="margin-top: 24px;">
                <div class="hub-header section-header">
                    <span> TASKS</span>
                </div>

                <div class="filter-row">
                    <button
                        class="filter-pill"
                        class:active={taskFilter === "today"}
                        onclick={() => (taskFilter = "today")}>! Today</button
                    >
                    <button
                        class="filter-pill"
                        class:active={taskFilter === "yesterday"}
                        onclick={() => (taskFilter = "yesterday")}
                        >! Yesterday</button
                    >
                    <button
                        class="filter-pill"
                        class:active={taskFilter === "overdue"}
                        onclick={() => (taskFilter = "overdue")}
                        >X Overdue</button
                    >
                    <button
                        class="filter-pill"
                        class:active={taskFilter === "unrelated"}
                        onclick={() => (taskFilter = "unrelated")}
                        >Unrelated Tasks</button
                    >
                    <button
                        class="filter-pill"
                        class:active={taskFilter === "inbox"}
                        onclick={() => (taskFilter = "inbox")}>Inbox</button
                    >
                </div>

                {#if filteredTasks.length === 0 && !showAddTask}
                    <div class="empty-filter-msg">No tasks in this view.</div>
                {/if}

                <div class="hub-tasks-grid">
                    {#each filteredTasks as task (task.id)}
                        <TaskCard
                            {task}
                            project={getProjectForTask(task)}
                            onComplete={() => markTaskComplete(task.id)}
                            onDelete={() => deleteTask(task.id)}
                        />
                    {/each}

                    {#if showAddTask}
                        <div class="form-card">
                            <div class="form-title">New Task</div>
                            <input
                                class="form-input"
                                bind:value={nt_title}
                                placeholder="e.g. Write blog post"
                                onkeydown={(e) =>
                                    e.key === "Enter" && addTask()}
                            />
                            <div class="form-label">Project (optional)</div>
                            <select
                                class="form-select"
                                bind:value={nt_projectId}
                            >
                                <option value="">No project</option>
                                {#each projects as p}
                                    <option value={p.id}>{p.title}</option>
                                {/each}
                            </select>
                            <div class="form-label">Due date (optional)</div>
                            <input
                                class="form-input"
                                type="date"
                                bind:value={nt_dueDate}
                            />
                            <div class="form-actions">
                                <button class="form-submit" onclick={addTask}
                                    >Add Task</button
                                >
                                <button
                                    class="form-cancel"
                                    onclick={() => {
                                        showAddTask = false;
                                    }}>Cancel</button
                                >
                            </div>
                        </div>
                    {:else}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-interactive-supports-focus -->
                        <div
                            class="new-page-card"
                            onclick={() => (showAddTask = true)}
                            role="button"
                            onkeydown={(e) =>
                                e.key === "Enter" && (showAddTask = true)}
                        >
                            + New task
                        </div>
                    {/if}
                </div>
            </div>

            <!-- ══════════════════════════════════════════════
                 PROJECTS
            ═══════════════════════════════════════════════ -->
            <div class="hub-card" style="margin-top: 24px;">
                <div class="hub-header section-header">
                    <span> PROJECT-MANAGER</span>
                </div>

                <div class="filter-row">
                    <button
                        class="filter-pill"
                        class:active={projectFilter === "all"}
                        onclick={() => (projectFilter = "all")}
                        >All Projects</button
                    >
                    <button
                        class="filter-pill"
                        class:active={projectFilter === "completed"}
                        onclick={() => (projectFilter = "completed")}
                        >Complete</button
                    >
                    <button
                        class="filter-pill"
                        class:active={projectFilter === "inbox"}
                        onclick={() => (projectFilter = "inbox")}
                        >Inbox</button
                    >
                </div>

                {#if filteredProjects.length === 0 && !showAddProject}
                    <div class="empty-filter-msg">
                        No projects in this view.
                    </div>
                {/if}

                <div class="hub-tasks-grid">
                    {#each filteredProjects as project (project.id)}
                        <ProjectCard
                            {project}
                            taskCounts={getTaskCounts(project.id)}
                            onComplete={() => markProjectComplete(project.id)}
                            onDelete={() => deleteProject(project.id)}
                        />
                    {/each}

                    {#if showAddProject}
                        <div class="form-card">
                            <div class="form-title">New Project</div>
                            <input
                                class="form-input"
                                bind:value={np_title}
                                placeholder="e.g. App Launch"
                                onkeydown={(e) =>
                                    e.key === "Enter" && addProject()}
                            />
                            <div class="form-label">Due date (optional)</div>
                            <input
                                class="form-input"
                                type="date"
                                bind:value={np_dueDate}
                            />
                            <div class="form-label">Colour</div>
                            <div class="color-row">
                                {#each PROJECT_COLORS as c}
                                    <button
                                        class="color-dot"
                                        style="background: {c}; box-shadow: {np_color ===
                                        c
                                            ? `0 0 0 2px #fff, 0 0 0 4px ${c}`
                                            : 'none'};"
                                        onclick={() => (np_color = c)}
                                        title={c}
                                    ></button>
                                {/each}
                            </div>
                            <div class="form-actions">
                                <button class="form-submit" onclick={addProject}
                                    >Add Project</button
                                >
                                <button
                                    class="form-cancel"
                                    onclick={() => {
                                        showAddProject = false;
                                    }}>Cancel</button
                                >
                            </div>
                        </div>
                    {:else}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-interactive-supports-focus -->
                        <div
                            class="new-page-card"
                            onclick={() => (showAddProject = true)}
                            role="button"
                            onkeydown={(e) =>
                                e.key === "Enter" && (showAddProject = true)}
                        >
                            + New project
                        </div>
                    {/if}
                </div>
            </div>

            <!-- ══════════════════════════════════════════════
                 CALENDAR
            ═══════════════════════════════════════════════ -->
            <CalendarView {tasks} {projects} onAddTask={addCalendarTask} />
        </div>
    </div>
</div>

<style>
    /* ── Section header with add button ──────────────────────────────────── */
    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .add-btn {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #a1a1aa;
        padding: 5px 14px;
        border-radius: 20px;
        cursor: pointer;
        font-family: "JetBrains Mono", monospace;
        font-size: 0.8em;
        transition: all 0.2s;
    }

    .add-btn:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.25);
        color: #e4e4e7;
    }

    /* ── Filter pills ────────────────────────────────────────────────────── */
    .filter-row {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        flex-wrap: wrap;
    }

    .filter-pill {
        background: transparent;
        border: none;
        color: #a1a1aa;
        padding: 6px 12px;
        border-radius: 16px;
        cursor: pointer;
        font-family: "JetBrains Mono", monospace;
        font-size: 0.85em;
        transition: all 0.2s;
    }

    .filter-pill:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #e4e4e7;
    }

    .filter-pill.active {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        font-weight: 600;
    }

    /* ── New-item card (dashed placeholder) ──────────────────────────────── */
    .new-page-card {
        background: transparent;
        border: 1px dashed rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #71717a;
        font-family: "JetBrains Mono", monospace;
        font-size: 0.88em;
        cursor: pointer;
        transition: all 0.2s;
        min-height: 120px;
    }

    .new-page-card:hover {
        background: rgba(255, 255, 255, 0.02);
        color: #a1a1aa;
        border-color: rgba(255, 255, 255, 0.2);
    }

    /* ── Empty states ────────────────────────────────────────────────────── */
    .empty-state {
        font-family: "JetBrains Mono", monospace;
        font-size: 0.85em;
        color: #52525b;
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 4px;
        padding: 10px 0;
    }

    .empty-filter-msg {
        font-family: "JetBrains Mono", monospace;
        font-size: 0.82em;
        color: #3f3f46;
        padding: 4px 2px 12px;
    }

    .inline-add-link {
        background: none;
        border: none;
        color: #71717a;
        cursor: pointer;
        font-family: inherit;
        font-size: inherit;
        text-decoration: underline;
        padding: 0;
        transition: color 0.15s;
    }

    .inline-add-link:hover {
        color: #a1a1aa;
    }

    /* ── Inline form card ────────────────────────────────────────────────── */
    .form-card {
        background: rgba(20, 20, 20, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        font-family: "JetBrains Mono", "Courier New", monospace;
        font-size: 0.85em;
    }

    .form-title {
        font-weight: 700;
        color: #e4e4e7;
        font-size: 1em;
    }

    .form-label {
        color: #52525b;
        font-size: 0.8em;
        margin-bottom: -4px;
    }

    .form-input {
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 7px;
        color: #e4e4e7;
        font-family: "JetBrains Mono", monospace;
        font-size: 0.9em;
        padding: 7px 11px;
        outline: none;
        width: 100%;
        box-sizing: border-box;
        transition: border-color 0.15s;
    }

    .form-input:focus {
        border-color: rgba(255, 255, 255, 0.28);
    }

    .form-input.small-input {
        width: 60px;
        flex-shrink: 0;
        text-align: center;
    }

    .form-select {
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 7px;
        color: #e4e4e7;
        font-family: "JetBrains Mono", monospace;
        font-size: 0.9em;
        padding: 7px 11px;
        outline: none;
        width: 100%;
        box-sizing: border-box;
        transition: border-color 0.15s;
        cursor: pointer;
    }

    .form-select:focus {
        border-color: rgba(255, 255, 255, 0.28);
    }
    .form-select option {
        background: #1c1c1f;
    }

    .form-row {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .form-row .form-select {
        flex: 1;
    }

    .color-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .color-dot {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        transition: transform 0.15s;
        flex-shrink: 0;
    }

    .color-dot:hover {
        transform: scale(1.2);
    }

    .form-actions {
        display: flex;
        gap: 8px;
        margin-top: 4px;
    }

    .form-submit {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 7px;
        color: #e4e4e7;
        cursor: pointer;
        font-family: "JetBrains Mono", monospace;
        font-size: 0.88em;
        padding: 7px 16px;
        transition:
            background 0.15s,
            border-color 0.15s,
            color 0.15s;
    }

    .form-submit:hover {
        background: rgba(52, 211, 153, 0.15);
        border-color: rgba(52, 211, 153, 0.35);
        color: #34d399;
    }

    .form-cancel {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 7px;
        color: #71717a;
        cursor: pointer;
        font-family: "JetBrains Mono", monospace;
        font-size: 0.88em;
        padding: 7px 12px;
        transition:
            background 0.15s,
            color 0.15s;
    }

    .form-cancel:hover {
        background: rgba(239, 68, 68, 0.08);
        color: #f87171;
    }
</style>
