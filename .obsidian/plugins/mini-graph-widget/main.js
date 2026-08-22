const obsidian = require('obsidian');

// This plugin's functionality is now integrated into the Welcome Widget sidebar dashboard.
// Keeping this as a no-op to avoid errors if still enabled.

class MiniGraphWidgetPlugin extends obsidian.Plugin {
    async onload() {
        console.log('Mini Graph Widget: Now integrated into the Welcome Widget sidebar dashboard.');
    }

    onunload() {}
}

module.exports = MiniGraphWidgetPlugin;
