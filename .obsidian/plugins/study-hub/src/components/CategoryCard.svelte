<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { ComponentType } from 'svelte';
    import { Plus } from 'lucide-svelte';

    export let title: 'ASSIGNMENT' | 'RESOURCES' | 'NOTES' | 'EXAM';
    export let subtitle: string;
    export let Icon: ComponentType;

    const dispatch = createEventDispatcher();
</script>

<div class="category-wrapper">
    <div class="category-icon-top">
        <svelte:component this={Icon} size={16} strokeWidth={2} color="var(--text-normal)" />
    </div>

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="category-main-box" on:click={() => dispatch('openCategory', title)} title="Click to view all {subtitle}">
        <span class="category-title">{title}</span>
    </div>

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="category-subtitle-row" on:click={() => dispatch('openCategory', title)}>
        <svelte:component this={Icon} size={14} strokeWidth={2} color="var(--text-muted)" />
        <span class="category-subtitle">{subtitle}</span>
    </div>

    <button type="button" class="new-page-btn" on:click={() => dispatch('addNew', title)}>
        <Plus size={14} /> New {title.charAt(0) + title.slice(1).toLowerCase()}
    </button>
</div>

<style>
    .category-wrapper {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 220px;
        flex: 1 0 220px;
    }

    .category-icon-top {
        margin-bottom: 4px;
        padding-left: 4px;
    }

    .category-main-box {
        background-color: #080808;
        border: 1px solid var(--background-modifier-border);
        border-radius: 8px;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .category-main-box:hover {
        border-color: rgba(0, 243, 255, 0.4);
        transform: translateY(-2px);
    }

    .category-title {
        font-family: var(--font-interface);
        font-weight: 300;
        letter-spacing: 0.3em;
        font-size: 1.2em;
        color: #00f3ff;
        text-shadow: 0 0 8px rgba(0, 243, 255, 0.4);
        text-transform: uppercase;
    }

    .category-subtitle-row {
        background-color: #080808;
        border: 1px solid var(--background-modifier-border);
        border-radius: 8px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .category-subtitle-row:hover {
        background-color: var(--background-modifier-hover);
    }

    .category-subtitle {
        font-weight: 600;
        font-size: 0.9em;
        color: var(--text-normal);
    }

    .new-page-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background: transparent;
        border: 1px solid var(--background-modifier-border);
        color: var(--text-muted);
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.85em;
        margin-top: 4px;
        transition: all 0.2s ease;
    }

    .new-page-btn:hover {
        background-color: var(--background-modifier-hover);
        color: var(--text-normal);
        border-color: var(--text-muted);
    }
</style>
