const obsidian = require('obsidian');

const VIEW_TYPE_WELCOME_WIDGET = 'welcome-widget-view';

class WelcomeWidgetView extends obsidian.ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
        this.graphLeaf = null;
    }

    getViewType() {
        return VIEW_TYPE_WELCOME_WIDGET;
    }

    getDisplayText() {
        return 'Dashboard';
    }

    getIcon() {
        return 'layout-dashboard';
    }

    async onOpen() {
        const container = this.contentEl;
        container.empty();
        container.addClass('sidebar-dashboard-root');

        // ── Section 1: Welcome Widget (WatchLog Media) ──
        const welcomeSection = container.createDiv({ cls: 'welcome-widget-container' });

        const booksSection = welcomeSection.createDiv({ cls: 'welcome-widget-section' });
        const booksTitle = booksSection.createDiv({ cls: 'welcome-widget-section-title' });
        booksTitle.innerText = 'Currently Reading Books';
        const booksGrid = booksSection.createDiv({ cls: 'welcome-widget-grid' });

        const showsSection = welcomeSection.createDiv({ cls: 'welcome-widget-section' });
        const showsTitle = showsSection.createDiv({ cls: 'welcome-widget-section-title' });
        showsTitle.innerText = 'Currently Watching Shows';
        const showsGrid = showsSection.createDiv({ cls: 'welcome-widget-grid' });

        await this.populateWatchlogData(booksGrid, showsGrid);

        // ── Section 2: Hub Links (Tube Buttons) ──
        const hubSection = container.createDiv({ cls: 'hub-links-widget-container' });

        const btn1 = this.createTubeButton('Productivity Hub', () => {
            this.app.commands.executeCommandById('productivity-hub:open-productivity-hub');
        });

        const btn2 = this.createTubeButton('Study Hub', () => {
            this.app.commands.executeCommandById('study-hub:open-study-hub');
        });

        const btn3 = this.createSplitTubeButton('Visual Hub',
            () => {
                this.app.commands.executeCommandById('canvas:new-file');
            },
            () => {
                this.app.commands.executeCommandById('obsidian-excalidraw-plugin:excalidraw-autocreate');
            }
        );

        const btn4 = this.createTubeButton('Fitness Hub', () => {
            // Functionality to be added later
        });

        hubSection.appendChild(btn1);
        hubSection.appendChild(btn2);
        hubSection.appendChild(btn3);
        hubSection.appendChild(btn4);

        // ── Section 3: ObsidianBookLm (NotebookLM Card) ──
        const booklmContainer = container.createDiv({ cls: 'notebooklm-widget-container' });
        
        const booklmCard = booklmContainer.createDiv({ cls: 'notebooklm-widget-card' });
        
        const booklmHeader = booklmCard.createDiv({ cls: 'notebooklm-header' });
        const booklmBadge = booklmHeader.createDiv({ cls: 'notebooklm-badge' });
        booklmBadge.innerText = 'AI Research';
        const booklmDot = booklmHeader.createDiv({ cls: 'notebooklm-dot' });

        const booklmContent = booklmCard.createDiv({ cls: 'notebooklm-body' });
        const booklmTitle = booklmContent.createDiv({ cls: 'notebooklm-title' });
        booklmTitle.innerText = 'NotebookLM';
        const booklmSubtitle = booklmContent.createDiv({ cls: 'notebooklm-subtitle' });
        booklmSubtitle.innerText = 'Launch Notebook & Audio Overview';

        booklmCard.addEventListener('click', () => {
            if (this.app.commands.commands['obsidian-booklm:open-notebooklm']) {
                this.app.commands.executeCommandById('obsidian-booklm:open-notebooklm');
            } else if (this.app.plugins.plugins['obsidian-booklm']) {
                this.app.plugins.plugins['obsidian-booklm'].openNotebookLm();
            } else {
                window.open('https://notebooklm.google.com', '_blank');
            }
        });
    }

    async onClose() {
        if (this.graphLeaf) {
            this.graphLeaf.detach();
            this.graphLeaf = null;
        }
        this.contentEl.empty();
    }

    // ── WatchLog Data ──
    async populateWatchlogData(booksGrid, showsGrid) {
        let watchlogData = null;
        try {
            const dataRaw = await this.app.vault.adapter.read('.obsidian/plugins/watchlog/data.json');
            watchlogData = JSON.parse(dataRaw);
        } catch (e) {
            console.error("Welcome Widget: Failed to read watchlog data.json", e);
        }

        if (!watchlogData) {
            booksGrid.innerHTML = '<div class="welcome-widget-empty-text">Watchlog data.json could not be read.</div>';
            showsGrid.innerHTML = '<div class="welcome-widget-empty-text">Watchlog data.json could not be read.</div>';
            return;
        }

        // Books (Reading)
        let booksHtml = '';
        if (watchlogData.reading && watchlogData.reading.books) {
            const readingBooks = watchlogData.reading.books.filter(b => b.status && b.status.toLowerCase().includes('reading'));
            if (readingBooks.length > 0) {
                readingBooks.forEach(b => {
                    const cover = b.coverUrl || '';
                    if (cover) {
                        booksHtml += `<img class="welcome-widget-cover welcome-widget-book-cover" src="${cover}" />`;
                    }
                });
            }
        }
        if (!booksHtml) {
            booksHtml = '<div class="welcome-widget-empty-text">No books currently being read.</div>';
        }
        booksGrid.innerHTML = booksHtml;

        booksGrid.querySelectorAll('.welcome-widget-book-cover').forEach(el => {
            el.addEventListener('click', () => {
                if (window.app && window.app.plugins && window.app.plugins.plugins.watchlog) {
                    window.app.plugins.plugins.watchlog.activateView('reading');
                }
            });
        });

        // Shows (Watching)
        let showsHtml = '';
        if (watchlogData.titles) {
            const watchingShows = Object.values(watchlogData.titles).filter(t => t.status && t.status.toLowerCase().includes('watching'));
            if (watchingShows.length > 0) {
                watchingShows.forEach(t => {
                    const poster = t.posterUrl || '';
                    if (poster) {
                        showsHtml += `<img class="welcome-widget-cover welcome-widget-show-cover" src="${poster}" />`;
                    }
                });
            }
        }
        if (!showsHtml) {
            showsHtml = '<div class="welcome-widget-empty-text">No shows currently being watched.</div>';
        }
        showsGrid.innerHTML = showsHtml;

        showsGrid.querySelectorAll('.welcome-widget-show-cover').forEach(el => {
            el.addEventListener('click', () => {
                if (window.app && window.app.plugins && window.app.plugins.plugins.watchlog) {
                    window.app.plugins.plugins.watchlog.activateView('watchlist');
                }
            });
        });
    }

    // ── Tube Buttons ──
    createTubeButton(text, onClick) {
        const wrapper = document.createElement('div');
        wrapper.className = 'tube-button-wrapper';

        const btn = document.createElement('div');
        btn.className = 'tube-button';

        const leftCircle = document.createElement('div');
        leftCircle.className = 'tube-circle-left';
        const rightCircle = document.createElement('div');
        rightCircle.className = 'tube-circle-right';

        const textSpan = document.createElement('span');
        textSpan.className = 'tube-text';
        textSpan.innerText = text;

        btn.appendChild(leftCircle);
        btn.appendChild(textSpan);
        btn.appendChild(rightCircle);
        wrapper.appendChild(btn);

        wrapper.addEventListener('click', onClick);
        return wrapper;
    }

    createSplitTubeButton(text, onLeftClick, onRightClick) {
        const wrapper = document.createElement('div');
        wrapper.className = 'tube-button-wrapper';

        const btn = document.createElement('div');
        btn.className = 'tube-button';

        const leftCircle = document.createElement('div');
        leftCircle.className = 'tube-circle-left';
        const rightCircle = document.createElement('div');
        rightCircle.className = 'tube-circle-right';

        const textSpan = document.createElement('span');
        textSpan.className = 'tube-text';
        textSpan.innerText = text;

        btn.appendChild(leftCircle);
        btn.appendChild(textSpan);
        btn.appendChild(rightCircle);
        wrapper.appendChild(btn);

        const leftBox = document.createElement('div');
        leftBox.style.position = 'absolute';
        leftBox.style.left = '0';
        leftBox.style.top = '0';
        leftBox.style.width = '50%';
        leftBox.style.height = '100%';
        leftBox.style.zIndex = '20';
        leftBox.addEventListener('click', onLeftClick);

        const rightBox = document.createElement('div');
        rightBox.style.position = 'absolute';
        rightBox.style.right = '0';
        rightBox.style.top = '0';
        rightBox.style.width = '50%';
        rightBox.style.height = '100%';
        rightBox.style.zIndex = '20';
        rightBox.addEventListener('click', onRightClick);

        wrapper.appendChild(leftBox);
        wrapper.appendChild(rightBox);

        return wrapper;
    }

    // ── Mini Graph ──
    async injectGraph(widget) {
        try {
            const activeLeaf = this.app.workspace.getLeaf(false);
            const LeafConstructor = Object.getPrototypeOf(activeLeaf).constructor;
            this.graphLeaf = new LeafConstructor(this.app);

            await this.graphLeaf.setViewState({ type: 'graph' });

            const graphEl = this.graphLeaf.view.containerEl;

            const header = graphEl.querySelector('.view-header');
            if (header) header.style.display = 'none';

            setTimeout(() => {
                if (this.graphLeaf && this.graphLeaf.view && this.graphLeaf.view.dataEngine) {
                    const pgPlugin = this.app.plugins.plugins['persistent-graph'];
                    if (pgPlugin && pgPlugin.graphManager) {
                        try {
                            console.log('Activating persistent-graph in mini widget');
                            const data = pgPlugin.graphManager.getGraphData();
                            pgPlugin.graphManager.restoreGraphData(data, this.graphLeaf);
                        } catch (err) {
                            console.error('Failed to restore persistent graph nodes:', err);
                        }
                    }

                    setTimeout(() => {
                        if (this.graphLeaf && this.graphLeaf.view && this.graphLeaf.view.dataEngine) {
                            const options = this.graphLeaf.view.dataEngine.getOptions();
                            options.scale = 0.017;
                            this.graphLeaf.view.dataEngine.setOptions(options);

                            if (this.graphLeaf.view.renderer && this.graphLeaf.view.renderer.worker) {
                                this.graphLeaf.view.renderer.worker.postMessage({
                                    run: true,
                                    alpha: 1,
                                    scale: 0.017
                                });
                            }
                        }
                    }, 100);
                }
            }, 1000);

            widget.appendChild(graphEl);
        } catch (e) {
            console.error("Failed to inject native graph", e);
            widget.innerHTML = '<div style="color: #a1a1aa; font-family: monospace; font-size: 11px; text-align: center; padding: 20px;">Graph could not be loaded.</div>';
        }
    }
}

class WelcomeWidgetPlugin extends obsidian.Plugin {
    async onload() {
        console.log('Loading Sidebar Dashboard plugin');

        this.registerView(
            VIEW_TYPE_WELCOME_WIDGET,
            (leaf) => new WelcomeWidgetView(leaf, this)
        );

        this.addCommand({
            id: 'open-dashboard',
            name: 'Open Dashboard',
            callback: () => {
                this.activateView();
            }
        });

        this.app.workspace.onLayoutReady(() => {
            // Clean up any ghost tabs from the previous separated sidebar view
            this.app.workspace.detachLeavesOfType('hub-links-widget-view');
            this.app.workspace.detachLeavesOfType('mini-graph-widget-view');
            
            // Remove the default core plugin tabs from the sidebar to leave only the Dashboard
            this.app.workspace.detachLeavesOfType('backlink');
            this.app.workspace.detachLeavesOfType('outgoing-link');
            this.app.workspace.detachLeavesOfType('tag');
            this.app.workspace.detachLeavesOfType('outline');
            
            this.activateView();
        });
    }

    onunload() {
        console.log('Unloading Sidebar Dashboard plugin');
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_WELCOME_WIDGET);
    }

    async activateView() {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_WELCOME_WIDGET);
        if (leaves.length > 0) {
            this.app.workspace.revealLeaf(leaves[0]);
            return;
        }

        const leaf = this.app.workspace.getRightLeaf(false);
        if (leaf) {
            await leaf.setViewState({
                type: VIEW_TYPE_WELCOME_WIDGET,
                active: true,
            });
            this.app.workspace.revealLeaf(leaf);
        }
    }
}

module.exports = WelcomeWidgetPlugin;
