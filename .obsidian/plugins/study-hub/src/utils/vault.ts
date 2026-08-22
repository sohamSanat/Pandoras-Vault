import { App, TFile, TFolder, normalizePath, Notice } from 'obsidian';

/**
 * Ensures that all directories in the given path exist in the vault.
 */
export async function ensureFolderExists(app: App, folderPath: string): Promise<void> {
    const normalized = normalizePath(folderPath);
    if (normalized === '' || normalized === '/') return;
    
    const parts = normalized.split('/');
    let currentPath = '';
    
    for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const exists = app.vault.getAbstractFileByPath(currentPath);
        if (!exists) {
            try {
                await app.vault.createFolder(currentPath);
            } catch (e) {
                // Folder might have been created concurrently, safely ignore
            }
        }
    }
}

/**
 * Creates a markdown file if it doesn't exist, and opens it in the active workspace.
 */
export async function openOrCreateNote(
    app: App,
    filePath: string,
    defaultContent: string = ''
): Promise<TFile | null> {
    const normalized = normalizePath(filePath.endsWith('.md') ? filePath : `${filePath}.md`);
    const parentFolder = normalized.substring(0, normalized.lastIndexOf('/'));
    
    if (parentFolder) {
        await ensureFolderExists(app, parentFolder);
    }
    
    let file = app.vault.getAbstractFileByPath(normalized);
    if (!file) {
        try {
            file = await app.vault.create(normalized, defaultContent);
            new Notice(`Created: ${normalized}`);
        } catch (e) {
            console.error('Failed to create file:', e);
            new Notice(`Failed to create note: ${e}`);
            return null;
        }
    }
    
    if (file instanceof TFile) {
        const leaf = app.workspace.getLeaf(false);
        await leaf.openFile(file);
        return file;
    }
    
    return null;
}

/**
 * Generates initial markdown template for a new Course
 */
export function getCourseTemplate(title: string): string {
    return `---
tags:
  - course
  - study-hub
course: "${title}"
created: "${new Date().toISOString().split('T')[0]}"
---

# 📚 ${title}

## 🎯 Overview & Objectives
- Course syllabus and description

## 📝 Lecture Notes
- [[Lecture 1]]

## 📌 Assignments & Tasks
- [ ] First assignment

## 📖 Key Resources
- Relevant textbooks, docs, or slide links
`;
}

/**
 * Generates initial markdown template for an Assignment
 */
export function getAssignmentTemplate(title: string, courseName: string, dueDate: string): string {
    return `---
tags:
  - assignment
  - study-hub
course: "${courseName}"
due_date: "${dueDate}"
status: "in-progress"
---

# 📝 Assignment: ${title}
**Course:** [[${courseName}]]
**Due Date:** ${dueDate}

## 📋 Requirements
- [ ] Task 1
- [ ] Task 2

## 💡 Notes & Progress
`;
}

/**
 * Generates initial markdown template for a Topic Note
 */
export function getNoteTemplate(title: string, courseName: string): string {
    return `---
tags:
  - note
  - lecture
  - study-hub
course: "${courseName}"
created: "${new Date().toISOString().split('T')[0]}"
---

# ✍️ ${title}
**Course:** [[${courseName}]]

## 📌 Key Concepts
- 

## 🔍 Detailed Notes
`;
}
