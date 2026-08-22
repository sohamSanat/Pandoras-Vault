<script lang="ts">
    import type { Habit, HabitLogs } from "../store";
    import {
        getTodayKey,
        calculateStreak,
        getWeekCompletions,
        getDateKey,
    } from "../store";

    let { habit, habitLogs, onToggle, onDelete } = $props<{
        habit: Habit;
        habitLogs: HabitLogs;
        onToggle: () => void;
        onDelete: () => void;
    }>();

    let showMenu = $state(false);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayDate = now.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let monthDays = $derived(
        Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateObj = new Date(year, month, day);
            const dateKey = getDateKey(dateObj);
            const completed = (habitLogs[dateKey] ?? []).includes(habit.id);
            const isToday = day === todayDate;
            const isFuture = day > todayDate;
            return { day, dateKey, completed, isToday, isFuture };
        }),
    );

    let todayKey = $derived(getTodayKey());
    let completedToday = $derived(
        (habitLogs[todayKey] ?? []).includes(habit.id),
    );
    let streak = $derived(calculateStreak(habit.id, habitLogs));
    let weekDone = $derived(getWeekCompletions(habit.id, habitLogs));
    let progressPct = $derived(
        Math.min(Math.round((weekDone / habit.frequency) * 100), 100),
    );
</script>

<svelte:window onclick={() => (showMenu = false)} />

<div class="habit-card">
    <!-- Header -->
    <div class="habit-header">
        <span class="habit-title">
            <span class="habit-icon" style="color: {habit.color}"
                >{habit.icon}</span
            >
            {habit.title}
        </span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="habit-menu-wrap" onclick={(e) => e.stopPropagation()}>
            <button class="menu-btn" onclick={() => (showMenu = !showMenu)}
                >···</button
            >
            {#if showMenu}
                <div class="menu-dropdown">
                    <button
                        class="menu-item danger"
                        onclick={() => {
                            showMenu = false;
                            onDelete();
                        }}>Delete habit</button
                    >
                </div>
            {/if}
        </div>
    </div>

    <!-- Frequency -->
    <div class="habit-frequency">
        <span></span> Weekly: {habit.frequency}x
    </div>

    <!-- Month calendar — completion dots -->
    <div class="habit-calendar">
        {#each monthDays as { day, completed, isToday, isFuture }}
            <div
                class="calendar-day"
                class:cal-completed={completed}
                class:cal-today={isToday}
                class:cal-future={isFuture}
                style={completed
                    ? `background-color: ${habit.color}20; color: ${habit.color};`
                    : isToday
                      ? `border: 1.5px solid ${habit.color}; color: ${habit.color};`
                      : ""}
            >
                {day}
            </div>
        {/each}
    </div>

    <!-- Statuses below grid -->
    <div class="habit-status-row">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class="habit-completed-status"
            onclick={onToggle}
            style="cursor: pointer; color: {completedToday
                ? habit.color
                : '#71717a'}; font-weight: {completedToday ? 600 : 400}"
        >
            {#if completedToday}
                ✓ Completed Today
            {:else}
                ○ Mark as Done Today
            {/if}
        </div>
    </div>

    <!-- Progress bar -->
    <div class="habit-stats">
        <div class="stat-text">Progress -</div>
        <div class="progress-bar-wrap" style="flex: 1;">
            <div
                class="progress-bar-fill"
                style="width: {progressPct}%; background-color: {habit.color}"
            ></div>
        </div>
        <div class="stat-text" style="color: #a1a1aa; font-size: 0.85em;">
            {progressPct}% ({weekDone}/{habit.frequency})
        </div>
    </div>

    <div class="habit-streak">
        Streak {streak} day{streak === 1 ? "" : "s"}
    </div>
</div>
