<script lang="ts">
    import { createEventDispatcher, onMount, onDestroy } from 'svelte';
    import { 
        studyHubStore, 
        recordFlashcardReview, 
        recordDuelVictory, 
        addNewFlashcard, 
        deleteFlashcard 
    } from '../../store';
    import { DEFAULT_SPEED_MONSTERS } from '../../utils/flashcardParser';
    import type { Flashcard, SpeedDuelMonster, Sm2Rating } from '../../types/flashcard';
    import { formatDateIso } from '../../utils/dateUtils';
    import { 
        Brain, 
        Swords, 
        Sparkles, 
        Clock, 
        Flame, 
        RotateCw, 
        Plus, 
        Trash2, 
        Award, 
        Check, 
        X,
        Layers,
        Zap,
        Coins
    } from 'lucide-svelte';

    const dispatch = createEventDispatcher();
    const today = formatDateIso(new Date());

    let activeTab: 'review' | 'duel' = 'review';
    let selectedCourseFilter = 'all';

    // Flashcard Review State
    let isFlipped = false;
    let currentCardIndex = 0;
    let showAddCard = false;
    let newQ = '';
    let newA = '';
    let newCourseId = 'ds';

    // Speed Duel State
    let duelActive = false;
    let duelTimeLeft = 60;
    let duelTimer: number | undefined;
    let activeMonster: SpeedDuelMonster = JSON.parse(JSON.stringify(DEFAULT_SPEED_MONSTERS[0]));
    let duelScore = 0;
    let duelCombo = 1;
    let duelVictory = false;
    let duelDefeat = false;
    let currentDuelCard: Flashcard | null = null;
    let duelShuffledOptions: string[] = [];
    let selectedOptionIndex: number | null = null;
    let optionFeedback: 'correct' | 'wrong' | null = null;

    $: allCards = $studyHubStore.flashcards?.cards || [];
    $: courses = $studyHubStore.courses || [];
    $: filteredCards = selectedCourseFilter === 'all' 
        ? allCards 
        : allCards.filter(c => c.courseId === selectedCourseFilter);
    $: dueCards = filteredCards.filter(c => !c.nextReviewDate || c.nextReviewDate <= today);
    $: currentCard = filteredCards[currentCardIndex] || filteredCards[0];

    function nextCard() {
        isFlipped = false;
        if (currentCardIndex < filteredCards.length - 1) {
            currentCardIndex += 1;
        } else {
            currentCardIndex = 0;
        }
    }

    function prevCard() {
        isFlipped = false;
        if (currentCardIndex > 0) {
            currentCardIndex -= 1;
        } else {
            currentCardIndex = filteredCards.length - 1;
        }
    }

    function handleSm2Rate(rating: Sm2Rating) {
        if (!currentCard) return;
        recordFlashcardReview(currentCard.id, rating);
        nextCard();
    }

    function handleCreateCard() {
        if (!newQ.trim() || !newA.trim()) return;
        const crs = courses.find(c => c.id === newCourseId);
        addNewFlashcard({
            courseId: newCourseId,
            courseTitle: crs ? crs.title : 'Course',
            question: newQ,
            answer: newA
        });
        newQ = '';
        newA = '';
        showAddCard = false;
    }

    // --- Speed Duel Arena Logic ---
    function selectMonster(m: SpeedDuelMonster) {
        activeMonster = JSON.parse(JSON.stringify(m));
    }

    function startDuel() {
        duelActive = true;
        duelVictory = false;
        duelDefeat = false;
        duelScore = 0;
        duelCombo = 1;
        duelTimeLeft = activeMonster.timeLimitSeconds || 60;
        activeMonster.currentHp = activeMonster.maxHp;

        pickNextDuelQuestion();

        if (duelTimer) clearInterval(duelTimer);
        duelTimer = window.setInterval(() => {
            if (duelTimeLeft > 0) {
                duelTimeLeft -= 1;
            } else {
                endDuel(false);
            }
        }, 1000);
    }

    function pickNextDuelQuestion() {
        optionFeedback = null;
        selectedOptionIndex = null;
        if (allCards.length === 0) return;
        const randIdx = Math.floor(Math.random() * allCards.length);
        currentDuelCard = allCards[randIdx];

        if (currentDuelCard.options && currentDuelCard.options.length === 4) {
            duelShuffledOptions = [...currentDuelCard.options];
        } else {
            // Generate synthetic multiple choice
            duelShuffledOptions = [
                currentDuelCard.answer,
                "Incorrect algorithmic assumption with exponential complexity",
                "Violates encapsulation and thread safety invariants",
                "Non-convergent linear approximation in boundary space"
            ].sort(() => Math.random() - 0.5);
        }
    }

    function handleOptionSelect(optionText: string, idx: number) {
        if (selectedOptionIndex !== null || !currentDuelCard) return;
        selectedOptionIndex = idx;

        const isCorrect = (currentDuelCard.options && currentDuelCard.correctOptionIndex !== undefined)
            ? idx === currentDuelCard.correctOptionIndex
            : optionText === currentDuelCard.answer;

        if (isCorrect) {
            optionFeedback = 'correct';
            const damage = 25 * duelCombo;
            activeMonster.currentHp = Math.max(0, activeMonster.currentHp - damage);
            duelScore += 100 * duelCombo;
            duelCombo = Math.min(4, duelCombo + 1);

            if (activeMonster.currentHp <= 0) {
                setTimeout(() => endDuel(true), 400);
                return;
            }
        } else {
            optionFeedback = 'wrong';
            duelCombo = 1;
        }

        setTimeout(() => {
            pickNextDuelQuestion();
        }, 600);
    }

    function endDuel(victory: boolean) {
        if (duelTimer) clearInterval(duelTimer);
        duelActive = false;
        if (victory) {
            duelVictory = true;
            recordDuelVictory(activeMonster);
        } else {
            duelDefeat = true;
        }
    }

    onDestroy(() => {
        if (duelTimer) clearInterval(duelTimer);
    });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal-backdrop" on:click={() => dispatch('close')}>
    <div class="modal-container" on:click|stopPropagation>
        <!-- Modal Top Bar -->
        <div class="modal-header">
            <div class="header-title-box">
                <Brain size={22} color="#00f3ff" />
                <h2>AI Flashcard Arena & Spaced Repetition</h2>
            </div>
            <button type="button" class="close-btn" on:click={() => dispatch('close')}>&times;</button>
        </div>

        <!-- Mode Navigation Tabs -->
        <div class="arena-tabs">
            <button 
                type="button" 
                class="tab-btn {activeTab === 'review' ? 'active' : ''}" 
                on:click={() => activeTab = 'review'}
            >
                <Layers size={15} /> 🗂️ Active Recall & Spaced Repetition ({dueCards.length} Due)
            </button>
            <button 
                type="button" 
                class="tab-btn {activeTab === 'duel' ? 'active' : ''}" 
                on:click={() => activeTab = 'duel'}
            >
                <Swords size={15} color="#ef4444" /> ⚔️ 60s Speed Duel Arena
            </button>

            {#if activeTab === 'review'}
                <button 
                    type="button" 
                    class="add-card-btn" 
                    on:click={() => showAddCard = !showAddCard}
                >
                    <Plus size={14} /> New Card
                </button>
            {/if}
        </div>

        <!-- Modal Body Content -->
        <div class="arena-body">
            {#if activeTab === 'review'}
                <!-- Course Deck Filter -->
                <div class="deck-filter-row">
                    <span class="filter-label">Deck Filter:</span>
                    <select bind:value={selectedCourseFilter}>
                        <option value="all">🌟 All Courses ({allCards.length} cards)</option>
                        {#each courses as c}
                            <option value={c.id}>{c.title}</option>
                        {/each}
                    </select>

                    <span class="due-badge">
                        <Clock size={12} /> {dueCards.length} cards due today
                    </span>
                </div>

                {#if showAddCard}
                    <div class="inline-add-card">
                        <h4>Create Custom Active Recall Card</h4>
                        <div class="card-form-grid">
                            <select bind:value={newCourseId}>
                                {#each courses as c}
                                    <option value={c.id}>{c.title}</option>
                                {/each}
                            </select>
                            <input type="text" placeholder="Question / Concept Cue" bind:value={newQ} />
                            <textarea placeholder="Detailed Answer / Explanation" bind:value={newA} rows="2"></textarea>
                        </div>
                        <div class="card-form-actions">
                            <button type="button" class="btn-cancel" on:click={() => showAddCard = false}>Cancel</button>
                            <button type="button" class="btn-save" on:click={handleCreateCard}>Save Flashcard</button>
                        </div>
                    </div>
                {/if}

                {#if filteredCards.length === 0}
                    <div class="empty-cards-state">
                        <Brain size={44} color="var(--text-muted)" />
                        <p>No flashcards found for this course deck. Create your first card above!</p>
                    </div>
                {:else if currentCard}
                    <!-- Flashcard 3D Viewer -->
                    <div class="flashcard-stage">
                        <div 
                            class="flashcard-3d {isFlipped ? 'flipped' : ''}" 
                            on:click={() => isFlipped = !isFlipped}
                        >
                            <!-- Card Front (Question) -->
                            <div class="card-face card-front">
                                <div class="card-top-info">
                                    <span class="course-pill">{currentCard.courseTitle}</span>
                                    <span class="counter-text">{currentCardIndex + 1} / {filteredCards.length}</span>
                                </div>
                                <div class="card-center-question">
                                    <h3>{currentCard.question}</h3>
                                </div>
                                <div class="card-hint-row">
                                    <RotateCw size={13} /> Click card to reveal answer & formula
                                </div>
                            </div>

                            <!-- Card Back (Answer) -->
                            <div class="card-face card-back">
                                <div class="card-top-info">
                                    <span class="course-pill">{currentCard.courseTitle}</span>
                                    <span class="mastery-pill">Interval: {currentCard.interval || 0}d &bull; EF: {currentCard.easeFactor || 2.5}</span>
                                </div>
                                <div class="card-center-answer">
                                    <p>{currentCard.answer}</p>
                                </div>
                                <div class="card-hint-row">
                                    <span>Rate your recall below to update SM-2 schedule</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- SM-2 Rating Controls -->
                    <div class="sm2-controls-bar">
                        <button type="button" class="sm2-btn again" on:click={() => handleSm2Rate(0)} title="Complete blackout (Interval resets to 1d)">
                            <span class="rate-num">1</span>
                            <span class="rate-name">Again (1d)</span>
                        </button>
                        <button type="button" class="sm2-btn hard" on:click={() => handleSm2Rate(1)} title="Recalled with high effort">
                            <span class="rate-num">2</span>
                            <span class="rate-name">Hard</span>
                        </button>
                        <button type="button" class="sm2-btn good" on:click={() => handleSm2Rate(2)} title="Recalled well (+XP)">
                            <span class="rate-num">3</span>
                            <span class="rate-name">Good (+XP)</span>
                        </button>
                        <button type="button" class="sm2-btn easy" on:click={() => handleSm2Rate(3)} title="Perfect instant recall (+Bonus Coins)">
                            <span class="rate-num">4</span>
                            <span class="rate-name">Easy (+Coins)</span>
                        </button>
                    </div>
                {/if}

            {:else}
                <!-- ⚔️ 60s Speed Duel Arena -->
                {#if !duelActive && !duelVictory && !duelDefeat}
                    <!-- Monster Selection Screen -->
                    <div class="monster-select-screen">
                        <div class="arena-intro">
                            <h3>⚔️ Choose Academic Monster to Duel</h3>
                            <p>Answer rapid-fire concept questions in 60 seconds to deplete monster HP and score massive XP + Gold Coin drops!</p>
                        </div>

                        <div class="monsters-grid">
                            {#each DEFAULT_SPEED_MONSTERS as monster}
                                <div 
                                    class="monster-card {activeMonster.id === monster.id ? 'selected' : ''}" 
                                    on:click={() => selectMonster(monster)}
                                >
                                    <span class="monster-avatar">{monster.icon}</span>
                                    <h4 class="monster-name">{monster.name}</h4>
                                    <span class="monster-title">{monster.title}</span>
                                    <div class="monster-stats">
                                        <span>❤️ {monster.maxHp} HP</span>
                                        <span>💰 +{monster.rewardCoins} Coins</span>
                                        <span>⚡ +{monster.rewardXp} XP</span>
                                    </div>
                                </div>
                            {/each}
                        </div>

                        <button type="button" class="start-duel-btn" on:click={startDuel}>
                            <Swords size={18} /> Enter Arena vs {activeMonster.name} (60s)
                        </button>
                    </div>

                {:else if duelActive}
                    <!-- Live Duel Combat Screen -->
                    <div class="live-duel-container">
                        <!-- Monster HUD & Countdown -->
                        <div class="duel-top-hud">
                            <div class="hud-monster-box">
                                <span class="hud-monster-icon">{activeMonster.icon}</span>
                                <div class="hud-monster-meta">
                                    <span class="hud-monster-name">{activeMonster.name}</span>
                                    <div class="monster-hp-bar">
                                        <div 
                                            class="monster-hp-fill" 
                                            style="width: {(activeMonster.currentHp / activeMonster.maxHp) * 100}%;"
                                        ></div>
                                    </div>
                                    <span class="hp-counter">{activeMonster.currentHp} / {activeMonster.maxHp} HP</span>
                                </div>
                            </div>

                            <div class="hud-timer-box {duelTimeLeft <= 10 ? 'urgent' : ''}">
                                <Clock size={16} />
                                <span class="timer-digits">{duelTimeLeft}s</span>
                            </div>

                            <div class="hud-combo-box">
                                <Flame size={16} color="#f97316" />
                                <span class="combo-digits">{duelCombo}x Combo</span>
                            </div>
                        </div>

                        <!-- Current Rapid Question -->
                        {#if currentDuelCard}
                            <div class="duel-question-card">
                                <span class="duel-course-tag">{currentDuelCard.courseTitle}</span>
                                <h3 class="duel-q-text">{currentDuelCard.question}</h3>
                            </div>

                            <!-- 4 Multiple Choice Options -->
                            <div class="duel-options-grid">
                                {#each duelShuffledOptions as opt, i}
                                    {@const isChosen = selectedOptionIndex === i}
                                    <button 
                                        type="button" 
                                        class="duel-opt-btn {isChosen ? optionFeedback : ''}" 
                                        disabled={selectedOptionIndex !== null}
                                        on:click={() => handleOptionSelect(opt, i)}
                                    >
                                        <span class="opt-key">{['A', 'B', 'C', 'D'][i]}</span>
                                        <span class="opt-text">{opt}</span>
                                    </button>
                                {/each}
                            </div>
                        {/if}
                    </div>

                {:else if duelVictory}
                    <!-- Victory Screen -->
                    <div class="duel-result-screen victory">
                        <div class="result-icon-box">🏆</div>
                        <h2>VICTORY! YOU DEFEATED {activeMonster.name.toUpperCase()}!</h2>
                        <p>Academic minion vanquished with brilliant knowledge recall.</p>
                        <div class="rewards-won">
                            <span class="reward-pill-won"><Zap size={16} color="#00f3ff" /> +{activeMonster.rewardXp} XP</span>
                            <span class="reward-pill-won"><Coins size={16} color="#ffd700" /> +{activeMonster.rewardCoins} Gold Coins</span>
                        </div>
                        <button type="button" class="btn-play-again" on:click={() => duelVictory = false}>
                            <RotateCw size={15} /> Back to Arena
                        </button>
                    </div>

                {:else if duelDefeat}
                    <!-- Defeat Screen -->
                    <div class="duel-result-screen defeat">
                        <div class="result-icon-box">💀</div>
                        <h2>TIME'S UP! {activeMonster.name} ESCAPED!</h2>
                        <p>Review your flashcards in Spaced Repetition mode and try again!</p>
                        <button type="button" class="btn-play-again" on:click={() => duelDefeat = false}>
                            <RotateCw size={15} /> Try Arena Again
                        </button>
                    </div>
                {/if}
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
        width: 90vw;
        max-width: 860px;
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

    .header-title-box {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .header-title-box h2 {
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

    .arena-tabs {
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

    .add-card-btn {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--background-modifier-border);
        color: #fff;
        padding: 5px 12px;
        border-radius: 8px;
        font-size: 0.78em;
        cursor: pointer;
    }

    .arena-body {
        padding: 20px;
        overflow-y: auto;
        overflow-x: hidden;
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 14px;
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 243, 255, 0.4) rgba(255, 255, 255, 0.03);
    }

    .arena-body::-webkit-scrollbar {
        width: 6px;
    }

    .arena-body::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 10px;
    }

    .arena-body::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, rgba(0, 243, 255, 0.4), rgba(244, 114, 182, 0.4));
        border-radius: 10px;
        transition: all 0.2s ease;
    }

    .arena-body::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #00f3ff, #f472b6);
        box-shadow: 0 0 10px rgba(0, 243, 255, 0.7);
    }

    .deck-filter-row {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.82em;
    }

    .deck-filter-row select {
        background: #12161f;
        border: 1px solid var(--background-modifier-border);
        color: #fff;
        padding: 4px 10px;
        border-radius: 6px;
    }

    .due-badge {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.78em;
        color: #00f3ff;
        background: rgba(0, 243, 255, 0.1);
        padding: 3px 8px;
        border-radius: 12px;
    }

    .inline-add-card {
        background: rgba(0, 243, 255, 0.04);
        border: 1px dashed rgba(0, 243, 255, 0.3);
        border-radius: 10px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .inline-add-card h4 {
        margin: 0;
        font-size: 0.88em;
        color: #00f3ff;
    }

    .card-form-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .card-form-grid input, .card-form-grid textarea, .card-form-grid select {
        background: #080b10;
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        padding: 6px 10px;
        color: #fff;
        font-size: 0.82em;
    }

    .card-form-actions {
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

    /* 3D Card Stage */
    .flashcard-stage {
        perspective: 1000px;
        min-height: 240px;
        display: flex;
    }

    .flashcard-3d {
        width: 100%;
        min-height: 240px;
        position: relative;
        transform-style: preserve-3d;
        transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
        cursor: pointer;
    }

    .flashcard-3d.flipped {
        transform: rotateY(180deg);
    }

    .card-face {
        position: absolute;
        inset: 0;
        backface-visibility: hidden;
        border-radius: 14px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .card-front {
        background: linear-gradient(135deg, rgba(20, 25, 35, 0.95), rgba(10, 12, 18, 0.95));
        border: 1px solid rgba(0, 243, 255, 0.35);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 243, 255, 0.05);
    }

    .card-back {
        background: linear-gradient(135deg, rgba(15, 30, 25, 0.95), rgba(10, 15, 20, 0.95));
        border: 1px solid rgba(16, 185, 129, 0.4);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(16, 185, 129, 0.05);
        transform: rotateY(180deg);
    }

    .card-top-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .course-pill {
        background: rgba(0, 243, 255, 0.15);
        color: #00f3ff;
        font-size: 0.72em;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 8px;
    }

    .mastery-pill {
        font-size: 0.7em;
        color: var(--text-muted);
    }

    .counter-text {
        font-size: 0.75em;
        color: var(--text-muted);
        font-weight: 600;
    }

    .card-center-question h3 {
        font-size: 1.15em;
        font-weight: 700;
        color: #fff;
        line-height: 1.4;
        margin: 14px 0;
        text-align: center;
    }

    .card-center-answer p {
        font-size: 1em;
        color: #e2e8f0;
        line-height: 1.5;
        margin: 14px 0;
        text-align: center;
    }

    .card-hint-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 0.72em;
        color: var(--text-muted);
    }

    /* SM-2 Buttons Bar */
    .sm2-controls-bar {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        margin-top: 10px;
    }

    .sm2-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 10px;
        border-radius: 10px;
        border: 1px solid var(--background-modifier-border);
        background: rgba(255, 255, 255, 0.03);
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .sm2-btn .rate-num {
        font-size: 0.7em;
        font-weight: 800;
        opacity: 0.6;
    }

    .sm2-btn .rate-name {
        font-size: 0.8em;
        font-weight: 700;
    }

    .sm2-btn.again:hover { border-color: #ef4444; background: rgba(239, 68, 68, 0.15); color: #ef4444; }
    .sm2-btn.hard:hover { border-color: #f59e0b; background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .sm2-btn.good:hover { border-color: #10b981; background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .sm2-btn.easy:hover { border-color: #00f3ff; background: rgba(0, 243, 255, 0.15); color: #00f3ff; }

    /* Monster Selection View */
    .monster-select-screen {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 10px;
    }

    .arena-intro h3 {
        margin: 0 0 4px 0;
        font-size: 1.1em;
        color: #fff;
        text-align: center;
    }

    .arena-intro p {
        margin: 0;
        font-size: 0.8em;
        color: var(--text-muted);
        text-align: center;
    }

    .monsters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 12px;
        width: 100%;
    }

    .monster-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--background-modifier-border);
        border-radius: 12px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .monster-card:hover {
        border-color: rgba(239, 68, 68, 0.5);
        transform: translateY(-2px);
    }

    .monster-card.selected {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
    }

    .monster-avatar { font-size: 2.2em; margin-bottom: 6px; }
    .monster-name { font-size: 0.9em; font-weight: 700; color: #fff; margin: 0; }
    .monster-title { font-size: 0.68em; color: var(--text-muted); margin: 2px 0 8px 0; }
    .monster-stats { display: flex; flex-direction: column; gap: 2px; font-size: 0.72em; color: var(--text-muted); }

    .start-duel-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(135deg, #ef4444, #f59e0b);
        color: #fff;
        border: none;
        padding: 10px 24px;
        border-radius: 20px;
        font-size: 0.95em;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        margin-top: 10px;
        transition: all 0.2s ease;
    }

    .start-duel-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
    }

    /* Live Duel View */
    .live-duel-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .duel-top-hud {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid var(--background-modifier-border);
        border-radius: 12px;
        padding: 12px 16px;
    }

    .hud-monster-box {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .hud-monster-icon { font-size: 1.8em; }
    .hud-monster-name { font-size: 0.85em; font-weight: 700; color: #fff; }

    .monster-hp-bar {
        width: 140px;
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        overflow: hidden;
        margin: 4px 0 2px 0;
    }

    .monster-hp-fill {
        height: 100%;
        background: #ef4444;
        transition: width 0.3s ease;
    }

    .hp-counter { font-size: 0.68em; color: var(--text-muted); }

    .hud-timer-box {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.05);
        padding: 6px 14px;
        border-radius: 20px;
        font-weight: 800;
        color: #fff;
    }

    .hud-timer-box.urgent {
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid #ef4444;
        color: #ef4444;
        animation: pulseTimer 0.8s infinite;
    }

    @keyframes pulseTimer { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    .hud-combo-box {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 800;
        color: #f97316;
    }

    .duel-question-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(0, 243, 255, 0.3);
        border-radius: 12px;
        padding: 18px;
        text-align: center;
    }

    .duel-course-tag {
        font-size: 0.72em;
        font-weight: 700;
        color: #00f3ff;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .duel-q-text {
        font-size: 1.1em;
        color: #fff;
        margin: 8px 0 0 0;
    }

    .duel-options-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }

    .duel-opt-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--background-modifier-border);
        border-radius: 10px;
        padding: 12px 16px;
        color: #fff;
        font-size: 0.85em;
        cursor: pointer;
        text-align: left;
        transition: all 0.15s ease;
    }

    .duel-opt-btn:hover:not(:disabled) {
        border-color: #00f3ff;
        background: rgba(0, 243, 255, 0.1);
    }

    .duel-opt-btn.correct {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.25);
        color: #10b981;
    }

    .duel-opt-btn.wrong {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.25);
        color: #ef4444;
    }

    .opt-key {
        font-weight: 800;
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.75em;
    }

    /* Result Screens */
    .duel-result-screen {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 40px 20px;
        gap: 12px;
    }

    .result-icon-box { font-size: 3em; }
    .duel-result-screen h2 { margin: 0; font-size: 1.2em; font-weight: 800; }
    .duel-result-screen.victory h2 { color: #ffd700; }
    .duel-result-screen.defeat h2 { color: #ef4444; }

    .rewards-won {
        display: flex;
        gap: 12px;
        margin: 10px 0;
    }

    .reward-pill-won {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid var(--background-modifier-border);
        padding: 6px 14px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 0.9em;
        color: #fff;
    }

    .btn-play-again {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #00f3ff;
        color: #000;
        border: none;
        padding: 8px 20px;
        border-radius: 20px;
        font-weight: 700;
        cursor: pointer;
        margin-top: 10px;
    }
</style>
