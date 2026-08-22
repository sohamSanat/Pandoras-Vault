import type { App, TFile, TFolder } from 'obsidian';
import type { ConceptGraphData, ConceptNode, ConceptLink } from '../types/conceptMap';
import { getSyllabusForCourse } from '../data/syllabusRoadmaps';

/**
 * Builds a complete 3D concept graph by scanning vault notes in the course folder
 * and merging them with the rich syllabus tree.
 */
export async function buildConceptGraph(
    app: App,
    courseId: string,
    courseTitle: string,
    folderPath?: string
): Promise<ConceptGraphData> {
    const nodes: ConceptNode[] = [];
    const links: ConceptLink[] = [];
    const nodeMap = new Map<string, ConceptNode>();

    // 1. Central Course Root Node
    const rootId = `root_${courseId}`;
    const rootNode: ConceptNode = {
        id: rootId,
        name: courseTitle,
        type: 'root',
        status: 'in-progress',
        courseId,
        difficulty: 'medium',
        val: 16
    };
    nodes.push(rootNode);
    nodeMap.set(rootId, rootNode);

    // 2. Fetch or generate syllabus template for this course
    const template = getSyllabusForCourse(courseId, courseTitle);

    // 3. Scan Obsidian Vault for real files in Course Folder
    const targetFolder = folderPath || `07 Notes/Courses/${courseTitle}`;
    const vaultFilesMap = new Map<string, { file: TFile; headings: string[]; outgoingLinks: string[] }>();

    try {
        const folder = app.vault.getAbstractFileByPath(targetFolder);
        if (folder && 'children' in folder) {
            const scanChildren = async (items: any[]) => {
                for (const item of items) {
                    if (item.extension === 'md') {
                        const file = item as TFile;
                        const content = await app.vault.cachedRead(file);
                        
                        // Extract headings
                        const headings: string[] = [];
                        const headingRegex = /^#{1,3}\s+(.+)$/gm;
                        let match;
                        while ((match = headingRegex.exec(content)) !== null) {
                            headings.push(match[1].trim());
                        }

                        // Extract internal wiki links [[Link]]
                        const outgoingLinks: string[] = [];
                        const linkRegex = /\[\[(.*?)\]\]/g;
                        let linkMatch;
                        while ((linkMatch = linkRegex.exec(content)) !== null) {
                            const linkText = linkMatch[1].split('|')[0].split('#')[0].trim();
                            outgoingLinks.push(linkText);
                        }

                        vaultFilesMap.set(file.basename.toLowerCase(), { file, headings, outgoingLinks });
                    } else if (item.children) {
                        await scanChildren(item.children);
                    }
                }
            };
            await scanChildren((folder as TFolder).children);
        }
    } catch (err) {
        console.warn(`[ConceptParser] Could not scan folder ${targetFolder}:`, err);
    }

    // 4. Construct Unit & Concept Nodes from Template & Vault
    template.units.forEach((unit, uIdx) => {
        const unitId = `unit_${courseId}_${uIdx}`;
        const unitNode: ConceptNode = {
            id: unitId,
            name: unit.name,
            type: 'unit',
            status: 'in-progress',
            courseId,
            val: 10
        };
        nodes.push(unitNode);
        nodeMap.set(unitId, unitNode);

        // Link Unit to Root
        links.push({
            source: rootId,
            target: unitId,
            type: 'parent-child'
        });

        // Add concepts for this unit
        unit.concepts.forEach((concept, cIdx) => {
            const conceptId = `concept_${courseId}_${uIdx}_${cIdx}`;
            
            // Check if user has an existing vault note for this concept
            const matchedVault = vaultFilesMap.get(concept.name.toLowerCase()) || 
                                 Array.from(vaultFilesMap.entries()).find(([k]) => k.includes(concept.name.toLowerCase()) || concept.name.toLowerCase().includes(k))?.[1];

            const conceptNode: ConceptNode = {
                id: conceptId,
                name: concept.name,
                description: concept.description,
                unit: unit.name,
                type: 'concept',
                status: matchedVault ? 'mastered' : 'not-started',
                courseId,
                filePath: matchedVault?.file.path,
                difficulty: concept.difficulty || 'medium',
                tags: concept.tags || [],
                val: 7
            };

            nodes.push(conceptNode);
            nodeMap.set(conceptId, conceptNode);

            // Link Concept to Unit
            links.push({
                source: unitId,
                target: conceptId,
                type: 'parent-child'
            });

            // Add sub-concepts if available
            if (concept.subconcepts && concept.subconcepts.length > 0) {
                concept.subconcepts.forEach((subName, sIdx) => {
                    const subId = `sub_${conceptId}_${sIdx}`;
                    const subNode: ConceptNode = {
                        id: subId,
                        name: subName,
                        unit: unit.name,
                        type: 'subconcept',
                        status: matchedVault ? 'in-progress' : 'not-started',
                        courseId,
                        difficulty: concept.difficulty,
                        val: 4
                    };
                    nodes.push(subNode);
                    nodeMap.set(subId, subNode);

                    links.push({
                        source: conceptId,
                        target: subId,
                        type: 'parent-child'
                    });
                });
            }

            // Prerequisite links
            if (concept.prerequisites && concept.prerequisites.length > 0) {
                concept.prerequisites.forEach(prereqName => {
                    // Find node matching prereqName
                    const targetConcept = nodes.find(n => n.name.toLowerCase() === prereqName.toLowerCase());
                    if (targetConcept) {
                        links.push({
                            source: targetConcept.id,
                            target: conceptId,
                            type: 'prerequisite',
                            label: 'prerequisite'
                        });
                    }
                });
            }
        });
    });

    // 5. Connect any additional standalone Vault files found that weren't in template
    for (const [basename, data] of vaultFilesMap.entries()) {
        const exists = nodes.some(n => n.name.toLowerCase() === basename);
        if (!exists) {
            const fileConceptId = `file_${courseId}_${basename.replace(/\s+/g, '_')}`;
            const fileNode: ConceptNode = {
                id: fileConceptId,
                name: data.file.basename,
                description: `Vault Note from ${data.file.path}`,
                type: 'concept',
                status: 'mastered',
                courseId,
                filePath: data.file.path,
                val: 6
            };
            nodes.push(fileNode);
            nodeMap.set(fileConceptId, fileNode);

            // Link to first unit or root
            const targetParent = nodes.find(n => n.type === 'unit') || rootNode;
            links.push({
                source: targetParent.id,
                target: fileConceptId,
                type: 'parent-child'
            });

            // Connect outgoing links
            data.outgoingLinks.forEach(targetName => {
                const targetNode = nodes.find(n => n.name.toLowerCase() === targetName.toLowerCase());
                if (targetNode) {
                    links.push({
                        source: fileConceptId,
                        target: targetNode.id,
                        type: 'related'
                    });
                }
            });
        }
    }

    return { nodes, links };
}
