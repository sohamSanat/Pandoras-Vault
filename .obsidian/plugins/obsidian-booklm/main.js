const obsidian = require('obsidian');

const NOTEBOOKLM_URL = 'https://notebooklm.google.com';
// Firefox desktop user-agent bypasses Google's Chromium-internal checks that block embedded Electron logins
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0';

const AMOLED_CSS = `
    :root {
        --mat-app-background-color: #000000 !important;
        --mat-toolbar-container-background-color: #000000 !important;
        --mat-app-bar-container-background-color: #000000 !important;
        --mdc-top-app-bar-container-color: #000000 !important;
        --mat-sys-surface: #000000 !important;
        --mat-sys-surface-container: #000000 !important;
        --mat-sys-surface-container-high: #000000 !important;
        --mat-sys-surface-container-highest: #000000 !important;
        --mat-sys-surface-container-low: #000000 !important;
        --mat-sys-surface-container-lowest: #000000 !important;
        --mat-sys-surface-dim: #000000 !important;
        --mat-sys-background: #000000 !important;
        --mdc-theme-background: #000000 !important;
        --mdc-theme-surface: #000000 !important;
        --mdc-dialog-container-color: #0c1017 !important;
        background: #000000 !important;
        background-color: #000000 !important;
    }

    html, body, 
    [class*="app-container"], 
    [class*="main-container"], 
    [class*="content-container"],
    [class*="page-container"],
    [class*="root-container"],
    main, 
    mat-drawer-container, 
    mat-drawer-content, 
    mat-sidenav-container, 
    mat-sidenav-content,
    .mat-drawer-container, 
    .mat-drawer-content,
    .mat-sidenav-container, 
    .mat-sidenav-content {
        background: #000000 !important;
        background-color: #000000 !important;
    }

    /* All Header, Toolbar, Nav, and App Bar containers */
    header, 
    nav, 
    mat-toolbar,
    mat-toolbar-row,
    .mat-toolbar,
    .mat-toolbar-row,
    .mat-toolbar.mat-primary,
    .mat-toolbar-single-row,
    .top-app-bar, 
    .app-header, 
    [role="banner"],
    [class*="header"],
    [class*="toolbar"],
    [class*="app-bar"],
    [class*="top-bar"],
    [class*="navbar"],
    [class*="navigation"],
    app-header,
    header-component,
    top-bar-component,
    navigation-bar {
        background: #000000 !important;
        background-color: #000000 !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
    }

    .notebook-card, 
    [class*="notebook-card"], 
    .create-card, 
    .notebook-item,
    [class*="project-card"],
    mat-card {
        background: #0a0e17 !important;
        background-color: #0a0e17 !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 16px !important;
    }

    .notebook-card:hover, 
    [class*="notebook-card"]:hover, 
    .create-card:hover,
    mat-card:hover {
        background: #121824 !important;
        background-color: #121824 !important;
        border-color: rgba(56, 189, 248, 0.35) !important;
    }

    [class*="source-panel"], 
    [class*="studio-panel"], 
    [class*="chat-panel"], 
    [class*="panel-container"],
    [class*="sources-container"],
    [class*="chat-container"],
    [class*="notes-container"],
    [class*="studio-container"],
    [class*="drawer"] {
        background: #000000 !important;
        background-color: #000000 !important;
        border-color: rgba(255, 255, 255, 0.08) !important;
    }

    textarea, 
    input, 
    [class*="chat-input"],
    [class*="query-input"],
    [class*="search-box"],
    [class*="input-container"] {
        background: #0a0e17 !important;
        background-color: #0a0e17 !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        color: #f8fafc !important;
    }

    mat-dialog-container, 
    [role="dialog"], 
    .mat-mdc-menu-panel, 
    .mat-menu-panel,
    [class*="menu-panel"],
    [class*="popup"],
    [class*="dialog"] {
        background: #0c1017 !important;
        background-color: #0c1017 !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.8) !important;
    }

    ::-webkit-scrollbar {
        width: 6px !important;
        height: 6px !important;
    }
    ::-webkit-scrollbar-track {
        background: #000000 !important;
    }
    ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.18) !important;
        border-radius: 4px !important;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: rgba(56, 189, 248, 0.5) !important;
    }
`;

class ObsidianBookLmModal extends obsidian.Modal {
    constructor(app, plugin) {
        super(app);
        this.plugin = plugin;
        this.loadingTimer = null;
        this.resizeHandler = null;
    }

    onOpen() {
        this.plugin.isModalOpen = true;
        const { contentEl, modalEl } = this;
        const bgEl = this.bgEl;

        // Hide full-screen dimmer so left & right sidebars remain accessible
        if (bgEl) {
            bgEl.style.display = 'none';
        }

        modalEl.addClass('mod-obsidian-booklm');

        const updatePosition = () => {
            const rootSplit = this.app.workspace.rootSplit;
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

                const webview = this.plugin.notebookIframe;
                if (webview) {
                    webview.style.left = `${rect.left}px`;
                    webview.style.top = `${rect.top}px`;
                    webview.style.width = `${rect.width}px`;
                    webview.style.height = `${rect.height}px`;
                }

                if (this.plugin.controlsBar) {
                    this.plugin.controlsBar.style.top = `${rect.top + 10}px`;
                    this.plugin.controlsBar.style.left = `${rect.right - 145}px`;
                }
            }
        };

        updatePosition();
        this.resizeHandler = () => updatePosition();
        window.addEventListener('resize', this.resizeHandler);

        contentEl.empty();
        contentEl.addClass('obsidian-booklm-content');

        // Apply AMOLED Theme immediately upon opening
        this.plugin.injectAmoledTheme();

        // Show dark loading screen that fades out
        const rootSplit = this.app.workspace.rootSplit;
        const rect = (rootSplit && rootSplit.containerEl) ? rootSplit.containerEl.getBoundingClientRect() : { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight, right: window.innerWidth };

        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'obsidian-booklm-loading';
        loadingOverlay.style.left = `${rect.left}px`;
        loadingOverlay.style.top = `${rect.top}px`;
        loadingOverlay.style.width = `${rect.width}px`;
        loadingOverlay.style.height = `${rect.height}px`;

        loadingOverlay.innerHTML = `
            <div class="obsidian-booklm-loading-badge">⚡ NotebookLM</div>
            <div class="obsidian-booklm-loading-text">Loading your research notebooks<span class="obsidian-booklm-loading-dots"></span></div>
        `;
        document.body.appendChild(loadingOverlay);

        this.loadingTimer = setTimeout(() => {
            loadingOverlay.addClass('fade-out');
            setTimeout(() => {
                loadingOverlay.remove();
            }, 600);
        }, 2500);

        // Floating controls bar: [ Back | Home | Reload | Close ]
        const controls = document.createElement('div');
        controls.className = 'obsidian-booklm-controls';
        controls.style.top = `${rect.top + 10}px`;
        controls.style.left = `${rect.right - 145}px`;

        // Back button
        const backBtn = document.createElement('div');
        backBtn.className = 'obsidian-booklm-ctrl-btn';
        backBtn.innerHTML = '←';
        backBtn.title = 'Back';
        backBtn.onclick = () => {
            const wv = this.plugin.notebookIframe;
            if (wv && wv.canGoBack && wv.canGoBack()) wv.goBack();
        };

        // Home button
        const homeBtn = document.createElement('div');
        homeBtn.className = 'obsidian-booklm-ctrl-btn';
        homeBtn.innerHTML = '⌂';
        homeBtn.title = 'NotebookLM Home';
        homeBtn.onclick = () => {
            const wv = this.plugin.notebookIframe;
            if (wv) wv.loadURL(NOTEBOOKLM_URL);
        };

        // Reload button
        const reloadBtn = document.createElement('div');
        reloadBtn.className = 'obsidian-booklm-ctrl-btn';
        reloadBtn.innerHTML = '↻';
        reloadBtn.title = 'Reload';
        reloadBtn.onclick = () => {
            const wv = this.plugin.notebookIframe;
            if (wv) wv.reload();
        };

        // Close button
        const closeBtn = document.createElement('div');
        closeBtn.className = 'obsidian-booklm-ctrl-btn btn-close';
        closeBtn.innerHTML = '✕';
        closeBtn.title = 'Close NotebookLM';
        closeBtn.onclick = () => this.close();

        controls.appendChild(backBtn);
        controls.appendChild(homeBtn);
        controls.appendChild(reloadBtn);
        controls.appendChild(closeBtn);

        document.body.appendChild(controls);
        this.plugin.controlsBar = controls;
    }

    onClose() {
        this.plugin.isModalOpen = false;

        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }

        if (this.loadingTimer) {
            clearTimeout(this.loadingTimer);
            this.loadingTimer = null;
        }

        const existingLoading = document.querySelector('.obsidian-booklm-loading');
        if (existingLoading) {
            existingLoading.remove();
        }

        if (this.plugin.controlsBar) {
            this.plugin.controlsBar.remove();
            this.plugin.controlsBar = null;
        }

        // Return webview to offscreen buffer so session stays active without reloading
        const webview = this.plugin.notebookIframe;
        if (webview) {
            webview.style.left = '-9999px';
            webview.style.top = '0px';
            webview.style.width = '1px';
            webview.style.height = '1px';
        }

        this.contentEl.empty();
    }
}

class ObsidianBookLmPlugin extends obsidian.Plugin {
    constructor() {
        super(...arguments);
        this.notebookIframe = null;
        this.controlsBar = null;
        this.isModalOpen = false;
    }

    async onload() {
        console.log('Loading ObsidianBookLm plugin');

        this.addCommand({
            id: 'open-notebooklm',
            name: 'Open NotebookLM',
            callback: () => {
                this.openNotebookLm();
            }
        });

        this.app.workspace.onLayoutReady(() => {
            this.createPersistentIframe();
        });
    }

    onunload() {
        console.log('Unloading ObsidianBookLm plugin');
        if (this.notebookIframe) {
            this.notebookIframe.remove();
            this.notebookIframe = null;
        }
        if (this.controlsBar) {
            this.controlsBar.remove();
            this.controlsBar = null;
        }
    }

    injectAmoledTheme() {
        if (!this.notebookIframe) return;
        const webview = this.notebookIframe;

        try {
            if (webview.insertCSS) {
                webview.insertCSS(AMOLED_CSS);
            }
            const jsCode = `
                (function() {
                    let style = document.getElementById('obsidian-amoled-theme');
                    if (!style) {
                        style = document.createElement('style');
                        style.id = 'obsidian-amoled-theme';
                        (document.head || document.documentElement).appendChild(style);
                    }
                    style.textContent = ${JSON.stringify(AMOLED_CSS)};
                    
                    const makePureBlack = () => {
                        document.documentElement.style.setProperty('background', '#000000', 'important');
                        document.documentElement.style.setProperty('background-color', '#000000', 'important');
                        if (document.body) {
                            document.body.style.setProperty('background', '#000000', 'important');
                            document.body.style.setProperty('background-color', '#000000', 'important');
                        }
                        
                        const headerElements = document.querySelectorAll('header, nav, mat-toolbar, mat-toolbar-row, .mat-toolbar, .mat-toolbar-row, [role="banner"], [class*="header"], [class*="top-bar"], [class*="app-bar"], [class*="navbar"], [class*="toolbar"], app-header, header-component');
                        headerElements.forEach(el => {
                            el.style.setProperty('background', '#000000', 'important');
                            el.style.setProperty('background-color', '#000000', 'important');
                            el.style.setProperty('border-bottom', '1px solid rgba(255, 255, 255, 0.08)', 'important');
                        });
                    };

                    makePureBlack();

                    if (!window.__obsidianAmoledObserver) {
                        window.__obsidianAmoledObserver = new MutationObserver(() => {
                            makePureBlack();
                        });
                        window.__obsidianAmoledObserver.observe(document.body || document.documentElement, {
                            childList: true,
                            subtree: true,
                            attributes: true,
                            attributeFilter: ['class', 'style']
                        });
                    }
                })();
            `;
            webview.executeJavaScript(jsCode);
        } catch (err) {
            console.error('Failed to inject AMOLED theme:', err);
        }
    }

    createPersistentIframe() {
        if (this.notebookIframe) return;

        // Use Electron's webview with dedicated partition so Google Login & Notebooks persist
        const webview = document.createElement('webview');
        webview.className = 'obsidian-booklm-iframe';
        webview.setAttribute('partition', 'persist:notebooklm');
        webview.setAttribute('allowfullscreen', 'true');
        webview.setAttribute('allowpopups', 'true');
        webview.setAttribute('nodeintegration', 'false');
        webview.setAttribute('nodeintegrationinsubframes', 'false');
        webview.setAttribute('plugins', 'true');
        webview.setAttribute('useragent', USER_AGENT);
        webview.setAttribute('src', NOTEBOOKLM_URL);

        // Keep offscreen initially
        webview.style.position = 'fixed';
        webview.style.left = '-9999px';
        webview.style.top = '0px';
        webview.style.width = '1px';
        webview.style.height = '1px';
        webview.style.zIndex = '9999990';
        webview.style.border = 'none';

        webview.addEventListener('dom-ready', () => {
            try {
                if (webview.setUserAgent) {
                    webview.setUserAgent(USER_AGENT);
                }
                webview.executeJavaScript(`
                    try {
                        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
                    } catch(e) {}
                `);
                this.injectAmoledTheme();
            } catch (err) {
                console.error('NotebookLM webview dom-ready setup error:', err);
            }
        });

        webview.addEventListener('did-navigate', () => {
            this.injectAmoledTheme();
        });

        webview.addEventListener('did-navigate-in-page', () => {
            this.injectAmoledTheme();
        });

        // Handle navigation and popups cleanly inside webview
        webview.addEventListener('new-window', (e) => {
            e.preventDefault();
            if (e.url && (e.url.includes('google.com') || e.url.includes('notebooklm.google.com') || e.url.includes('gstatic.com'))) {
                webview.loadURL(e.url);
            } else if (e.url) {
                window.open(e.url, '_blank');
            }
        });

        document.body.appendChild(webview);
        this.notebookIframe = webview;
    }

    openNotebookLm() {
        if (!this.notebookIframe) {
            this.createPersistentIframe();
        }
        new ObsidianBookLmModal(this.app, this).open();
    }
}

module.exports = ObsidianBookLmPlugin;
