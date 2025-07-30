// src/models/AcademicModel.ts

export interface AcademicCalendar {
    id: string;
    universityId: string;
    academicYear: string; // "2024-2025"
    terms: AcademicTerm[];
    importantDates: ImportantAcademicDate[];
    holidays: Holiday[];
    deadlines: UniversityDeadline[];
    events: UniversityEvent[];
    lastUpdated: Date;
  }
  
  export interface AcademicTerm {
    id: string;
    name: string; // "Fall 2024", "Spring 2025"
    type: TermType;
    startDate: Date;
    endDate: Date;
    registrationPeriod: DateRange;
    dropAddPeriod: DateRange;
    withdrawalDeadline: Date;
    finalExamsPeriod: DateRange;
    gradingDeadline: Date;
    tuitionDueDate: Date;
    status: 'upcoming' | 'current' | 'completed';
    breaks: AcademicBreak[];
    weekCount: number;
    isActive: boolean;
  }
  
  export type TermType = 
    | 'semester' 
    | 'quarter' 
    | 'trimester' 
    | 'summer_session' 
    | 'winter_session' 
    | 'intersession';
  
  export interface DateRange {
    startDate: Date;
    endDate: Date;
  }
  
  export interface AcademicBreak {
    id: string;
    name: string; // "Spring Break", "Thanksgiving Break"
    startDate: Date;
    endDate: Date;
    type: 'spring_break' | 'fall_break' | 'winter_break' | 'thanksgiving' | 'reading_days' | 'other';
    classesResumeDate: Date;
    description?: string;
  }
  
  export interface ImportantAcademicDate {
    id: string;
    title: string;
    date: Date;
    type: AcademicDateType;
    description?: string;
    applicableTerms: string[]; // term IDs
    isDeadline: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
    notifications: DateNotification[];
    affectedGroups: string[]; // 'all_students', 'undergrad', 'grad', etc.
  }
  
  export type AcademicDateType = 
    | 'registration_opens' 
    | 'registration_closes' 
    | 'classes_begin' 
    | 'classes_end' 
    | 'add_drop_deadline' 
    | 'withdrawal_deadline' 
    | 'tuition_due' 
    | 'final_exams' 
    | 'grades_due' 
    | 'graduation' 
    | 'orientation'
    | 'housing_deadline'
    | 'financial_aid_deadline'
    | 'study_abroad_deadline';
  
  export interface DateNotification {
    daysBefore: number;
    message: string;
    channels: ('email' | 'sms' | 'push' | 'portal')[];
    sent: boolean;
    sentAt?: Date;
  }
  
  export interface Holiday {
    id: string;
    name: string;
    date: Date;  
    type: 'federal' | 'state' | 'university' | 'religious' | 'cultural';
    classesAffected: boolean;
    officesAffected: boolean;
    description?: string;
    observanceRules?: string;
  }
  
  export interface UniversityDeadline {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    category: DeadlineCategory;
    applicableTo: string[]; // student groups, majors, etc.
    requirements: string[];
    consequences: string[];
    resources: DeadlineResource[];
    reminders: ReminderSchedule[];
    status: 'upcoming' | 'current' | 'overdue' | 'completed';
    extensions?: ExtensionPolicy;
  }
  
  export type DeadlineCategory = 
    | 'application' 
    | 'financial_aid' 
    | 'housing' 
    | 'registration' 
    | 'graduation' 
    | 'internship' 
    | 'study_abroad' 
    | 'scholarship'
    | 'thesis_defense'
    | 'course_evaluation';
  
  export interface DeadlineResource {
    title: string;
    type: 'form' | 'website' | 'document' | 'contact' | 'tutorial';
    url?: string;
    description: string;
    required: boolean;
  }
  
  export interface ReminderSchedule {
    daysBefore: number;
    message: string;
    urgent: boolean;
  }
  
  export interface ExtensionPolicy {
    allowed: boolean;
    maxExtension: number; // days
    requiresApproval: boolean;
    approvalProcess: string;
    penaltyAmount?: number;
    penaltyType?: 'fee' | 'points' | 'grade_reduction';
  }
  
  export interface UniversityEvent {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: EventLocation;
    category: EventCategory;
    targetAudience: string[]; // 'students', 'faculty', 'staff', 'public'
    cost?: number;
    registrationRequired: boolean;
    registrationDeadline?: Date;
    capacity?: number;
    registeredCount?: number;
    tags: string[];
    organizer: EventOrganizer;
    resources: EventResource[];
    status: 'scheduled' | 'cancelled' | 'postponed' | 'completed';
  }
  
  export type EventCategory = 
    | 'academic' 
    | 'social' 
    | 'career' 
    | 'cultural' 
    | 'sports' 
    | 'orientation' 
    | 'graduation' 
    | 'workshop' 
    | 'conference'
    | 'guest_speaker'
    | 'club_activity'
    | 'volunteer';
  
  export interface EventLocation {
    building: string;
    room?: string;
    address?: string;
    campus?: string;
    isVirtual: boolean;
    virtualLink?: string;
    parkingInfo?: string;
    accessibility: string[];
  }
  
  export interface EventOrganizer {
    name: string;
    department?: string;
    email: string;
    phone?: string;
    website?: string;
  }
  
  export interface EventResource {
    title: string;
    type: 'agenda' | 'materials' | 'recording' | 'slides' | 'handout';
    url?: string;
    availableAfter?: Date;
    description?: string;
  }
  
  // University Information
  export interface University {
    id: string;
    name: string;
    shortName: string; // "MIT", "Stanford"
    location: UniversityLocation;
    type: 'public' | 'private' | 'community' | 'technical' | 'religious';
    size: 'small' | 'medium' | 'large';
    website: string;
    contact: UniversityContact;
    academicStructure: AcademicStructure;
    services: UniversityService[];
    policies: UniversityPolicy[];
    ratings?: UniversityRating[];
  }
  
  export interface UniversityLocation {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    timezone: string;
    campuses?: Campus[];
  }
  
  export interface Campus {
    id: string;
    name: string;
    location: UniversityLocation;
    buildings: Building[];
    amenities: CampusAmenity[];
    transportation: TransportationOption[];
  }
  
  export interface Building {
    id: string;
    name: string;
    code?: string; // "ENGR", "MATH"
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    departments: string[];
    amenities: string[];
    hours: OperatingHours;
    accessibility: AccessibilityFeature[];
    floors: Floor[];
  }
  
  export interface Floor {
    number: number;
    rooms: Room[];
    amenities: string[];
    accessibility: string[];
  }
  
  export interface Room {
    number: string;
    name?: string;
    type: 'classroom' | 'lab' | 'office' | 'auditorium' | 'study_room' | 'conference' | 'other';
    capacity?: number;
    equipment: string[];
    reservable: boolean;
    accessibility: string[];
  }
  
  export interface CampusAmenity {
    name: string;
    type: 'dining' | 'recreation' | 'health' | 'academic' | 'residential' | 'parking' | 'transportation';
    location: string;
    hours: OperatingHours;
    cost?: string;
    description?: string;
  }
  
  export interface TransportationOption {
    type: 'bus' | 'shuttle' | 'bike_share' | 'parking' | 'metro' | 'walking_path';
    name: string;
    schedule?: string;
    cost?: number;
    routes?: TransportationRoute[];
    accessibility: string[];
    contact?: string;
  }
  
  export interface TransportationRoute {
    id: string;
    name: string;
    stops: string[];
    frequency: number; // minutes between arrivals
    operatingHours: OperatingHours;
    realTimeTracking: boolean;
  }
  
  export interface OperatingHours {
    monday?: TimeRange;
    tuesday?: TimeRange;
    wednesday?: TimeRange;
    thursday?: TimeRange;
    friday?: TimeRange;
    saturday?: TimeRange;
    sunday?: TimeRange;
    holidays?: 'closed' | 'limited' | 'normal';
    specialHours?: SpecialHours[];
  }
  
  export interface TimeRange {
    open: string; // "08:00"
    close: string; // "22:00"
    breaks?: TimeRange[]; // lunch breaks, etc.
  }
  
  export interface SpecialHours {
    dates: DateRange;
    description: string;
    hours: TimeRange | 'closed';
  }
  
  export interface AccessibilityFeature {
    type: 'wheelchair_accessible' | 'hearing_loop' | 'braille' | 'elevator' | 'ramp' | 'automatic_doors';
    description?: string;
    location?: string;
  }
  
  export interface UniversityContact {
    mainPhone: string;
    emergencyPhone: string;
    email: string;
    admissionsOffice: ContactInfo;
    registrarOffice: ContactInfo;
    financialAid: ContactInfo;
    studentServices: ContactInfo;
    itHelpDesk: ContactInfo;
    library: ContactInfo;
  }
  
  export interface ContactInfo {
    phone?: string;
    email?: string;
    website?: string;
    location?: string;
    hours?: OperatingHours;
  }
  
  export interface AcademicStructure {
    termSystem: TermType;
    termLength: number; // weeks
    termsPerYear: number;
    schools: School[];
    degrees: DegreeProgram[];
    gradingScale: GradingScale;
    creditSystem: CreditSystem;
    policies: AcademicPolicy[];
  }
  
  export interface School {
    id: string;
    name: string;
    dean: string;
    departments: Department[];
    website?: string;
    description?: string;
  }
  
  export interface Department {
    id: string;
    name: string;
    code: string; // "CS", "MATH", "ENG"
    head: string;
    website?: string;
    location?: string;
    majors: string[];
    minors: string[];
    faculty: FacultyMember[];
  }
  
  export interface FacultyMember {
    id: string;
    name: string;
    title: string;
    department: string;
    email?: string;
    phone?: string;
    officeLocation?: string;
    officeHours?: OfficeHours[];
    researchAreas: string[];
    courses: string[];
    bio?: string;
    website?: string;
  }
  
  export interface OfficeHours {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    location: string;
    type: 'in_person' | 'virtual' | 'hybrid';
    appointmentRequired: boolean;
    notes?: string;
  }
  
  export interface DegreeProgram {
    id: string;
    name: string;
    type: 'bachelor' | 'master' | 'doctoral' | 'certificate' | 'associate';
    department: string;
    school: string;
    creditRequirements: number;
    duration: number; // years
    requirements: DegreeRequirement[];
    concentrations?: string[];
    prerequisites: string[];
    careerOutcomes: string[];
    website?: string;
  }
  
  export interface DegreeRequirement {
    category: 'core' | 'major' | 'minor' | 'general_education' | 'elective' | 'capstone';
    name: string;
    credits: number;
    courses: string[];
    alternatives?: string[][];
    description?: string;
  }
  
  export interface GradingScale {
    type: 'letter' | 'numerical' | 'pass_fail';
    scale: GradeMapping[];
    plusMinus: boolean;
    passingGrade: string;
    honorsCutoff?: string;
  }
  
  export interface GradeMapping {
    letter: string;
    minPercentage: number;
    maxPercentage: number;
    gpaPoints: number;
    description?: string;
  }
  
  export interface CreditSystem {
    type: 'semester_hours' | 'quarter_hours' | 'units';
    hoursPerCredit: number; // contact hours per week
    fullTimeMinimum: number;
    fullTimeMaximum: number;
    overloadThreshold: number;
    graduationMinimum: number;
  }
  
  export interface AcademicPolicy {
    id: string;
    title: string;
    category: PolicyCategory;
    description: string;
    effectiveDate: Date;
    lastUpdated: Date;
    applicableTo: string[];
    requirements: string[];
    consequences: string[];
    exceptions: string[];
    relatedPolicies: string[];
    contact: ContactInfo;
  }
  
  export type PolicyCategory = 
    | 'attendance' 
    | 'grading' 
    | 'academic_integrity' 
    | 'withdrawal' 
    | 'probation' 
    | 'graduation' 
    | 'transfer_credit'
    | 'disability_services'
    | 'student_conduct'
    | 'privacy';
  
  export interface UniversityService {
    id: string;
    name: string;
    category: ServiceCategory;
    description: string;
    location?: string;
    contact: ContactInfo;
    hours: OperatingHours;
    eligibility: string[];
    cost?: ServiceCost;
    howToAccess: string[];
    website?: string;
    onlineAvailable: boolean;
    appointmentRequired: boolean;
    resources: ServiceResource[];
  }
  
  export type ServiceCategory = 
    | 'academic_support' 
    | 'career_services' 
    | 'counseling' 
    | 'disability_services' 
    | 'financial_aid' 
    | 'health_services'
    | 'housing'
    | 'library'
    | 'recreation'
    | 'dining'
    | 'transportation'
    | 'technology';
  
  export interface ServiceCost {
    type: 'free' | 'fee' | 'insurance' | 'sliding_scale';
    amount?: number;
    description?: string;
    paymentMethods: string[];
  }
  
  export interface ServiceResource {
    title: string;
    type: 'form' | 'guide' | 'faq' | 'video' | 'contact';
    url?: string;
    description: string;
  }
  
  export interface UniversityPolicy {
    id: string;
    title: string;
    category: string;
    summary: string;
    fullText: string;
    effectiveDate: Date;
    lastRevised: Date;
    applicableGroups: string[];
    relatedPolicies: string[];
    contact: ContactInfo;
    website?: string;
  }
  
  export interface UniversityRating {
    source: string; // "US News", "Princeton Review"
    category: string;
    rating: number | string;
    maxRating: number | string;
    year: number;
    methodology?: string;
    notes?: string;
  }
  
  // LMS Integration Models
  export interface LMSIntegration {
    id: string;
    platform: LMSPlatform;
    universityId: string;
    baseUrl: string;
    apiVersion: string;
    authConfig: LMSAuthConfig;
    syncSettings: SyncSettings;
    lastSync?: Date;
    status: 'active' | 'inactive' | 'error' | 'maintenance';
    supportedFeatures: LMSFeature[];
  }
  
  export type LMSPlatform = 
    | 'canvas' 
    | 'blackboard' 
    | 'moodle' 
    | 'brightspace' 
    | 'schoology' 
    | 'google_classroom'
    | 'edmodo'
    | 'sakai';
  
  export interface LMSAuthConfig {
    type: 'oauth2' | 'api_key' | 'basic_auth' | 'saml';
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
    username?: string;
    tokenEndpoint?: string;
    authEndpoint?: string;
    scopes: string[];
  }
  
  export interface SyncSettings {
    autoSync: boolean;
    syncInterval: number; // hours
    syncItems: LMSSyncItem[];
    conflictResolution: 'local_wins' | 'remote_wins' | 'manual' | 'timestamp';
    retryAttempts: number;
    batchSize: number;
  }
  
  export type LMSSyncItem = 
    | 'courses' 
    | 'assignments' 
    | 'grades' 
    | 'announcements' 
    | 'calendar' 
    | 'discussions'
    | 'resources'
    | 'attendance';
  
  export type LMSFeature = 
    | 'course_import' 
    | 'assignment_sync' 
    | 'grade_sync' 
    | 'calendar_sync' 
    | 'announcement_sync'
    | 'file_download'
    | 'discussion_access'
    | 'submission_upload';
  
  export interface LMSCourse {
    lmsId: string;
    platform: LMSPlatform;
    name: string;
    courseCode: string;
    section?: string;
    instructor: string;
    term: string;
    status: 'active' | 'completed' | 'unpublished';
    enrollmentType: 'student' | 'teacher' | 'ta' | 'observer';
    lastAccessed?: Date;
    syllabus?: string;
    modules: LMSModule[];
    assignments: LMSAssignment[];
    announcements: LMSAnnouncement[];
  }
  
  export interface LMSModule {
    id: string;
    name: string;
    position: number;
    unlockAt?: Date;
    published: boolean;
    items: LMSModuleItem[];
  }
  
  export interface LMSModuleItem {
    id: string;
    title: string;
    type: 'assignment' | 'quiz' | 'discussion' | 'page' | 'file' | 'url' | 'video';
    position: number;
    published: boolean;
    pointsPossible?: number;
    dueAt?: Date;
    url?: string;
    completed: boolean;
  }
  
  export interface LMSAssignment {
    lmsId: string;
    name: string;
    description: string;
    dueAt?: Date;
    unlockAt?: Date;
    lockAt?: Date;
    pointsPossible: number;
    submissionTypes: string[];
    allowedExtensions?: string[];
    hasSubmittedSubmissions: boolean;
    published: boolean;
    locked: boolean;
    submission?: LMSSubmission;
  }
  
  export interface LMSSubmission {
    id: string;
    userId: string;
    submittedAt?: Date;
    score?: number;
    grade?: string;
    attempt: number;
    workflowState: 'submitted' | 'unsubmitted' | 'graded' | 'pending_review';
    late: boolean;
    missing: boolean;
    excused: boolean;
    attachments?: LMSAttachment[];
  }
  
  export interface LMSAttachment {
    id: string;
    displayName: string;
    filename: string;
    size: number;
    contentType: string;
    url: string;
    createdAt: Date;
  }
  
  export interface LMSAnnouncement {
    id: string;
    title: string;
    message: string;
    postedAt: Date;
    author: string;
    read: boolean;
    important: boolean;
  }
  
  // File Import Models
  export interface ImportFormat {
    id: string;
    name: string;
    description: string;
    fileExtensions: string[];
    mimeTypes: string[];
    university?: string; // university-specific format
    parser: string; // parser function name
    sampleTemplate?: string;
    instructions: string[];
    commonIssues: ImportIssue[];
  }
  
  export interface ImportIssue {
    issue: string;
    solution: string;
    severity: 'warning' | 'error';
  }
  
  export interface ImportResult {
    success: boolean;
    itemsProcessed: number;
    itemsImported: number;
    itemsSkipped: number;
    itemsFailed: number;
    errors: ImportError[];
    warnings: ImportWarning[];
    summary: ImportSummary;
    previewData?: any[];
  }
  
  export interface ImportError {
    row: number;
    field: string;
    value: string;
    message: string;
    suggestion?: string;
  }
  
  export interface ImportWarning {
    row: number;
    field: string;
    value: string;
    message: string;
    handled: boolean;
  }
  
  export interface ImportSummary {
    coursesImported: number;
    assignmentsImported: number;
    eventsImported: number;
    conflictsResolved: number;
    duplicatesSkipped: number;
    processingTime: number; // milliseconds
  }
  
  // Default configurations and constants
  export const DEFAULT_TERM_LENGTHS: Record<TermType, number> = {
    semester: 16,
    quarter: 10,
    trimester: 14,
    summer_session: 8,
    winter_session: 4,
    intersession: 2
  };
  
  export const COMMON_GRADING_SCALES: Record<string, GradingScale> = {
    'standard_4_0': {
      type: 'letter',
      scale: [
        { letter: 'A+', minPercentage: 97, maxPercentage: 100, gpaPoints: 4.0 },
        { letter: 'A', minPercentage: 93, maxPercentage: 96, gpaPoints: 4.0 },
        { letter: 'A-', minPercentage: 90, maxPercentage: 92, gpaPoints: 3.7 },
        { letter: 'B+', minPercentage: 87, maxPercentage: 89, gpaPoints: 3.3 },
        { letter: 'B', minPercentage: 83, maxPercentage: 86, gpaPoints: 3.0 },
        { letter: 'B-', minPercentage: 80, maxPercentage: 82, gpaPoints: 2.7 },
        { letter: 'C+', minPercentage: 77, maxPercentage: 79, gpaPoints: 2.3 },
        { letter: 'C', minPercentage: 73, maxPercentage: 76, gpaPoints: 2.0 },
        { letter: 'C-', minPercentage: 70, maxPercentage: 72, gpaPoints: 1.7 },
        { letter: 'D+', minPercentage: 67, maxPercentage: 69, gpaPoints: 1.3 },
        { letter: 'D', minPercentage: 60, maxPercentage: 66, gpaPoints: 1.0 },
        { letter: 'F', minPercentage: 0, maxPercentage: 59, gpaPoints: 0.0 }
      ],
      plusMinus: true,
      passingGrade: 'D'
    }
  };
  
  export const STANDARD_OPERATING_HOURS: OperatingHours = {
    monday: { open: '08:00', close: '17:00' },
    tuesday: { open: '08:00', close: '17:00' },
    wednesday: { open: '08:00', close: '17:00' },
    thursday: { open: '08:00', close: '17:00' },
    friday: { open: '08:00', close: '17:00' },
    holidays: 'closed'
  };
  
  export const LIBRARY_HOURS: OperatingHours = {
    monday: { open: '07:00', close: '23:00' },
    tuesday: { open: '07:00', close: '23:00' },
    wednesday: { open: '07:00', close: '23:00' },
    thursday: { open: '07:00', close: '23:00' },
    friday: { open: '07:00', close: '20:00' },
    saturday: { open: '09:00', close: '18:00' },
    sunday: { open: '12:00', close: '23:00' },
    holidays: 'limited'
  };
  
  // Utility functions
  export const getCurrentTerm = (calendar: AcademicCalendar): AcademicTerm | null => {
    const now = new Date();
    return calendar.terms.find(term => 
      now >= term.startDate && now <= term.endDate
    ) || null;
  };
  
  export const getUpcomingDeadlines = (
    calendar: AcademicCalendar, 
    daysAhead: number = 7
  ): UniversityDeadline[] => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysAhead);
    
    return calendar.deadlines.filter(deadline => 
      deadline.dueDate >= now && 
      deadline.dueDate <= futureDate &&
      deadline.status === 'upcoming'
    ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  };
  
  export const calculateTermProgress = (term: AcademicTerm): number => {
    const now = new Date();
    if (now < term.startDate) return 0;
    if (now > term.endDate) return 100;
    
    const totalDuration = term.endDate.getTime() - term.startDate.getTime();
    const elapsed = now.getTime() - term.startDate.getTime();
    
    return Math.round((elapsed / totalDuration) * 100);
  };
  
  export const isLocationAccessible = (
    location: EventLocation | Building, 
    requirements: string[]
  ): boolean => {
    // Check if location has accessibility information
    if (!location.accessibility) return false;
    
    // For EventLocation, accessibility is string[]
    if ('isVirtual' in location) {
      return requirements.every(req => 
        location.accessibility.includes(req)
      );
    }
    
    // For Building, accessibility is AccessibilityFeature[]
    const accessibilityTypes = location.accessibility.map(feature => feature.type);
    return requirements.every(req => 
      accessibilityTypes.includes(req as any)
    );
  };
  
  export const formatOperatingHours = (hours: OperatingHours): string => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const openDays = days.filter(day => hours[day as keyof OperatingHours]);
    
    if (openDays.length === 0) return 'Closed';
    if (openDays.length === 7) return 'Open daily';
    
    return `Open ${openDays.join(', ')}`;
  };
  
  export const validateAcademicCalendar = (calendar: Partial<AcademicCalendar>): string[] => {
    const errors: string[] = [];
    
    if (!calendar.academicYear?.trim()) {
      errors.push('Academic year is required');
    }
    
    if (!calendar.terms || calendar.terms.length === 0) {
      errors.push('At least one academic term is required');
    }
    
    if (calendar.terms) {
      calendar.terms.forEach((term, index) => {
        if (term.startDate >= term.endDate) {
          errors.push(`Term ${index + 1}: End date must be after start date`);
        }
      });
    }
    
    return errors;
  };
  
  export const getDaysUntilDeadline = (deadline: Date): number => {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  export const getTermByDate = (calendar: AcademicCalendar, date: Date): AcademicTerm | null => {
    return calendar.terms.find(term => 
      date >= term.startDate && date <= term.endDate
    ) || null;
  };