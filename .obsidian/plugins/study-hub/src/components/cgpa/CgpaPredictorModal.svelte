<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { 
        studyHubStore, 
        updateCgpaTargets, 
        updateCourseGradeItem, 
        addCourseGradeItem, 
        deleteCourseGradeItem, 
        updatePastSemester 
    } from '../../store';
    import { 
        calculateSemesterSgpa, 
        calculateCumulativeCgpa, 
        solveRequiredSeeScores, 
        INDIAN_GRADE_SCALE 
    } from '../../utils/cgpaEngine';
    import type { CourseGradeItem, PastSemesterRecord, FeasibilityTier } from '../../types/cgpa';
    import { 
        Calculator, 
        GraduationCap, 
        TrendingUp, 
        Plus, 
        Trash2, 
        AlertCircle, 
        CheckCircle2, 
        Sparkles, 
        Flame, 
        Target,
        Layers
    } from 'lucide-svelte';

    const dispatch = createEventDispatcher();

    let activeTab: 'semester' | 'degree' = 'semester';
    let showAddCourseModal = false;

    // New Course Form state
    let newCourseName = '';
    let newCredits = 4;
    let newCieMax = 50;
    let newCieObtained = 42;
    let newSeeMax = 50;

    $: cgpaState = $studyHubStore.cgpa || {
        targetDegreeCgpa: 9.0,
        targetSemesterSgpa: 8.8,
        currentSemesterNumber: 4,
        currentSemesterCourses: [],
        pastSemesters: []
    };

    $: courses = cgpaState.currentSemesterCourses || [];
    $: targetSgpa = cgpaState.targetSemesterSgpa || 8.8;
    $: targetDegreeCgpa = cgpaState.targetDegreeCgpa || 9.0;
    $: pastSemesters = cgpaState.pastSemesters || [];

    // Live calculations
    $: solvedCourses = solveRequiredSeeScores(courses, targetSgpa);
    $: currentSemResult = calculateSemesterSgpa(courses);
    $: cumulativeResult = calculateCumulativeCgpa(pastSemesters, currentSemResult.sgpa, currentSemResult.totalCredits);
    $: honors = getHonorsClassification(cumulativeResult.cgpa);

    function handleTargetSgpaChange(val: number) {
        updateCgpaTargets(targetDegreeCgpa, Number(val));
    }

    function handleTargetDegreeChange(val: number) {
        updateCgpaTargets(Number(val), targetSgpa);
    }

    function handleCieChange(courseId: string, obtained: number) {
        updateCourseGradeItem(courseId, { cieObtainedMarks: Number(obtained) });
    }

    function handleSeePredictedChange(courseId: string, predicted: number) {
        updateCourseGradeItem(courseId, { seePredictedMarks: Number(predicted) });
    }

    function handleAddCourse() {
        if (!newCourseName.trim()) return;
        addCourseGradeItem({
            id: `course-${Date.now()}`,
            courseName: newCourseName,
            credits: Number(newCredits),
            cieMaxMarks: Number(newCieMax),
            cieObtainedMarks: Number(newCieObtained),
            seeMaxMarks: Number(newSeeMax),
            seePredictedMarks: Math.round(Number(newSeeMax) * 0.8)
        });
        newCourseName = '';
        showAddCourseModal = false;
    }

    function handlePastSemUpdate(semNum: number, sgpa: number, credits: number) {
        updatePastSemester(semNum, Number(sgpa), Number(credits));
    }

    function getFeasibilityBadge(feasibility?: FeasibilityTier) {
        switch (feasibility) {
            case 'smooth': return { label: '🟢 Smooth Sailing', class: 'smooth' };
            case 'grind': return { label: '🟡 Manageable Grind', class: 'grind' };
            case 'high_focus': return { label: '🟠 High Focus', class: 'high-focus' };
            case 'clutch': return { label: '🔴 Clutch Required', class: 'clutch' };
            case 'impossible': return { label: '☠️ Mathematically Out of Range', class: 'impossible' };
            default: return { label: '🟢 On Track', class: 'smooth' };
        }
    }

    function getHonorsClassification(cgpa: number) {
        if (cgpa >= 9.0) return { title: '🌟 Dean\'s List / Gold Medal Candidate', class: 'gold' };
        if (cgpa >= 7.75) return { title: '🏆 First Class with Distinction (FCD)', class: 'fcd' };
        if (cgpa >= 6.75) return { title: '🎖️ First Class (FC)', class: 'fc' };
        if (cgpa >= 5.0) return { title: '📜 Second Class', class: 'sc' };
        return { title: 'Pass', class: 'pass' };
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal-backdrop" on:click={() => dispatch('close')}>
    <div class="modal-container" on:click|stopPropagation>
        <!-- Top Bar -->
        <div class="modal-header">
            <div class="header-left">
                <Calculator size={22} color="#00f3ff" />
                <h2>Indian Engineering (CSE) CGPA & Target Predictor</h2>
            </div>
            <button type="button" class="close-btn" on:click={() => dispatch('close')}>&times;</button>
        </div>

        <!-- Navigation Tabs -->
        <div class="cgpa-tabs">
            <button 
                type="button" 
                class="tab-btn {activeTab === 'semester' ? 'active' : ''}" 
                on:click={() => activeTab = 'semester'}
            >
                <Target size={15} /> 🎯 Current Semester End-Sem Target Solver
            </button>
            <button 
                type="button" 
                class="tab-btn {activeTab === 'degree' ? 'active' : ''}" 
                on:click={() => activeTab = 'degree'}
            >
                <GraduationCap size={15} color="#ffd700" /> 🎓 8-Semester Cumulative Degree CGPA
            </button>
        </div>

        <!-- Modal Body -->
        <div class="cgpa-body">
            {#if activeTab === 'semester'}
                <!-- Target Orbit HUD Bar -->
                <div class="orbit-hud">
                    <div class="hud-stat-box">
                        <span class="hud-label">TARGET SGPA</span>
                        <div class="target-input-row">
                            <input 
                                type="number" 
                                step="0.1" 
                                min="4.0" 
                                max="10.0" 
                                value={targetSgpa} 
                                on:change={(e) => handleTargetSgpaChange(Number(e.currentTarget.value))}
                            />
                            <span class="target-max">/ 10.0</span>
                        </div>
                    </div>

                    <div class="hud-stat-box highlight">
                        <span class="hud-label">PROJECTED SGPA</span>
                        <span class="hud-val glow">{currentSemResult.sgpa}</span>
                    </div>

                    <div class="hud-stat-box">
                        <span class="hud-label">SEMESTER CREDITS</span>
                        <span class="hud-val">{currentSemResult.totalCredits} Credits</span>
                    </div>

                    <div class="hud-stat-box">
                        <span class="hud-label">OVERALL DEGREE CGPA</span>
                        <span class="hud-val">{cumulativeResult.cgpa}</span>
                    </div>
                </div>

                <!-- Course Solver Table Header -->
                <div class="table-header-row">
                    <div class="section-title">
                        <Layers size={16} color="#00f3ff" />
                        <h3>CIE (Internals) & Required SEE (End-Sem) Marks</h3>
                    </div>

                    <button type="button" class="btn-add-course" on:click={() => showAddCourseModal = !showAddCourseModal}>
                        <Plus size={14} /> Add Subject
                    </button>
                </div>

                {#if showAddCourseModal}
                    <div class="add-course-drawer">
                        <h4>Add Engineering Subject</h4>
                        <div class="add-grid">
                            <input type="text" placeholder="Subject Name (e.g. Computer Networks)" bind:value={newCourseName} />
                            <select bind:value={newCredits}>
                                <option value={4}>4 Credits (Core Theory)</option>
                                <option value={3}>3 Credits (Elective/Theory)</option>
                                <option value={2}>2 Credits (Mini-Project/Lab)</option>
                                <option value={1.5}>1.5 Credits (Lab)</option>
                            </select>
                            <input type="number" placeholder="CIE Max (50)" bind:value={newCieMax} />
                            <input type="number" placeholder="CIE Scored (e.g. 44)" bind:value={newCieObtained} />
                            <input type="number" placeholder="SEE Max (50)" bind:value={newSeeMax} />
                        </div>
                        <div class="drawer-actions">
                            <button type="button" class="btn-cancel" on:click={() => showAddCourseModal = false}>Cancel</button>
                            <button type="button" class="btn-save" on:click={handleAddCourse}>Add Subject</button>
                        </div>
                    </div>
                {/if}

                <!-- Courses Table -->
                <div class="courses-table-container">
                    <table class="cgpa-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Credits</th>
                                <th>CIE (Internals)</th>
                                <th>Need in End-Sem (SEE)</th>
                                <th>Target Feasibility</th>
                                <th>Projected Grade</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each solvedCourses as course (course.id)}
                                {@const badge = getFeasibilityBadge(course.feasibility)}
                                <tr>
                                    <td class="course-name-cell">
                                        <span class="subject-title">{course.courseName}</span>
                                        {#if course.isLab}
                                            <span class="lab-tag">LAB</span>
                                        {/if}
                                    </td>
                                    <td>
                                        <span class="credits-tag">{course.credits} Cr</span>
                                    </td>
                                    <td>
                                        <div class="cie-input-wrapper">
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max={course.cieMaxMarks} 
                                                value={course.cieObtainedMarks}
                                                on:input={(e) => handleCieChange(course.id, Number(e.currentTarget.value))}
                                            />
                                            <span class="max-sub">/ {course.cieMaxMarks}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="see-needed-box">
                                            <span class="needed-marks">{course.requiredSeeMarksForTarget}</span>
                                            <span class="see-max">/ {course.seeMaxMarks}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="feasibility-badge {badge.class}">
                                            {badge.label}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="grade-pill">{course.predictedGradeLetter} ({course.predictedGradePoint} GP)</span>
                                    </td>
                                    <td>
                                        <button 
                                            type="button" 
                                            class="btn-delete-course" 
                                            on:click={() => deleteCourseGradeItem(course.id)}
                                            title="Remove Subject"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>

            {:else}
                <!-- 🎓 8-Semester Cumulative Degree CGPA Tab -->
                <div class="degree-cgpa-container">
                    <!-- Honors Banner -->
                    <div class="honors-banner">
                        <div class="honors-left">
                            <span class="honors-badge">{honors.title}</span>
                            <h3 class="cumulative-display">Degree CGPA: <strong>{cumulativeResult.cgpa} / 10.0</strong></h3>
                            <p class="credits-total-sub">Total Completed Credits: {cumulativeResult.totalDegreeCredits} Credits</p>
                        </div>
                        <div class="target-degree-box">
                            <span class="target-label">Target Degree CGPA:</span>
                            <input 
                                type="number" 
                                step="0.1" 
                                min="4.0" 
                                max="10.0" 
                                value={targetDegreeCgpa} 
                                on:change={(e) => handleTargetDegreeChange(Number(e.currentTarget.value))}
                            />
                        </div>
                    </div>

                    <!-- 8 Semesters Grid -->
                    <div class="semesters-grid">
                        {#each Array(8) as _, i}
                            {@const semNum = i + 1}
                            {@const semRecord = pastSemesters.find(p => p.semesterNumber === semNum) || { semesterNumber: semNum, sgpa: 0, totalCredits: 20 }}
                            <div class="semester-card {semRecord.sgpa > 0 ? 'completed' : 'future'}">
                                <div class="sem-header">
                                    <span class="sem-name">Semester {semNum}</span>
                                    {#if semRecord.sgpa > 0}
                                        <span class="sem-status-done">Recorded</span>
                                    {:else}
                                        <span class="sem-status-pending">Upcoming</span>
                                    {/if}
                                </div>

                                <div class="sem-inputs">
                                    <div class="input-group">
                                        <label>SGPA (0-10)</label>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            min="0" 
                                            max="10" 
                                            placeholder="e.g. 8.85" 
                                            value={semRecord.sgpa || ''} 
                                            on:change={(e) => handlePastSemUpdate(semNum, Number(e.currentTarget.value), semRecord.totalCredits)}
                                        />
                                    </div>
                                    <div class="input-group">
                                        <label>Credits</label>
                                        <input 
                                            type="number" 
                                            min="10" 
                                            max="30" 
                                            value={semRecord.totalCredits || 20} 
                                            on:change={(e) => handlePastSemUpdate(semNum, semRecord.sgpa, Number(e.currentTarget.value))}
                                        />
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
    }

    .modal-container {
        width: 92vw;
        max-width: 920px;
        height: 88vh;
        max-height: 88vh;
        background: #0b0e14;
        border: 1px solid rgba(0, 243, 255, 0.3);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 243, 255, 0.1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--background-modifier-border);
        flex-shrink: 0;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .header-left h2 {
        font-size: 1.15em;
        font-weight: 800;
        color: #fff;
        margin: 0;
    }

    .close-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 1.4em;
        cursor: pointer;
    }

    .cgpa-tabs {
        display: flex;
        gap: 8px;
        padding: 12px 20px;
        background: rgba(255, 255, 255, 0.02);
        border-bottom: 1px solid var(--background-modifier-border);
        flex-shrink: 0;
    }

    .tab-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: transparent;
        border: 1px solid transparent;
        color: var(--text-muted);
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 0.82em;
        font-weight: 600;
        cursor: pointer;
    }

    .tab-btn.active {
        background: rgba(0, 243, 255, 0.12);
        border-color: rgba(0, 243, 255, 0.4);
        color: #00f3ff;
    }

    .cgpa-body {
        padding: 20px;
        overflow-y: auto;
        overflow-x: hidden;
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 243, 255, 0.4) rgba(255, 255, 255, 0.03);
    }

    .cgpa-body::-webkit-scrollbar,
    .courses-table-container::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    .cgpa-body::-webkit-scrollbar-track,
    .courses-table-container::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 10px;
    }

    .cgpa-body::-webkit-scrollbar-thumb,
    .courses-table-container::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, rgba(0, 243, 255, 0.4), rgba(244, 114, 182, 0.4));
        border-radius: 10px;
        transition: all 0.2s ease;
    }

    .cgpa-body::-webkit-scrollbar-thumb:hover,
    .courses-table-container::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #00f3ff, #f472b6);
        box-shadow: 0 0 10px rgba(0, 243, 255, 0.7);
    }

    /* Orbit HUD */
    .orbit-hud {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--background-modifier-border);
        border-radius: 12px;
        padding: 14px 18px;
    }

    .hud-stat-box {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .hud-label {
        font-size: 0.68em;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: var(--text-muted);
    }

    .hud-val {
        font-size: 1.15em;
        font-weight: 800;
        color: #fff;
    }

    .hud-val.glow {
        color: #00f3ff;
        text-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
    }

    .target-input-row {
        display: flex;
        align-items: baseline;
        gap: 4px;
    }

    .target-input-row input {
        width: 60px;
        background: #12161f;
        border: 1px solid #00f3ff;
        color: #00f3ff;
        font-weight: 800;
        font-size: 1.1em;
        padding: 2px 6px;
        border-radius: 6px;
    }

    .target-max {
        font-size: 0.8em;
        color: var(--text-muted);
    }

    /* Table Section */
    .table-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .section-title h3 {
        margin: 0;
        font-size: 0.9em;
        font-weight: 800;
        color: #fff;
    }

    .btn-add-course {
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(0, 243, 255, 0.1);
        border: 1px solid rgba(0, 243, 255, 0.35);
        color: #00f3ff;
        padding: 5px 12px;
        border-radius: 8px;
        font-size: 0.78em;
        font-weight: 600;
        cursor: pointer;
    }

    .add-course-drawer {
        background: rgba(0, 243, 255, 0.04);
        border: 1px dashed rgba(0, 243, 255, 0.3);
        border-radius: 10px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .add-course-drawer h4 {
        margin: 0;
        font-size: 0.85em;
        color: #00f3ff;
    }

    .add-grid {
        display: grid;
        grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr;
        gap: 8px;
    }

    .add-grid input, .add-grid select {
        background: #080b10;
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        padding: 6px 10px;
        color: #fff;
        font-size: 0.8em;
    }

    .drawer-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }

    .btn-cancel {
        background: transparent;
        border: 1px solid var(--background-modifier-border);
        color: var(--text-muted);
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 0.78em;
        cursor: pointer;
    }

    .btn-save {
        background: #00f3ff;
        color: #000;
        border: none;
        font-weight: 700;
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 0.78em;
        cursor: pointer;
    }

    /* Courses Table */
    .courses-table-container {
        border: 1px solid var(--background-modifier-border);
        border-radius: 12px;
        overflow-x: auto;
        overflow-y: visible;
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 243, 255, 0.4) rgba(255, 255, 255, 0.03);
    }

    .cgpa-table {
        width: 100%;
        min-width: 780px;
        border-collapse: collapse;
        font-size: 0.82em;
    }

    .cgpa-table th {
        background: rgba(255, 255, 255, 0.04);
        padding: 10px 12px;
        text-align: left;
        color: var(--text-muted);
        font-weight: 700;
        border-bottom: 1px solid var(--background-modifier-border);
    }

    .cgpa-table td {
        padding: 10px 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        vertical-align: middle;
    }

    .course-name-cell {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .subject-title {
        font-weight: 700;
        color: #fff;
    }

    .lab-tag {
        font-size: 0.65em;
        font-weight: 800;
        color: #f472b6;
        background: rgba(244, 114, 182, 0.15);
        padding: 1px 4px;
        border-radius: 4px;
    }

    .credits-tag {
        font-size: 0.75em;
        color: var(--text-muted);
        font-weight: 600;
    }

    .cie-input-wrapper {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .cie-input-wrapper input {
        width: 46px;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid var(--background-modifier-border);
        color: #fff;
        padding: 3px 6px;
        border-radius: 4px;
        font-size: 0.85em;
    }

    .max-sub {
        font-size: 0.75em;
        color: var(--text-muted);
    }

    .see-needed-box {
        display: flex;
        align-items: baseline;
        gap: 4px;
    }

    .needed-marks {
        font-size: 1.1em;
        font-weight: 800;
        color: #00f3ff;
    }

    .see-max {
        font-size: 0.75em;
        color: var(--text-muted);
    }

    .feasibility-badge {
        font-size: 0.72em;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 12px;
    }

    .feasibility-badge.smooth { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .feasibility-badge.grind { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .feasibility-badge.high-focus { background: rgba(249, 115, 22, 0.15); color: #f97316; }
    .feasibility-badge.clutch { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .feasibility-badge.impossible { background: rgba(239, 68, 68, 0.3); color: #ef4444; }

    .grade-pill {
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
        font-weight: 700;
        font-size: 0.78em;
        padding: 3px 8px;
        border-radius: 6px;
    }

    .btn-delete-course {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
    }

    .btn-delete-course:hover { color: #ef4444; }

    /* Degree CGPA Tab */
    .degree-cgpa-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .honors-banner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 243, 255, 0.05) 100%);
        border: 1px solid rgba(255, 215, 0, 0.35);
        border-radius: 14px;
        padding: 16px 20px;
    }

    .honors-badge {
        font-size: 0.8em;
        font-weight: 800;
        color: #ffd700;
        letter-spacing: 0.5px;
    }

    .cumulative-display {
        margin: 4px 0 2px 0;
        font-size: 1.3em;
        color: #fff;
    }

    .credits-total-sub {
        margin: 0;
        font-size: 0.78em;
        color: var(--text-muted);
    }

    .target-degree-box {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
    }

    .target-label {
        font-size: 0.72em;
        color: var(--text-muted);
    }

    .target-degree-box input {
        width: 70px;
        background: #080b10;
        border: 1px solid #ffd700;
        color: #ffd700;
        font-size: 1.1em;
        font-weight: 800;
        padding: 4px 8px;
        border-radius: 6px;
        text-align: center;
    }

    .semesters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
    }

    .semester-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--background-modifier-border);
        border-radius: 10px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .semester-card.completed {
        border-color: rgba(0, 243, 255, 0.3);
    }

    .sem-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .sem-name {
        font-size: 0.85em;
        font-weight: 700;
        color: #fff;
    }

    .sem-status-done { font-size: 0.68em; color: #10b981; font-weight: 700; }
    .sem-status-pending { font-size: 0.68em; color: var(--text-muted); }

    .sem-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .input-group label {
        font-size: 0.68em;
        color: var(--text-muted);
    }

    .input-group input {
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        padding: 4px 6px;
        color: #fff;
        font-size: 0.82em;
    }
</style>
