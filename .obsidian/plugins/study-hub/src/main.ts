import { App, Plugin, ItemView, WorkspaceLeaf } from 'obsidian';
import StudyHubApp from './App.svelte';
import { mount, unmount } from 'svelte';
import { initStudyHubStore } from './store';
import { ConceptMapView, VIEW_TYPE_CONCEPT_MAP } from './views/ConceptMapView';

export const VIEW_TYPE_STUDY_HUB = "study-hub-view";

class StudyHubView extends ItemView {
	component!: Record<string, any>;
	plugin: StudyHubPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: StudyHubPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_STUDY_HUB;
	}

	getDisplayText() {
		return "Study Hub";
	}

	async onOpen() {
		this.contentEl.empty();
		this.contentEl.addClass('study-hub-view-leaf');
		this.contentEl.style.overflowY = "auto";
		this.contentEl.style.height = "100%";
		this.contentEl.style.padding = "0";
		
		this.component = mount(StudyHubApp, {
			target: this.contentEl,
			props: {
				app: this.app,
				plugin: this.plugin
			}
		});
	}

	async onClose() {
		if (this.component) {
			unmount(this.component);
		}
	}
}

export default class StudyHubPlugin extends Plugin {
	async onload() {
		// Load stored data into reactive store
		const savedData = await this.loadData();
		initStudyHubStore(this, savedData);

		this.registerView(
			VIEW_TYPE_STUDY_HUB,
			(leaf) => new StudyHubView(leaf, this)
		);

		this.registerView(
			VIEW_TYPE_CONCEPT_MAP,
			(leaf) => new ConceptMapView(leaf)
		);

		this.addRibbonIcon('graduation-cap', 'Open Study Hub', () => {
			this.activateView();
		});

		this.addRibbonIcon('network', 'Open 3D Concept Map', () => {
			this.activateConceptMapView();
		});

		this.addCommand({
			id: 'open-study-hub',
			name: 'Open Study Hub',
			callback: () => {
				this.activateView();
			}
		});

		this.addCommand({
			id: 'open-3d-concept-map',
			name: 'Open 3D Concept Map',
			callback: () => {
				this.activateConceptMapView();
			}
		});
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_STUDY_HUB);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getLeaf('tab');
			await leaf.setViewState({ type: VIEW_TYPE_STUDY_HUB, active: true });
		}

		workspace.revealLeaf(leaf);
	}

	async activateConceptMapView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_CONCEPT_MAP);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getLeaf('tab');
			await leaf.setViewState({ type: VIEW_TYPE_CONCEPT_MAP, active: true });
		}

		workspace.revealLeaf(leaf);
	}
}
