<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { App } from 'obsidian';
    import ConceptMap3D from './ConceptMap3D.svelte';
    import { studyHubStore } from '../../store';

    export let app: App;
    export let initialCourseId: string = $studyHubStore.courses[0]?.id || 'dsa';
    export let initialCourseTitle: string = $studyHubStore.courses[0]?.title || 'Data Structures & Algorithms';

    const dispatch = createEventDispatcher();
</script>

<div class="modal-backdrop" on:click={() => dispatch('close')}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-container-3d" on:click|stopPropagation>
        <ConceptMap3D 
            {app} 
            courseId={initialCourseId} 
            courseTitle={initialCourseTitle} 
            on:close={() => dispatch('close')}
        />
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
        padding: 24px;
        box-sizing: border-box;
    }

    .modal-container-3d {
        width: 95vw;
        max-width: 1240px;
        height: 88vh;
        max-height: 880px;
        background: #080808;
        border: 1px solid rgba(0, 243, 255, 0.3);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 243, 255, 0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
    }
</style>
