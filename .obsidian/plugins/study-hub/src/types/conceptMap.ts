export type MasteryStatus = 'not-started' | 'in-progress' | 'mastered';

export type NodeType = 'root' | 'unit' | 'concept' | 'subconcept';

export type ConceptMapMode = 'orbital' | 'tree' | 'constellation';

export interface ConceptNode {
    id: string;
    name: string;
    description?: string;
    unit?: string;
    type: NodeType;
    status: MasteryStatus;
    courseId: string;
    filePath?: string;
    prerequisites?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    tags?: string[];
    customPosition?: { x: number; y: number; z: number };
    // Simulation / Rendering runtime properties
    x?: number;
    y?: number;
    z?: number;
    vx?: number;
    vy?: number;
    vz?: number;
    color?: string;
    val?: number;
}

export interface ConceptLink {
    id?: string;
    source: string | ConceptNode;
    target: string | ConceptNode;
    type?: 'prerequisite' | 'parent-child' | 'related';
    label?: string;
}

export interface ConceptGraphData {
    nodes: ConceptNode[];
    links: ConceptLink[];
}

export interface SyllabusUnit {
    name: string;
    color?: string;
    concepts: {
        id?: string;
        name: string;
        description?: string;
        difficulty?: 'easy' | 'medium' | 'hard';
        subconcepts?: string[];
        prerequisites?: string[];
        tags?: string[];
    }[];
}

export interface SyllabusTemplate {
    courseId: string;
    courseName: string;
    icon?: string;
    units: SyllabusUnit[];
}
