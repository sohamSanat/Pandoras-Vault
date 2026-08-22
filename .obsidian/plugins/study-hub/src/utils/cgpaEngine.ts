import type { 
    IndianGradeLetter, 
    GradeScaleMapping, 
    CourseGradeItem, 
    PastSemesterRecord, 
    CgpaDataState, 
    FeasibilityTier 
} from '../types/cgpa';

export const INDIAN_GRADE_SCALE: GradeScaleMapping[] = [
    { letter: 'O', gradePoint: 10, minPercentage: 90, maxPercentage: 100, description: 'Outstanding' },
    { letter: 'A+', gradePoint: 9, minPercentage: 80, maxPercentage: 89, description: 'Excellent' },
    { letter: 'A', gradePoint: 8, minPercentage: 70, maxPercentage: 79, description: 'Very Good' },
    { letter: 'B+', gradePoint: 7, minPercentage: 60, maxPercentage: 69, description: 'Good' },
    { letter: 'B', gradePoint: 6, minPercentage: 55, maxPercentage: 59, description: 'Above Average' },
    { letter: 'C', gradePoint: 5, minPercentage: 50, maxPercentage: 54, description: 'Average' },
    { letter: 'P', gradePoint: 4, minPercentage: 40, maxPercentage: 49, description: 'Pass' },
    { letter: 'F', gradePoint: 0, minPercentage: 0, maxPercentage: 39, description: 'Fail' }
];

export function getGradeFromPercentage(percentage: number): { letter: IndianGradeLetter; gradePoint: number } {
    const rounded = Math.round(percentage);
    for (const scale of INDIAN_GRADE_SCALE) {
        if (rounded >= scale.minPercentage) {
            return { letter: scale.letter, gradePoint: scale.gradePoint };
        }
    }
    return { letter: 'F', gradePoint: 0 };
}

export function getMinPercentageForGrade(targetGradePoint: number): number {
    const scale = INDIAN_GRADE_SCALE.find(s => s.gradePoint === targetGradePoint);
    return scale ? scale.minPercentage : 40;
}

/**
 * Calculates current semester SGPA from courses list
 */
export function calculateSemesterSgpa(courses: CourseGradeItem[]): { sgpa: number; totalCredits: number } {
    if (!courses || courses.length === 0) return { sgpa: 0, totalCredits: 0 };

    let totalWeightedPoints = 0;
    let totalCredits = 0;

    for (const c of courses) {
        const totalMax = c.cieMaxMarks + c.seeMaxMarks;
        const totalObtained = c.cieObtainedMarks + (c.seePredictedMarks ?? 0);
        const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
        const grade = getGradeFromPercentage(percentage);

        totalWeightedPoints += grade.gradePoint * c.credits;
        totalCredits += c.credits;
    }

    const sgpa = totalCredits > 0 ? Number((totalWeightedPoints / totalCredits).toFixed(2)) : 0;
    return { sgpa, totalCredits };
}

/**
 * Calculates overall Degree CGPA across all past semesters + current semester
 */
export function calculateCumulativeCgpa(pastSemesters: PastSemesterRecord[], currentSgpa: number, currentCredits: number): { cgpa: number; totalDegreeCredits: number } {
    let totalWeightedPoints = 0;
    let totalCredits = 0;

    for (const sem of pastSemesters) {
        if (sem.sgpa > 0 && sem.totalCredits > 0) {
            totalWeightedPoints += sem.sgpa * sem.totalCredits;
            totalCredits += sem.totalCredits;
        }
    }

    if (currentSgpa > 0 && currentCredits > 0) {
        totalWeightedPoints += currentSgpa * currentCredits;
        totalCredits += currentCredits;
    }

    const cgpa = totalCredits > 0 ? Number((totalWeightedPoints / totalCredits).toFixed(2)) : 0;
    return { cgpa, totalDegreeCredits: totalCredits };
}

/**
 * Solves the exact required Semester End Exam (SEE) score needed in each subject to hit target SGPA
 */
export function solveRequiredSeeScores(courses: CourseGradeItem[], targetSgpa: number): CourseGradeItem[] {
    // Determine the base target grade point for courses
    const targetGradePoint = Math.min(10, Math.max(4, Math.round(targetSgpa)));

    return courses.map(course => {
        const totalMax = course.cieMaxMarks + course.seeMaxMarks;
        const minPercentage = getMinPercentageForGrade(targetGradePoint);
        const totalRequiredMarks = (minPercentage / 100) * totalMax;

        const neededSeeMarks = Math.max(0, Math.ceil(totalRequiredMarks - course.cieObtainedMarks));
        const seePercentageNeeded = course.seeMaxMarks > 0 ? (neededSeeMarks / course.seeMaxMarks) * 100 : 0;

        let feasibility: FeasibilityTier = 'smooth';
        if (neededSeeMarks > course.seeMaxMarks) {
            feasibility = 'impossible';
        } else if (seePercentageNeeded >= 90) {
            feasibility = 'clutch';
        } else if (seePercentageNeeded >= 75) {
            feasibility = 'high_focus';
        } else if (seePercentageNeeded >= 55) {
            feasibility = 'grind';
        } else {
            feasibility = 'smooth';
        }

        // Predicted grade with current seePredictedMarks or fallback
        const effectiveSee = course.seePredictedMarks ?? neededSeeMarks;
        const currentPercentage = totalMax > 0 ? ((course.cieObtainedMarks + effectiveSee) / totalMax) * 100 : 0;
        const grade = getGradeFromPercentage(currentPercentage);

        return {
            ...course,
            requiredSeeMarksForTarget: neededSeeMarks,
            feasibility,
            predictedGradeLetter: grade.letter,
            predictedGradePoint: grade.gradePoint
        };
    });
}

export function createDefaultCgpaState(): CgpaDataState {
    return {
        targetDegreeCgpa: 9.0,
        targetSemesterSgpa: 8.8,
        currentSemesterNumber: 4,
        currentSemesterCourses: [
            {
                id: 'course-dsa',
                courseName: 'Data Structures & Algorithms',
                credits: 4,
                cieMaxMarks: 50,
                cieObtainedMarks: 44,
                seeMaxMarks: 50,
                seePredictedMarks: 42
            },
            {
                id: 'course-oop',
                courseName: 'Object Oriented Programming',
                credits: 4,
                cieMaxMarks: 50,
                cieObtainedMarks: 42,
                seeMaxMarks: 50,
                seePredictedMarks: 40
            },
            {
                id: 'course-math',
                courseName: 'Discrete Mathematics & Graph Theory',
                credits: 4,
                cieMaxMarks: 50,
                cieObtainedMarks: 40,
                seeMaxMarks: 50,
                seePredictedMarks: 38
            },
            {
                id: 'course-os',
                courseName: 'Operating Systems',
                credits: 3,
                cieMaxMarks: 50,
                cieObtainedMarks: 45,
                seeMaxMarks: 50,
                seePredictedMarks: 43
            },
            {
                id: 'course-dsa-lab',
                courseName: 'DSA Lab with C++',
                credits: 1.5,
                isLab: true,
                cieMaxMarks: 50,
                cieObtainedMarks: 48,
                seeMaxMarks: 50,
                seePredictedMarks: 46
            },
            {
                id: 'course-oop-lab',
                courseName: 'Java / OOP Lab',
                credits: 1.5,
                isLab: true,
                cieMaxMarks: 50,
                cieObtainedMarks: 47,
                seeMaxMarks: 50,
                seePredictedMarks: 45
            }
        ],
        pastSemesters: [
            { semesterNumber: 1, sgpa: 8.75, totalCredits: 20, semesterName: 'Semester 1' },
            { semesterNumber: 2, sgpa: 8.90, totalCredits: 20, semesterName: 'Semester 2' },
            { semesterNumber: 3, sgpa: 9.10, totalCredits: 22, semesterName: 'Semester 3' }
        ]
    };
}
