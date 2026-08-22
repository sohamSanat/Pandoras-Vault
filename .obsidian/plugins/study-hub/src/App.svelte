<script lang="ts">
    import type { App as ObsidianApp, Plugin } from 'obsidian';
    import { studyHubStore } from './store';
    import CourseCard from './components/CourseCard.svelte';
    import CategoryCard from './components/CategoryCard.svelte';
    import LifeBalanceChart from './components/LifeBalanceChart.svelte';
    import PomodoroTimer from './components/PomodoroTimer.svelte';
    import MiniTodoList from './components/MiniTodoList.svelte';
    import ReminderList from './components/ReminderList.svelte';
    import TaskManager from './components/TaskManager.svelte';
    import TimeTable from './components/TimeTable.svelte';
    import AcademicCalendar from './components/AcademicCalendar.svelte';

    // RPG Gamification Components
    import RpgProfileCard from './components/rpg/RpgProfileCard.svelte';
    import ComboMeter from './components/rpg/ComboMeter.svelte';
    import QuestBoard from './components/rpg/QuestBoard.svelte';
    import BossBattleWidget from './components/rpg/BossBattleWidget.svelte';
    import VoucherShopModal from './components/rpg/VoucherShopModal.svelte';
    import SkillTreeModal from './components/rpg/SkillTreeModal.svelte';

    // Flashcard & CGPA Modals
    import FlashcardArenaModal from './components/flashcard/FlashcardArenaModal.svelte';
    import CgpaPredictorModal from './components/cgpa/CgpaPredictorModal.svelte';

    // Standard Modals
    import CourseModal from './components/modals/CourseModal.svelte';
    import AssignmentModal from './components/modals/AssignmentModal.svelte';
    import ExamModal from './components/modals/ExamModal.svelte';
    import NoteModal from './components/modals/NoteModal.svelte';
    import ResourceModal from './components/modals/ResourceModal.svelte';
    import CategoryListModal from './components/modals/CategoryListModal.svelte';
    import ConceptMapModal from './components/concept/ConceptMapModal.svelte';

    import { 
        LayoutGrid, 
        Plus, 
        BookOpen, 
        PenTool, 
        FileText, 
        LayoutList, 
        Sparkles, 
        ShoppingBag, 
        GitFork,
        Brain,
        Calculator
    } from 'lucide-svelte';

    export let app: ObsidianApp;
    export let plugin: Plugin | undefined = undefined;

    // Modal state
    let showCourseModal = false;
    let showAssignmentModal = false;
    let showExamModal = false;
    let showNoteModal = false;
    let showResourceModal = false;
    let showConceptMapModal = false;
    let showVoucherShopModal = false;
    let showSkillTreeModal = false;
    let showFlashcardModal = false;
    let showCgpaModal = false;

    let activeConceptCourse = { id: 'dsa', title: 'Data Structures & Algorithms' };
    let activeCategoryList: 'ASSIGNMENT' | 'RESOURCES' | 'NOTES' | 'EXAM' | null = null;

    function handleCategoryClick(event: CustomEvent<'ASSIGNMENT' | 'RESOURCES' | 'NOTES' | 'EXAM'>) {
        activeCategoryList = event.detail;
    }

    function handleAddNew(event: CustomEvent<'ASSIGNMENT' | 'RESOURCES' | 'NOTES' | 'EXAM'>) {
        const cat = event.detail;
        if (cat === 'ASSIGNMENT') showAssignmentModal = true;
        else if (cat === 'EXAM') showExamModal = true;
        else if (cat === 'NOTES') showNoteModal = true;
        else if (cat === 'RESOURCES') showResourceModal = true;
    }

    function handleOpenConceptMap(event: CustomEvent<{ courseId: string; courseTitle: string }>) {
        activeConceptCourse = {
            id: event.detail.courseId,
            title: event.detail.courseTitle
        };
        showConceptMapModal = true;
    }
</script>

<!-- Global Modals -->
{#if showCourseModal}
    <CourseModal {app} on:close={() => showCourseModal = false} />
{/if}

{#if showAssignmentModal}
    <AssignmentModal {app} on:close={() => showAssignmentModal = false} />
{/if}

{#if showExamModal}
    <ExamModal on:close={() => showExamModal = false} />
{/if}

{#if showNoteModal}
    <NoteModal {app} on:close={() => showNoteModal = false} />
{/if}

{#if showResourceModal}
    <ResourceModal on:close={() => showResourceModal = false} />
{/if}

{#if showConceptMapModal}
    <ConceptMapModal 
        {app} 
        initialCourseId={activeConceptCourse.id} 
        initialCourseTitle={activeConceptCourse.title}
        on:close={() => showConceptMapModal = false} 
    />
{/if}

{#if showVoucherShopModal}
    <VoucherShopModal on:close={() => showVoucherShopModal = false} />
{/if}

{#if showSkillTreeModal}
    <SkillTreeModal on:close={() => showSkillTreeModal = false} />
{/if}

{#if showFlashcardModal}
    <FlashcardArenaModal on:close={() => showFlashcardModal = false} />
{/if}

{#if showCgpaModal}
    <CgpaPredictorModal on:close={() => showCgpaModal = false} />
{/if}

{#if activeCategoryList}
    <CategoryListModal 
        {app} 
        category={activeCategoryList} 
        on:close={() => activeCategoryList = null}
        on:addNew={handleAddNew}
    />
{/if}

<div class="study-hub-container">
    <!-- Header Row -->
    <div class="hub-header-row">
        <div class="hub-header">
            🎓 STUDY HUB
        </div>

        <div class="header-actions">
            <ComboMeter />

            <button type="button" class="btn-flashcards-launcher" on:click={() => showFlashcardModal = true} title="Open AI Flashcard & Speed Duel Arena">
                <Brain size={15} color="#00f3ff" /> Flashcards
            </button>

            <button type="button" class="btn-cgpa-launcher" on:click={() => showCgpaModal = true} title="Open Indian Engineering CGPA & Target Predictor">
                <Calculator size={15} color="#ffd700" /> CGPA Orbit
            </button>

            <button type="button" class="btn-shop-launcher" on:click={() => showVoucherShopModal = true} title="Open Voucher Shop">
                <ShoppingBag size={15} color="#ffd700" /> Voucher Shop
            </button>

            <button type="button" class="btn-skills-launcher" on:click={() => showSkillTreeModal = true} title="Open Subject Skills & Buffs">
                <GitFork size={15} color="#00f3ff" /> Skill Trees
            </button>

            <button type="button" class="btn-3d-map-launcher" on:click={() => showConceptMapModal = true} title="Open 3D Concept Map">
                <Sparkles size={15} /> 3D Map
            </button>
        </div>
    </div>
    
    <div class="hub-main-grid">
        <!-- RPG Character Profile & Quests Row -->
        <div class="rpg-dashboard-row">
            <div class="rpg-column-left">
                <RpgProfileCard 
                    on:openShop={() => showVoucherShopModal = true} 
                    on:openSkillTrees={() => showSkillTreeModal = true} 
                />
                <BossBattleWidget />
            </div>

            <div class="rpg-column-right">
                <QuestBoard />
            </div>
        </div>

        <!-- Courses Row -->
        <div class="courses-section-wrapper">
            <div class="courses-header-wrapper">
                <h2 class="courses-main-title">Courses</h2>
                <div class="courses-toolbar">
                    <LayoutGrid size={16} color="var(--text-muted)" />
                </div>
            </div>
            
            <div class="courses-scroll-container">
                {#each $studyHubStore.courses as course (course.id)}
                    <CourseCard {app} {course} on:openConceptMap={handleOpenConceptMap} />
                {/each}
            </div>
            
            <button type="button" class="new-page-btn" on:click={() => showCourseModal = true}>
                <Plus size={14} /> New Course
            </button>
        </div>

        <!-- Categories Row (Quick Actions Horizontal Scroll) -->
        <div class="categories-section-wrapper" style="grid-column: 1 / -1;">
            <div class="categories-scroll-container">
                <CategoryCard 
                    title="ASSIGNMENT" 
                    subtitle="Assignments" 
                    Icon={LayoutList} 
                    on:openCategory={handleCategoryClick}
                    on:addNew={handleAddNew}
                />
                <CategoryCard 
                    title="RESOURCES" 
                    subtitle="Resources" 
                    Icon={BookOpen} 
                    on:openCategory={handleCategoryClick}
                    on:addNew={handleAddNew}
                />
                <CategoryCard 
                    title="NOTES" 
                    subtitle="Notes" 
                    Icon={PenTool} 
                    on:openCategory={handleCategoryClick}
                    on:addNew={handleAddNew}
                />
                <CategoryCard 
                    title="EXAM" 
                    subtitle="Exams" 
                    Icon={FileText} 
                    on:openCategory={handleCategoryClick}
                    on:addNew={handleAddNew}
                />
            </div>
        </div>

        <!-- 2x2 Widgets Grid -->
        <div class="widgets-grid">
            <div class="widget-cell">
                <LifeBalanceChart />
            </div>
            <div class="widget-cell">
                <MiniTodoList />
            </div>
            <div class="widget-cell">
                <PomodoroTimer />
            </div>
            <div class="widget-cell">
                <ReminderList />
            </div>
        </div>

        <!-- Task Manager Full Width -->
        <div style="grid-column: 1 / -1;">
            <TaskManager />
        </div>

        <!-- TimeTable Full Width -->
        <div style="grid-column: 1 / -1;">
            <TimeTable {app} />
        </div>

        <!-- Academic Calendar Full Width -->
        <div style="grid-column: 1 / -1;">
            <AcademicCalendar {app} />
        </div>
    </div>
</div>

<style>
    * {
        box-sizing: border-box;
    }

    .study-hub-container {
        padding: 24px;
        max-width: 1300px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
        font-family: var(--font-interface);
        color: var(--text-normal);
        background-color: var(--background-primary);
        width: 100%;
        min-height: 100%;
        box-sizing: border-box;
    }

    .hub-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
        flex-wrap: wrap;
        gap: 12px;
    }

    .hub-header {
        font-size: 1.4em;
        font-weight: 800;
        letter-spacing: 1.5px;
        color: var(--text-normal);
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .btn-flashcards-launcher {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(0, 243, 255, 0.1);
        border: 1px solid rgba(0, 243, 255, 0.35);
        color: #00f3ff;
        font-weight: 700;
        font-size: 0.82em;
        padding: 6px 13px;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-flashcards-launcher:hover {
        background: rgba(0, 243, 255, 0.2);
        box-shadow: 0 0 15px rgba(0, 243, 255, 0.3);
    }

    .btn-cgpa-launcher {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 215, 0, 0.1);
        border: 1px solid rgba(255, 215, 0, 0.35);
        color: #ffd700;
        font-weight: 700;
        font-size: 0.82em;
        padding: 6px 13px;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-cgpa-launcher:hover {
        background: rgba(255, 215, 0, 0.2);
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
    }

    .btn-shop-launcher {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 215, 0, 0.1);
        border: 1px solid rgba(255, 215, 0, 0.35);
        color: #ffd700;
        font-weight: 700;
        font-size: 0.82em;
        padding: 6px 13px;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-shop-launcher:hover {
        background: rgba(255, 215, 0, 0.2);
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
    }

    .btn-skills-launcher {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(0, 243, 255, 0.1);
        border: 1px solid rgba(0, 243, 255, 0.35);
        color: #00f3ff;
        font-weight: 700;
        font-size: 0.82em;
        padding: 6px 13px;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-skills-launcher:hover {
        background: rgba(0, 243, 255, 0.2);
        box-shadow: 0 0 15px rgba(0, 243, 255, 0.3);
    }

    .btn-3d-map-launcher {
        display: flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(135deg, rgba(0, 243, 255, 0.15), rgba(244, 114, 182, 0.15));
        border: 1px solid rgba(0, 243, 255, 0.4);
        color: #fff;
        font-weight: 700;
        font-size: 0.82em;
        padding: 6px 13px;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 0 12px rgba(0, 243, 255, 0.2);
    }

    .btn-3d-map-launcher:hover {
        background: linear-gradient(135deg, rgba(0, 243, 255, 0.3), rgba(244, 114, 182, 0.3));
        box-shadow: 0 0 20px rgba(0, 243, 255, 0.4);
        transform: translateY(-1px);
    }

    .hub-main-grid {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .rpg-dashboard-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        align-items: stretch;
    }

    .rpg-column-left {
        display: flex;
        flex-direction: column;
        gap: 16px;
        height: 100%;
    }

    .rpg-column-right {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    @media (max-width: 860px) {
        .rpg-dashboard-row {
            grid-template-columns: 1fr;
        }
    }

    /* Courses Horizontal Section */
    .courses-section-wrapper {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .courses-header-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .courses-main-title {
        font-size: 1.15em;
        font-weight: 800;
        margin: 0;
    }

    .courses-scroll-container {
        display: flex;
        gap: 16px;
        overflow-x: auto;
        padding-bottom: 10px;
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 243, 255, 0.4) rgba(255, 255, 255, 0.03);
    }

    .courses-scroll-container::-webkit-scrollbar,
    .categories-scroll-container::-webkit-scrollbar {
        height: 6px;
    }

    .courses-scroll-container::-webkit-scrollbar-track,
    .categories-scroll-container::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 10px;
    }

    .courses-scroll-container::-webkit-scrollbar-thumb,
    .categories-scroll-container::-webkit-scrollbar-thumb {
        background: linear-gradient(90deg, rgba(0, 243, 255, 0.35), rgba(244, 114, 182, 0.35));
        border-radius: 10px;
        transition: all 0.2s ease;
    }

    .courses-scroll-container::-webkit-scrollbar-thumb:hover,
    .categories-scroll-container::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(90deg, #00f3ff, #f472b6);
        box-shadow: 0 0 10px rgba(0, 243, 255, 0.6);
    }

    .new-page-btn {
        align-self: flex-start;
        display: flex;
        align-items: center;
        gap: 6px;
        background: transparent;
        border: 1px dashed var(--background-modifier-border);
        color: var(--text-muted);
        padding: 6px 14px;
        border-radius: 6px;
        font-size: 0.85em;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .new-page-btn:hover {
        color: var(--text-normal);
        border-color: #00f3ff;
        background: rgba(0, 243, 255, 0.05);
    }

    /* Categories Horizontal Row */
    .categories-section-wrapper {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .categories-scroll-container {
        display: flex;
        gap: 16px;
        overflow-x: auto;
        padding-bottom: 10px;
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 243, 255, 0.4) rgba(255, 255, 255, 0.03);
    }

    /* 2x2 Widgets Grid */
    .widgets-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
    }

    @media (max-width: 800px) {
        .widgets-grid {
            grid-template-columns: 1fr;
        }
    }

    .widget-cell {
        display: flex;
        flex-direction: column;
    }
</style>
