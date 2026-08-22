export type IndianGradeLetter = 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F';

export interface GradeScaleMapping {
    letter: IndianGradeLetter;
    gradePoint: number;
    minPercentage: number; // e.g. 90 for O, 80 for A+
    maxPercentage: number;
    description: string;
}

export type FeasibilityTier = 'smooth' | 'grind' | 'high_focus' | 'clutch' | 'impossible';

export interface CourseGradeItem {
    id: string;
    courseId?: string;
    courseName: string;
    credits: number; // 4 (Theory), 3 (Theory), 2 (Lab/Project), 1.5 (Lab)
    isLab?: boolean;
    
    // Internal Marks (CIE - Continuous Internal Evaluation)
    cieMaxMarks: number; // Usually 50
    cieObtainedMarks: number; // e.g. 44
    
    // End-Semester Exam Marks (SEE - Semester End Examination)
    seeMaxMarks: number; // Usually 50 or 100 (scaled to 50)
    seePredictedMarks?: number; // User input or Target solved
    
    // Calculated Grade
    predictedGradeLetter?: IndianGradeLetter;
    predictedGradePoint?: number;
    
    // Target solver requirement
    requiredSeeMarksForTarget?: number;
    feasibility?: FeasibilityTier;
}

export interface PastSemesterRecord {
    semesterNumber: number; // 1 to 8
    sgpa: number;
    totalCredits: number;
    semesterName?: string;
}

export interface CgpaDataState {
    targetDegreeCgpa: number; // e.g. 9.0
    targetSemesterSgpa: number; // e.g. 8.8
    currentSemesterNumber: number; // e.g. 4
    currentSemesterCourses: CourseGradeItem[];
    pastSemesters: PastSemesterRecord[];
}
