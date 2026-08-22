import type { SyllabusTemplate } from '../types/conceptMap';

export const SYLLABUS_TEMPLATES: Record<string, SyllabusTemplate> = {
    // Data Structures & Algorithms
    dsa: {
        courseId: 'dsa',
        courseName: 'Data Structures & Algorithms',
        icon: 'Code',
        units: [
            {
                name: '1. Foundations & Linear Structures',
                color: '#00f3ff',
                concepts: [
                    {
                        name: 'Asymptotic Analysis & Big-O',
                        description: 'Time and space complexity bounds, master theorem, and amortized runtime analysis.',
                        difficulty: 'easy',
                        subconcepts: ['Time Complexity', 'Space Complexity', 'Big-O / Big-Theta / Big-Omega'],
                        tags: ['fundamentals', 'complexity']
                    },
                    {
                        name: 'Arrays & Dynamic Arrays',
                        description: 'Contiguous memory layout, dynamic resizing, two-pointer techniques, and sliding window.',
                        difficulty: 'easy',
                        subconcepts: ['Two Pointers', 'Sliding Window', 'Prefix Sums'],
                        prerequisites: ['Asymptotic Analysis & Big-O'],
                        tags: ['linear', 'array']
                    },
                    {
                        name: 'Linked Lists',
                        description: 'Singly, doubly, and circular linked lists with pointer manipulation and reversal algorithms.',
                        difficulty: 'easy',
                        subconcepts: ['Singly Linked List', 'Doubly Linked List', 'Cycle Detection (Floyd)'],
                        prerequisites: ['Arrays & Dynamic Arrays'],
                        tags: ['linear', 'pointers']
                    },
                    {
                        name: 'Stacks & Queues',
                        description: 'LIFO and FIFO data structures, monotonic stacks, and circular queue buffers.',
                        difficulty: 'medium',
                        subconcepts: ['Monotonic Stack', 'Deque', 'Circular Queue'],
                        prerequisites: ['Linked Lists'],
                        tags: ['linear', 'stack', 'queue']
                    }
                ]
            },
            {
                name: '2. Non-Linear & Hierarchical Structures',
                color: '#3b82f6',
                concepts: [
                    {
                        name: 'Binary Trees & Traversals',
                        description: 'Hierarchical node representations, Pre/In/Post/Level order traversals with recursion and iteration.',
                        difficulty: 'medium',
                        subconcepts: ['Inorder / Preorder / Postorder', 'Level Order (BFS)', 'Tree Height & Depth'],
                        prerequisites: ['Stacks & Queues'],
                        tags: ['trees', 'recursion']
                    },
                    {
                        name: 'Binary Search Trees (BST)',
                        description: 'Ordered binary trees enabling O(log N) lookup, insertion, validation, and successor searching.',
                        difficulty: 'medium',
                        subconcepts: ['BST Search / Insert', 'LCA in BST', 'Validate BST'],
                        prerequisites: ['Binary Trees & Traversals'],
                        tags: ['trees', 'search']
                    },
                    {
                        name: 'Balanced Trees (AVL & Red-Black)',
                        description: 'Self-balancing binary trees utilizing tree rotations to guarantee O(log N) worst-case balance.',
                        difficulty: 'hard',
                        subconcepts: ['Left/Right Rotations', 'AVL Balance Factor', 'Red-Black Color Properties'],
                        prerequisites: ['Binary Search Trees (BST)'],
                        tags: ['trees', 'balanced', 'advanced']
                    },
                    {
                        name: 'Heaps & Priority Queues',
                        description: 'Complete binary tree heap representations, heapify, min/max heap operations, and Top-K queries.',
                        difficulty: 'medium',
                        subconcepts: ['Min-Heap / Max-Heap', 'Heapify O(N)', 'Top-K Elements'],
                        prerequisites: ['Binary Trees & Traversals'],
                        tags: ['heap', 'priority-queue']
                    }
                ]
            },
            {
                name: '3. Hash Tables & Graphs',
                color: '#a855f7',
                concepts: [
                    {
                        name: 'Hash Tables & Collision Resolution',
                        description: 'Hash functions, chaining, open addressing (linear probing, quadratic, double hashing), and Bloom filters.',
                        difficulty: 'medium',
                        subconcepts: ['Hash Functions', 'Chaining vs Open Addressing', 'LRU Cache Design'],
                        prerequisites: ['Arrays & Dynamic Arrays'],
                        tags: ['hashing', 'lookup']
                    },
                    {
                        name: 'Graph Representations & Traversals',
                        description: 'Adjacency matrix vs list, Breadth-First Search (BFS), and Depth-First Search (DFS).',
                        difficulty: 'medium',
                        subconcepts: ['Adjacency List', 'BFS Traversal', 'DFS Traversal', 'Connected Components'],
                        prerequisites: ['Binary Trees & Traversals', 'Hash Tables & Collision Resolution'],
                        tags: ['graph', 'traversal']
                    },
                    {
                        name: 'Shortest Paths & Minimum Spanning Trees',
                        description: 'Dijkstra, Bellman-Ford, Prim, Kruskal with Disjoint Set Union (DSU / Union-Find).',
                        difficulty: 'hard',
                        subconcepts: ['Dijkstra Algorithm', 'Kruskal + DSU', 'Prim Algorithm'],
                        prerequisites: ['Graph Representations & Traversals', 'Heaps & Priority Queues'],
                        tags: ['graph', 'greedy', 'shortest-path']
                    },
                    {
                        name: 'Trie (Prefix Tree) & Disjoint Set',
                        description: 'Specialized tree structures for prefix search, autocomplete, and dynamic connectivity.',
                        difficulty: 'hard',
                        subconcepts: ['Trie Autocomplete', 'Union by Rank', 'Path Compression'],
                        prerequisites: ['Graph Representations & Traversals'],
                        tags: ['trees', 'trie', 'dsu']
                    }
                ]
            },
            {
                name: '4. Algorithmic Paradigms',
                color: '#f472b6',
                concepts: [
                    {
                        name: 'Divide & Conquer',
                        description: 'Merge Sort, Quick Sort, Binary Search on Answer, and Karatsuba multiplication.',
                        difficulty: 'medium',
                        subconcepts: ['Merge Sort', 'Quick Sort', 'Binary Search'],
                        prerequisites: ['Arrays & Dynamic Arrays'],
                        tags: ['algorithms', 'divide-and-conquer']
                    },
                    {
                        name: 'Dynamic Programming (DP)',
                        description: 'Memoization, tabulation, optimal substructure, 0/1 Knapsack, LCS, and Interval DP.',
                        difficulty: 'hard',
                        subconcepts: ['1D DP (Fibonacci, House Robber)', '2D Grid DP', '0/1 Knapsack', 'Longest Common Subsequence'],
                        prerequisites: ['Divide & Conquer', 'Binary Trees & Traversals'],
                        tags: ['algorithms', 'dp']
                    },
                    {
                        name: 'Backtracking & Branch-and-Bound',
                        description: 'State space tree search, N-Queens, Sudoku solver, Subsets, and Permutations.',
                        difficulty: 'hard',
                        subconcepts: ['Subsets & Permutations', 'N-Queens Problem', 'Sudoku Solver'],
                        prerequisites: ['Graph Representations & Traversals'],
                        tags: ['algorithms', 'backtracking']
                    }
                ]
            }
        ]
    },

    // Object Oriented Programming
    oop: {
        courseId: 'oop',
        courseName: 'Object Oriented Programming',
        icon: 'PenTool',
        units: [
            {
                name: '1. Core OOP Pillars',
                color: '#10b981',
                concepts: [
                    {
                        name: 'Classes, Objects & Constructors',
                        description: 'Class blueprints, instance instantiation, default/parameterized/copy constructors, and destructor/garbage collection.',
                        difficulty: 'easy',
                        subconcepts: ['Class Blueprint', 'Instance Variables & Methods', 'Constructors'],
                        tags: ['fundamentals', 'class']
                    },
                    {
                        name: 'Encapsulation & Access Control',
                        description: 'Data hiding, getter/setter methods, public/private/protected visibility, and invariants.',
                        difficulty: 'easy',
                        subconcepts: ['Information Hiding', 'Access Modifiers', 'Properties / Mutators'],
                        prerequisites: ['Classes, Objects & Constructors'],
                        tags: ['pillar', 'encapsulation']
                    },
                    {
                        name: 'Inheritance & Subtyping',
                        description: 'Code reuse hierarchy, IS-A relationships, super keyword, method overriding, and diamond problem.',
                        difficulty: 'medium',
                        subconcepts: ['Single vs Multiple Inheritance', 'Method Overriding', 'super() Constructor Chaining'],
                        prerequisites: ['Encapsulation & Access Control'],
                        tags: ['pillar', 'inheritance']
                    },
                    {
                        name: 'Polymorphism & Dynamic Dispatch',
                        description: 'Compile-time overloading vs runtime dynamic dispatch, virtual method tables (vtable), and interfaces.',
                        difficulty: 'medium',
                        subconcepts: ['Method Overloading', 'Virtual Functions & vtable', 'Abstract Classes vs Interfaces'],
                        prerequisites: ['Inheritance & Subtyping'],
                        tags: ['pillar', 'polymorphism']
                    }
                ]
            },
            {
                name: '2. SOLID Principles',
                color: '#00f3ff',
                concepts: [
                    {
                        name: 'Single Responsibility & Open/Closed',
                        description: 'SRP (one reason to change) and OCP (open for extension, closed for modification).',
                        difficulty: 'medium',
                        subconcepts: ['Single Responsibility (SRP)', 'Open-Closed Principle (OCP)'],
                        prerequisites: ['Polymorphism & Dynamic Dispatch'],
                        tags: ['solid', 'architecture']
                    },
                    {
                        name: 'Liskov Substitution & Interface Segregation',
                        description: 'LSP (subtypes must be substitutable for base types) and ISP (fine-grained client interfaces).',
                        difficulty: 'medium',
                        subconcepts: ['Liskov Substitution (LSP)', 'Interface Segregation (ISP)'],
                        prerequisites: ['Single Responsibility & Open/Closed'],
                        tags: ['solid', 'architecture']
                    },
                    {
                        name: 'Dependency Inversion & Injection (DIP/DI)',
                        description: 'Depend upon abstractions rather than concretions, Inversion of Control (IoC), and container DI.',
                        difficulty: 'hard',
                        subconcepts: ['Dependency Inversion (DIP)', 'Constructor Injection', 'IoC Containers'],
                        prerequisites: ['Liskov Substitution & Interface Segregation'],
                        tags: ['solid', 'dependency-injection']
                    }
                ]
            },
            {
                name: '3. Design Patterns',
                color: '#d4af37',
                concepts: [
                    {
                        name: 'Creational Patterns',
                        description: 'Object creation mechanisms isolating instantiation logic from client code.',
                        difficulty: 'medium',
                        subconcepts: ['Singleton Pattern', 'Factory Method', 'Builder Pattern', 'Prototype'],
                        prerequisites: ['Dependency Inversion & Injection (DIP/DI)'],
                        tags: ['patterns', 'creational']
                    },
                    {
                        name: 'Structural Patterns',
                        description: 'Assembling classes and objects into larger composite structures with loose coupling.',
                        difficulty: 'medium',
                        subconcepts: ['Adapter Pattern', 'Decorator Pattern', 'Composite Pattern', 'Proxy Pattern'],
                        prerequisites: ['Creational Patterns'],
                        tags: ['patterns', 'structural']
                    },
                    {
                        name: 'Behavioral Patterns',
                        description: 'Algorithms and assignment of responsibilities between collaborating objects.',
                        difficulty: 'hard',
                        subconcepts: ['Observer Pattern', 'Strategy Pattern', 'Command Pattern', 'State Pattern'],
                        prerequisites: ['Structural Patterns'],
                        tags: ['patterns', 'behavioral']
                    }
                ]
            }
        ]
    },

    // Computer Networks
    networks: {
        courseId: 'networks',
        courseName: 'Computer Networks',
        icon: 'Network',
        units: [
            {
                name: '1. Architecture & Physical Layer',
                color: '#00f3ff',
                concepts: [
                    {
                        name: 'OSI & TCP/IP Model Layers',
                        description: 'Layered network stack architecture, encapsulation/decapsulation, and protocol data units (PDU).',
                        difficulty: 'easy',
                        subconcepts: ['7-Layer OSI Model', '4-Layer TCP/IP Model', 'PDU Headers & Encapsulation'],
                        tags: ['architecture', 'layers']
                    },
                    {
                        name: 'Physical & Data Link Layer',
                        description: 'Transmission media, framing, error detection (CRC/Checksum), MAC addressing, and Ethernet CSMA/CD.',
                        difficulty: 'medium',
                        subconcepts: ['Framing & Bit Stuffing', 'CRC Error Detection', 'MAC vs IP Address', 'Switching & ARP'],
                        prerequisites: ['OSI & TCP/IP Model Layers'],
                        tags: ['datalink', 'ethernet']
                    }
                ]
            },
            {
                name: '2. Network Layer & Routing',
                color: '#3b82f6',
                concepts: [
                    {
                        name: 'IPv4 / IPv6 & Subnetting',
                        description: 'IP addressing classes, CIDR subnet masks, VLSM, NAT (Network Address Translation), and ICMP.',
                        difficulty: 'medium',
                        subconcepts: ['CIDR Subnetting', 'VLSM Calculation', 'NAT & Private IPs', 'ICMP / Ping / Traceroute'],
                        prerequisites: ['Physical & Data Link Layer'],
                        tags: ['ip', 'subnetting']
                    },
                    {
                        name: 'Routing Protocols & Algorithms',
                        description: 'Distance Vector (RIP), Link State (OSPF), Path Vector (BGP), and autonomous systems (AS).',
                        difficulty: 'hard',
                        subconcepts: ['Distance Vector (Bellman-Ford)', 'OSPF (Dijkstra)', 'BGP Inter-Domain Routing'],
                        prerequisites: ['IPv4 / IPv6 & Subnetting'],
                        tags: ['routing', 'ospf', 'bgp']
                    }
                ]
            },
            {
                name: '3. Transport & Application Layers',
                color: '#f472b6',
                concepts: [
                    {
                        name: 'TCP vs UDP Protocols',
                        description: 'Connection-oriented vs datagram communication, port multiplexing, checksums, and socket endpoints.',
                        difficulty: 'medium',
                        subconcepts: ['TCP 3-Way Handshake & Teardown', 'UDP Datagrams', 'Socket API Basics'],
                        prerequisites: ['IPv4 / IPv6 & Subnetting'],
                        tags: ['transport', 'tcp', 'udp']
                    },
                    {
                        name: 'TCP Flow Control & Congestion Control',
                        description: 'Sliding window buffer management, slow start, congestion avoidance, AIMD, fast retransmit/recovery.',
                        difficulty: 'hard',
                        subconcepts: ['Sliding Window Protocol', 'AIMD & Slow Start', 'Fast Retransmit (Tahoe vs Reno)'],
                        prerequisites: ['TCP vs UDP Protocols'],
                        tags: ['tcp', 'congestion-control']
                    },
                    {
                        name: 'Application Layer Protocols (HTTP/DNS/TLS)',
                        description: 'DNS hierarchy & resolution, HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC), and TLS handshake encryption.',
                        difficulty: 'medium',
                        subconcepts: ['DNS Resolution & Caching', 'HTTP/2 Multiplexing & HTTP/3 QUIC', 'TLS 1.3 Handshake & Certificates'],
                        prerequisites: ['TCP Flow Control & Congestion Control'],
                        tags: ['application', 'http', 'tls', 'security']
                    }
                ]
            }
        ]
    },

    // Database Management Systems
    dbms: {
        courseId: 'dbms',
        courseName: 'Database Management Systems',
        icon: 'Monitor',
        units: [
            {
                name: '1. Relational Modeling & Design',
                color: '#10b981',
                concepts: [
                    {
                        name: 'Entity-Relationship (ER) Modeling',
                        description: 'Entities, attributes, primary/foreign keys, cardinality ratios, and ER-to-relational schema mapping.',
                        difficulty: 'easy',
                        subconcepts: ['Entity Sets & Attributes', 'Relationships & Cardinality', 'ER to Schema Conversion'],
                        tags: ['er-model', 'design']
                    },
                    {
                        name: 'Relational Algebra & Calculus',
                        description: 'Formal relational query operations: Select, Project, Cartesian Product, Joins, Set operators, and TRC.',
                        difficulty: 'medium',
                        subconcepts: ['Selection & Projection', 'Theta & Natural Joins', 'Division & Aggregate Ops'],
                        prerequisites: ['Entity-Relationship (ER) Modeling'],
                        tags: ['relational-algebra', 'theory']
                    },
                    {
                        name: 'Database Normalization',
                        description: 'Functional dependencies, Armstrong axioms, 1NF, 2NF, 3NF, and Boyce-Codd Normal Form (BCNF).',
                        difficulty: 'hard',
                        subconcepts: ['Functional Dependencies', '3NF Synthesis', 'BCNF Decomposition', 'Lossless Join & Dependency Preservation'],
                        prerequisites: ['Relational Algebra & Calculus'],
                        tags: ['normalization', 'schema-design']
                    }
                ]
            },
            {
                name: '2. Storage, Indexing & Query Processing',
                color: '#00f3ff',
                concepts: [
                    {
                        name: 'File Organization & Buffer Management',
                        description: 'Page formats, slotted page layout, buffer pool replacement (LRU/CLOCK), and sequential vs heap files.',
                        difficulty: 'medium',
                        subconcepts: ['Slotted Page Storage', 'Buffer Pool Manager', 'LRU-K Eviction Policy'],
                        prerequisites: ['Database Normalization'],
                        tags: ['storage', 'buffer-pool']
                    },
                    {
                        name: 'B+ Tree Indexing & Hash Indexes',
                        description: 'Balanced multi-way search trees for disk storage, node splits/merges, clustered vs secondary indexes.',
                        difficulty: 'hard',
                        subconcepts: ['B+ Tree Search & Insert', 'Clustered vs Unclustered Index', 'Hash Indexing (Linear/Extendible)'],
                        prerequisites: ['File Organization & Buffer Management'],
                        tags: ['indexing', 'b-plus-tree']
                    }
                ]
            },
            {
                name: '3. Transactions & Concurrency Control',
                color: '#d4af37',
                concepts: [
                    {
                        name: 'ACID Properties & Serializability',
                        description: 'Atomicity, Consistency, Isolation, Durability, conflict serializability, and precedence graphs.',
                        difficulty: 'hard',
                        subconcepts: ['ACID Definitions', 'Conflict vs View Serializability', 'Precedence Graph Cycles'],
                        prerequisites: ['B+ Tree Indexing & Hash Indexes'],
                        tags: ['transactions', 'acid']
                    },
                    {
                        name: 'Concurrency Control (2PL & MVCC)',
                        description: 'Two-Phase Locking (Strict/Rigorous 2PL), Deadlock detection/prevention, and Multi-Version Concurrency Control.',
                        difficulty: 'hard',
                        subconcepts: ['Strict 2PL', 'Deadlock Wait-For Graph', 'MVCC Snapshot Isolation'],
                        prerequisites: ['ACID Properties & Serializability'],
                        tags: ['concurrency', 'mvcc', 'locking']
                    },
                    {
                        name: 'Crash Recovery (WAL & ARIES)',
                        description: 'Write-Ahead Logging (WAL), checkpointing, and ARIES recovery algorithm (Analysis, Redo, Undo).',
                        difficulty: 'hard',
                        subconcepts: ['Write-Ahead Logging (WAL)', 'ARIES 3-Phase Recovery', 'Dirty Page Table & Flush LSN'],
                        prerequisites: ['Concurrency Control (2PL & MVCC)'],
                        tags: ['recovery', 'aries', 'wal']
                    }
                ]
            }
        ]
    }
};

/**
 * Helper to get or generate a default syllabus roadmap for any course title.
 */
export function getSyllabusForCourse(courseId: string, courseTitle: string): SyllabusTemplate {
    // Check known keys
    const lower = (courseId || courseTitle || '').toLowerCase();
    if (lower.includes('data') || lower.includes('algo') || lower.includes('dsa') || lower.includes('math')) {
        return SYLLABUS_TEMPLATES.dsa;
    }
    if (lower.includes('oop') || lower.includes('object') || lower.includes('java') || lower.includes('c++') || lower.includes('program')) {
        return SYLLABUS_TEMPLATES.oop;
    }
    if (lower.includes('net') || lower.includes('web') || lower.includes('cloud') || lower.includes('cyber')) {
        return SYLLABUS_TEMPLATES.networks;
    }
    if (lower.includes('db') || lower.includes('sql') || lower.includes('data') || lower.includes('store')) {
        return SYLLABUS_TEMPLATES.dbms;
    }

    // Default template synthesized for custom course
    return {
        courseId: courseId || 'custom',
        courseName: courseTitle || 'Course Concept Map',
        units: [
            {
                name: '1. Fundamentals & Core Concepts',
                color: '#00f3ff',
                concepts: [
                    {
                        name: 'Introduction & Foundations',
                        description: `Foundational principles and core terminology of ${courseTitle}.`,
                        difficulty: 'easy',
                        subconcepts: ['Core Definitions', 'Historical Context', 'First Principles']
                    },
                    {
                        name: 'Essential Models & Representations',
                        description: `Primary mental models and formal representations in ${courseTitle}.`,
                        difficulty: 'medium',
                        subconcepts: ['Theoretical Framework', 'Notations & Paradigms'],
                        prerequisites: ['Introduction & Foundations']
                    }
                ]
            },
            {
                name: '2. Intermediate Architectures',
                color: '#3b82f6',
                concepts: [
                    {
                        name: 'Methods & Analytical Techniques',
                        description: `Practical workflows and standard implementation methodologies for ${courseTitle}.`,
                        difficulty: 'medium',
                        subconcepts: ['Standard Workflows', 'Pattern Recognition'],
                        prerequisites: ['Essential Models & Representations']
                    },
                    {
                        name: 'Core System Dynamics',
                        description: `Interactions between subsystem components in ${courseTitle}.`,
                        difficulty: 'hard',
                        subconcepts: ['System Architecture', 'Performance Optimization'],
                        prerequisites: ['Methods & Analytical Techniques']
                    }
                ]
            },
            {
                name: '3. Advanced Topics & Real-world Practice',
                color: '#f472b6',
                concepts: [
                    {
                        name: 'State of the Art & Edge Cases',
                        description: `Complex edge cases and production-scale practices in ${courseTitle}.`,
                        difficulty: 'hard',
                        subconcepts: ['Advanced Case Studies', 'Troubleshooting & Diagnostics'],
                        prerequisites: ['Core System Dynamics']
                    }
                ]
            }
        ]
    };
}
