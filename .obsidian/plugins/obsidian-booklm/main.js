const obsidian = require('obsidian');

const NOTEBOOKLM_URL = 'https://notebooklm.google.com';
// Firefox desktop user-agent bypasses Google's Chromium-internal checks that block embedded Electron logins
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0';

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
        }, 3000);

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
            } catch (err) {
                console.error('NotebookLM webview dom-ready setup error:', err);
            }
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
