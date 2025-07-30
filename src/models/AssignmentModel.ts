// src/models/AssignmentModel.ts

export interface Assignment {
    id: string;
    courseId: string;
    title: string;
    description: string;
    type: AssignmentType;
    dueDate: Date;
    assignedDate: Date;
    submissionDetails: SubmissionDetails;
    grading: AssignmentGrading;
    requirements: AssignmentRequirements;
    progress: AssignmentProgress;
    collaboration: CollaborationInfo;
    resources: AssignmentResource[];
    reminders: ReminderSettings[];
    priority: Priority;
    tags: string[];
    status: AssignmentStatus;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Project extends Assignment {
    milestones: ProjectMilestone[];
    timeline: ProjectTimeline;
    team?: TeamInfo;
    budget?: ProjectBudget;
    risks: RiskAssessment[];
    deliverables: Deliverable[];
    researchComponents?: ResearchComponent[];
  }
  
  export type AssignmentType = 
    | 'homework' 
    | 'quiz' 
    | 'exam' 
    | 'midterm' 
    | 'final' 
    | 'project' 
    | 'paper' 
    | 'essay' 
    | 'presentation' 
    | 'lab_report' 
    | 'case_study' 
    | 'group_project' 
    | 'thesis' 
    | 'dissertation'
    | 'other';
  
  export type AssignmentStatus = 
    | 'not_started' 
    | 'planning' 
    | 'in_progress' 
    | 'review' 
    | 'completed' 
    | 'submitted' 
    | 'graded' 
    | 'late' 
    | 'missing' 
    | 'excused';
  
  export type Priority = 'low' | 'medium' | 'high' | 'urgent';
  
  export interface SubmissionDetails {
    method: SubmissionMethod;
    location?: string; // URL or physical location
    format: string[]; // ['PDF', 'DOCX', 'PPT']
    maxFileSize?: number; // in MB
    allowedAttempts: number;
    currentAttempt: number;
    latePolicy: LatePolicyInfo;
    submissionHistory: SubmissionAttempt[];
    requiresPlagiarismCheck: boolean;
    submittedAt?: Date;
    confirmationCode?: string;
  }
  
  export type SubmissionMethod = 
    | 'online_upload' 
    | 'email' 
    | 'physical' 
    | 'presentation' 
    | 'oral_exam' 
    | 'practical_demo' 
    | 'portfolio';
  
  export interface LatePolicyInfo {
    penaltyType: 'percentage' | 'points' | 'letter_grade' | 'zero';
    penaltyAmount: number;
    penaltyPer: 'day' | 'hour' | 'assignment';
    gracePeriod?: number; // minutes
    maxLateDays?: number;
    acceptsLateWork: boolean;
  }
  
  export interface SubmissionAttempt {
    attemptNumber: number;
    submittedAt: Date;
    files: SubmittedFile[];
    feedback?: string;
    grade?: number;
    isPlagiarismChecked: boolean;
    plagiarismScore?: number;
  }
  
  export interface SubmittedFile {
    filename: string;
    size: number;
    format: string;
    uploadedAt: Date;
    path?: string;
    checksum?: string;
  }
  
  export interface AssignmentGrading {
    totalPoints: number;
    earnedPoints?: number;
    percentage?: number;
    letterGrade?: string;
    rubric?: GradingRubric;
    feedback?: GradingFeedback;
    gradeWeight: number; // percentage of course grade
    gradedAt?: Date;
    gradedBy?: string;
    isExtraCredit: boolean;
    curveApplied?: number;
  }
  
  export interface GradingRubric {
    id: string;
    name: string;
    criteria: RubricCriterion[];
    totalPoints: number;
    description?: string;
  }
  
  export interface RubricCriterion {
    id: string;
    name: string;
    description: string;
    maxPoints: number;
    earnedPoints?: number;
    levels: RubricLevel[];
    comments?: string;
  }
  
  export interface RubricLevel {
    name: string; // "Excellent", "Good", "Fair", "Poor"
    description: string;
    points: number;
  }
  
  export interface GradingFeedback {
    overallComments: string;
    strengths: string[];
    areasForImprovement: string[];
    specificComments: SpecificComment[];
    suggestedResources: string[];
    followUpActions: string[];
  }
  
  export interface SpecificComment {
    section: string; // "Introduction", "Methodology", etc.
    comment: string;
    type: 'positive' | 'constructive' | 'question' | 'suggestion';
    lineNumber?: number;
    isResolved: boolean;
  }
  
  export interface AssignmentRequirements {
    wordCount?: {
      min?: number;
      max?: number;
      current?: number;
    };
    pageCount?: {
      min?: number;
      max?: number;
    };
    citations?: {
      style: 'APA' | 'MLA' | 'Chicago' | 'IEEE' | 'Harvard' | 'Other';
      minSources: number;
      sourceTypes: string[]; // ['journal', 'book', 'website']
    };
    technicalRequirements?: TechnicalRequirement[];
    learningObjectives: string[];
    skillsAssessed: string[];
    prerequisites: string[];
  }
  
  export interface TechnicalRequirement {
    type: 'software' | 'hardware' | 'platform' | 'language' | 'framework';
    name: string;
    version?: string;
    required: boolean;
    notes?: string;
  }
  
  export interface AssignmentProgress {
    completionPercentage: number;
    timeSpent: number; // minutes
    estimatedTimeRemaining: number; // minutes
    tasks: AssignmentTask[];
    checkpoints: ProgressCheckpoint[];
    blockers: Blocker[];
    notes: ProgressNote[];
    lastWorkedOn?: Date;
  }
  
  export interface AssignmentTask {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    completedAt?: Date;
    estimatedMinutes: number;
    actualMinutes?: number;
    priority: Priority;
    dependencies: string[]; // other task IDs
    category: 'research' | 'writing' | 'coding' | 'design' | 'review' | 'other';
  }
  
  export interface ProgressCheckpoint {
    id: string;
    title: string;
    description: string;
    targetDate: Date;
    completedDate?: Date;
    percentage: number; // 0-100
    deliverables: string[];
    notes?: string;
  }
  
  export interface Blocker {
    id: string;
    title: string;
    description: string;
    type: 'technical' | 'resource' | 'knowledge' | 'external' | 'time';
    severity: 'low' | 'medium' | 'high' | 'critical';
    identifiedAt: Date;
    resolvedAt?: Date;
    resolution?: string;
    preventable: boolean;
  }
  
  export interface ProgressNote {
    id: string;
    content: string;
    timestamp: Date;
    category: 'insight' | 'question' | 'decision' | 'resource' | 'progress';
    tags: string[];
  }
  
  export interface CollaborationInfo {
    isGroupWork: boolean;
    teamSize?: number;
    teammates?: Teammate[];
    roleAssignments: RoleAssignment[];
    communicationPlan: CommunicationPlan;
    conflictResolution?: ConflictResolution[];
  }
  
  export interface Teammate {
    id: string;
    name: string;
    email: string;
    skills: string[];
    availability: TimeSlot[];
    contactPreference: 'email' | 'slack' | 'discord' | 'phone' | 'in_person';
    reliability: number; // 1-5 rating
    notes?: string;
  }
  
  export interface RoleAssignment {
    teammateId: string;
    role: string;
    responsibilities: string[];
    deliverables: string[];
    weight: number; // percentage of work
  }
  
  export interface CommunicationPlan {
    primaryChannel: string; // 'slack', 'discord', 'email', etc.
    meetingSchedule: MeetingSchedule[];
    responseTimeExpectation: number; // hours
    decisionMakingProcess: string;
    conflictResolutionProcess: string;
  }
  
  export interface MeetingSchedule {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'as_needed';
    duration: number; // minutes
    platform: string;
    recurringTime?: TimeSlot;
  }
  
  export interface ConflictResolution {
    id: string;
    description: string;
    involvedParties: string[];
    resolution: string;
    resolvedAt: Date;
    mediatedBy?: string;
  }
  
  export interface AssignmentResource {
    id: string;
    title: string;
    type: ResourceType;
    url?: string;
    file?: File;
    description?: string;
    category: ResourceCategory;
    isRequired: boolean;
    accessedAt?: Date;
    rating?: number; // 1-5 usefulness rating
    notes?: string;
  }
  
  export type ResourceType = 
    | 'article' 
    | 'book' 
    | 'video' 
    | 'tutorial' 
    | 'tool' 
    | 'template' 
    | 'example' 
    | 'dataset'
    | 'api'
    | 'documentation';
  
  export type ResourceCategory = 
    | 'reference' 
    | 'research' 
    | 'tools' 
    | 'examples' 
    | 'templates' 
    | 'datasets' 
    | 'tutorials';
  
  export interface ReminderSettings {
    id: string;
    type: 'due_date' | 'milestone' | 'checkpoint' | 'custom';
    triggerBefore: number; // minutes before due date
    message: string;
    channels: ReminderChannel[];
    isActive: boolean;
    lastTriggered?: Date;
  }
  
  export type ReminderChannel = 'email' | 'push' | 'sms' | 'in_app';
  
  export interface TimeSlot {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }
  
  // Project-specific interfaces
  export interface ProjectMilestone {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    completedDate?: Date;
    deliverables: string[];
    dependencies: string[]; // other milestone IDs
    weight: number; // percentage of project grade
    status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
    assignedTo?: string[];
    estimatedHours: number;
    actualHours?: number;
    risks: string[];
  }
  
  export interface ProjectTimeline {
    startDate: Date;
    endDate: Date;
    phases: ProjectPhase[];
    criticalPath: string[]; // milestone IDs
    bufferTime: number; // days
    lastUpdated: Date;
  }
  
  export interface ProjectPhase {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    milestones: string[]; // milestone IDs
    dependencies: string[]; // other phase IDs
    resources: string[];
    risks: string[];
  }
  
  export interface TeamInfo {
    id: string;
    name: string;
    members: Teammate[];
    leader?: string;
    roles: RoleDefinition[];
    workingAgreement: WorkingAgreement;
    performanceMetrics: TeamPerformanceMetric[];
  }
  
  export interface RoleDefinition {
    title: string;
    description: string;
    responsibilities: string[];
    requiredSkills: string[];
    timeCommitment: number; // hours per week
  }
  
  export interface WorkingAgreement {
    communicationRules: string[];
    meetingSchedule: string;
    qualityStandards: string[];
    conflictResolution: string;
    decisionMaking: string;
    codeOfConduct: string[];
  }
  
  export interface TeamPerformanceMetric {
    metric: string;
    value: number;
    target: number;
    period: string;
    trend: 'improving' | 'declining' | 'stable';
  }
  
  export interface ProjectBudget {
    totalBudget: number;
    categories: BudgetCategory[];
    expenses: Expense[];
    remaining: number;
    currency: string;
  }
  
  export interface BudgetCategory {
    name: string;
    allocated: number;
    spent: number;
    remaining: number;
  }
  
  export interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: Date;
    approvedBy?: string;
    receipt?: string;
  }
  
  export interface RiskAssessment {
    id: string;
    title: string;
    description: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    category: 'technical' | 'resource' | 'schedule' | 'scope' | 'external';
    mitigationStrategy: string;
    contingencyPlan: string;
    owner: string;
    status: 'identified' | 'monitoring' | 'occurred' | 'resolved';
    identifiedDate: Date;
    lastReviewed: Date;
  }
  
  export interface Deliverable {
    id: string;
    title: string;
    description: string;
    type: 'document' | 'code' | 'presentation' | 'prototype' | 'report' | 'other';
    dueDate: Date;
    submittedDate?: Date;
    quality: 'draft' | 'review' | 'final' | 'approved';
    assignedTo: string[];
    dependencies: string[];
    acceptanceCriteria: string[];
    status: 'not_started' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  }
  
  export interface ResearchComponent {
    id: string;
    title: string;
    type: 'literature_review' | 'data_collection' | 'analysis' | 'methodology' | 'hypothesis';
    description: string;
    sources: ResearchSource[];
    findings: string[];
    methodology: string;
    limitations: string[];
    conclusions: string[];
    nextSteps: string[];
  }
  
  export interface ResearchSource {
    id: string;
    title: string;
    authors: string[];
    publicationType: 'journal' | 'book' | 'conference' | 'thesis' | 'website' | 'report';
    publicationDate: Date;
    publisher?: string;
    doi?: string;
    url?: string;
    citationStyle: string;
    relevanceScore: number; // 1-5
    notes: string;
    quotes: SourceQuote[];
  }
  
  export interface SourceQuote {
    id: string;
    text: string;
    pageNumber?: number;
    context: string;
    tags: string[];
    usedInSection?: string;
  }
  
  // Utility functions and constants
  export const ASSIGNMENT_TYPE_LABELS: Record<AssignmentType, string> = {
    homework: 'Homework',
    quiz: 'Quiz',
    exam: 'Exam',
    midterm: 'Midterm Exam',
    final: 'Final Exam',
    project: 'Project',
    paper: 'Paper',
    essay: 'Essay',
    presentation: 'Presentation',
    lab_report: 'Lab Report',
    case_study: 'Case Study',
    group_project: 'Group Project',
    thesis: 'Thesis',
    dissertation: 'Dissertation',
    other: 'Other'
  };
  
  export const PRIORITY_COLORS: Record<Priority, string> = {
    low: '#10B981',      // green
    medium: '#F59E0B',   // amber
    high: '#EF4444',     // red
    urgent: '#DC2626'    // dark red
  };
  
  export const STATUS_COLORS: Record<AssignmentStatus, string> = {
    not_started: '#6B7280',    // gray
    planning: '#3B82F6',       // blue
    in_progress: '#F59E0B',    // amber
    review: '#8B5CF6',         // purple
    completed: '#10B981',      // green
    submitted: '#059669',      // emerald
    graded: '#0D9488',         // teal
    late: '#DC2626',           // red
    missing: '#991B1B',        // dark red
    excused: '#6B7280'         // gray
  };
  
  // Validation functions
  export const validateAssignment = (assignment: Partial<Assignment>): string[] => {
    const errors: string[] = [];
    
    if (!assignment.title?.trim()) {
      errors.push('Assignment title is required');
    }
    
    if (!assignment.courseId) {
      errors.push('Course ID is required');
    }
    
    if (!assignment.dueDate) {
      errors.push('Due date is required');
    } else if (assignment.dueDate < new Date()) {
      errors.push('Due date cannot be in the past');
    }
    
    if (!assignment.type) {
      errors.push('Assignment type is required');
    }
    
    if (!assignment.grading?.totalPoints || assignment.grading.totalPoints <= 0) {
      errors.push('Total points must be greater than 0');
    }
    
    return errors;
  };
  
  export const calculateAssignmentProgress = (assignment: Assignment): number => {
    if (!assignment.progress.tasks.length) {
      return assignment.progress.completionPercentage;
    }
    
    const completedTasks = assignment.progress.tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / assignment.progress.tasks.length) * 100);
  };
  
  export const getAssignmentUrgency = (assignment: Assignment): 'low' | 'medium' | 'high' | 'critical' => {
    const now = new Date();
    const timeUntilDue = assignment.dueDate.getTime() - now.getTime();
    const hoursUntilDue = timeUntilDue / (1000 * 60 * 60);
    
    if (hoursUntilDue < 0) return 'critical'; // overdue
    if (hoursUntilDue < 24) return 'critical'; // due within 24 hours
    if (hoursUntilDue < 72) return 'high'; // due within 3 days
    if (hoursUntilDue < 168) return 'medium'; // due within 1 week
    return 'low';
  };
  
  export const estimateCompletionTime = (assignment: Assignment): number => {
    const incompleteTasks = assignment.progress.tasks.filter(task => !task.completed);
    return incompleteTasks.reduce((total, task) => total + task.estimatedMinutes, 0);
  };
  
  export const getAssignmentsByPriority = (assignments: Assignment[]): Record<Priority, Assignment[]> => {
    return assignments.reduce((acc, assignment) => {
      if (!acc[assignment.priority]) {
        acc[assignment.priority] = [];
      }
      acc[assignment.priority].push(assignment);
      return acc;
    }, {} as Record<Priority, Assignment[]>);
  };