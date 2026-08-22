import { ItemView, WorkspaceLeaf } from 'obsidian';
import { mount, unmount } from 'svelte';
import ConceptMap3D from '../components/concept/ConceptMap3D.svelte';
import { studyHubStore } from '../store';
import { get } from 'svelte/store';

export const VIEW_TYPE_CONCEPT_MAP = 'study-hub-concept-map';

export class ConceptMapView extends ItemView {
    private component: any;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return VIEW_TYPE_CONCEPT_MAP;
    }

    getDisplayText(): string {
        return '3D Concept Map';
    }

    getIcon(): string {
        return 'network';
    }

    async onOpen() {
        const store = get(studyHubStore);
        const defaultCourse = store.courses[0] || { id: 'dsa', title: 'Data Structures & Algorithms' };

        this.contentEl.empty();
        this.contentEl.style.padding = '0';
        this.contentEl.style.height = '100%';
        this.contentEl.style.overflow = 'hidden';

        this.component = mount(ConceptMap3D, {
            target: this.contentEl,
            props: {
                app: this.app,
                courseId: defaultCourse.id,
                courseTitle: defaultCourse.title
            }
        });
    }

    async onClose() {
        if (this.component) {
            unmount(this.component);
            this.component = null;
        }
    }
}
