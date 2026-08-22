`BUTTON[generate-weekly-summary, generate-weekly-alias]`
```meta-bind-button
id: generate-weekly-summary
style: primary
class: phone-responsive
label:  Generate Summary
hidden: true
actions:
  - type: command
    command: templater-obsidian:<%* tR += window?.timeGarden?.rootPath.substring(1); _%>06 Templates/Components/Weekly AI Summarize.md
```
```meta-bind-button
id: generate-weekly-alias
style: primary
class: phone-responsive
label: 🏷️ Generate Alias
hidden: true
actions:
  - type: command
    command: templater-obsidian:<%* tR += window?.timeGarden?.rootPath.substring(1); _%>06 Templates/Components/Weekly AI Alias.md
```