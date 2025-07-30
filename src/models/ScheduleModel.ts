// src/models/ScheduleModel.ts - Updated for Phase 1 Student Features

import { UserPreferences } from "./UserPreferencesModel";
import { Course } from "./CourseModel";
import { Assignment, Project } from "./AssignmentModel";
import { StudySession } from "./StudySessionModel";
import { AcademicCalendar } from "./AcademicModel";

export interface Activity {
  content: string;
  category: string;
  id?: string;
  courseId?: string;
  assignmentId?: string;
  studySessionId?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration?: number; // minutes
  actualDuration?: number;
  location?: string;
  notes?: string;
  tags?: string[];
  completionStatus?: 'not_started' | 'in_progress' | 'completed';
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
  reminders?: ActivityReminder[];
  collaborators?: string[]; // student IDs
  resources?: ActivityResource[];
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  interval: number; // every N days/weeks/months
  daysOfWeek?: string[]; // for weekly patterns
  endDate?: Date;
  exceptions?: Date[]; // dates to skip
  customDates?: Date[]; // for custom patterns
}

export interface ActivityReminder {
  id: string;
  minutesBefore: number;
  message: string;
  channels: ('email' | 'push' | 'sms' | 'in_app')[];
  sent: boolean;
  sentAt?: Date;
}

export interface ActivityResource {
  id: string;
  title: string;
  type: 'link' | 'file' | 'note' | 'contact';
  content: string; // URL, file path, note text, or contact info
  description?: string;
}

export interface CategoryColor {
  category: string;
  color: string;
  icon?: string;
  description?: string;
  isDefault?: boolean;
  priority?: number; // for ordering in UI
}

export interface ScheduleSlot {
  time: string;
  activities: {
    [day: string]: Activity;
  };
  metadata?: {
    energyLevel?: 'low' | 'medium' | 'high';
    focusLevel?: 'low' | 'medium' | 'high';
    preferredActivities?: string[];
    restrictions?: string[];
    bufferTime?: number; // minutes
  };
}

export interface TimeSlot {
  time: string;
  activities: {
    [day: string]: Activity;
  };
}

export interface ScheduleData {
  slots: TimeSlot[];
  metadata: ScheduleMetadata;
}

export interface ScheduleMetadata {
  studentId: string;
  semester: string;
  academicYear: string;
  generatedAt: Date;
  lastOptimized?: Date;
  version: string;
  source: 'manual' | 'imported' | 'ai_generated' | 'optimized';
  preferences: UserPreferences;
  statistics: ScheduleStatistics;
  conflicts: ScheduleConflict[];
  suggestions: ScheduleSuggestion[];
}

export interface ScheduleStatistics {
  totalActivities: number;
  totalStudyHours: number;
  totalClassHours: number;
  totalWorkHours: number;
  totalFreeTime: number;
  averageDailyCommute: number; // minutes
  categoryDistribution: CategoryDistribution[];
  weeklyWorkload: number; // hours
  timeUtilization: number; // percentage
  optimalityScore: number; // 0-100
}

export interface CategoryDistribution {
  category: string;
  hours: number;
  percentage: number;
  count: number;
}

export interface ScheduleConflict {
  id: string;
  type: ConflictType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedSlots: ConflictSlot[];
  suggestedResolutions: ConflictResolution[];
  autoResolvable: boolean;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: 'user' | 'system';
}

export type ConflictType = 
  | 'time_overlap' 
  | 'location_conflict' 
  | 'travel_time' 
  | 'workload_excess' 
  | 'break_insufficient' 
  | 'priority_conflict'
  | 'resource_unavailable'
  | 'deadline_impossible'
  | 'energy_mismatch';

export interface ConflictSlot {
  time: string;
  day: string;
  activity: Activity;
}

export interface ConflictResolution {
  id: string;
  description: string;
  type: 'reschedule' | 'relocate' | 'modify' | 'remove' | 'split';
  impact: 'minimal' | 'moderate' | 'significant';
  automaticApplicable: boolean;
  steps: ResolutionStep[];
  tradeoffs?: string[];
}

export interface ResolutionStep {
  action: string;
  description: string;
  parameters?: Record<string, any>;
}

export interface ScheduleSuggestion {
  id: string;
  type: SuggestionType;
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  reasoning: string;
  impact: string;
  implementation: SuggestionImplementation;
  estimatedBenefit: number; // 0-100 score
  effort: 'low' | 'medium' | 'high';
  category: 'productivity' | 'wellness' | 'academic' | 'social' | 'other';
  applied: boolean;
  appliedAt?: Date;
  feedback?: SuggestionFeedback;
}

export type SuggestionType = 
  | 'time_optimization' 
  | 'break_addition' 
  | 'study_grouping' 
  | 'commute_optimization' 
  | 'workload_balancing'
  | 'energy_alignment'
  | 'social_scheduling'
  | 'health_improvement'
  | 'deadline_management';

export interface SuggestionImplementation {
  type: 'automatic' | 'manual' | 'guided';
  steps: string[];
  previewChanges?: ScheduleChange[];
  requiredApprovals?: string[];
  reversible: boolean;
}

export interface ScheduleChange {
  type: 'add' | 'modify' | 'remove' | 'move';
  slot: string; // time-day combination
  before?: Activity;
  after?: Activity;
  reason: string;
}

export interface SuggestionFeedback {
  rating: number; // 1-5
  helpful: boolean;
  implemented: boolean;
  comments?: string;
  improvedProductivity?: boolean;
  wouldRecommend?: boolean;
}

// Date range interface for various operations
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Enhanced Schedule with Student-Specific Data
export interface StudentSchedule extends ScheduleData {
  studentId: string;
  courses: Course[];
  assignments: Assignment[];
  projects: Project[];
  studySessions: StudySession[];
  workShifts: WorkShift[];
  personalEvents: PersonalEvent[];
  examSchedule: ExamEvent[];
  breaks: ScheduledBreak[];
  academicCalendar: AcademicCalendar;
  integrations: ScheduleIntegration[];
  backups: ScheduleBackup[];
}

export interface WorkShift {
  id: string;
  jobTitle: string;
  employer: string;
  location: string;
  startTime: Date;
  endTime: Date;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  hourlyRate?: number;
  notes?: string;
  supervisor?: string;
  contactInfo?: string;
}

export interface PersonalEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  category: 'social' | 'family' | 'health' | 'personal' | 'entertainment' | 'other';
  attendees?: string[];
  priority: 'low' | 'medium' | 'high';
  reminders?: ActivityReminder[];
  travelTime?: number; // minutes
  preparation?: PreparationTask[];
}

export interface PreparationTask {
  id: string;
  description: string;
  estimatedDuration: number; // minutes
  deadline: Date; // when it should be completed before the event
  completed: boolean;
  completedAt?: Date;
}

export interface ExamEvent {
  id: string;
  courseId: string;
  examType: 'quiz' | 'midterm' | 'final' | 'practical' | 'oral';
  title: string;
  date: Date;
  startTime: string;
  duration: number; // minutes
  location: string;
  weight: number; // percentage of course grade
  topics: string[];
  allowedMaterials: string[];
  preparationPlan?: ExamPreparationPlan;
  completed?: boolean;
  result?: ExamResult;
}

export interface ExamPreparationPlan {
  startDate: Date;
  studyHours: number;
  studySessions: string[]; // study session IDs
  practiceTests: string[];
  reviewSessions: string[];
  milestones: PreparationMilestone[];
}

export interface PreparationMilestone {
  id: string;
  title: string;
  targetDate: Date;
  completed: boolean;
  completedDate?: Date;
  description?: string;
}

export interface ExamResult {
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade?: string;
  rank?: number;
  classAverage?: number;
  feedback?: string;
}

export interface ScheduledBreak {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  type: 'semester_break' | 'spring_break' | 'winter_break' | 'thanksgiving' | 'reading_days' | 'personal' | 'other';
  description?: string;
  location?: string;
  plannedActivities?: string[];
  travelPlans?: TravelPlan[];
  academicWork?: BreakAcademicWork[];
  relaxationGoals?: string[];
}

export interface TravelPlan {
  id: string;
  destination: string;
  departureDate: Date;
  returnDate: Date;
  transportation: string;
  accommodation?: string;
  companions?: string[];
  itinerary?: TravelItinerary[];
}

export interface TravelItinerary {
  date: Date;
  activities: string[];
  location: string;
  notes?: string;
}

export interface BreakAcademicWork {
  id: string;
  type: 'assignment' | 'reading' | 'project' | 'research' | 'preparation';
  courseId: string;
  description: string;
  estimatedHours: number;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

export interface ScheduleIntegration {
  id: string;
  type: 'lms' | 'calendar' | 'todo_app' | 'fitness_tracker' | 'other';
  name: string;
  platform: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  lastSync?: Date;
  syncFrequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'manual';
  syncedData: string[];
  settings: IntegrationSettings;
  conflicts: IntegrationConflict[];
}

export interface IntegrationSettings {
  autoSync: boolean;
  conflictResolution: 'local_wins' | 'remote_wins' | 'manual' | 'merge';
  dataFilters: DataFilter[];
  notifications: boolean;
  backupBeforeSync: boolean;
}

export interface DataFilter {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'greater_than' | 'less_than';
  value: string;
  include: boolean;
}

export interface IntegrationConflict {
  id: string;
  timestamp: Date;
  type: 'duplicate' | 'time_conflict' | 'data_mismatch' | 'missing_reference';
  localData: any;
  remoteData: any;
  resolution?: ConflictResolution;
  resolved: boolean;
}

export interface ScheduleBackup {
  id: string;
  timestamp: Date;
  version: string;
  description: string;
  automatic: boolean;
  size: number; // bytes
  scheduleData: ScheduleData;
  metadata: BackupMetadata;
}

export interface BackupMetadata {
  studentId: string;
  semester: string;
  coursesCount: number;
  assignmentsCount: number;
  studySessionsCount: number;
  conflictsCount: number;
  suggestionsCount: number;
  checksum: string;
}

// Schedule Analysis and Optimization
export interface ScheduleAnalysis {
  scheduleId: string;
  analysisDate: Date;
  overallScore: number; // 0-100
  categories: AnalysisCategory[];
  trends: AnalysisTrend[];
  recommendations: AnalysisRecommendation[];
  comparisons: ScheduleComparison[];
  insights: ScheduleInsight[];
}

export interface AnalysisCategory {
  name: string;
  score: number; // 0-100
  weight: number; // importance weight
  factors: AnalysisFactor[];
  improvement: string[];
}

export interface AnalysisFactor {
  name: string;
  value: number;
  target: number;
  unit: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface AnalysisTrend {
  metric: string;
  period: 'daily' | 'weekly' | 'monthly' | 'semester';
  direction: 'improving' | 'declining' | 'stable';
  changePercentage: number;
  dataPoints: TrendDataPoint[];
}

export interface TrendDataPoint {
  date: Date;
  value: number;
  context?: string;
}

export interface AnalysisRecommendation {
  id: string;
  category: 'time_management' | 'workload' | 'wellness' | 'productivity' | 'social';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImprovement: number; // percentage
  effort: 'minimal' | 'moderate' | 'significant';
  timeframe: string;
  steps: string[];
  metrics: string[]; // metrics that will improve
}

export interface ScheduleComparison {
  type: 'peer_average' | 'personal_best' | 'ideal_schedule' | 'previous_semester';
  metric: string;
  currentValue: number;
  comparisonValue: number;
  difference: number;
  percentageDifference: number;
  betterThan: number; // percentage of comparison group
}

export interface ScheduleInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'opportunity' | 'risk' | 'achievement';
  severity: 'info' | 'warning' | 'critical' | 'positive';
  title: string;
  description: string;
  data: any;
  actionable: boolean;
  actions?: string[];
  relatedMetrics: string[];
  confidence: number; // 0-1
}

// Schedule Templates and Presets
export interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  category: 'academic' | 'work_study' | 'research' | 'athletics' | 'balanced' | 'intensive';
  targetAudience: string[]; // 'freshman', 'stem_major', 'pre_med', etc.
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeCommitment: 'light' | 'moderate' | 'heavy' | 'intensive';
  structure: TemplateStructure;
  customizations: TemplateCustomization[];
  usage: TemplateUsage;
  ratings: TemplateRating[];
  createdBy: string;
  createdAt: Date;
  lastUpdated: Date;
}

export interface TemplateStructure {
  weeklyHours: WeeklyHourDistribution;
  dailyPatterns: DailyPattern[];
  commonActivities: TemplateActivity[];
  breakSchedule: BreakSchedule;
  flexibilityRules: FlexibilityRule[];
}

export interface WeeklyHourDistribution {
  classes: number;
  study: number;
  work: number;
  personal: number;
  sleep: number;
  meals: number;
  exercise: number;
  social: number;
  commute: number;
  buffer: number;
}

export interface DailyPattern {
  dayType: 'weekday' | 'weekend' | 'exam_day' | 'light_day';
  wakeTime: string;
  sleepTime: string;
  mealTimes: string[];
  studyBlocks: TimeBlock[];
  breakPattern: string;
  flexibility: 'rigid' | 'flexible' | 'adaptive';
}

export interface TimeBlock {
  startTime: string;
  endTime: string;
  activity: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  flexibility: 'fixed' | 'moveable' | 'optional';
}

export interface BreakSchedule {
  shortBreaks: number; // minutes every hour
  longBreaks: number; // minutes every few hours
  lunchBreak: number;
  exerciseBreak: number;
  socialBreak: number;
  pattern: 'regular' | 'energy_based' | 'task_based';
}

export interface FlexibilityRule {
  condition: string;
  action: string;
  priority: number;
  description: string;
}

export interface TemplateActivity {
  name: string;
  category: string;
  defaultDuration: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  priority: 'low' | 'medium' | 'high';
  timePreferences: string[];
  dependencies: string[];
}

export interface TemplateCustomization {
  field: string;
  type: 'number' | 'time' | 'selection' | 'boolean' | 'text';
  label: string;
  description: string;
  options?: string[];
  defaultValue: any;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern';
  value: any;
  message: string;
}

export interface TemplateUsage {
  timesUsed: number;
  averageRating: number;
  successRate: number; // percentage who completed semester
  mostCommonCustomizations: string[];
  userFeedback: string[];
}

export interface TemplateRating {
  userId: string;
  rating: number; // 1-5
  review?: string;
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
  usedFor: string; // semester/situation
  date: Date;
}

// Legacy compatibility interfaces
export interface Schedule {
  slots: ScheduleSlot[];
  preferences: UserPreferences;
}

// Utility types for better type safety
export type ScheduleViewMode = 'day' | 'week' | 'month' | 'agenda' | 'timeline';
export type ScheduleFilterType = 'category' | 'course' | 'priority' | 'status' | 'location';
export type OptimizationGoal = 'productivity' | 'wellness' | 'balance' | 'academic' | 'social';
export type ScheduleExportFormat = 'csv' | 'ics' | 'pdf' | 'json' | 'xlsx';

// Constants and defaults
export const DEFAULT_CATEGORY_COLORS: CategoryColor[] = [
  { category: 'Classes', color: '#3B82F6', icon: '🎓', description: 'Lectures, seminars, labs', isDefault: true, priority: 1 },
  { category: 'Study', color: '#8B5CF6', icon: '📚', description: 'Individual study time', isDefault: true, priority: 2 },
  { category: 'Assignments', color: '#EF4444', icon: '📝', description: 'Homework and projects', isDefault: true, priority: 3 },
  { category: 'Work', color: '#10B981', icon: '💼', description: 'Part-time job or internship', isDefault: true, priority: 4 },
  { category: 'Exercise', color: '#F59E0B', icon: '🏃‍♂️', description: 'Gym, sports, fitness', isDefault: true, priority: 5 },
  { category: 'Meals', color: '#84CC16', icon: '🍽️', description: 'Breakfast, lunch, dinner', isDefault: true, priority: 6 },
  { category: 'Sleep', color: '#6B7280', icon: '😴', description: 'Sleep and rest', isDefault: true, priority: 7 },
  { category: 'Social', color: '#EC4899', icon: '👥', description: 'Friends, parties, events', isDefault: true, priority: 8 },
  { category: 'Personal', color: '#06B6D4', icon: '🏠', description: 'Personal care, errands', isDefault: true, priority: 9 },
  { category: 'Commute', color: '#64748B', icon: '🚗', description: 'Travel time', isDefault: true, priority: 10 }
];

export const SCHEDULE_TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
});

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const ACADEMIC_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

// Validation functions
export const validateScheduleData = (schedule: Partial<StudentSchedule>): string[] => {
  const errors: string[] = [];
  
  if (!schedule.studentId) {
    errors.push('Student ID is required');
  }
  
  if (!schedule.slots || schedule.slots.length === 0) {
    errors.push('Schedule must have at least one time slot');
  }
  
  if (schedule.courses && schedule.assignments) {
    // Validate that all assignments belong to enrolled courses
    const courseIds = new Set(schedule.courses.map(c => c.id));
    const invalidAssignments = schedule.assignments.filter(a => !courseIds.has(a.courseId));
    
    if (invalidAssignments.length > 0) {
      errors.push(`${invalidAssignments.length} assignments reference invalid courses`);
    }
  }
  
  // Validate time slots don't overlap
  if (schedule.slots) {
    const timeSlots = schedule.slots.map(slot => slot.time);
    const duplicates = timeSlots.filter((time, index) => timeSlots.indexOf(time) !== index);
    
    if (duplicates.length > 0) {
      errors.push('Duplicate time slots found');
    }
  }
  
  return errors;
};

export const calculateScheduleUtilization = (schedule: StudentSchedule): number => {
  let totalSlots = 0;
  let filledSlots = 0;
  
  schedule.slots.forEach(slot => {
    Object.values(slot.activities).forEach(activity => {
      totalSlots++;
      if (activity.content !== 'Free Time' && activity.content !== 'Sleep') {
        filledSlots++;
      }
    });
  });
  
  return totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;
};

export const getScheduleConflicts = (schedule: StudentSchedule): ScheduleConflict[] => {
  const conflicts: ScheduleConflict[] = [];
  
  // Check for time overlaps
  schedule.slots.forEach((slot, index) => {
    Object.entries(slot.activities).forEach(([day, activity]) => {
      if (activity.courseId) {
        // Check if this conflicts with other activities at the same time
        const otherActivities = Object.entries(slot.activities)
          .filter(([d, a]) => d !== day && a.content !== 'Free Time');
        
        if (otherActivities.length > 0) {
          conflicts.push({
            id: `conflict-${index}-${day}`,
            type: 'time_overlap',
            severity: 'high',
            description: `Time conflict on ${day} at ${slot.time}`,
            affectedSlots: [
              { time: slot.time, day, activity },
              ...otherActivities.map(([d, a]) => ({ time: slot.time, day: d, activity: a }))
            ],
            suggestedResolutions: [],
            autoResolvable: false,
            resolved: false
          });
        }
      }
    });
  });
  
  return conflicts;
};

export const optimizeScheduleForGoal = (
  schedule: StudentSchedule, 
  goal: OptimizationGoal
): StudentSchedule => {
  // This would contain the optimization logic based on the goal
  // For now, return the original schedule
  return schedule;
};

export const generateScheduleFromTemplate = (
  template: ScheduleTemplate,
  student: { id: string; preferences: UserPreferences; courses: Course[] }
): StudentSchedule => {
  // This would generate a schedule based on the template
  // Implementation would be complex and is placeholder for now
  throw new Error('Template-based schedule generation not yet implemented');
};

export const exportSchedule = (
  schedule: StudentSchedule, 
  format: ScheduleExportFormat,
  options?: { dateRange?: DateRange; includeDetails?: boolean; }
): string | Blob => {
  // This would handle various export formats
  // Implementation would be format-specific
  throw new Error('Schedule export not yet implemented');
};