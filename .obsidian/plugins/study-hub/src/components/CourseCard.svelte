<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { studyHubStore, deleteCourse } from '../store';
    import { openOrCreateNote, getCourseTemplate } from '../utils/vault';
    import type { Course } from '../types';
    import type { App } from 'obsidian';
    import { 
        Calculator, 
        Code, 
        Network, 
        SquareTerminal, 
        Monitor, 
        BookOpen, 
        PenTool, 
        Brain, 
        Atom, 
        FileText,
        Sparkles,
        Trash2
    } from 'lucide-svelte';

    export let app: App;
    export let course: Course;

    const dispatch = createEventDispatcher();

    // Dynamically resolve icon component
    const iconMap: Record<string, any> = {
        Calculator,
        Code,
        Network,
        SquareTerminal,
        Monitor,
        BookOpen,
        PenTool,
        Brain,
        Atom,
        FileText
    };

    $: IconComp = iconMap[course.icon] || FileText;

    // Relational dynamic stats
    $: courseAssignments = $studyHubStore.assignments.filter(a => a.courseId === course.id);
    $: totalAssignments = courseAssignments.length;
    $: completedAssignments = courseAssignments.filter(a => a.completed).length;
    $: assignmentProgress = totalAssignments === 0 ? 0 : Math.round((completedAssignments / totalAssignments) * 100);

    $: courseExams = $studyHubStore.exams.filter(e => e.courseId === course.id);
    $: upcomingExams = courseExams.filter(e => !e.isPast).length;
    $: pastExams = courseExams.filter(e => e.isPast).length;
    $: totalExams = upcomingExams + pastExams;
    $: examProgress = totalExams === 0 ? 0 : Math.round((pastExams / totalExams) * 100);

    // Course Skill level
    $: skill = $studyHubStore.rpg?.courseSkills?.[course.id] || { level: 1 };

    async function handleCardClick() {
        const folder = course.folderPath || `07 Notes/Courses/${course.title}`;
        const filePath = `${folder}/${course.title}.md`;
        await openOrCreateNote(app, filePath, getCourseTemplate(course.title));
    }

    function handleOpenConceptMap(e: MouseEvent) {
        e.stopPropagation();
        dispatch('openConceptMap', { courseId: course.id, courseTitle: course.title });
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="course-card" on:click={handleCardClick} title="Click to open {course.title} in Obsidian">
    <div class="card-icon-wrapper">
        <svelte:component this={IconComp} size={64} strokeWidth={1} color="var(--text-normal)" />
        <button type="button" class="concept-map-btn" on:click={handleOpenConceptMap} title="Open 3D Concept Map for {course.title}">
            <Sparkles size={12} /> 3D Map
        </button>
    </div>

    <div class="card-content">
        <div class="card-title-row">
            <svelte:component this={IconComp} size={16} strokeWidth={2} color="#00f3ff" />
            <span class="card-title">{course.title}</span>
            <span class="course-level-tag">Lv. {skill.level}</span>
            <button 
                type="button" 
                class="course-delete-btn" 
                on:click|stopPropagation={() => deleteCourse(course.id)} 
                title="Remove course"
            >
                <Trash2 size={13} />
            </button>
        </div>

        <div class="stats-group">
            <div class="stat-line">Total Assignment = {totalAssignments}</div>
            <div class="stat-line">Completed Assignment = {completedAssignments}</div>
            <div class="progress-container">
                <span class="progress-text">{assignmentProgress}%</span>
                <div class="progress-track">
                    <div class="progress-fill" style="width: {assignmentProgress}%"></div>
                </div>
            </div>
        </div>

        <div class="stats-group" style="margin-top: 12px;">
            <div class="stat-line">Upcoming Exams = {upcomingExams}</div>
            <div class="stat-line">Past Exams = {pastExams}</div>
            <div class="progress-container">
                <span class="progress-text">{examProgress}%</span>
                <div class="progress-track">
                    <div class="progress-fill exam-fill" style="width: {examProgress}%"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .course-card {
        background-color: #080808;
        border: 1px solid var(--background-modifier-border);
        border-radius: 8px;
        display: flex;
        align-items: stretch;
        cursor: pointer;
        transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        position: relative;
        overflow: hidden;
        min-width: 320px;
    }

    .course-card:hover {
        transform: translateY(-2px);
        border-color: #00f3ff;
        box-shadow: 0 4px 20px rgba(0, 243, 255, 0.12);
    }

    .card-icon-wrapper {
        width: 110px;
        background-color: #0d0d0d;
        border-right: 1px solid var(--background-modifier-border);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 6px;
    }

    .concept-map-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(0, 243, 255, 0.12);
        border: 1px solid rgba(0, 243, 255, 0.35);
        color: #00f3ff;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.7em;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .concept-map-btn:hover {
        background: #00f3ff;
        color: #000;
        box-shadow: 0 0 10px rgba(0, 243, 255, 0.4);
    }

    .card-content {
        flex: 1;
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .card-title-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
    }

    .card-title {
        font-size: 1.05em;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 0.3px;
    }

    .course-level-tag {
        background: rgba(0, 243, 255, 0.15);
        border: 1px solid rgba(0, 243, 255, 0.3);
        color: #00f3ff;
        font-size: 0.68em;
        font-weight: 800;
        padding: 1px 6px;
        border-radius: 6px;
        margin-left: auto;
    }

    .course-delete-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        opacity: 0;
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 4px;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
    }

    .course-card:hover .course-delete-btn {
        opacity: 0.5;
    }

    .course-delete-btn:hover {
        opacity: 1 !important;
        color: #ef4444;
        background: rgba(239, 68, 68, 0.15);
    }

    .stats-group {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .stat-line {
        font-size: 0.8em;
        color: var(--text-muted);
        line-height: 1.3;
    }

    .progress-container {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
    }

    .progress-text {
        font-size: 0.75em;
        font-weight: 700;
        color: var(--text-normal);
        min-width: 32px;
    }

    .progress-track {
        flex: 1;
        height: 6px;
        background-color: #1a1a1a;
        border-radius: 3px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background-color: #00f3ff;
        border-radius: 3px;
        transition: width 0.3s ease;
    }

    .exam-fill {
        background-color: #ffd700;
    }
</style>
