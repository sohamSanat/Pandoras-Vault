<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { studyHubStore, toggleFocusBuff } from '../../store';
    import { calculateLevelInfo, getCourseTitle } from '../../utils/rpgEngine';
    import { 
        GitFork, 
        Zap, 
        Lock, 
        Check, 
        ShieldCheck, 
        Coffee, 
        Sparkles, 
        Award, 
        Layers,
        TrendingUp
    } from 'lucide-svelte';

    const dispatch = createEventDispatcher();

    $: rpg = $studyHubStore.rpg || {
        level: 1,
        totalXp: 0,
        currentTitle: 'Freshman Scholar 🎓',
        buffs: [],
        courseSkills: {}
    };

    $: courses = $studyHubStore.courses || [];
    $: overallLevelInfo = calculateLevelInfo(rpg.totalXp);
    $: buffs = rpg.buffs || [];
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal-backdrop" on:click={() => dispatch('close')}>
    <div class="modal-container" on:click|stopPropagation>
        <div class="modal-header">
            <div class="header-left">
                <GitFork size={20} color="#00f3ff" />
                <h2>Subject Skill Trees & Focus Buffs</h2>
            </div>
            <button type="button" class="close-btn" on:click={() => dispatch('close')}>&times;</button>
        </div>

        <div class="modal-body">
            <!-- Overall Rank Banner -->
            <div class="rank-banner">
                <div class="rank-avatar">
                    <span>🧙‍♂️</span>
                </div>
                <div class="rank-details">
                    <div class="rank-title-row">
                        <span class="rank-title">{rpg.currentTitle}</span>
                        <span class="rank-badge">Total Level {overallLevelInfo.level}</span>
                    </div>
                    <p class="rank-sub">Total Academic Experience: <strong>{rpg.totalXp} XP</strong></p>
                </div>
            </div>

            <!-- Subject Skill Trees Grid -->
            <div class="section-title-row">
                <TrendingUp size={16} color="#00f3ff" />
                <h3>Course Skill Mastery</h3>
            </div>

            <div class="courses-skill-grid">
                {#each courses as course (course.id)}
                    {@const skill = rpg.courseSkills[course.id] || { level: 1, xp: 0, title: getCourseTitle(course.title, 1) }}
                    {@const skillInfo = calculateLevelInfo(skill.xp)}
                    <div class="course-skill-card">
                        <div class="skill-header">
                            <div class="course-icon-badge">
                                <span>📚</span>
                            </div>
                            <div class="skill-title-box">
                                <span class="course-name">{course.title}</span>
                                <span class="skill-title">{skill.title}</span>
                            </div>
                            <div class="skill-level-pill">
                                Lv. {skill.level}
                            </div>
                        </div>

                        <!-- Skill XP Bar -->
                        <div class="skill-bar-container">
                            <div class="skill-bar-track">
                                <div class="skill-bar-fill" style="width: {skillInfo.progressPercent}%;"></div>
                            </div>
                            <div class="skill-xp-text">
                                <span>{skillInfo.currentLevelXp} / {skillInfo.xpForNextLevel} XP</span>
                                <span>{skillInfo.progressPercent}%</span>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Active Focus Buffs -->
            <div class="section-title-row" style="margin-top: 14px;">
                <Zap size={16} color="#ffd700" />
                <h3>Focus Buffs & Pomodoro Perks</h3>
            </div>

            <div class="buffs-grid">
                {#each buffs as buff (buff.id)}
                    {@const isUnlocked = rpg.level >= buff.unlockLevel}
                    <div class="buff-card {buff.isActive ? 'active' : ''} {!isUnlocked ? 'locked' : ''}">
                        <div class="buff-icon-box">
                            {#if !isUnlocked}
                                <Lock size={18} color="var(--text-muted)" />
                            {:else if buff.id === 'buff-espresso'}
                                <Coffee size={18} color="#f59e0b" />
                            {:else if buff.id === 'buff-shield'}
                                <ShieldCheck size={18} color="#00f3ff" />
                            {:else}
                                <Zap size={18} color="#ffd700" />
                            {/if}
                        </div>

                        <div class="buff-info">
                            <div class="buff-name-row">
                                <span class="buff-name">{buff.name}</span>
                                {#if !isUnlocked}
                                    <span class="unlock-tag">Unlocks Lv. {buff.unlockLevel}</span>
                                {/if}
                            </div>
                            <p class="buff-desc">{buff.description}</p>
                        </div>

                        <div class="buff-toggle-box">
                            {#if isUnlocked}
                                <button 
                                    type="button" 
                                    class="buff-toggle-btn {buff.isActive ? 'active' : ''}"
                                    on:click={() => toggleFocusBuff(buff.id)}
                                >
                                    {buff.isActive ? 'Equipped' : 'Equip'}
                                </button>
                            {:else}
                                <span class="locked-badge">Locked</span>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
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
        width: 90vw;
        max-width: 820px;
        max-height: 85vh;
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

    .close-btn:hover { color: #fff; }

    .modal-body {
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .rank-banner {
        display: flex;
        align-items: center;
        gap: 14px;
        background: linear-gradient(135deg, rgba(0, 243, 255, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
        border: 1px solid rgba(0, 243, 255, 0.3);
        border-radius: 12px;
        padding: 14px 18px;
    }

    .rank-avatar {
        font-size: 2em;
    }

    .rank-details {
        flex: 1;
    }

    .rank-title-row {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .rank-title {
        font-size: 1.1em;
        font-weight: 800;
        color: #fff;
    }

    .rank-badge {
        background: #00f3ff;
        color: #000;
        font-size: 0.75em;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 10px;
    }

    .rank-sub {
        font-size: 0.8em;
        color: var(--text-muted);
        margin: 4px 0 0 0;
    }

    .section-title-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 6px;
    }

    .section-title-row h3 {
        margin: 0;
        font-size: 0.9em;
        font-weight: 800;
        color: #fff;
        letter-spacing: 0.5px;
    }

    .courses-skill-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
        gap: 12px;
    }

    .course-skill-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--background-modifier-border);
        border-radius: 10px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .skill-header {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .course-icon-badge {
        font-size: 1.2em;
    }

    .skill-title-box {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
    }

    .course-name {
        font-size: 0.85em;
        font-weight: 700;
        color: #fff;
    }

    .skill-title {
        font-size: 0.72em;
        color: #00f3ff;
        font-weight: 600;
    }

    .skill-level-pill {
        background: rgba(0, 243, 255, 0.15);
        border: 1px solid rgba(0, 243, 255, 0.35);
        color: #00f3ff;
        font-size: 0.72em;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 8px;
    }

    .skill-bar-container {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .skill-bar-track {
        height: 5px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 3px;
        overflow: hidden;
    }

    .skill-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #00f3ff, #10b981);
        border-radius: 3px;
    }

    .skill-xp-text {
        display: flex;
        justify-content: space-between;
        font-size: 0.68em;
        color: var(--text-muted);
    }

    .buffs-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .buff-card {
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--background-modifier-border);
        border-radius: 10px;
        padding: 12px 16px;
        transition: all 0.2s ease;
    }

    .buff-card.active {
        border-color: rgba(255, 215, 0, 0.4);
        background: rgba(255, 215, 0, 0.05);
    }

    .buff-card.locked {
        opacity: 0.55;
    }

    .buff-icon-box {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .buff-info {
        flex: 1;
        min-width: 0;
    }

    .buff-name-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .buff-name {
        font-size: 0.88em;
        font-weight: 700;
        color: #fff;
    }

    .unlock-tag {
        font-size: 0.68em;
        color: #ef4444;
        font-weight: 700;
    }

    .buff-desc {
        font-size: 0.75em;
        color: var(--text-muted);
        margin: 2px 0 0 0;
    }

    .buff-toggle-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid var(--background-modifier-border);
        color: #fff;
        padding: 5px 12px;
        border-radius: 6px;
        font-size: 0.78em;
        font-weight: 700;
        cursor: pointer;
    }

    .buff-toggle-btn.active {
        background: #ffd700;
        color: #000;
        border-color: #ffd700;
    }

    .locked-badge {
        font-size: 0.75em;
        color: var(--text-muted);
        font-weight: 600;
    }
</style>
