// src/utils/academic/courseUtils.ts

import { Course, RecurringTimeSlot, DayOfWeek, GradingScale, CourseAnalytics } from '../../models/CourseModel';
import { StudentSchedule } from '../../models/ScheduleModel';
import { UserPreferences } from '../../models/UserPreferencesModel';

export interface CourseConflict {
  type: 'time_overlap' | 'location_conflict' | 'instructor_conflict' | 'prerequisite_missing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  courses: Course[];
  description: string;
  suggestions: string[];
  autoResolvable: boolean;
}

export interface CourseRecommendation {
  courseId: string;
  reason: string;
  confidence: number; // 0-1
  category: 'prerequisite' | 'corequisite' | 'elective' | 'sequence' | 'workload_balance';
  priority: 'low' | 'medium' | 'high';
  semester: string;
}

export interface CourseWorkload {
  courseId: string;
  estimatedHoursPerWeek: number;
  difficulty: number; // 1-5
  assignmentLoad: 'light' | 'moderate' | 'heavy';
  examFrequency: 'low' | 'moderate' | 'high';
  participationRequired: boolean;
  groupWorkPercentage: number; // 0-100
}

export interface SemesterPlan {
  semester: string;
  year: number;
  courses: Course[];
  totalCredits: number;
  estimatedWorkload: number; // hours per week
  difficultyBalance: number; // 1-5 average
  conflicts: CourseConflict[];
  recommendations: CourseRecommendation[];
  feasibilityScore: number; // 0-100
}

// Course scheduling and conflict detection
export const detectCourseConflicts = (courses: Course[]): CourseConflict[] => {
  const conflicts: CourseConflict[] = [];
  
  // Check for time conflicts
  for (let i = 0; i < courses.length; i++) {
    for (let j = i + 1; j < courses.length; j++) {
      const course1 = courses[i];
      const course2 = courses[j];
      
      const timeConflicts = findTimeOverlaps(course1.schedule, course2.schedule);
      if (timeConflicts.length > 0) {
        conflicts.push({
          type: 'time_overlap',
          severity: 'critical',
          courses: [course1, course2],
          description: `Time conflict between ${course1.courseCode} and ${course2.courseCode}`,
          suggestions: [
            'Choose a different section',
            'Take one course in a different semester',
            'Check if there are online options available'
          ],
          autoResolvable: false
        });
      }
      
      // Check for location conflicts (back-to-back classes in different buildings)
      const locationConflicts = findLocationConflicts(course1, course2);
      if (locationConflicts.length > 0) {
        conflicts.push({
          type: 'location_conflict',
          severity: 'medium',
          courses: [course1, course2],
          description: `Tight schedule between ${course1.courseCode} and ${course2.courseCode} - insufficient travel time`,
          suggestions: [
            'Add buffer time between classes',
            'Consider online section for one course',
            'Plan efficient routes between buildings'
          ],
          autoResolvable: true
        });
      }
    }
  }
  
  // Check for prerequisite violations
  const prereqConflicts = checkPrerequisites(courses);
  conflicts.push(...prereqConflicts);
  
  return conflicts;
};

// Find overlapping time slots between courses
const findTimeOverlaps = (schedule1: RecurringTimeSlot[], schedule2: RecurringTimeSlot[]): {
  slot1: RecurringTimeSlot;
  slot2: RecurringTimeSlot;
  overlapMinutes: number;
}[] => {
  const overlaps: { slot1: RecurringTimeSlot; slot2: RecurringTimeSlot; overlapMinutes: number }[] = [];
  
  for (const slot1 of schedule1) {
    for (const slot2 of schedule2) {
      if (slot1.dayOfWeek === slot2.dayOfWeek) {
        const overlap = calculateTimeOverlap(slot1, slot2);
        if (overlap > 0) {
          overlaps.push({ slot1, slot2, overlapMinutes: overlap });
        }
      }
    }
  }
  
  return overlaps;
};

// Calculate overlap in minutes between two time slots
const calculateTimeOverlap = (slot1: RecurringTimeSlot, slot2: RecurringTimeSlot): number => {
  const start1 = timeToMinutes(slot1.startTime);
  const end1 = timeToMinutes(slot1.endTime);
  const start2 = timeToMinutes(slot2.startTime);
  const end2 = timeToMinutes(slot2.endTime);
  
  const overlapStart = Math.max(start1, start2);
  const overlapEnd = Math.min(end1, end2);
  
  return Math.max(0, overlapEnd - overlapStart);
};

// Find location-based conflicts (insufficient travel time)
const findLocationConflicts = (course1: Course, course2: Course): string[] => {
  const conflicts: string[] = [];
  
  for (const slot1 of course1.schedule) {
    for (const slot2 of course2.schedule) {
      if (slot1.dayOfWeek === slot2.dayOfWeek) {
        const end1 = timeToMinutes(slot1.endTime);
        const start2 = timeToMinutes(slot2.startTime);
        const gap = start2 - end1;
        
        // Check if classes are back-to-back in different buildings
        if (gap >= 0 && gap <= 15 && course1.location.building !== course2.location.building) {
          const travelTime = estimateTravelTime(course1.location.building, course2.location.building);
          if (travelTime > gap) {
            conflicts.push(`Insufficient time to travel from ${course1.location.building} to ${course2.location.building}`);
          }
        }
      }
    }
  }
  
  return conflicts;
};

// Check prerequisite requirements
const checkPrerequisites = (courses: Course[]): CourseConflict[] => {
  const conflicts: CourseConflict[] = [];
  const courseCodes = new Set(courses.map(c => c.courseCode));
  
  courses.forEach(course => {
    if (course.metadata.prerequisites && course.metadata.prerequisites.length > 0) {
      const missingPrereqs = course.metadata.prerequisites.filter(prereq => !courseCodes.has(prereq));
      
      if (missingPrereqs.length > 0) {
        conflicts.push({
          type: 'prerequisite_missing',
          severity: 'high',
          courses: [course],
          description: `${course.courseCode} requires prerequisites: ${missingPrereqs.join(', ')}`,
          suggestions: [
            'Take prerequisite courses first',
            'Check if prerequisites can be waived',
            'Consider alternative courses without prerequisites'
          ],
          autoResolvable: false
        });
      }
    }
  });
  
  return conflicts;
};

// Course workload analysis
export const analyzeCourseWorkload = (courses: Course[]): CourseWorkload[] => {
  return courses.map(course => {
    const baseHours = course.metadata.creditHours * 2; // Rule of thumb: 2 hours study per credit hour
    const difficultyMultiplier = getDifficultyMultiplier(course.metadata.difficulty);
    const departmentMultiplier = getDepartmentWorkloadMultiplier(course.metadata.department);
    
    const estimatedHours = Math.round(baseHours * difficultyMultiplier * departmentMultiplier);
    
    return {
      courseId: course.id,
      estimatedHoursPerWeek: estimatedHours,
      difficulty: course.metadata.difficulty,
      assignmentLoad: classifyAssignmentLoad(course),
      examFrequency: classifyExamFrequency(course),
      participationRequired: checkParticipationRequirement(course),
      groupWorkPercentage: estimateGroupWorkPercentage(course)
    };
  });
};

// Generate course recommendations
export const generateCourseRecommendations = (
  currentCourses: Course[],
  availableCourses: Course[],
  userPreferences: UserPreferences,
  degreeRequirements?: string[]
): CourseRecommendation[] => {
  const recommendations: CourseRecommendation[] = [];
  const currentCourseCodes = new Set(currentCourses.map(c => c.courseCode));
  
  availableCourses.forEach(course => {
    if (currentCourseCodes.has(course.courseCode)) return;
    
    // Check for prerequisite fulfillment
    if (course.metadata.prerequisites?.some(prereq => currentCourseCodes.has(prereq))) {
      recommendations.push({
        courseId: course.id,
        reason: `Prerequisite completed for ${course.courseCode}`,
        confidence: 0.8,
        category: 'prerequisite',
        priority: 'high',
        semester: getNextAvailableSemester(course)
      });
    }
    
    // Check degree requirements
    if (degreeRequirements?.includes(course.courseCode)) {
      recommendations.push({
        courseId: course.id,
        reason: `Required for degree completion`,
        confidence: 0.9,
        category: 'prerequisite',
        priority: 'high',
        semester: getNextAvailableSemester(course)
      });
    }
    
    // Check workload balance
    const currentWorkload = calculateTotalWorkload(currentCourses);
    const courseWorkload = analyzeCourseWorkload([course])[0];
    
    if (currentWorkload + courseWorkload.estimatedHoursPerWeek <= userPreferences.academic.maxCreditsPerSemester * 3) {
      recommendations.push({
        courseId: course.id,
        reason: `Fits well with current workload`,
        confidence: 0.6,
        category: 'workload_balance',
        priority: 'medium',
        semester: getNextAvailableSemester(course)
      });
    }
    
    // Interest-based recommendations
    const interestScore = calculateInterestScore(course, userPreferences);
    if (interestScore > 0.7) {
      recommendations.push({
        courseId: course.id,
        reason: `Matches your interests and learning preferences`,
        confidence: interestScore,
        category: 'elective',
        priority: 'medium',
        semester: getNextAvailableSemester(course)
      });
    }
  });
  
  return recommendations.sort((a, b) => b.confidence - a.confidence);
};

// Create semester plan with optimization
export const createOptimizedSemesterPlan = (
  targetCourses: Course[],
  userPreferences: UserPreferences,
  semester: string,
  year: number
): SemesterPlan => {
  // Start with all target courses
  let selectedCourses = [...targetCourses];
  
  // Apply credit limit
  const maxCredits = userPreferences.academic.maxCreditsPerSemester;
  selectedCourses = optimizeForCreditLimit(selectedCourses, maxCredits);
  
  // Balance difficulty
  if (userPreferences.academic.difficultyBalance) {
    selectedCourses = balanceCourseDifficulty(selectedCourses);
  }
  
  // Optimize schedule for user preferences
  selectedCourses = optimizeForTimePreferences(selectedCourses, userPreferences);
  
  const totalCredits = selectedCourses.reduce((sum, course) => sum + course.metadata.creditHours, 0);
  const workloadAnalysis = analyzeCourseWorkload(selectedCourses);
  const estimatedWorkload = workloadAnalysis.reduce((sum, w) => sum + w.estimatedHoursPerWeek, 0);
  const difficultyBalance = selectedCourses.reduce((sum, course) => sum + course.metadata.difficulty, 0) / selectedCourses.length;
  
  const conflicts = detectCourseConflicts(selectedCourses);
  const recommendations = generateCourseRecommendations(selectedCourses, [], userPreferences);
  
  // Calculate feasibility score
  const feasibilityScore = calculateFeasibilityScore({
    totalCredits,
    maxCredits,
    estimatedWorkload,
    conflicts,
    difficultyBalance,
    userPreferences
  });
  
  return {
    semester,
    year,
    courses: selectedCourses,
    totalCredits,
    estimatedWorkload,
    difficultyBalance,
    conflicts,
    recommendations,
    feasibilityScore
  };
};

// Course analytics and insights
export const generateCourseAnalytics = (
  course: Course,
  studentPerformance?: any,
  historicalData?: any
): CourseAnalytics => {
  const analytics: CourseAnalytics = {
    courseId: course.id,
    semester: course.metadata.semester,
    stats: {
      totalClasses: calculateTotalClasses(course),
      attendedClasses: studentPerformance?.attendedClasses || 0,
      attendanceRate: 0,
      averageGrade: studentPerformance?.averageGrade || 0,
      timeSpent: studentPerformance?.timeSpent || 0,
      assignmentsCompleted: studentPerformance?.assignmentsCompleted || 0,
      assignmentsTotal: studentPerformance?.assignmentsTotal || 0,
      studyHours: studentPerformance?.studyHours || 0,
      difficulty: course.metadata.difficulty,
      satisfaction: studentPerformance?.satisfaction || 0,
      wouldTakeAgain: studentPerformance?.wouldTakeAgain || false
    },
    insights: [],
    predictions: [],
    recommendations: []
  };
  
  // Calculate attendance rate
  if (analytics.stats.totalClasses > 0) {
    analytics.stats.attendanceRate = (analytics.stats.attendedClasses / analytics.stats.totalClasses) * 100;
  }
  
  // Generate insights
  if (analytics.stats.attendanceRate < 80) {
    analytics.insights.push({
      type: 'attendance',
      message: `Attendance is below recommended level (${analytics.stats.attendanceRate.toFixed(1)}%)`,
      severity: 'warning',
      actionable: true,
      suggestion: 'Try to attend more classes to improve understanding and grades'
    });
  }
  
  if (analytics.stats.studyHours < course.metadata.creditHours * 2) {
    analytics.insights.push({
      type: 'workload',
      message: 'Study time is below recommended hours per week',
      severity: 'warning',
      actionable: true,
      suggestion: `Aim for ${course.metadata.creditHours * 2} hours of study per week`
    });
  }
  
  // Generate predictions if we have enough data
  if (studentPerformance && historicalData) {
    const predictedGrade = predictFinalGrade(course, studentPerformance, historicalData);
    analytics.predictions.push({
      type: 'final_grade',
      prediction: predictedGrade.grade,
      confidence: predictedGrade.confidence,
      factors: predictedGrade.factors,
      lastUpdated: new Date()
    });
  }
  
  return analytics;
};

// Utility helper functions
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const estimateTravelTime = (building1: string, building2: string): number => {
  // Simple estimation - in a real app, this would use campus map data
  if (building1 === building2) return 0;
  
  // Default estimates based on typical campus layouts
  const walkingSpeed = 3; // mph
  const campusDistances: Record<string, Record<string, number>> = {
    // Example campus building distances in miles
    'MATH': { 'ENGR': 0.3, 'PHYS': 0.2, 'CHEM': 0.4 },
    'ENGR': { 'MATH': 0.3, 'PHYS': 0.5, 'CHEM': 0.6 },
    'PHYS': { 'MATH': 0.2, 'ENGR': 0.5, 'CHEM': 0.3 },
    'CHEM': { 'MATH': 0.4, 'ENGR': 0.6, 'PHYS': 0.3 }
  };
  
  const distance = campusDistances[building1]?.[building2] || 0.4; // Default 0.4 miles
  return Math.ceil((distance / walkingSpeed) * 60); // Convert to minutes
};

const getDifficultyMultiplier = (difficulty: number): number => {
  const multipliers = [0.8, 0.9, 1.0, 1.2, 1.5]; // Index 0-4 for difficulty 1-5
  return multipliers[Math.max(0, Math.min(4, difficulty - 1))];
};

const getDepartmentWorkloadMultiplier = (department: string): number => {
  const departmentMultipliers: Record<string, number> = {
    'CS': 1.3,      // Computer Science - programming intensive
    'MATH': 1.2,    // Mathematics - problem-solving intensive
    'PHYS': 1.2,    // Physics - lab work and calculations
    'CHEM': 1.2,    // Chemistry - lab work
    'ENGR': 1.3,    // Engineering - design projects
    'BIOL': 1.1,    // Biology - memorization heavy
    'HIST': 1.0,    // History - reading intensive but standard
    'ENGL': 1.1,    // English - writing intensive
    'PSYC': 0.9,    // Psychology - typically lighter workload
    'ARTS': 0.8,    // Arts - creative but flexible
    'ECON': 1.0,    // Economics - standard workload
    'POLI': 0.9     // Political Science - reading intensive
  };
  
  return departmentMultipliers[department] || 1.0;
};

const classifyAssignmentLoad = (course: Course): 'light' | 'moderate' | 'heavy' => {
  // This would be based on syllabus analysis or historical data
  const creditHours = course.metadata.creditHours;
  const difficulty = course.metadata.difficulty;
  
  const score = creditHours + difficulty;
  
  if (score <= 5) return 'light';
  if (score <= 8) return 'moderate';
  return 'heavy';
};

const classifyExamFrequency = (course: Course): 'low' | 'moderate' | 'high' => {
  // Estimate based on course type and credit hours
  const creditHours = course.metadata.creditHours;
  
  if (creditHours <= 2) return 'low';
  if (creditHours <= 3) return 'moderate';
  return 'high';
};

const checkParticipationRequirement = (course: Course): boolean => {
  // Would check syllabus or course metadata
  const participationCourseTypes = ['seminar', 'discussion', 'language'];
  return participationCourseTypes.some(type => 
    course.courseName.toLowerCase().includes(type) ||
    course.metadata.tags.includes(type)
  );
};

const estimateGroupWorkPercentage = (course: Course): number => {
  // Estimate based on course type and department
  const groupWorkDepartments = ['ENGR', 'CS', 'BUSI', 'COMM'];
  const department = course.metadata.department;
  
  if (groupWorkDepartments.includes(department)) {
    return Math.min(40, course.metadata.creditHours * 10);
  }
  
  return Math.min(20, course.metadata.creditHours * 5);
};

const getNextAvailableSemester = (course: Course): string => {
  // Simple logic - in reality, this would check course offering schedules
  const currentSemester = course.metadata.semester;
  
  if (currentSemester.includes('Fall')) {
    return currentSemester.replace('Fall', 'Spring').replace(/\d{4}/, (year) => (parseInt(year) + 1).toString());
  } else {
    return currentSemester.replace('Spring', 'Fall');
  }
};

const calculateTotalWorkload = (courses: Course[]): number => {
  const workloads = analyzeCourseWorkload(courses);
  return workloads.reduce((sum, w) => sum + w.estimatedHoursPerWeek, 0);
};

const calculateInterestScore = (course: Course, preferences: UserPreferences): number => {
  let score = 0.5; // Base score
  
  // Check if department matches any preferences or past courses
  const department = course.metadata.department.toLowerCase();
  
  // This would be expanded with actual preference matching logic
  if (preferences.academic.studyTimePreference === 'morning' && 
      course.schedule.some(slot => timeToMinutes(slot.startTime) < 600)) { // Before 10 AM
    score += 0.2;
  }
  
  return Math.min(1.0, score);
};

const optimizeForCreditLimit = (courses: Course[], maxCredits: number): Course[] => {
  const sortedCourses = [...courses].sort((a, b) => {
    // Prioritize required courses and higher priority courses
    const priorityA = a.metadata.prerequisites?.length || 0;
    const priorityB = b.metadata.prerequisites?.length || 0;
    return priorityB - priorityA;
  });
  
  const selectedCourses: Course[] = [];
  let totalCredits = 0;
  
  for (const course of sortedCourses) {
    if (totalCredits + course.metadata.creditHours <= maxCredits) {
      selectedCourses.push(course);
      totalCredits += course.metadata.creditHours;
    }
  }
  
  return selectedCourses;
};

const balanceCourseDifficulty = (courses: Course[]): Course[] => {
  // Sort by difficulty and try to balance
  const sorted = [...courses].sort((a, b) => a.metadata.difficulty - b.metadata.difficulty);
  
  // For now, just return the original courses
  // In a more sophisticated implementation, this would swap courses to balance difficulty
  return courses;
};

const optimizeForTimePreferences = (courses: Course[], preferences: UserPreferences): Course[] => {
  // Filter courses that conflict with user's time preferences
  const preferredTimes = preferences.academic.preferredClassTimes;
  
  return courses.filter(course => {
    // Check if any class time conflicts with strongly avoided times
    return !course.schedule.some(slot => {
      const classTime = timeToMinutes(slot.startTime);
      
      // Check against user's avoid early/late class preferences
      if (preferences.academic.avoidEarlyClasses) {
        const earlyThreshold = timeToMinutes(preferences.academic.earlyClassThreshold);
        if (classTime < earlyThreshold) return true;
      }
      
      if (preferences.academic.avoidLateClasses) {
        const lateThreshold = timeToMinutes(preferences.academic.lateClassThreshold);
        if (classTime > lateThreshold) return true;
      }
      
      return false;
    });
  });
};

const calculateTotalClasses = (course: Course): number => {
  // Estimate total classes based on schedule and semester length
  const semesterWeeks = 16; // Typical semester length
  return course.schedule.length * semesterWeeks;
};

const predictFinalGrade = (
  course: Course,
  studentPerformance: any,
  historicalData: any
): { grade: number; confidence: number; factors: string[] } => {
  // Simple prediction based on current performance
  const currentGrade = studentPerformance.averageGrade || 0;
  const attendanceRate = studentPerformance.attendanceRate || 0;
  const studyHours = studentPerformance.studyHours || 0;
  
  let predictedGrade = currentGrade;
  const factors: string[] = [];
  
  // Adjust based on attendance
  if (attendanceRate < 80) {
    predictedGrade *= 0.9;
    factors.push('Low attendance may impact final grade');
  } else if (attendanceRate > 95) {
    predictedGrade *= 1.05;
    factors.push('Excellent attendance supports strong performance');
  }
  
  // Adjust based on study time
  const recommendedStudyHours = course.metadata.creditHours * 2;
  if (studyHours < recommendedStudyHours * 0.8) {
    predictedGrade *= 0.95;
    factors.push('Insufficient study time may lower grades');
  } else if (studyHours > recommendedStudyHours * 1.2) {
    predictedGrade *= 1.03;
    factors.push('Above-average study time should improve performance');
  }
  
  // Calculate confidence based on data completeness
  let confidence = 0.6; // Base confidence
  if (studentPerformance.assignmentsCompleted > 3) confidence += 0.2;
  if (attendanceRate > 0) confidence += 0.1;
  if (studyHours > 0) confidence += 0.1;
  
  return {
    grade: Math.min(100, Math.max(0, predictedGrade)),
    confidence: Math.min(1.0, confidence),
    factors
  };
};

const calculateFeasibilityScore = (params: {
  totalCredits: number;
  maxCredits: number;
  estimatedWorkload: number;
  conflicts: CourseConflict[];
  difficultyBalance: number;
  userPreferences: UserPreferences;
}): number => {
  let score = 100;
  
  // Credit load penalty
  if (params.totalCredits > params.maxCredits) {
    score -= (params.totalCredits - params.maxCredits) * 10;
  }
  
  // Workload penalty (assume 50 hours/week is maximum sustainable)
  if (params.estimatedWorkload > 50) {
    score -= (params.estimatedWorkload - 50) * 2;
  }
  
  // Conflict penalties
  const criticalConflicts = params.conflicts.filter(c => c.severity === 'critical').length;
  const highConflicts = params.conflicts.filter(c => c.severity === 'high').length;
  const mediumConflicts = params.conflicts.filter(c => c.severity === 'medium').length;
  
  score -= criticalConflicts * 30;
  score -= highConflicts * 15;
  score -= mediumConflicts * 5;
  
  // Difficulty balance bonus/penalty
  const preferredDifficulty = 3; // Moderate difficulty
  const difficultyDeviation = Math.abs(params.difficultyBalance - preferredDifficulty);
  score -= difficultyDeviation * 5;
  
  return Math.max(0, Math.min(100, score));
};

// Export all utility functions
export {
  timeToMinutes,
  minutesToTime,
  estimateTravelTime,
  calculateTimeOverlap,
  getDifficultyMultiplier,
  getDepartmentWorkloadMultiplier,
  calculateTotalWorkload,
  calculateInterestScore,
  predictFinalGrade,
  calculateFeasibilityScore
};