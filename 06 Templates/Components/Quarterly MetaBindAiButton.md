`BUTTON[generate-quarterly-summary, generate-quarterly-alias]`
```meta-bind-button
id: generate-quarterly-summary
style: primary
label:  Generate Summary
hidden: true
actions:
  - type: command
    command: templater-obsidian:<%* tR += window?.timeGarden?.rootPath.substring(1); _%>06 Templates/Components/Quarterly AI Summarize.md
```
```meta-bind-button
id: generate-quarterly-alias
style: primary
label: 🏷️ Generate Alias
hidden: true
actions:
  - type: command
    command: templater-obsidian:<%* tR += window?.timeGarden?.rootPath.substring(1); _%>06 Templates/Components/Quarterly AI Alias.md
```