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
    [class*="source"],
    [class*="chat"],
    [class*="studio"],
    [class*="notebook"],
    [class*="tab-body"],
    [class*="tab-content"],
    [class*="panel"],
    [class*="drawer"],
    [class*="layout"],
    [class*="view"],
    main, 
    section,
    article,
    mat-drawer-container, 
    mat-drawer-content, 
    mat-sidenav-container, 
    mat-sidenav-content,
    mat-tab-body,
    mat-tab-group,
    .mat-mdc-tab-body-wrapper,
    .mat-mdc-tab-body-content,
    .mat-drawer-container, 
    .mat-drawer-content,
    .mat-sidenav-container, 
    .mat-sidenav-content {
        background: #000000 !important;
        background-color: #000000 !important;
    }

    /* All Header, Toolbar, Nav, App Bar, Tab Strips, and Sub-headers */
    header, 
    nav, 
    mat-toolbar,
    mat-toolbar-row,
    .mat-toolbar,
    .mat-toolbar-row,
    .mat-toolbar.mat-primary,
    .mat-toolbar-single-row,
    mat-tab-header,
    .mat-mdc-tab-header,
    .top-app-bar, 
    .app-header, 
    [role="banner"],
    [role="tablist"],
    [role="navigation"],
    [class*="header"],
    [class*="toolbar"],
    [class*="app-bar"],
    [class*="top-bar"],
    [class*="navbar"],
    [class*="navigation"],
    [class*="tab-header"],
    [class*="tab-bar"],
    [class*="tab-nav"],
    [class*="subheader"],
    [class*="sub-header"],
    [class*="action-bar"],
    app-header,
    header-component,
    top-bar-component,
    navigation-bar {
        background: #000000 !important;
        background-color: #000000 !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
    }

    /* Hide Google Gemini Notebook SVG Logo image */
    labs-tailwind-logo img,
    img[alt*="Notebook Logo"],
    img[src*="notebook-logo.svg"] {
        display: none !important;
    }

    .obsidian-notebook-custom-logo {
        display: inline-flex !important;
        align-items: center !important;
        gap: 10px !important;
        user-select: none !important;
        cursor: pointer !important;
        text-decoration: none !important;
    }

    .obsidian-notebook-custom-logo span {
        font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        font-size: 19px !important;
        font-weight: 600 !important;
        color: #ffffff !important;
        letter-spacing: -0.3px !important;
    }

    /* Notebook Cards in Dashboard */
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

    /* Studio Action Cards, Option Tiles, and Banner */
    [class*="studio-card"],
    [class*="action-card"],
    [class*="card-grid"] > *,
    [class*="grid"] > button,
    [class*="grid"] > div,
    [class*="tile"],
    [class*="studio-tile"],
    [class*="option-card"],
    [class*="banner"],
    [class*="language-selector"],
    [class*="audio-overview-banner"] {
        background: #06090e !important;
        background-color: #06090e !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 14px !important;
    }

    [class*="studio-card"]:hover,
    [class*="action-card"]:hover,
    [class*="grid"] > button:hover,
    [class*="tile"]:hover,
    [class*="option-card"]:hover {
        background: #0f172a !important;
        background-color: #0f172a !important;
        border-color: rgba(56, 189, 248, 0.35) !important;
    }

    /* Sources Search Box, Chat Query Box & Footer Composer */
    [class*="search-web"],
    [class*="search-box"],
    [class*="search-bar"],
    [class*="query-box"],
    [class*="query-container"],
    [class*="chat-input"],
    [class*="prompt-box"],
    [class*="composer"],
    [class*="bottom-container"],
    [class*="bottom-bar"],
    [class*="footer"],
    footer,
    form {
        background: #000000 !important;
        background-color: #000000 !important;
    }

    /* Input wrappers inside Search and Chat */
    [class*="search-box"] > div,
    [class*="search-bar"] > div,
    [class*="query-container"] > div,
    [class*="chat-input"] > div,
    [class*="composer"] > div,
    [class*="input-wrapper"],
    textarea,
    input {
        background: #06090e !important;
        background-color: #06090e !important;
        border: 1px solid rgba(255, 255, 255, 0.14) !important;
        color: #f8fafc !important;
        border-radius: 12px !important;
    }

    /* Prompt suggestion chips & buttons in Chat & Sources */
    [class*="prompt-button"],
    [class*="prompt-chip"],
    [class*="suggestion"],
    [class*="chip"],
    [class*="pill"],
    mat-chip,
    .mat-mdc-chip,
    button[class*="pill"],
    button[class*="chip"] {
        background: #06090e !important;
        background-color: #06090e !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        color: #e2e8f0 !important;
    }

    [class*="prompt-button"]:hover,
    [class*="prompt-chip"]:hover,
    [class*="suggestion"]:hover,
    button[class*="pill"]:hover {
        background: #0f172a !important;
        background-color: #0f172a !important;
        border-color: rgba(56, 189, 248, 0.4) !important;
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

        // Apply AMOLED Theme & text renaming immediately upon opening
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
                        
                        // Header elements
                        const headerElements = document.querySelectorAll('header, nav, mat-toolbar, mat-toolbar-row, .mat-toolbar, .mat-toolbar-row, [role="banner"], [class*="header"], [class*="top-bar"], [class*="app-bar"], [class*="navbar"], [class*="toolbar"], app-header, header-component');
                        headerElements.forEach(el => {
                            el.style.setProperty('background', '#000000', 'important');
                            el.style.setProperty('background-color', '#000000', 'important');
                            el.style.setProperty('border-bottom', '1px solid rgba(255, 255, 255, 0.08)', 'important');
                        });

                        // Sub-header, tab-header, chat action strips, footer composer
                        const subBars = document.querySelectorAll('mat-tab-header, .mat-mdc-tab-header, [role="tablist"], [class*="tab-header"], [class*="sub-header"], [class*="subheader"], [class*="action-bar"], footer, [class*="footer"], [class*="bottom-bar"], [class*="bottom-container"], [class*="composer"]');
                        subBars.forEach(el => {
                            el.style.setProperty('background', '#000000', 'important');
                            el.style.setProperty('background-color', '#000000', 'important');
                        });

                        // Studio cards & banner
                        const studioCards = document.querySelectorAll('[class*="studio-card"], [class*="action-card"], [class*="banner"], [class*="language-selector"]');
                        studioCards.forEach(el => {
                            el.style.setProperty('background', '#06090e', 'important');
                            el.style.setProperty('background-color', '#06090e', 'important');
                            el.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.1)', 'important');
                        });
                    };

                    const replaceLogoWithObsidian = () => {
                        try {
                            const logoElements = document.querySelectorAll('labs-tailwind-logo, img[alt*="Notebook Logo"], img[src*="notebook-logo.svg"]');
                            logoElements.forEach(container => {
                                const parent = container.tagName.toLowerCase() === 'img' ? container.parentElement : container;
                                if (parent && !parent.querySelector('.obsidian-notebook-custom-logo')) {
                                    const img = parent.querySelector('img');
                                    if (img) {
                                        img.style.setProperty('display', 'none', 'important');
                                    }
                                    
                                    const customLogo = document.createElement('div');
                                    customLogo.className = 'obsidian-notebook-custom-logo';
                                    customLogo.style.display = 'inline-flex';
                                    customLogo.style.alignItems = 'center';
                                    customLogo.style.gap = '10px';
                                    customLogo.style.userSelect = 'none';
                                    customLogo.style.cursor = 'pointer';

                                    customLogo.innerHTML = \`
                                        <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 6px rgba(168, 85, 247, 0.6));">
                                            <polygon points="50,5 88,25 70,85 50,95 30,85 12,25" fill="#1e1b4b" stroke="#a855f7" stroke-width="6" stroke-linejoin="round"/>
                                            <polygon points="50,5 70,85 50,95" fill="#6b21a8" />
                                            <polygon points="50,5 30,85 50,95" fill="#7c3aed" />
                                            <polygon points="50,5 88,25 70,85" fill="#9333ea" />
                                            <polygon points="50,5 12,25 30,85" fill="#a855f7" />
                                        </svg>
                                        <span style="font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 19px; font-weight: 600; color: #ffffff; letter-spacing: -0.3px;">Obsidian Notebook</span>
                                    \`;
                                    parent.appendChild(customLogo);
                                }
                            });

                            // Text replacements in disclaimers and footer
                            const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT, null, false);
                            let node;
                            while (node = walker.nextNode()) {
                                if (node.nodeValue && node.nodeValue.includes('Gemini')) {
                                    node.nodeValue = node.nodeValue.replace(/Gemini Notebook/g, 'Obsidian Notebook').replace(/Gemini/g, 'Obsidian');
                                }
                            }

                            if (document.title && (document.title.includes('Gemini') || document.title.includes('NotebookLM'))) {
                                document.title = document.title.replace(/Gemini Notebook|NotebookLM/g, 'Obsidian Notebook');
                            }
                        } catch (e) {
                            console.error('Logo replacement error:', e);
                        }
                    };

                    makePureBlack();
                    replaceLogoWithObsidian();

                    if (!window.__obsidianAmoledObserver) {
                        window.__obsidianAmoledObserver = new MutationObserver(() => {
                            makePureBlack();
                            replaceLogoWithObsidian();
                        });
                        window.__obsidianAmoledObserver.observe(document.body || document.documentElement, {
                            childList: true,
                            subtree: true,
                            characterData: true,
                            attributes: true,
                            attributeFilter: ['class', 'style', 'src']
                        });
                    }
                })();
            `;
            webview.executeJavaScript(jsCode);
        } catch (err) {
            console.error('Failed to inject AMOLED theme & logo replacement:', err);
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
