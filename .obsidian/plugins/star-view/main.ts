import { Plugin, Modal, App, PluginSettingTab, Setting } from 'obsidian';

interface StarViewSettings {
    latitude: string;
    longitude: string;
    localStorageData: string;
}

const DEFAULT_SETTINGS: StarViewSettings = {
    latitude: '',
    longitude: '',
    localStorageData: '{}'
}
export default class StarViewPlugin extends Plugin {
    iconContainer: HTMLElement | null = null;
    stellariumIframe: HTMLElement | null = null;
    closeButton: HTMLElement | null = null;
    settings: StarViewSettings;
    isModalOpen: boolean = false;

    async onload() {
        console.log("Loading Star-view plugin");
        await this.loadSettings();

        // Register the settings tab
        this.addSettingTab(new StarViewSettingTab(this.app, this));

        // Wait for layout to be ready to inject into the workspace
        this.app.workspace.onLayoutReady(() => {
            this.injectConstellation();
            this.createPersistentIframe();
            this.checkIconVisibility();
            
            this.registerEvent(this.app.workspace.on('layout-change', this.checkIconVisibility.bind(this)));
            this.registerEvent(this.app.workspace.on('active-leaf-change', this.checkIconVisibility.bind(this)));
        });
    }

    checkIconVisibility() {
        if (!this.iconContainer) return;
        if (this.isModalOpen) {
            this.iconContainer.style.display = 'none';
            return;
        }
        
        let allVisibleLeavesAreEmpty = true;
        let rootHasLeaves = false;

        this.app.workspace.iterateRootLeaves((leaf) => {
            rootHasLeaves = true;
            // Check if this leaf's view is actually visible (it is the active tab in its group)
            if (leaf.view && leaf.view.containerEl && leaf.view.containerEl.clientWidth > 0) {
                const viewType = leaf.view.getViewType();
                const title = leaf.getDisplayText();
                
                // If any visible leaf is NOT a New Tab/Empty screen, we hide the icon
                if (viewType !== 'empty' && title !== 'New tab') {
                    allVisibleLeavesAreEmpty = false;
                }
            }
        });

        // Show the icon if the workspace is completely empty, or if all visible panes are just New Tabs
        if (!rootHasLeaves || allVisibleLeavesAreEmpty) {
            this.iconContainer.style.display = 'flex';
        } else {
            this.iconContainer.style.display = 'none';
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        // Reload iframe if settings change
        if (this.stellariumIframe) {
            this.stellariumIframe.setAttribute('src', this.getIframeUrl());
        }
    }

    getIframeUrl(): string {
        let url = 'https://stellarium-web.org/';
        if (this.settings.latitude && this.settings.longitude) {
            url += `?lat=${this.settings.latitude}&lng=${this.settings.longitude}`;
        }
        return url;
    }

    createPersistentIframe() {
        // Create a webview instead of an iframe to persist cookies and local storage
        this.stellariumIframe = document.createElement('webview');
        this.stellariumIframe.className = 'star-view-iframe';
        this.stellariumIframe.setAttribute('allowfullscreen', 'true');
        this.stellariumIframe.setAttribute('src', this.getIframeUrl());
        // Hide it offscreen initially
        this.stellariumIframe.style.position = 'fixed';
        this.stellariumIframe.style.left = '-9999px';
        this.stellariumIframe.style.top = '0px';
        this.stellariumIframe.style.width = '1px';
        this.stellariumIframe.style.height = '1px';
        this.stellariumIframe.style.zIndex = '9999990'; // High z-index to sit on top of the workspace
        this.stellariumIframe.style.border = 'none';
        
        // When webview is ready, inject CSS to hide cookie banners and restore our saved localStorage
        this.stellariumIframe.addEventListener('dom-ready', () => {
            const webview = this.stellariumIframe as any;
            
            // Hide cookie consent banners permanently
            // Also hide the left sidebar and its toggle button
            webview.insertCSS(`
                /* Cookies */
                .qc-cmp2-container, 
                #qc-cmp2-ui,
                .cookie-consent,
                .cookie-banner,
                [class*="cookie"],
                /* Sidebar and Hamburger Menu */
                .v-navigation-drawer,
                .v-app-bar__nav-icon,
                button:has(.mdi-menu),
                div.layout.column.fill-height:has(.v-list),
                /* Observe Button */
                a[href="/p"],
                /* Bottom Toolbar Target Buttons */
                .bottom-button:nth-of-type(5),
                .bottom-button:nth-of-type(6),
                .bottom-button:nth-of-type(8) {
                    display: none !important;
                }
                
                /* Reset content padding so there's no blank space */
                .v-content,
                .v-main,
                main {
                    padding-left: 0 !important;
                }
            `);

            // Restore the saved localStorage into the webview
            if (this.settings.localStorageData) {
                const restoreScript = `
                    try {
                        const data = JSON.parse(${JSON.stringify(this.settings.localStorageData)});
                        for (const key in data) {
                            localStorage.setItem(key, data[key]);
                        }
                    } catch (e) { console.error("Failed to restore local storage:", e); }
                `;
                webview.executeJavaScript(restoreScript);
            }
        });

        document.body.appendChild(this.stellariumIframe);
    }

    onunload() {
        console.log("Unloading Star-view plugin");
        if (this.iconContainer) {
            this.iconContainer.remove();
        }
        if (this.stellariumIframe) {
            this.stellariumIframe.remove();
        }
        if (this.closeButton) {
            this.closeButton.remove();
        }
    }

    injectConstellation() {
        // We will append it to the main central workspace area so it stays over the background
        // and doesn't overlap with the sidebars.
        const container = document.body;
        
        this.iconContainer = container.createDiv({ cls: 'star-view-container' });
        
        // Open modal on click
        this.iconContainer.onclick = () => {
            new StarViewModal(this.app, this).open();
        };
        
        // Render the Sagittarius SVG matching the line-graph node shape
        this.iconContainer!.innerHTML = `
            <svg class="sagittarius-icon" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <!-- Lines -->
                <g class="constellation-lines">
                    <line x1="85" y1="25" x2="95" y2="35" />
                    <line x1="95" y1="35" x2="105" y2="45" />
                    <line x1="105" y1="45" x2="115" y2="40" />
                    <line x1="105" y1="45" x2="120" y2="75" />
                    <line x1="120" y1="75" x2="100" y2="80" />
                    <line x1="120" y1="75" x2="130" y2="80" />
                    <line x1="100" y1="80" x2="105" y2="100" />
                    <line x1="100" y1="80" x2="60" y2="65" />
                    <line x1="60" y1="65" x2="30" y2="90" />
                    <line x1="30" y1="90" x2="45" y2="140" />
                    <line x1="45" y1="140" x2="55" y2="175" />
                    <line x1="55" y1="175" x2="90" y2="160" />
                    <line x1="90" y1="160" x2="85" y2="190" />
                    <line x1="85" y1="190" x2="55" y2="175" />
                    <line x1="90" y1="160" x2="105" y2="100" />
                    <line x1="90" y1="160" x2="155" y2="130" />
                    <line x1="105" y1="100" x2="130" y2="80" />
                    <line x1="105" y1="100" x2="155" y2="130" />
                    <line x1="130" y1="80" x2="150" y2="65" />
                    <line x1="130" y1="80" x2="165" y2="95" />
                    <line x1="130" y1="80" x2="155" y2="130" />
                    <line x1="150" y1="65" x2="175" y2="40" />
                    <line x1="165" y1="95" x2="185" y2="100" />
                    <line x1="165" y1="95" x2="155" y2="130" />
                    <line x1="155" y1="130" x2="165" y2="150" />
                </g>
                <!-- Stars -->
                <g class="constellation-stars">
                    <!-- Minor Stars -->
                    <circle cx="85" cy="25" r="2.5" />
                    <circle cx="95" cy="35" r="2.5" />
                    <circle cx="105" cy="45" r="2.5" />
                    <circle cx="115" cy="40" r="2.5" />
                    <circle cx="100" cy="80" r="2.5" />
                    <circle cx="105" cy="100" r="2.5" />
                    <circle cx="130" cy="80" r="2.5" />
                    <circle cx="175" cy="40" r="2.5" />
                    <circle cx="165" cy="95" r="2.5" />
                    <circle cx="185" cy="100" r="2.5" />
                    <circle cx="165" cy="150" r="2.5" />
                    <circle cx="60" cy="65" r="2.5" />
                    <circle cx="30" cy="90" r="2.5" />
                    <circle cx="45" cy="140" r="2.5" />
                    <circle cx="55" cy="175" r="2.5" />
                    <circle cx="90" cy="160" r="2.5" />
                    
                    <!-- Major Stars -->
                    <circle cx="120" cy="75" r="5.5" class="major-star" />
                    <circle cx="150" cy="65" r="5.5" class="major-star" />
                    <circle cx="155" cy="130" r="5.5" class="major-star" />
                    <circle cx="85" cy="190" r="5.5" class="major-star" />
                </g>
            </svg>
        `;
    }
}

class StarViewModal extends Modal {
    plugin: StarViewPlugin;
    loadingTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(app: App, plugin: StarViewPlugin) {
        super(app);
        this.plugin = plugin;
    }

    onOpen() {
        this.plugin.isModalOpen = true;
        if (this.plugin.iconContainer) {
            this.plugin.iconContainer.style.display = 'none';
        }

        const { contentEl, modalEl } = this;
        const bgEl = (this as any).bgEl;
        
        // Hide the full-screen background overlay so sidebars remain clearly visible
        if (bgEl) {
            bgEl.style.display = 'none';
        }
        
        // Add a custom class to the modal wrapper for sizing
        modalEl.addClass('mod-star-view');
        
        // Snap the modal exactly to the central workspace container
        const rootSplit = (this.app.workspace as any).rootSplit;
        if (rootSplit && rootSplit.containerEl) {
            const rect = rootSplit.containerEl.getBoundingClientRect();
            modalEl.style.position = 'fixed';
            modalEl.style.top = `${rect.top}px`;
            modalEl.style.left = `${rect.left}px`;
            modalEl.style.width = `${rect.width}px`;
            modalEl.style.height = `${rect.height}px`;
            modalEl.style.margin = '0';
            modalEl.style.maxWidth = 'none';
            modalEl.style.maxHeight = 'none';
            modalEl.style.borderRadius = '0';
        }
        
        contentEl.empty();
        contentEl.addClass('star-view-content');
        
        // Move the persistent iframe into position OVER the modal without reparenting it
        // Reparenting an iframe (appendChild) causes it to reload, losing all state!
        const iframe = this.plugin.stellariumIframe;
        if (iframe) {
            const rootSplit = (this.app.workspace as any).rootSplit;
            if (rootSplit && rootSplit.containerEl) {
                const rect = rootSplit.containerEl.getBoundingClientRect();
                iframe.style.left = `${rect.left}px`;
                iframe.style.top = `${rect.top}px`;
                iframe.style.width = `${rect.width}px`;
                iframe.style.height = `${rect.height}px`;
            }
        }
        
        // Show loading overlay on top of the iframe (attached to body so it escapes the modal z-index)
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'star-view-loading';
        loadingOverlay.style.position = 'fixed';
        loadingOverlay.style.zIndex = '9999995'; // Higher than the iframe
        if (iframe) {
            loadingOverlay.style.left = iframe.style.left;
            loadingOverlay.style.top = iframe.style.top;
            loadingOverlay.style.width = iframe.style.width;
            loadingOverlay.style.height = iframe.style.height;
        }
        
        const loadingText = loadingOverlay.createEl('span', { cls: 'star-view-loading-text', text: 'Stars are loading up' });
        loadingOverlay.createEl('span', { cls: 'star-view-loading-dots' });
        document.body.appendChild(loadingOverlay);
        
        // Fade out loading overlay after 5 seconds
        this.loadingTimer = setTimeout(() => {
            loadingOverlay.addClass('fade-out');
            setTimeout(() => {
                loadingOverlay.remove();
            }, 600);
        }, 5000);
        
        // Create a custom close button since the iframe covers the modal's native one
        const closeBtn = document.createElement('div');
        closeBtn.className = 'star-view-close-button';
        closeBtn.innerHTML = '✕'; // 'X' mark
        closeBtn.onclick = () => this.close();
        
        if (iframe) {
            const rootSplit = (this.app.workspace as any).rootSplit;
            if (rootSplit && rootSplit.containerEl) {
                const rect = rootSplit.containerEl.getBoundingClientRect();
                closeBtn.style.top = `${rect.top + 15}px`;
                closeBtn.style.left = `${rect.right - 45}px`;
            }
        }
        document.body.appendChild(closeBtn);
        this.plugin.closeButton = closeBtn;

        // Show a warning if the user hasn't set their coordinates
        if (!this.plugin.settings.latitude || !this.plugin.settings.longitude) {
            const warningOverlay = document.createElement('div');
            warningOverlay.className = 'star-view-warning';
            warningOverlay.innerHTML = `
                <div class="star-view-warning-content">
                    <h3>⚠️ Persistent Cache is Disabled in Obsidian</h3>
                    <p>Obsidian's security sandbox automatically wipes this window's cache every time you restart the app.</p>
                    <p>To permanently lock in your location, you <b>must</b> go to <strong>Obsidian Settings &rarr; Star View</strong> and manually enter your Latitude and Longitude.</p>
                    <button id="star-view-dismiss-warning">Got it</button>
                </div>
            `;
            
            if (iframe) {
                warningOverlay.style.left = iframe.style.left;
                warningOverlay.style.top = iframe.style.top;
                warningOverlay.style.width = iframe.style.width;
                warningOverlay.style.height = iframe.style.height;
            }
            
            document.body.appendChild(warningOverlay);
            
            document.getElementById('star-view-dismiss-warning')?.addEventListener('click', () => {
                warningOverlay.remove();
            });
            
            // Store it to remove later if needed
            (this as any).warningOverlay = warningOverlay;
        }
    }

    onClose() {
        this.plugin.isModalOpen = false;
        
        if (this.plugin.iconContainer) {
            this.plugin.checkIconVisibility();
        }
        
        // Clear the loading timer if still running
        if (this.loadingTimer) {
            clearTimeout(this.loadingTimer);
            this.loadingTimer = null;
        }
        
        // Hide iframe offscreen instead of destroying or reparenting it
        const iframe = this.plugin.stellariumIframe;
        if (iframe) {
            iframe.style.left = '-9999px';
            iframe.style.width = '1px';
            iframe.style.height = '1px';
        }
        
        if (this.plugin.closeButton) {
            this.plugin.closeButton.remove();
            this.plugin.closeButton = null;
        }
        
        if ((this as any).warningOverlay) {
            (this as any).warningOverlay.remove();
            (this as any).warningOverlay = null;
        }
        
        const { contentEl } = this;
        contentEl.empty();
    }
}

class StarViewSettingTab extends PluginSettingTab {
    plugin: StarViewPlugin;

    constructor(app: App, plugin: StarViewPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;
        containerEl.empty();

        containerEl.createEl('h2', {text: 'Star View Settings'});
        containerEl.createEl('p', {text: 'By default, Stellarium attempts to use your IP address for location. Enter your Latitude and Longitude here to bypass autolocation and hardcode your position.'});

        new Setting(containerEl)
            .setName('Latitude')
            .setDesc('Enter your latitude (e.g. 40.7128 for New York, -33.8688 for Sydney)')
            .addText(text => text
                .setPlaceholder('Latitude')
                .setValue(this.plugin.settings.latitude)
                .onChange(async (value) => {
                    this.plugin.settings.latitude = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Longitude')
            .setDesc('Enter your longitude (e.g. -74.0060 for New York, 151.2093 for Sydney)')
            .addText(text => text
                .setPlaceholder('Longitude')
                .setValue(this.plugin.settings.longitude)
                .onChange(async (value) => {
                    this.plugin.settings.longitude = value;
                    await this.plugin.saveSettings();
                }));
    }
}
