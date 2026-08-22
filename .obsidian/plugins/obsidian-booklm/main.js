const obsidian = require('obsidian');

const NOTEBOOKLM_URL = 'https://notebooklm.google.com';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

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

                if (this.plugin.closeButton) {
                    this.plugin.closeButton.style.top = `${rect.top + 12}px`;
                    this.plugin.closeButton.style.left = `${rect.right - 46}px`;
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

        // Floating close button
        const closeBtn = document.createElement('div');
        closeBtn.className = 'obsidian-booklm-close-button';
        closeBtn.innerHTML = '✕';
        closeBtn.title = 'Close NotebookLM';
        closeBtn.onclick = () => this.close();
        closeBtn.style.top = `${rect.top + 12}px`;
        closeBtn.style.left = `${rect.right - 46}px`;

        document.body.appendChild(closeBtn);
        this.plugin.closeButton = closeBtn;
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

        if (this.plugin.closeButton) {
            this.plugin.closeButton.remove();
            this.plugin.closeButton = null;
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
        this.closeButton = null;
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
        if (this.closeButton) {
            this.closeButton.remove();
            this.closeButton = null;
        }
    }

    createPersistentIframe() {
        if (this.notebookIframe) return;

        // Use Electron's webview with dedicated partition so Google Login & Notebooks persist
        const webview = document.createElement('webview');
        webview.className = 'obsidian-booklm-iframe';
        webview.setAttribute('partition', 'persist:notebooklm');
        webview.setAttribute('allowfullscreen', 'true');
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
