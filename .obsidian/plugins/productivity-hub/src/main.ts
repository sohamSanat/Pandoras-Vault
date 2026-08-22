import { Plugin, ItemView, WorkspaceLeaf } from 'obsidian';
import { mount, unmount } from 'svelte';
import HubApp from './App.svelte';
import type { HubData } from './store';

export const VIEW_TYPE_PRODUCTIVITY_HUB = "productivity-hub-view";

class ProductivityHubView extends ItemView {
	component: ReturnType<typeof mount>;
	plugin: ProductivityHubPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: ProductivityHubPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_PRODUCTIVITY_HUB;
	}

	getDisplayText() {
		return "Productivity Hub";
	}

	async onOpen() {
		try {
			this.contentEl.empty();
			this.component = mount(HubApp, {
				target: this.contentEl,
				props: {
					app: this.app,
					plugin: this.plugin,
				}
			});
		} catch (e: any) {
			console.error("Failed to mount Productivity Hub:", e);
			this.contentEl.empty();
			const errorDiv = this.contentEl.createDiv();
			errorDiv.style.color = "red";
			errorDiv.style.padding = "20px";
			errorDiv.style.fontFamily = "monospace";
			errorDiv.innerHTML = `<h2>Productivity Hub Error</h2><pre style="white-space: pre-wrap;">${e.stack || e.message || String(e)}</pre>`;
		}
	}

	async onClose() {
		if (this.component) {
			unmount(this.component);
		}
	}
}

export default class ProductivityHubPlugin extends Plugin {
	data: HubData = {
		habits: [],
		tasks: [],
		projects: [],
		habitLogs: {},
	};

	async onload() {
		await this.loadHubData();

		this.registerView(
			VIEW_TYPE_PRODUCTIVITY_HUB,
			(leaf) => new ProductivityHubView(leaf, this)
		);

		this.addRibbonIcon('target', 'Open Productivity Hub', () => {
			this.activateView();
		});

		this.addCommand({
			id: 'open-productivity-hub',
			name: 'Open Productivity Hub',
			callback: () => {
				this.activateView();
			}
		});
	}

	async loadHubData() {
		const saved = await this.loadData();
		this.data = {
			habits:    saved?.habits    ?? [],
			tasks:     saved?.tasks     ?? [],
			projects:  saved?.projects  ?? [],
			habitLogs: saved?.habitLogs ?? {},
		};
	}

	async saveHubData() {
		await this.saveData(this.data);
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_PRODUCTIVITY_HUB);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getLeaf(false);
			await leaf.setViewState({ type: VIEW_TYPE_PRODUCTIVITY_HUB, active: true });
		}

		workspace.revealLeaf(leaf);
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_PRODUCTIVITY_HUB);
	}
}
