// src/models/CourseModel.ts

export interface Course {
    id: string;
    courseCode: string; // "CS 101", "MATH 241"
    courseName: string; // "Introduction to Computer Science"
    section?: string; // "A01", "L01"
    crn?: string; // Course Registration Number
    instructor: Instructor;
    schedule: RecurringTimeSlot[];
    location: CourseLocation;
    metadata: CourseMetadata;
    syllabus?: SyllabusInfo;
    enrollment: EnrollmentInfo;
    grading: GradingInfo;
    resources: CourseResource[];
    status: 'enrolled' | 'waitlisted' | 'dropped' | 'completed';
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Instructor {
    id?: string;
    name: string;
    email?: string;
    title?: string; // "Professor", "Dr.", "TA"
    department: string;
    officeHours?: OfficeHours[];
    officeLocation?: string;
    phone?: string;
    bio?: string;
    rating?: number; // 1-5 stars
    rateMyProfId?: string;
  }
  
  export interface OfficeHours {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    location: string;
    type: 'in-person' | 'virtual' | 'hybrid';
    meetingLink?: string;
    notes?: string;
  }
  
  export interface RecurringTimeSlot {
    id: string;
    dayOfWeek: DayOfWeek;
    startTime: string; // "14:30"
    endTime: string; // "15:50"
    recurrencePattern: RecurrencePattern;
    sessionType: 'lecture' | 'lab' | 'seminar' | 'tutorial' | 'exam' | 'office_hours';
    location?: CourseLocation;
    isOnline: boolean;
    meetingLink?: string;
    notes?: string;
  }
  
  export interface RecurrencePattern {
    type: 'weekly' | 'biweekly' | 'monthly' | 'custom';
    interval: number; // every N weeks/days
    startDate: Date;
    endDate: Date;
    exceptions: Date[]; // dates when class is cancelled
    makeupSessions?: MakeupSession[];
  }
  
  export interface MakeupSession {
    originalDate: Date;
    newDate: Date;
    newTime?: string;
    newLocation?: CourseLocation;
    reason: string;
  }
  
  export interface CourseLocation {
    building: string;
    room: string;
    campus?: string;
    address?: string;
    floor?: number;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    amenities?: string[]; // ['projector', 'whiteboard', 'computers']
    capacity?: number;
    accessibility?: string[]; // ['wheelchair_accessible', 'hearing_loop']
  }
  
  export interface CourseMetadata {
    creditHours: number;
    difficulty: 1 | 2 | 3 | 4 | 5; // user-assessed difficulty
    workload: 'light' | 'moderate' | 'heavy'; // hours per week expectation
    department: string;
    school?: string; // "School of Engineering"
    level: 'undergraduate' | 'graduate';
    semester: string; // "Fall 2024"
    year: number;
    prerequisites: string[];
    corequisites?: string[];
    description?: string;
    learningObjectives?: string[];
    textbooks?: Textbook[];
    tags: string[]; // ['math', 'programming', 'theory']
  }
  
  export interface Textbook {
    title: string;
    author: string;
    isbn?: string;
    edition?: string;
    required: boolean;
    price?: number;
    format: 'physical' | 'digital' | 'rental';
    source?: string; // where to buy/rent
    notes?: string;
  }
  
  export interface SyllabusInfo {
    url?: string;
    uploadedFile?: File;
    lastUpdated?: Date;
    keyDates: ImportantDate[];
    gradingPolicy: string;
    attendancePolicy?: string;
    latePolicy?: string;
    academicIntegrity?: string;
    courseSchedule?: SyllabusScheduleItem[];
  }
  
  export interface ImportantDate {
    id: string;
    date: Date;
    title: string;
    description?: string;
    type: 'exam' | 'assignment' | 'project' | 'quiz' | 'presentation' | 'field_trip' | 'no_class' | 'other';
    location?: string;
    weight?: number; // % of final grade
    duration?: number; // minutes
  }
  
  export interface SyllabusScheduleItem {
    week: number;
    startDate: Date;
    endDate: Date;
    topics: string[];
    readings?: string[];
    assignments?: string[];
    notes?: string;
  }
  
  export interface EnrollmentInfo {
    enrolledDate: Date;
    enrollmentType: 'credit' | 'audit' | 'pass_fail';
    capacity: number;
    enrolled: number;
    waitlisted: number;
    available: number;
    waitlistPosition?: number;
  }
  
  export interface GradingInfo {
    scale: GradingScale;
    components: GradeComponent[];
    currentGrade?: CurrentGrade;
    finalGrade?: FinalGrade;
    gpa: number;
  }
  
  export interface GradingScale {
    type: 'letter' | 'percentage' | 'points';
    scale: GradeThreshold[];
  }
  
  export interface GradeThreshold {
    grade: string; // "A", "B+", etc.
    minPercentage: number;
    gpaPoints: number;
  }
  
  export interface GradeComponent {
    name: string; // "Homework", "Midterm Exam"
    weight: number; // percentage of final grade
    count?: number; // number of assignments of this type
    dropLowest?: number; // how many lowest scores to drop
    description?: string;
  }
  
  export interface CurrentGrade {
    percentage: number;
    letter: string;
    gpaPoints: number;
    trend: 'improving' | 'declining' | 'stable';
    lastUpdated: Date;
    breakdown: ComponentGrade[];
  }
  
  export interface ComponentGrade {
    component: string;
    earnedPoints: number;
    totalPoints: number;
    percentage: number;
    weight: number;
    count: number;
  }
  
  export interface FinalGrade {
    percentage: number;
    letter: string;
    gpaPoints: number;
    submittedDate: Date;
    official: boolean;
  }
  
  export interface CourseResource {
    id: string;
    title: string;
    type: 'link' | 'file' | 'video' | 'article' | 'book' | 'software';
    url?: string;
    file?: File;
    description?: string;
    category: 'lecture_materials' | 'assignments' | 'readings' | 'tools' | 'references';
    addedDate: Date;
    addedBy: 'instructor' | 'student' | 'system';
    tags: string[];
    isRequired: boolean;
  }
  
  // Utility types
  export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  export type SessionType = RecurringTimeSlot['sessionType'];
  export type CourseStatus = Course['status'];
  export type EnrollmentType = EnrollmentInfo['enrollmentType'];
  export type ResourceType = CourseResource['type'];
  export type ResourceCategory = CourseResource['category'];
  
  // Course analysis and stats
  export interface CourseAnalytics {
    courseId: string;
    semester: string;
    stats: {
      totalClasses: number;
      attendedClasses: number;
      attendanceRate: number;
      averageGrade: number;
      timeSpent: number; // total hours
      assignmentsCompleted: number;
      assignmentsTotal: number;
      studyHours: number;
      difficulty: number; // 1-5 scale
      satisfaction: number; // 1-5 scale
      wouldTakeAgain: boolean;
    };
    insights: CourseInsight[];
    predictions: CoursePrediction[];
    recommendations: string[];
  }
  
  export interface CourseInsight {
    type: 'attendance' | 'performance' | 'workload' | 'difficulty';
    message: string;
    severity: 'info' | 'warning' | 'success' | 'error';
    actionable: boolean;
    suggestion?: string;
  }
  
  export interface CoursePrediction {
    type: 'final_grade' | 'gpa_impact' | 'time_commitment';
    prediction: number;
    confidence: number; // 0-1
    factors: string[];
    lastUpdated: Date;
  }
  
  // Default values and constants
  export const DEFAULT_GRADING_SCALE: GradingScale = {
    type: 'letter',
    scale: [
      { grade: 'A+', minPercentage: 97, gpaPoints: 4.0 },
      { grade: 'A', minPercentage: 93, gpaPoints: 4.0 },
      { grade: 'A-', minPercentage: 90, gpaPoints: 3.7 },
      { grade: 'B+', minPercentage: 87, gpaPoints: 3.3 },
      { grade: 'B', minPercentage: 83, gpaPoints: 3.0 },
      { grade: 'B-', minPercentage: 80, gpaPoints: 2.7 },
      { grade: 'C+', minPercentage: 77, gpaPoints: 2.3 },
      { grade: 'C', minPercentage: 73, gpaPoints: 2.0 },
      { grade: 'C-', minPercentage: 70, gpaPoints: 1.7 },
      { grade: 'D+', minPercentage: 67, gpaPoints: 1.3 },
      { grade: 'D', minPercentage: 63, gpaPoints: 1.0 },
      { grade: 'D-', minPercentage: 60, gpaPoints: 0.7 },
      { grade: 'F', minPercentage: 0, gpaPoints: 0.0 }
    ]
  };
  
  export const COMMON_GRADE_COMPONENTS: GradeComponent[] = [
    { name: 'Homework', weight: 20, count: 10, dropLowest: 1 },
    { name: 'Quizzes', weight: 15, count: 8, dropLowest: 1 },
    { name: 'Midterm Exam', weight: 25, count: 1 },
    { name: 'Final Exam', weight: 30, count: 1 },
    { name: 'Participation', weight: 10, count: 1 }
  ];
  
  export const DAY_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Validation functions
  export const validateCourse = (course: Partial<Course>): string[] => {
    const errors: string[] = [];
    
    if (!course.courseCode?.trim()) {
      errors.push('Course code is required');
    }
    
    if (!course.courseName?.trim()) {
      errors.push('Course name is required');
    }
    
    if (!course.instructor?.name?.trim()) {
      errors.push('Instructor name is required');
    }
    
    if (!course.metadata?.creditHours || course.metadata.creditHours < 0) {
      errors.push('Valid credit hours required');
    }
    
    if (!course.schedule || course.schedule.length === 0) {
      errors.push('Course schedule is required');
    }
    
    // Validate schedule time slots
    course.schedule?.forEach((slot, index) => {
      if (!slot.startTime || !slot.endTime) {
        errors.push(`Schedule slot ${index + 1}: Start and end times are required`);
      }
      
      const startHour = parseInt(slot.startTime?.split(':')[0] || '0');
      const endHour = parseInt(slot.endTime?.split(':')[0] || '0');
      
      if (startHour >= endHour) {
        errors.push(`Schedule slot ${index + 1}: End time must be after start time`);
      }
    });
    
    return errors;
  };
  
  export const validateTimeSlot = (slot: RecurringTimeSlot): boolean => {
    if (!slot.startTime || !slot.endTime) return false;
    
    const [startHour, startMin] = slot.startTime.split(':').map(Number);
    const [endHour, endMin] = slot.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return startMinutes < endMinutes && startHour >= 0 && startHour <= 23 && endHour >= 0 && endHour <= 23;
  };
  
  export const calculateCourseGPA = (courses: Course[]): number => {
    let totalGradePoints = 0;
    let totalCreditHours = 0;
    
    courses.forEach(course => {
      if (course.grading.finalGrade) {
        totalGradePoints += course.grading.finalGrade.gpaPoints * course.metadata.creditHours;
        totalCreditHours += course.metadata.creditHours;
      }
    });
    
    return totalCreditHours > 0 ? totalGradePoints / totalCreditHours : 0;
  };
  
  export const getLetterGrade = (percentage: number, scale?: GradingScale): string => {
    const gradeScale = scale || DEFAULT_GRADING_SCALE;
    
    for (const threshold of gradeScale.scale) {
      if (percentage >= threshold.minPercentage) {
        return threshold.grade;
      }
    }
    
    return 'F';
  };
  
  export const getGPAPoints = (percentage: number, scale?: GradingScale): number => {
    const gradeScale = scale || DEFAULT_GRADING_SCALE;
    
    for (const threshold of gradeScale.scale) {
      if (percentage >= threshold.minPercentage) {
        return threshold.gpaPoints;
      }
    }
    
    return 0;
  };
  
  // Helper functions
  export const formatCourseCode = (courseCode: string): string => {
    return courseCode.toUpperCase().replace(/\s+/g, ' ').trim();
  };
  
  export const getCourseDisplayName = (course: Course): string => {
    return `${course.courseCode} - ${course.courseName}`;
  };
  
  export const getCourseDuration = (course: Course): number => {
    // Calculate total class time per week in minutes
    return course.schedule.reduce((total, slot) => {
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      return total + (endMinutes - startMinutes);
    }, 0);
  };
  
  export const getNextClassTime = (course: Course): Date | null => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Convert to our day format
    const dayMap: Record<number, DayOfWeek> = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };
    
    for (const slot of course.schedule) {
      const slotDayIndex = DAY_ORDER.indexOf(slot.dayOfWeek) + 1; // Convert to 1-7 format
      const adjustedSlotDay = slotDayIndex === 7 ? 0 : slotDayIndex; // Sunday = 0
      
      const [hour, minute] = slot.startTime.split(':').map(Number);
      
      // Calculate next occurrence
      let daysUntil = adjustedSlotDay - currentDay;
      if (daysUntil < 0 || (daysUntil === 0 && now.getHours() * 60 + now.getMinutes() >= hour * 60 + minute)) {
        daysUntil += 7;
      }
      
      const nextClass = new Date(now);
      nextClass.setDate(now.getDate() + daysUntil);
      nextClass.setHours(hour, minute, 0, 0);
      
      return nextClass;
    }
    
    return null;
  };
  
  export const isCourseActive = (course: Course): boolean => {
    const now = new Date();
    const semester = course.metadata.semester.toLowerCase();
    const year = course.metadata.year;
    
    // Simple semester date estimation - this could be more sophisticated
    const semesterDates = {
      spring: { start: new Date(year, 0, 15), end: new Date(year, 4, 15) },
      summer: { start: new Date(year, 4, 15), end: new Date(year, 7, 15) },
      fall: { start: new Date(year, 7, 15), end: new Date(year, 11, 15) }
    };
    
    const dates = semesterDates[semester as keyof typeof semesterDates];
    if (!dates) return false;
    
    return now >= dates.start && now <= dates.end && course.status === 'enrolled';
  };