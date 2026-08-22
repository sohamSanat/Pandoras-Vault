<script lang="ts">
    import { studyHubStore, updateLifeBalanceValue } from "../store";
    import { Sliders, X } from "lucide-svelte";

    $: labels = $studyHubStore.lifeBalance?.labels || [
        "Career",
        "Relationship",
        "Growth",
        "Lifestyle",
        "Physical Health",
        "Money",
        "Family",
    ];
    $: values = $studyHubStore.lifeBalance?.values || [7, 6, 9, 8, 5, 8, 9];

    const max = 10;
    const size = 300;
    const center = size / 2;
    const radius = size * 0.35;
    const steps = 5;

    let isEditing = false;

    // Helper to calculate x,y points for the polygons
    function getPoint(value: number, index: number, total: number) {
        const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
        const r = (value / max) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
        };
    }

    // Generate grid rings
    $: rings = Array.from({ length: steps }, (_, i) => {
        let points = "";
        for (let j = 0; j < labels.length; j++) {
            const p = getPoint((i + 1) * (max / steps), j, labels.length);
            points += `${p.x},${p.y} `;
        }
        return points.trim();
    });

    // Generate axes lines
    $: axes = labels.map((_, j) => {
        const p = getPoint(max, j, labels.length);
        return { x1: center, y1: center, x2: p.x, y2: p.y };
    });

    // Generate data polygon & dots
    $: dataPolygon = (() => {
        let points = "";
        const dots: {
            x: number;
            y: number;
            val: number;
            index: number;
            label: string;
        }[] = [];
        for (let j = 0; j < labels.length; j++) {
            const val = values[j] ?? 5;
            const p = getPoint(val, j, labels.length);
            points += `${p.x},${p.y} `;
            dots.push({ ...p, val, index: j, label: labels[j] });
        }
        return { points: points.trim(), dots };
    })();

    // Generate label positions
    $: labelPositions = labels.map((label, j) => {
        const angle = (Math.PI * 2 * j) / labels.length - Math.PI / 2;
        const r = radius + 25;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        let anchor = "middle";
        if (Math.cos(angle) > 0.1) anchor = "start";
        if (Math.cos(angle) < -0.1) anchor = "end";
        return { x, y, label, anchor, index: j };
    });
</script>

<div class="chart-container">
    <div class="chart-header">
        <span class="chart-title">Life Balance</span>
        <button
            class="btn-edit-scores"
            on:click={() => (isEditing = !isEditing)}
        >
            <Sliders size={14} />
            {isEditing ? "Done" : "Adjust Scores"}
        </button>
    </div>

    {#if isEditing}
        <div class="sliders-panel">
            {#each labels as label, i}
                <div class="slider-row">
                    <span class="slider-label">{label}</span>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={values[i]}
                        on:input={(e) =>
                            updateLifeBalanceValue(
                                i,
                                Number(e.currentTarget.value),
                            )}
                    />
                    <span class="slider-val">{values[i]}</span>
                </div>
            {/each}
        </div>
    {/if}

    <svg viewBox="0 0 {size} {size}" width="100%" height="100%">
        <!-- Grid Rings -->
        {#each rings as ring, i}
            <polygon
                points={ring}
                fill="none"
                stroke="var(--background-modifier-border)"
                stroke-width="1"
            />
            <text
                x={center}
                y={center - (i + 1) * (radius / steps) + 4}
                font-size="10"
                fill="var(--text-muted)"
                text-anchor="middle"
            >
                {(i + 1) * 2}
            </text>
        {/each}

        <!-- Axes lines -->
        {#each axes as axis}
            <line
                x1={axis.x1}
                y1={axis.y1}
                x2={axis.x2}
                y2={axis.y2}
                stroke="var(--background-modifier-border)"
                stroke-width="1"
            />
        {/each}

        <!-- Data Polygon -->
        <polygon
            points={dataPolygon.points}
            fill="rgba(244, 114, 182, 0.35)"
            stroke="#f472b6"
            stroke-width="2"
        />

        <!-- Data Dots -->
        {#each dataPolygon.dots as dot}
            <circle
                cx={dot.x}
                cy={dot.y}
                r="4.5"
                fill="#f472b6"
                stroke="#fff"
                stroke-width="1"
                class="chart-dot"
                on:click={() => (isEditing = true)}
            />
        {/each}

        <!-- Category Labels -->
        {#each labelPositions as pos}
            <text
                x={pos.x}
                y={pos.y}
                font-size="11"
                fill="var(--text-muted)"
                text-anchor={pos.anchor}
                dominant-baseline="middle"
                class="chart-label-text"
                on:click={() => (isEditing = true)}
            >
                {pos.label} ({values[pos.index] || 0})
            </text>
        {/each}
    </svg>
</div>

<style>
    .chart-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 400px;
        margin: 0 auto;
        padding: 8px;
    }

    .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin-bottom: 8px;
    }

    .chart-title {
        font-family: var(--font-interface);
        font-size: 1em;
        font-weight: 600;
        color: #00f3ff;
    }

    .btn-edit-scores {
        background: transparent;
        border: 1px solid var(--background-modifier-border);
        color: var(--text-muted);
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 0.8em;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .btn-edit-scores:hover {
        background: var(--background-modifier-hover);
        color: var(--text-normal);
    }

    .sliders-panel {
        background: #18181b;
        border: 1px solid var(--background-modifier-border);
        border-radius: 8px;
        padding: 12px;
        width: 100%;
        margin-bottom: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .slider-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .slider-label {
        font-size: 0.75em;
        color: var(--text-muted);
        width: 90px;
    }

    .slider-val {
        font-size: 0.8em;
        color: #f472b6;
        font-weight: 600;
        width: 20px;
        text-align: right;
    }

    input[type="range"] {
        flex: 1;
        accent-color: #f472b6;
    }

    svg {
        font-family: var(--font-interface);
        user-select: none;
    }

    .chart-dot {
        cursor: pointer;
        transition: transform 0.2s;
    }

    .chart-dot:hover {
        transform: scale(1.3);
    }

    .chart-label-text {
        cursor: pointer;
    }

    .chart-label-text:hover {
        fill: var(--text-normal);
    }

    .powered-by {
        margin-top: 8px;
        font-size: 0.8em;
        color: var(--text-muted);
        font-family: var(--font-interface);
    }
</style>
