<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { X, ExternalLink, FilePlus, BookOpen, CheckCircle, Clock, CircleAlert, Sparkles, Tag } from 'lucide-svelte';
    import type { ConceptNode, MasteryStatus } from '../../types/conceptMap';
    import { openOrCreateNote } from '../../utils/vault';
    import type { App } from 'obsidian';

    export let app: App;
    export let node: ConceptNode | null = null;
    export let courseTitle: string = 'Course';

    const dispatch = createEventDispatcher();

    function setStatus(status: MasteryStatus) {
        if (!node) return;
        node.status = status;
        dispatch('statusChange', { nodeId: node.id, status });
    }

    async function handleOpenOrCreateNote() {
        if (!node) return;
        
        let path = node.filePath;
        if (!path) {
            // Generate standard path in course folder
            const folder = `07 Notes/Courses/${courseTitle}`;
            path = `${folder}/${node.name}.md`;
            const template = `---
course: "${courseTitle}"
unit: "${node.unit || ''}"
difficulty: "${node.difficulty || 'medium'}"
status: "${node.status}"
tags: [concept, ${courseTitle.toLowerCase().replace(/\s+/g, '-')}]
---

# ${node.name}

> [!abstract] Overview
> ${node.description || 'Core concept notes and principles.'}

## 1. Key Principles & Definition


## 2. Implementation & Examples
\`\`\`ts
// Code example or pseudo-code
\`\`\`

## 3. Prerequisite Concepts & Relational Notes
${node.prerequisites && node.prerequisites.length > 0 ? node.prerequisites.map(p => `- [[${p}]]`).join('\n') : '- Foundational topic'}

## 4. Practice Questions & Edge Cases
- [ ] Practice standard problem
- [ ] Review time/space complexity
`;
            await openOrCreateNote(app, path, template);
            node.filePath = path;
            node.status = 'in-progress';
            dispatch('statusChange', { nodeId: node.id, status: 'in-progress' });
        } else {
            await openOrCreateNote(app, path);
        }
    }
</script>

{#if node}
    <div class="inspector-card">
        <div class="inspector-header">
            <div class="header-badges">
                <span class="type-badge {node.type}">{node.type.toUpperCase()}</span>
                {#if node.difficulty}
                    <span class="diff-badge {node.difficulty}">{node.difficulty}</span>
                {/if}
            </div>
            <button class="close-btn" on:click={() => dispatch('close')}>
                <X size={16} />
            </button>
        </div>

        <h3 class="node-title">{node.name}</h3>
        {#if node.unit}
            <div class="unit-tag">{node.unit}</div>
        {/if}

        {#if node.description}
            <div class="node-desc">
                {node.description}
            </div>
        {/if}

        <!-- Mastery Status Buttons -->
        <div class="mastery-section">
            <span class="section-label">Mastery Status</span>
            <div class="status-btn-group">
                <button 
                    class="status-btn not-started {node.status === 'not-started' ? 'active' : ''}"
                    on:click={() => setStatus('not-started')}
                >
                    <CircleAlert size={12} /> Not Started
                </button>
                <button 
                    class="status-btn in-progress {node.status === 'in-progress' ? 'active' : ''}"
                    on:click={() => setStatus('in-progress')}
                >
                    <Clock size={12} /> Learning
                </button>
                <button 
                    class="status-btn mastered {node.status === 'mastered' ? 'active' : ''}"
                    on:click={() => setStatus('mastered')}
                >
                    <CheckCircle size={12} /> Mastered
                </button>
            </div>
        </div>

        <!-- Tags / Prerequisites -->
        {#if node.prerequisites && node.prerequisites.length > 0}
            <div class="prereq-section">
                <span class="section-label">Prerequisites</span>
                <div class="prereq-list">
                    {#each node.prerequisites as p}
                        <span class="prereq-pill">{p}</span>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Vault Note Action -->
        <div class="note-action-section">
            {#if node.filePath}
                <button class="vault-btn open" on:click={handleOpenOrCreateNote}>
                    <ExternalLink size={14} /> Open Note in Vault
                </button>
                <div class="path-subtext">{node.filePath}</div>
            {:else}
                <button class="vault-btn create" on:click={handleOpenOrCreateNote}>
                    <Sparkles size={14} /> Generate Note Stub in Vault
                </button>
            {/if}
        </div>
    </div>
{/if}

<style>
    .inspector-card {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 320px;
        max-width: 90vw;
        background: rgba(10, 12, 16, 0.85);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(0, 243, 255, 0.25);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 243, 255, 0.1);
        color: #e4e4e7;
        font-family: 'Inter', var(--font-interface);
        z-index: 100;
        animation: slideIn 0.2s ease-out;
    }

    @keyframes slideIn {
        from { transform: translateX(20px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    .inspector-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }

    .header-badges {
        display: flex;
        gap: 6px;
    }

    .type-badge {
        font-size: 0.7em;
        font-weight: 700;
        letter-spacing: 0.5px;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgba(0, 243, 255, 0.15);
        color: #00f3ff;
        border: 1px solid rgba(0, 243, 255, 0.3);
    }

    .diff-badge {
        font-size: 0.7em;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
        text-transform: capitalize;
    }
    .diff-badge.easy { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .diff-badge.medium { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .diff-badge.hard { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

    .close-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 2px;
    }
    .close-btn:hover {
        color: #fff;
    }

    .node-title {
        margin: 0 0 4px 0;
        font-size: 1.2em;
        font-weight: 700;
        color: #fff;
        line-height: 1.3;
    }

    .unit-tag {
        font-size: 0.8em;
        color: #a1a1aa;
        margin-bottom: 12px;
    }

    .node-desc {
        font-size: 0.85em;
        color: #d4d4d8;
        line-height: 1.45;
        background: rgba(255, 255, 255, 0.03);
        padding: 10px;
        border-radius: 6px;
        margin-bottom: 16px;
        border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .section-label {
        display: block;
        font-size: 0.75em;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
    }

    .mastery-section {
        margin-bottom: 16px;
    }

    .status-btn-group {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
    }

    .status-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        padding: 6px 4px;
        font-size: 0.75em;
        color: var(--text-muted);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        transition: all 0.2s ease;
    }

    .status-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
    }

    .status-btn.not-started.active {
        background: rgba(239, 68, 68, 0.2);
        border-color: #ef4444;
        color: #ef4444;
    }
    .status-btn.in-progress.active {
        background: rgba(245, 158, 11, 0.2);
        border-color: #f59e0b;
        color: #f59e0b;
    }
    .status-btn.mastered.active {
        background: rgba(16, 185, 129, 0.2);
        border-color: #10b981;
        color: #10b981;
    }

    .prereq-section {
        margin-bottom: 16px;
    }

    .prereq-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .prereq-pill {
        font-size: 0.75em;
        background: rgba(0, 243, 255, 0.08);
        border: 1px solid rgba(0, 243, 255, 0.2);
        color: #00f3ff;
        padding: 2px 8px;
        border-radius: 12px;
    }

    .note-action-section {
        margin-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        padding-top: 16px;
    }

    .vault-btn {
        width: 100%;
        padding: 10px;
        border-radius: 6px;
        font-size: 0.85em;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s ease;
    }

    .vault-btn.open {
        background: #00f3ff;
        border: none;
        color: #000;
    }
    .vault-btn.open:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }

    .vault-btn.create {
        background: rgba(244, 114, 182, 0.15);
        border: 1px solid #f472b6;
        color: #f472b6;
    }
    .vault-btn.create:hover {
        background: rgba(244, 114, 182, 0.25);
        transform: translateY(-1px);
    }

    .path-subtext {
        font-size: 0.7em;
        color: var(--text-muted);
        text-align: center;
        margin-top: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
