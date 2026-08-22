<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import * as THREE from 'three';
    import type { App } from 'obsidian';
    import type { ConceptGraphData, ConceptNode, ConceptMapMode } from '../../types/conceptMap';
    import { buildConceptGraph } from '../../utils/conceptParser';
    import { studyHubStore } from '../../store';
    import ConceptInspector from './ConceptInspector.svelte';
    import { 
        Orbit, 
        GitFork, 
        Sparkles, 
        RotateCw, 
        Search, 
        Maximize2, 
        Minimize2, 
        RefreshCw,
        ChevronDown
    } from 'lucide-svelte';

    export let app: App;
    export let courseId: string = $studyHubStore.courses[0]?.id || 'dsa';
    export let courseTitle: string = $studyHubStore.courses[0]?.title || 'Data Structures & Algorithms';

    const dispatch = createEventDispatcher();

    let containerEl: HTMLElement;
    let canvasEl: HTMLCanvasElement;

    let mode: ConceptMapMode = 'orbital';
    let autoRotate = true;
    let searchQuery = '';
    let selectedNode: ConceptNode | null = null;
    let hoveredNode: ConceptNode | null = null;
    let isFullscreen = false;
    let filterStatus: string = 'all';

    // Three.js State
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let animationFrameId: number;
    let raycaster: THREE.Raycaster;
    let mouse: THREE.Vector2;
    let graphData: ConceptGraphData = { nodes: [], links: [] };

    // 3D Objects
    let nodeMeshes: Map<string, THREE.Mesh> = new Map();
    let labelSprites: Map<string, THREE.Sprite> = new Map();
    let linkLines: THREE.LineSegments | null = null;
    let orbitalRingsGroup: THREE.Group = new THREE.Group();
    let starsParticleSystem: THREE.Points | null = null;

    // Orbit & Camera Controls state
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraTarget = new THREE.Vector3(0, 0, 0);
    let cameraRadius = 380;
    let cameraTheta = 0.5;
    let cameraPhi = 1.1;

    // Color palette
    const colors = {
        root: 0xd4af37,       // Gold
        unit: 0x00f3ff,       // Cyan
        mastered: 0x10b981,   // Emerald
        inProgress: 0xf59e0b, // Amber
        notStarted: 0x64748b, // Dim Slate
        prereqLine: 0xf472b6, // Pink laser
        parentLine: 0x00f3ff, // Cyan laser
        glow: 0x00f3ff
    };

    function getNodeColor(node: ConceptNode): number {
        if (node.type === 'root') return colors.root;
        if (node.type === 'unit') return colors.unit;
        if (node.status === 'mastered') return colors.mastered;
        if (node.status === 'in-progress') return colors.inProgress;
        return colors.notStarted;
    }

    async function loadData() {
        graphData = await buildConceptGraph(app, courseId, courseTitle);
        calculatePositions();
        rebuildScene();
    }

    async function handleCourseChange(newId: string) {
        const found = $studyHubStore.courses.find(c => c.id === newId);
        if (found) {
            courseId = found.id;
            courseTitle = found.title;
        } else {
            courseId = newId;
        }
        selectedNode = null;
        searchQuery = '';
        resetCamera();
        await loadData();
    }

    function calculatePositions() {
        const { nodes, links } = graphData;
        const root = nodes.find(n => n.type === 'root') || nodes[0];
        if (!root) return;

        if (mode === 'orbital') {
            // Solar / Orbital layout
            root.x = 0;
            root.y = 0;
            root.z = 0;

            const units = nodes.filter(n => n.type === 'unit');
            const unitCount = units.length;
            const unitRadius = 140;

            units.forEach((unit, uIdx) => {
                const uAngle = (uIdx / unitCount) * Math.PI * 2;
                unit.x = Math.cos(uAngle) * unitRadius;
                unit.z = Math.sin(uAngle) * unitRadius;
                unit.y = Math.sin(uIdx * 1.5) * 20;

                // Concepts orbiting this unit
                const concepts = nodes.filter(n => n.type === 'concept' && n.unit === unit.name);
                const cCount = concepts.length;
                const conceptRadius = 60;

                concepts.forEach((concept, cIdx) => {
                    const cAngle = (cIdx / Math.max(cCount, 1)) * Math.PI * 2;
                    const tilt = 0.35;
                    concept.x = (unit.x || 0) + Math.cos(cAngle) * conceptRadius;
                    concept.z = (unit.z || 0) + Math.sin(cAngle) * conceptRadius * Math.cos(tilt);
                    concept.y = (unit.y || 0) + Math.sin(cAngle) * conceptRadius * Math.sin(tilt) + (cIdx % 2 === 0 ? 15 : -15);

                    // Subconcepts
                    const subconcepts = nodes.filter(n => n.type === 'subconcept' && links.some(l => 
                        (typeof l.source === 'string' ? l.source : l.source.id) === concept.id &&
                        (typeof l.target === 'string' ? l.target : l.target.id) === n.id
                    ));
                    const sCount = subconcepts.length;
                    const subRadius = 24;

                    subconcepts.forEach((sub, sIdx) => {
                        const sAngle = (sIdx / Math.max(sCount, 1)) * Math.PI * 2;
                        sub.x = (concept.x || 0) + Math.cos(sAngle) * subRadius;
                        sub.z = (concept.z || 0) + Math.sin(sAngle) * subRadius;
                        sub.y = (concept.y || 0) + Math.sin(sAngle * 2) * 8;
                    });
                });
            });
        } else if (mode === 'tree') {
            // 3D Hierarchical Syllabus Tree
            root.x = 0;
            root.y = 120;
            root.z = 0;

            const units = nodes.filter(n => n.type === 'unit');
            const unitWidth = 260;
            const uStep = units.length > 1 ? unitWidth / (units.length - 1) : 0;

            units.forEach((unit, uIdx) => {
                unit.x = -unitWidth / 2 + uIdx * uStep;
                unit.y = 40;
                unit.z = 0;

                const concepts = nodes.filter(n => n.type === 'concept' && n.unit === unit.name);
                const cHeight = 140;
                const cStep = concepts.length > 1 ? cHeight / (concepts.length - 1) : 0;

                concepts.forEach((concept, cIdx) => {
                    concept.x = (unit.x || 0) + (cIdx % 2 === 0 ? -25 : 25);
                    concept.y = -30 - cIdx * 45;
                    concept.z = (cIdx % 2 === 0 ? 30 : -30);

                    const subconcepts = nodes.filter(n => n.type === 'subconcept' && links.some(l => 
                        (typeof l.source === 'string' ? l.source : l.source.id) === concept.id &&
                        (typeof l.target === 'string' ? l.target : l.target.id) === n.id
                    ));

                    subconcepts.forEach((sub, sIdx) => {
                        sub.x = (concept.x || 0) + (sIdx === 0 ? -20 : 20);
                        sub.y = (concept.y || 0) - 25;
                        sub.z = (concept.z || 0) + (sIdx * 15);
                    });
                });
            });
        } else if (mode === 'constellation') {
            // Force-Directed Constellation (Spherical distribution with relaxing iterations)
            const count = nodes.length;
            const radius = 160;

            nodes.forEach((n, i) => {
                if (n.type === 'root') {
                    n.x = 0; n.y = 0; n.z = 0;
                } else {
                    const phi = Math.acos(-1 + (2 * i) / count);
                    const theta = Math.sqrt(count * Math.PI) * phi;
                    const r = radius * (0.6 + 0.4 * Math.sin(i * 3));
                    n.x = r * Math.cos(theta) * Math.sin(phi);
                    n.y = r * Math.sin(theta) * Math.sin(phi);
                    n.z = r * Math.cos(phi);
                }
            });
        }
    }

    function createTextSprite(message: string, color: string = '#ffffff'): THREE.Sprite {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.Sprite();

        canvas.width = 512;
        canvas.height = 128;

        ctx.font = 'Bold 32px "Inter", sans-serif';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Subtle glow / outline
        ctx.shadowColor = 'rgba(0, 243, 255, 0.8)';
        ctx.shadowBlur = 8;
        ctx.fillText(message, 256, 64);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture, 
            transparent: true,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(40, 10, 1);
        return sprite;
    }

    function rebuildScene() {
        if (!scene) return;

        // Clear existing meshes & sprites
        nodeMeshes.forEach(mesh => scene.remove(mesh));
        nodeMeshes.clear();
        labelSprites.forEach(sprite => scene.remove(sprite));
        labelSprites.clear();

        if (linkLines) scene.remove(linkLines);
        while (orbitalRingsGroup.children.length > 0) {
            orbitalRingsGroup.remove(orbitalRingsGroup.children[0]);
        }

        const sphereGeo = new THREE.SphereGeometry(1, 24, 24);

        // 1. Create Node Meshes
        graphData.nodes.forEach(node => {
            const isVisible = filterStatus === 'all' || node.status === filterStatus || node.type === 'root' || node.type === 'unit';
            if (!isVisible) return;

            const isHighlighted = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());
            const radius = node.type === 'root' ? 12 : node.type === 'unit' ? 8 : node.type === 'concept' ? 5 : 3.2;
            const nodeColor = getNodeColor(node);

            const mat = new THREE.MeshStandardMaterial({
                color: isHighlighted ? 0xffffff : nodeColor,
                emissive: isHighlighted ? 0x00f3ff : nodeColor,
                emissiveIntensity: isHighlighted ? 0.9 : node.status === 'mastered' ? 0.6 : 0.35,
                roughness: 0.2,
                metalness: 0.8
            });

            const mesh = new THREE.Mesh(sphereGeo, mat);
            mesh.scale.set(radius, radius, radius);
            mesh.position.set(node.x || 0, node.y || 0, node.z || 0);
            mesh.userData = { node };

            scene.add(mesh);
            nodeMeshes.set(node.id, mesh);

            // Add Text Sprite Label
            if (node.type !== 'subconcept' || isHighlighted) {
                const label = createTextSprite(
                    node.name, 
                    node.type === 'root' ? '#ffd700' : node.type === 'unit' ? '#00f3ff' : '#ffffff'
                );
                label.position.set(node.x || 0, (node.y || 0) + radius + 7, node.z || 0);
                scene.add(label);
                labelSprites.set(node.id, label);
            }
        });

        // 2. Create Laser Link Lines
        const linePositions: number[] = [];
        const lineColors: number[] = [];

        graphData.links.forEach(link => {
            const srcId = typeof link.source === 'string' ? link.source : link.source.id;
            const tgtId = typeof link.target === 'string' ? link.target : link.target.id;

            const srcNode = graphData.nodes.find(n => n.id === srcId);
            const tgtNode = graphData.nodes.find(n => n.id === tgtId);

            if (srcNode && tgtNode && nodeMeshes.has(srcNode.id) && nodeMeshes.has(tgtNode.id)) {
                linePositions.push(srcNode.x || 0, srcNode.y || 0, srcNode.z || 0);
                linePositions.push(tgtNode.x || 0, tgtNode.y || 0, tgtNode.z || 0);

                const c = link.type === 'prerequisite' ? new THREE.Color(colors.prereqLine) : new THREE.Color(colors.parentLine);
                lineColors.push(c.r, c.g, c.b);
                lineColors.push(c.r, c.g, c.b);
            }
        });

        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

        const lineMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.45,
            linewidth: 1
        });

        linkLines = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(linkLines);

        // 3. Add Orbital Rings in Orbital mode
        if (mode === 'orbital') {
            const mainRingGeo = new THREE.RingGeometry(138, 142, 64);
            const mainRingMat = new THREE.MeshBasicMaterial({ 
                color: 0x00f3ff, 
                side: THREE.DoubleSide, 
                transparent: true, 
                opacity: 0.12 
            });
            const mainRing = new THREE.Mesh(mainRingGeo, mainRingMat);
            mainRing.rotation.x = Math.PI / 2;
            orbitalRingsGroup.add(mainRing);
            scene.add(orbitalRingsGroup);
        }
    }

    function createStarfield() {
        const starGeo = new THREE.BufferGeometry();
        const count = 700;
        const positions = new Float32Array(count * 3);
        const starColors = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 1200;
            positions[i + 1] = (Math.random() - 0.5) * 1200;
            positions[i + 2] = (Math.random() - 0.5) * 1200;

            const isCyan = Math.random() > 0.5;
            starColors[i] = isCyan ? 0.0 : 0.9;
            starColors[i + 1] = isCyan ? 0.9 : 0.7;
            starColors[i + 2] = 1.0;
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        const starMat = new THREE.PointsMaterial({
            size: 2.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.75
        });

        starsParticleSystem = new THREE.Points(starGeo, starMat);
        scene.add(starsParticleSystem);
    }

    function updateCamera() {
        camera.position.x = cameraTarget.x + cameraRadius * Math.sin(cameraPhi) * Math.sin(cameraTheta);
        camera.position.y = cameraTarget.y + cameraRadius * Math.cos(cameraPhi);
        camera.position.z = cameraTarget.z + cameraRadius * Math.sin(cameraPhi) * Math.cos(cameraTheta);
        camera.lookAt(cameraTarget);
    }

    function animate() {
        animationFrameId = requestAnimationFrame(animate);

        if (autoRotate && !isDragging) {
            cameraTheta += 0.003;
            updateCamera();
        }

        if (starsParticleSystem) {
            starsParticleSystem.rotation.y += 0.0003;
        }

        renderer.render(scene, camera);
    }

    function handleMouseDown(e: MouseEvent) {
        if (e.target !== canvasEl) return;
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    function handleMouseMove(e: MouseEvent) {
        const rect = canvasEl.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        if (isDragging) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            cameraTheta -= deltaX * 0.006;
            cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraPhi - deltaY * 0.006));
            updateCamera();

            previousMousePosition = { x: e.clientX, y: e.clientY };
        } else {
            // Raycast for hover
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(Array.from(nodeMeshes.values()));
            if (intersects.length > 0) {
                const mesh = intersects[0].object as THREE.Mesh;
                hoveredNode = mesh.userData.node;
                canvasEl.style.cursor = 'pointer';
            } else {
                hoveredNode = null;
                canvasEl.style.cursor = 'grab';
            }
        }
    }

    function handleMouseUp() {
        isDragging = false;
    }

    function handleWheel(e: WheelEvent) {
        e.preventDefault();
        cameraRadius = Math.max(100, Math.min(800, cameraRadius + e.deltaY * 0.4));
        updateCamera();
    }

    function handleClick(e: MouseEvent) {
        if (e.target !== canvasEl) return;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(Array.from(nodeMeshes.values()));
        if (intersects.length > 0) {
            const mesh = intersects[0].object as THREE.Mesh;
            selectedNode = mesh.userData.node;
            // Smoothly look at clicked node
            if (selectedNode) {
                cameraTarget.set(selectedNode.x || 0, selectedNode.y || 0, selectedNode.z || 0);
                updateCamera();
            }
        }
    }

    function handleResize() {
        if (!containerEl || !renderer || !camera) return;
        const width = containerEl.clientWidth;
        const height = containerEl.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    function setMode(newMode: ConceptMapMode) {
        mode = newMode;
        calculatePositions();
        rebuildScene();
    }

    function handleSearch() {
        if (!searchQuery.trim()) {
            rebuildScene();
            return;
        }
        const found = graphData.nodes.find(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()));
        if (found) {
            selectedNode = found;
            cameraTarget.set(found.x || 0, found.y || 0, found.z || 0);
            cameraRadius = 220;
            updateCamera();
        }
        rebuildScene();
    }

    function handleStatusChange(e: CustomEvent<{ nodeId: string; status: any }>) {
        const { nodeId, status } = e.detail;
        const n = graphData.nodes.find(node => node.id === nodeId);
        if (n) {
            n.status = status;
            rebuildScene();
        }
    }

    function resetCamera() {
        cameraTarget.set(0, 0, 0);
        cameraRadius = 380;
        cameraTheta = 0.5;
        cameraPhi = 1.1;
        updateCamera();
    }

    onMount(async () => {
        const width = containerEl.clientWidth || 800;
        const height = containerEl.clientHeight || 600;

        // Init Three.js Scene
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x05070a, 0.0012);

        camera = new THREE.PerspectiveCamera(50, width / height, 1, 3000);
        updateCamera();

        renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Ambient & Point Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x00f3ff, 2, 800);
        pointLight.position.set(0, 50, 0);
        scene.add(pointLight);

        const pointLight2 = new THREE.PointLight(0xf472b6, 1.5, 800);
        pointLight2.position.set(100, -50, 100);
        scene.add(pointLight2);

        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        createStarfield();
        await loadData();
        animate();

        window.addEventListener('resize', handleResize);
    });

    onDestroy(() => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        if (renderer) renderer.dispose();
    });
</script>

<div class="concept-map-container" bind:this={containerEl} class:fullscreen={isFullscreen}>
    <!-- 3D WebGL Canvas -->
    <canvas 
        bind:this={canvasEl} 
        on:mousedown={handleMouseDown}
        on:mousemove={handleMouseMove}
        on:mouseup={handleMouseUp}
        on:wheel={handleWheel}
        on:click={handleClick}
    ></canvas>

    <!-- Top HUD Toolbar -->
    <div class="top-hud">
        <div class="hud-left">
            <!-- Integrated Course Selector Badge -->
            <div class="course-selector-badge">
                <span class="course-icon">🕸️</span>
                {#if $studyHubStore.courses.length > 0}
                    <select 
                        value={courseId} 
                        on:change={(e) => handleCourseChange(e.currentTarget.value)}
                        class="course-select-dropdown"
                    >
                        {#each $studyHubStore.courses as course}
                            <option value={course.id}>{course.title}</option>
                        {/each}
                    </select>
                    <ChevronDown size={14} class="select-chevron" />
                {:else}
                    <span class="course-name">{courseTitle}</span>
                {/if}
            </div>

            <!-- Mode Switcher -->
            <div class="mode-pills">
                <button 
                    type="button"
                    class="mode-btn {mode === 'orbital' ? 'active' : ''}" 
                    on:click={() => setMode('orbital')}
                    title="3D Solar / Orbital System"
                >
                    <Orbit size={14} /> Orbital
                </button>
                <button 
                    type="button"
                    class="mode-btn {mode === 'tree' ? 'active' : ''}" 
                    on:click={() => setMode('tree')}
                    title="3D Hierarchical Syllabus Tree"
                >
                    <GitFork size={14} /> Syllabus Tree
                </button>
                <button 
                    type="button"
                    class="mode-btn {mode === 'constellation' ? 'active' : ''}" 
                    on:click={() => setMode('constellation')}
                    title="3D Knowledge Constellation"
                >
                    <Sparkles size={14} /> Constellation
                </button>
            </div>
        </div>

        <div class="hud-right">
            <!-- Search -->
            <div class="search-box">
                <Search size={14} color="var(--text-muted)" />
                <input 
                    type="text" 
                    placeholder="Find concept..." 
                    bind:value={searchQuery} 
                    on:input={handleSearch}
                />
            </div>

            <!-- Controls -->
            <button 
                type="button"
                class="icon-control-btn {autoRotate ? 'active' : ''}" 
                on:click={() => autoRotate = !autoRotate}
                title="Toggle Auto-Rotate Turntable"
            >
                <RotateCw size={15} />
            </button>

            <button 
                type="button"
                class="icon-control-btn" 
                on:click={resetCamera}
                title="Reset Camera View"
            >
                <RefreshCw size={15} />
            </button>

            <button 
                type="button"
                class="icon-control-btn" 
                on:click={() => isFullscreen = !isFullscreen}
                title="Toggle Fullscreen"
            >
                {#if isFullscreen}
                    <Minimize2 size={15} />
                {:else}
                    <Maximize2 size={15} />
                {/if}
            </button>

            <button 
                type="button"
                class="close-hud-btn" 
                on:click={() => dispatch('close')}
                title="Close Concept Map"
            >
                &times;
            </button>
        </div>
    </div>

    <!-- Bottom Legend / Status Filter -->
    <div class="bottom-legend">
        <button type="button" class="legend-item" on:click={() => { filterStatus = 'all'; rebuildScene(); }}>
            <span class="legend-dot all"></span>
            <span>All ({graphData.nodes.length})</span>
        </button>
        <button type="button" class="legend-item" on:click={() => { filterStatus = 'mastered'; rebuildScene(); }}>
            <span class="legend-dot mastered"></span>
            <span>Mastered</span>
        </button>
        <button type="button" class="legend-item" on:click={() => { filterStatus = 'in-progress'; rebuildScene(); }}>
            <span class="legend-dot in-progress"></span>
            <span>Learning</span>
        </button>
        <button type="button" class="legend-item" on:click={() => { filterStatus = 'not-started'; rebuildScene(); }}>
            <span class="legend-dot not-started"></span>
            <span>Not Started</span>
        </button>
    </div>

    <!-- Hovered Node Tooltip Preview -->
    {#if hoveredNode && !selectedNode}
        <div class="hover-tooltip" style="left: {mouse.x * 50 + 50}%; top: {-mouse.y * 50 + 50}%;">
            <div class="tooltip-title">{hoveredNode.name}</div>
            <div class="tooltip-sub">{hoveredNode.unit || hoveredNode.type} &bull; {hoveredNode.status}</div>
        </div>
    {/if}

    <!-- Inspector Side Panel -->
    {#if selectedNode}
        <ConceptInspector 
            {app} 
            node={selectedNode} 
            {courseTitle}
            on:close={() => selectedNode = null}
            on:statusChange={handleStatusChange}
        />
    {/if}
</div>

<style>
    .concept-map-container {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 520px;
        background: radial-gradient(circle at center, #0a0d14 0%, #030407 100%);
        border-radius: 12px;
        overflow: hidden;
        user-select: none;
    }

    .concept-map-container.fullscreen {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9999;
        border-radius: 0;
    }

    canvas {
        width: 100%;
        height: 100%;
        display: block;
        cursor: grab;
    }

    canvas:active {
        cursor: grabbing;
    }

    .top-hud {
        position: absolute;
        top: 16px;
        left: 16px;
        right: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        pointer-events: none;
        z-index: 10;
        flex-wrap: wrap;
    }

    .hud-left, .hud-right {
        display: flex;
        align-items: center;
        gap: 12px;
        pointer-events: auto;
    }

    .course-selector-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(10, 12, 16, 0.85);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(0, 243, 255, 0.35);
        padding: 5px 14px;
        border-radius: 20px;
        box-shadow: 0 0 15px rgba(0, 243, 255, 0.15);
        position: relative;
    }

    .course-icon {
        font-size: 1.1em;
        line-height: 1;
    }

    .course-select-dropdown {
        background: transparent;
        border: none;
        color: #00f3ff;
        font-family: var(--font-interface);
        font-weight: 700;
        font-size: 0.9em;
        cursor: pointer;
        outline: none;
        padding-right: 16px;
        appearance: none;
        -webkit-appearance: none;
    }

    .course-select-dropdown option {
        background: #111;
        color: #fff;
    }

    :global(.select-chevron) {
        position: absolute;
        right: 10px;
        pointer-events: none;
        color: #00f3ff;
    }

    .course-name {
        font-weight: 700;
        font-size: 0.9em;
        color: #00f3ff;
    }

    .mode-pills {
        display: flex;
        background: rgba(10, 12, 16, 0.85);
        backdrop-filter: blur(12px);
        border: 1px solid var(--background-modifier-border);
        padding: 4px;
        border-radius: 20px;
        gap: 4px;
    }

    .mode-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        padding: 5px 12px;
        border-radius: 14px;
        font-size: 0.8em;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
    }

    .mode-btn:hover {
        color: #fff;
    }

    .mode-btn.active {
        background: #00f3ff;
        color: #000;
        box-shadow: 0 0 10px rgba(0, 243, 255, 0.4);
    }

    .search-box {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(10, 12, 16, 0.85);
        backdrop-filter: blur(12px);
        border: 1px solid var(--background-modifier-border);
        border-radius: 20px;
        padding: 5px 12px;
    }

    .search-box input {
        background: transparent;
        border: none;
        color: #fff;
        font-size: 0.85em;
        outline: none;
        width: 140px;
    }

    .icon-control-btn {
        background: rgba(10, 12, 16, 0.85);
        backdrop-filter: blur(12px);
        border: 1px solid var(--background-modifier-border);
        color: var(--text-muted);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .icon-control-btn:hover {
        color: #fff;
        border-color: #00f3ff;
    }

    .icon-control-btn.active {
        color: #00f3ff;
        border-color: #00f3ff;
    }

    .close-hud-btn {
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        font-size: 1.2em;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        line-height: 1;
    }

    .close-hud-btn:hover {
        background: #ef4444;
        color: #fff;
    }

    .bottom-legend {
        position: absolute;
        bottom: 16px;
        left: 16px;
        display: flex;
        gap: 16px;
        background: rgba(10, 12, 16, 0.85);
        backdrop-filter: blur(12px);
        border: 1px solid var(--background-modifier-border);
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 0.75em;
        color: var(--text-muted);
        z-index: 10;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 1em;
        padding: 0;
    }

    .legend-item:hover {
        color: #fff;
    }

    .legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }

    .legend-dot.all { background: #00f3ff; }
    .legend-dot.mastered { background: #10b981; }
    .legend-dot.in-progress { background: #f59e0b; }
    .legend-dot.not-started { background: #64748b; }

    .hover-tooltip {
        position: absolute;
        transform: translate(-50%, -120%);
        background: rgba(0, 0, 0, 0.85);
        border: 1px solid #00f3ff;
        border-radius: 6px;
        padding: 6px 10px;
        pointer-events: none;
        z-index: 50;
        white-space: nowrap;
    }

    .tooltip-title {
        font-size: 0.85em;
        font-weight: 700;
        color: #00f3ff;
    }

    .tooltip-sub {
        font-size: 0.7em;
        color: var(--text-muted);
    }
</style>
