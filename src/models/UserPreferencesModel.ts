// src/models/UserPreferencesModel.ts - Updated for Phase 1 Student Features

import { CategoryColor } from './ScheduleModel';
import { StudyLocation, TimePreference, NotificationSettings } from './StudentModel';

export interface UserPreferences {
  // Basic schedule preferences (existing)
  startDay: string;
  startTime: string;
  desiredSleepHours: number;
  bedTime: string;
  workScheduleConstant: boolean;
  workStartTime: string;
  workEndTime: string;
  workDays: string[];
  categoryColors: CategoryColor[];
  
  // Enhanced student-specific preferences
  academic: AcademicPreferences;
  study: StudyPreferences;
  wellness: WellnessPreferences;
  social: SocialPreferences;
  productivity: ProductivityPreferences;
  notifications: NotificationSettings;
  privacy: PrivacyPreferences;
  accessibility: AccessibilityPreferences;
  integrations: IntegrationPreferences;
  
  // Profile metadata
  profileVersion: string;
  lastUpdated: Date;
  onboardingCompleted: boolean;
  customizations: CustomizationSetting[];
}

export interface AcademicPreferences {
  // Student identification
  studentId: string; // Added studentId property
  
  // Class preferences
  preferredClassTimes: TimePreference[];
  avoidEarlyClasses: boolean;
  earlyClassThreshold: string; // "08:00"
  avoidLateClasses: boolean;
  lateClassThreshold: string; // "18:00"
  
  
  // Study preferences
  studyTimePreference: 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible';
  optimalStudyDuration: number; // minutes per session
  breakFrequency: number; // minutes between breaks
  breakDuration: number; // minutes per break
  studyLocations: StudyLocation[];
  defaultStudyLocation: string; // location ID
  
  // Assignment preferences
  assignmentBuffer: number; // days before due date to aim for completion
  workAheadPreference: boolean;
  lastMinuteWorker: boolean;
  groupWorkPreference: 'prefer' | 'neutral' | 'avoid';
  
  // Exam preferences
  examPrepTime: number; // days to prepare before exam
  intensiveStudyPreference: boolean;
  spacedStudyPreference: boolean;
  reviewSessionFrequency: 'daily' | 'every_other_day' | 'weekly';
  
  // Grade tracking
  trackGrades: boolean;
  gpaGoal?: number;
  semesterGpaGoal?: number;
  gradingScale: 'letter' | 'percentage' | 'points';
  
  // Course load management
  maxCreditsPerSemester: number;
  preferredCourseLoad: 'light' | 'moderate' | 'heavy' | 'maximum';
  difficultyBalance: boolean; // balance easy and hard courses
  workloadDistribution: 'even' | 'front_loaded' | 'back_loaded' | 'flexible';
}

export interface StudyPreferences {
  // Learning style
  learningStyle: ('visual' | 'auditory' | 'kinesthetic' | 'reading_writing')[];
  preferredStudyMethods: StudyMethod[];
  
  // Environment preferences
  noisePreference: 'silent' | 'quiet' | 'moderate' | 'background_music' | 'busy';
  temperaturePreference: 'cool' | 'moderate' | 'warm';
  lightingPreference: 'bright' | 'moderate' | 'dim' | 'natural';
  
  // Session structure
  focusSessionLength: number; // minutes
  maxStudySessionLength: number; // minutes
  pomodoroPreference: boolean;
  pomodoroWorkTime: number; // minutes
  pomodoroBreakTime: number; // minutes
  pomodoroLongBreakTime: number; // minutes
  pomodoroSessionsBeforeLongBreak: number;
  
  // Study habits
  studyAlonePreference: boolean;
  groupStudyFrequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'always';
  maxGroupSize: number;
  studyBuddyPreference: boolean;
  
  // Content organization
  noteOrganizationMethod: 'chronological' | 'topical' | 'cornell' | 'mind_maps' | 'digital' | 'mixed';
  reviewFrequency: 'daily' | 'weekly' | 'before_exams' | 'as_needed';
  spacedRepetitionUse: boolean;
  flashcardPreference: boolean;
  
  // Technology use
  digitalToolsPreference: boolean;
  handwrittenNotesPreference: boolean;
  recordedLecturesUsage: 'always' | 'sometimes' | 'rarely' | 'never';
  onlineResourcesUsage: 'heavy' | 'moderate' | 'light' | 'minimal';
}

export interface StudyMethod {
  name: string;
  effectiveness: number; // 1-5 rating
  frequency: 'always' | 'often' | 'sometimes' | 'rarely' | 'never';
  subjects: string[]; // which subjects it works best for
  timeOfDay: string[]; // when it works best
  notes?: string;
}

export interface WellnessPreferences {
  // Sleep preferences
  sleepGoal: number; // hours per night
  bedtimeRoutine: boolean;
  bedtimeRoutineDuration: number; // minutes
  wakeUpRoutine: boolean;
  wakeUpRoutineDuration: number; // minutes
  sleepConsistency: boolean; // same bedtime/wake time daily
  weekendSleepPattern: 'same' | 'later_bedtime' | 'longer_sleep' | 'flexible';
  
  // Exercise preferences
  exerciseGoal: number; // minutes per day
  exerciseTypes: ExerciseType[];
  exerciseTimePreference: 'morning' | 'afternoon' | 'evening' | 'flexible';
  gymMembership: boolean;
  homeWorkoutPreference: boolean;
  outdoorActivityPreference: boolean;
  sportsParticipation: boolean;
  
  // Nutrition preferences
  mealPlanningPreference: boolean;
  cookingFrequency: 'daily' | 'often' | 'sometimes' | 'rarely' | 'never';
  diningHallUsage: 'always' | 'often' | 'sometimes' | 'rarely' | 'never';
  healthyEatingGoals: boolean;
  specialDietaryNeeds: string[];
  hydrateReminders: boolean;
  hydrationGoal: number; // glasses per day
  
  // Mental health preferences
  stressManagementTechniques: StressTechnique[];
  mindfulnessPractice: boolean;
  meditationFrequency: 'daily' | 'weekly' | 'monthly' | 'as_needed' | 'never';
  therapyAccess: boolean;
  mentalHealthResources: boolean;
  
  // Break preferences
  microBreakFrequency: number; // minutes between micro breaks
  microBreakDuration: number; // seconds
  longerBreakFrequency: number; // hours between longer breaks
  longerBreakDuration: number; // minutes
  breakActivities: BreakActivity[];
  outdoorBreakPreference: boolean;
  socialBreakPreference: boolean;
}

export interface ExerciseType {
  name: string;
  frequency: number; // times per week
  duration: number; // minutes per session
  intensity: 'low' | 'moderate' | 'high';
  preference: number; // 1-5 rating
  location: 'gym' | 'home' | 'outdoor' | 'pool' | 'court' | 'studio';
  equipment: string[];
}

export interface StressTechnique {
  name: string;
  effectiveness: number; // 1-5 rating
  duration: number; // minutes
  situationsUsedFor: string[];
  frequency: 'daily' | 'weekly' | 'as_needed' | 'rarely';
}

export interface BreakActivity {
  name: string;
  type: 'physical' | 'mental' | 'social' | 'creative' | 'restful';
  duration: number; // minutes
  preference: number; // 1-5 rating
  energyLevel: 'low' | 'medium' | 'high';
  location: 'indoor' | 'outdoor' | 'either';
}

export interface SocialPreferences {
  // Social time allocation
  socialTimeGoal: number; // hours per week
  socialTimeDistribution: 'daily' | 'clustered_weekends' | 'evening_focused' | 'flexible';
  
  // Activity preferences
  socialActivityTypes: SocialActivity[];
  partyFrequency: 'never' | 'rarely' | 'monthly' | 'weekly' | 'often';
  clubParticipation: boolean;
  volunteeringInterest: boolean;
  volunteeringHours: number; // per month
  
  // Relationship management
  prioritizeCloseStudyFriends: boolean;
  studyGroupParticipation: boolean;
  networkingImportance: number; // 1-5
  professionalEventAttendance: boolean;
  
  // Social boundaries
  socialMediaLimits: boolean;
  socialMediaDailyLimit: number; // minutes
  phoneFreeDuringStudy: boolean;
  quietHoursRespect: boolean;
  roommateCommunication: 'frequent' | 'daily' | 'weekly' | 'as_needed' | 'minimal';
  
  // Event preferences
  campusEventAttendance: 'frequent' | 'occasional' | 'rare' | 'never';
  culturalEventInterest: boolean;
  sportsEventAttendance: boolean;
  academicEventAttendance: boolean;
}

export interface SocialActivity {
  name: string;
  type: 'casual' | 'structured' | 'academic' | 'cultural' | 'recreational' | 'service';
  frequency: number; // times per month
  duration: number; // hours per activity
  groupSize: 'small' | 'medium' | 'large';
  cost: 'free' | 'low' | 'moderate' | 'high';
  preference: number; // 1-5 rating
}

export interface ProductivityPreferences {
  // Time management
  timeTrackingPreference: boolean;
  deadlineAwareness: 'high' | 'moderate' | 'low';
  procrastinationTendency: 'low' | 'moderate' | 'high';
  multitaskingPreference: boolean;
  batchSimilarTasks: boolean;
  
  // Planning preferences
  planningHorizon: 'daily' | 'weekly' | 'monthly' | 'semester';
  planningMethod: 'digital' | 'paper' | 'mixed';
  goalSettingFrequency: 'daily' | 'weekly' | 'monthly' | 'semester';
  progressTrackingMethod: 'manual' | 'automated' | 'mixed';
  
  // Work habits
  deepWorkSessions: boolean;
  deepWorkDuration: number; // minutes
  taskSwitchingComfort: 'low' | 'moderate' | 'high';
  prioritizationMethod: 'eisenhower' | 'abc' | 'importance' | 'deadline' | 'effort' | 'intuitive';
  
  // Focus and concentration
  distractionSusceptibility: 'low' | 'moderate' | 'high';
  commonDistractions: Distraction[];
  focusEnhancementTechniques: FocusTechnique[];
  environmentalNeeds: EnvironmentalNeed[];
  
  // Energy management
  energyPatternAwareness: boolean;
  peakEnergyTimes: string[]; // time periods
  lowEnergyTimes: string[];
  energyBoostMethods: EnergyBoostMethod[];
  fatigueCues: string[];
  
  // Technology preferences
  productivityAppsUse: boolean;
  favoriteProdApps: string[];
  automationInterest: boolean;
  digitalMinimalismPractice: boolean;
  notificationManagement: 'strict' | 'moderate' | 'flexible' | 'unrestricted';
}

export interface Distraction {
  source: string;
  frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
  impact: 'low' | 'moderate' | 'high' | 'severe';
  mitigation: string[];
  triggers: string[];
}

export interface FocusTechnique {
  name: string;
  effectiveness: number; // 1-5
  duration: number; // minutes
  situationsUsedFor: string[];
  requirements: string[]; // what's needed to implement
}

export interface EnvironmentalNeed {
  factor: string; // 'lighting', 'temperature', 'noise', etc.
  preference: string;
  importance: 'low' | 'moderate' | 'high' | 'critical';
  flexibility: 'rigid' | 'somewhat_flexible' | 'very_flexible';
}

export interface EnergyBoostMethod {
  method: string;
  effectiveness: number; // 1-5
  duration: number; // minutes
  sideEffects: string[];
  frequency: 'as_needed' | 'daily' | 'weekly' | 'rarely';
}

export interface PrivacyPreferences {
  dataSharing: 'minimal' | 'selective' | 'open';
  analyticsOptIn: boolean;
  performanceDataSharing: boolean;
  scheduleVisibility: 'private' | 'friends' | 'study_groups' | 'public';
  locationSharing: boolean;
  calendarIntegrationSharing: boolean;
  gradeSharingComfort: 'none' | 'gpa_only' | 'close_friends' | 'study_groups';
  studyHabitsSharing: boolean;
  anonymousResearchParticipation: boolean;
  marketingOptIn: boolean;
  thirdPartyIntegrations: 'none' | 'essential' | 'selected' | 'all';
  dataRetentionPreference: 'minimal' | 'academic_year' | 'degree_completion' | 'indefinite';
}

export interface AccessibilityPreferences {
  // Visual accessibility
  highContrast: boolean;
  largeText: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra_large';
  colorBlindFriendly: boolean;
  colorBlindType?: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
  reducedMotion: boolean;
  screenReaderCompatible: boolean;
  
  // Motor accessibility
  keyboardNavigation: boolean;
  mouseAlternatives: boolean;
  voiceControl: boolean;
  touchGestures: boolean;
  
  // Cognitive accessibility
  simplifiedInterface: boolean;
  consistentNavigation: boolean;
  clearInstructions: boolean;
  minimizeDistractions: boolean;
  
  // Hearing accessibility
  visualNotifications: boolean;
  captionsPreference: boolean;
  audioDescriptions: boolean;
  
  // Academic accommodations
  extendedTime: boolean;
  extendedTimeMultiplier: number; // 1.5x, 2x, etc.
  alternativeFormats: boolean;
  preferredFormats: string[];
  assistiveTechnology: string[];
  accommodationDocumentation: boolean;
  
  // Learning differences
  dyslexiaSupport: boolean;
  adhdSupport: boolean;
  autismSupport: boolean;
  memorySupport: boolean;
  processingSupport: boolean;
  customAccommodations: string[];
}

export interface IntegrationPreferences {
  // Calendar integrations
  googleCalendar: IntegrationConfig;
  outlookCalendar: IntegrationConfig;
  appleCalendar: IntegrationConfig;
  
  // LMS integrations
  canvas: IntegrationConfig;
  blackboard: IntegrationConfig;
  moodle: IntegrationConfig;
  brightspace: IntegrationConfig;
  
  // Productivity apps
  notion: IntegrationConfig;
  obsidian: IntegrationConfig;
  todoist: IntegrationConfig;
  trello: IntegrationConfig;
  
  // Health and fitness
  fitbit: IntegrationConfig;
  appleHealth: IntegrationConfig;
  googleFit: IntegrationConfig;
  myFitnessPal: IntegrationConfig;
  
  // Social and communication
  discord: IntegrationConfig;
  slack: IntegrationConfig;
  whatsapp: IntegrationConfig;
  
  // File storage
  googleDrive: IntegrationConfig;
  dropbox: IntegrationConfig;
  oneDrive: IntegrationConfig;
  
  // Music and focus
  spotify: IntegrationConfig;
  appleMusic: IntegrationConfig;
  focusApps: IntegrationConfig;
  
  // Financial
  budgetingApps: IntegrationConfig;
  studentLoanTracking: IntegrationConfig;
  
  // Transportation
  campusTransport: IntegrationConfig;
  publicTransit: IntegrationConfig;
  rideSharing: IntegrationConfig;
}

export interface IntegrationConfig {
  enabled: boolean;
  authenticated: boolean;
  syncFrequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'manual';
  dataTypes: string[]; // what data to sync
  conflictResolution: 'local_wins' | 'remote_wins' | 'manual' | 'newest_wins';
  notifications: boolean;
  lastSync?: Date;
  errorCount: number;
  settings: Record<string, any>;
}

export interface CustomizationSetting {
  id: string;
  category: 'ui' | 'behavior' | 'notifications' | 'data' | 'integrations';
  key: string;
  value: any;
  description: string;
  appliedAt: Date;
  source: 'user' | 'admin' | 'system' | 'import';
}

// Enhanced category definitions for students
export const DEFAULT_CATEGORIES = [
  'Classes',        // Lectures, seminars, labs
  'Study',          // Individual study time
  'Assignments',    // Homework, projects, papers
  'Exams',          // Tests, quizzes, finals
  'Work',           // Part-time job, internship
  'Research',       // Research activities, lab work
  'Office Hours',   // Meeting with professors/TAs
  'Group Projects', // Collaborative work time
  'Exercise',       // Gym, sports, fitness
  'Meals',          // Breakfast, lunch, dinner
  'Sleep',          // Sleep and rest
  'Social',         // Friends, parties, clubs
  'Personal',       // Errands, self-care, family
  'Commute',        // Travel time
  'Breaks',         // Planned rest periods
  'Extracurricular',// Clubs, volunteering, activities
  'Health',         // Medical appointments, mental health
  'Leisure',        // Entertainment, hobbies
  'Learning',       // Self-directed learning, MOOCs
  'Free Time'       // Unscheduled time
];

export const DEFAULT_COLOR_PALETTE = [
  '#3B82F6', // Blue - Classes
  '#8B5CF6', // Purple - Study
  '#EF4444', // Red - Assignments
  '#DC2626', // Dark Red - Exams
  '#10B981', // Green - Work
  '#0D9488', // Teal - Research
  '#F59E0B', // Amber - Office Hours
  '#EC4899', // Pink - Group Projects
  '#F97316', // Orange - Exercise
  '#84CC16', // Lime - Meals
  '#6B7280', // Gray - Sleep
  '#EC4899', // Pink - Social
  '#06B6D4', // Cyan - Personal
  '#64748B', // Slate - Commute
  '#22C55E', // Green - Breaks
  '#A855F7', // Violet - Extracurricular
  '#EF4444', // Red - Health
  '#10B981', // Emerald - Leisure
  '#F59E0B', // Yellow - Learning
  '#9CA3AF'  // Cool Gray - Free Time
];

// Default student preferences
export const DEFAULT_STUDENT_PREFERENCES: UserPreferences = {
  // Basic schedule preferences
  startDay: 'Monday',
  startTime: '08:00',
  desiredSleepHours: 8,
  bedTime: '23:00',
  workScheduleConstant: false,
  workStartTime: '10:00',
  workEndTime: '14:00',
  workDays: ['Tuesday', 'Thursday'],
  categoryColors: DEFAULT_CATEGORIES.map((category, index) => ({
    category,
    color: DEFAULT_COLOR_PALETTE[index % DEFAULT_COLOR_PALETTE.length],
    icon: getCategoryIcon(category),
    description: getCategoryDescription(category),
    isDefault: true,
    priority: index + 1
  })),
  
  // Enhanced student preferences
  academic: {
    studentId: 'student-' + Date.now(), // Added default studentId
    preferredClassTimes: [
      {
        type: 'study',
        dayOfWeek: 'monday',
        startTime: '10:00',
        endTime: '12:00',
        energyLevel: 'high',
        preference: 'prefer'
      }
    ],
    avoidEarlyClasses: true,
    earlyClassThreshold: '08:00',
    avoidLateClasses: false,
    lateClassThreshold: '18:00',
    studyTimePreference: 'morning',
    optimalStudyDuration: 50,
    breakFrequency: 50,
    breakDuration: 10,
    studyLocations: [],
    defaultStudyLocation: '',
    assignmentBuffer: 2,
    workAheadPreference: true,
    lastMinuteWorker: false,
    groupWorkPreference: 'neutral',
    examPrepTime: 7,
    intensiveStudyPreference: false,
    spacedStudyPreference: true,
    reviewSessionFrequency: 'daily',
    trackGrades: true,
    gpaGoal: 3.5,
    gradingScale: 'letter',
    maxCreditsPerSemester: 18,
    preferredCourseLoad: 'moderate',
    difficultyBalance: true,
    workloadDistribution: 'even'
  },
  
  study: {
    learningStyle: ['visual', 'reading_writing'],
    preferredStudyMethods: [
      {
        name: 'Active Recall',
        effectiveness: 5,
        frequency: 'often',
        subjects: ['all'],
        timeOfDay: ['morning', 'afternoon'],
        notes: 'Most effective method for retention'
      }
    ],
    noisePreference: 'quiet',
    temperaturePreference: 'moderate',
    lightingPreference: 'bright',
    focusSessionLength: 25,
    maxStudySessionLength: 120,
    pomodoroPreference: true,
    pomodoroWorkTime: 25,
    pomodoroBreakTime: 5,
    pomodoroLongBreakTime: 30,
    pomodoroSessionsBeforeLongBreak: 4,
    studyAlonePreference: true,
    groupStudyFrequency: 'sometimes',
    maxGroupSize: 4,
    studyBuddyPreference: true,
    noteOrganizationMethod: 'topical',
    reviewFrequency: 'weekly',
    spacedRepetitionUse: true,
    flashcardPreference: true,
    digitalToolsPreference: true,
    handwrittenNotesPreference: false,
    recordedLecturesUsage: 'sometimes',
    onlineResourcesUsage: 'moderate'
  },
  
  wellness: {
    sleepGoal: 8,
    bedtimeRoutine: true,
    bedtimeRoutineDuration: 30,
    wakeUpRoutine: true,
    wakeUpRoutineDuration: 20,
    sleepConsistency: true,
    weekendSleepPattern: 'same',
    exerciseGoal: 60,
    exerciseTypes: [
      {
        name: 'Running',
        frequency: 3,
        duration: 30,
        intensity: 'moderate',
        preference: 4,
        location: 'outdoor',
        equipment: ['running shoes']
      }
    ],
    exerciseTimePreference: 'morning',
    gymMembership: true,
    homeWorkoutPreference: false,
    outdoorActivityPreference: true,
    sportsParticipation: false,
    mealPlanningPreference: true,
    cookingFrequency: 'sometimes',
    diningHallUsage: 'often',
    healthyEatingGoals: true,
    specialDietaryNeeds: [],
    hydrateReminders: true,
    hydrationGoal: 8,
    stressManagementTechniques: [
      {
        name: 'Deep Breathing',
        effectiveness: 4,
        duration: 5,
        situationsUsedFor: ['before exams', 'overwhelmed'],
        frequency: 'as_needed'
      }
    ],
    mindfulnessPractice: false,
    meditationFrequency: 'never',
    therapyAccess: false,
    mentalHealthResources: true,
    microBreakFrequency: 60,
    microBreakDuration: 30,
    longerBreakFrequency: 3,
    longerBreakDuration: 15,
    breakActivities: [
      {
        name: 'Walk',
        type: 'physical',
        duration: 10,
        preference: 5,
        energyLevel: 'medium',
        location: 'outdoor'
      }
    ],
    outdoorBreakPreference: true,
    socialBreakPreference: false
  },
  
  social: {
    socialTimeGoal: 10,
    socialTimeDistribution: 'evening_focused',
    socialActivityTypes: [
      {
        name: 'Study Group',
        type: 'academic',
        frequency: 2,
        duration: 2,
        groupSize: 'small',
        cost: 'free',
        preference: 4
      }
    ],
    partyFrequency: 'rarely',
    clubParticipation: true,
    volunteeringInterest: false,
    volunteeringHours: 0,
    prioritizeCloseStudyFriends: true,
    studyGroupParticipation: true,
    networkingImportance: 3,
    professionalEventAttendance: false,
    socialMediaLimits: true,
    socialMediaDailyLimit: 60,
    phoneFreeDuringStudy: true,
    quietHoursRespect: true,
    roommateCommunication: 'daily',
    campusEventAttendance: 'occasional',
    culturalEventInterest: true,
    sportsEventAttendance: false,
    academicEventAttendance: true
  },
  
  productivity: {
    timeTrackingPreference: true,
    deadlineAwareness: 'high',
    procrastinationTendency: 'moderate',
    multitaskingPreference: false,
    batchSimilarTasks: true,
    planningHorizon: 'weekly',
    planningMethod: 'digital',
    goalSettingFrequency: 'weekly',
    progressTrackingMethod: 'automated',
    deepWorkSessions: true,
    deepWorkDuration: 90,
    taskSwitchingComfort: 'low',
    prioritizationMethod: 'importance',
    distractionSusceptibility: 'moderate',
    commonDistractions: [
      {
        source: 'Phone notifications',
        frequency: 'frequent',
        impact: 'high',
        mitigation: ['silence phone', 'airplane mode'],
        triggers: ['boredom', 'difficult material']
      }
    ],
    focusEnhancementTechniques: [
      {
        name: 'Pomodoro Technique',
        effectiveness: 4,
        duration: 25,
        situationsUsedFor: ['studying', 'assignments'],
        requirements: ['timer', 'distraction-free environment']
      }
    ],
    environmentalNeeds: [
      {
        factor: 'noise',
        preference: 'quiet',
        importance: 'high',
        flexibility: 'somewhat_flexible'
      }
    ],
    energyPatternAwareness: true,
    peakEnergyTimes: ['morning'],
    lowEnergyTimes: ['mid-afternoon'],
    energyBoostMethods: [
      {
        method: 'Coffee',
        effectiveness: 4,
        duration: 30,
        sideEffects: ['jitters if too much'],
        frequency: 'daily'
      }
    ],
    fatigueCues: ['yawning', 'difficulty concentrating'],
    productivityAppsUse: true,
    favoriteProdApps: ['Forest', 'Notion', 'Google Calendar'],
    automationInterest: true,
    digitalMinimalismPractice: false,
    notificationManagement: 'moderate'
  },
  
  notifications: {
    enabled: true,
    channels: {
      inApp: true,
      email: true,
      push: true,
      sms: false
    },
    preferences: {
      assignmentReminders: {
        enabled: true,
        timeBefore: [1440, 360, 60] // 1 day, 6 hours, 1 hour
      },
      classReminders: {
        enabled: true,
        timeBefore: 15
      },
      examReminders: {
        enabled: true,
        timeBefore: [10080, 1440, 360] // 1 week, 1 day, 6 hours
      },
      studySessionReminders: {
        enabled: true,
        timeBefore: 10
      },
      gradeUpdates: {
        enabled: true,
        immediate: false
      }
    },
    quietHours: {
      enabled: true,
      startTime: '22:00',
      endTime: '08:00',
      days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
    }
  },
  
  privacy: {
    dataSharing: 'selective',
    analyticsOptIn: true,
    performanceDataSharing: false,
    scheduleVisibility: 'friends',
    locationSharing: false,
    calendarIntegrationSharing: false,
    gradeSharingComfort: 'close_friends',
    studyHabitsSharing: false,
    anonymousResearchParticipation: true,
    marketingOptIn: false,
    thirdPartyIntegrations: 'selected',
    dataRetentionPreference: 'degree_completion'
  },
  
  accessibility: {
    highContrast: false,
    largeText: false,
    fontSize: 'medium',
    colorBlindFriendly: false,
    reducedMotion: false,
    screenReaderCompatible: false,
    keyboardNavigation: false,
    mouseAlternatives: false,
    voiceControl: false,
    touchGestures: true,
    simplifiedInterface: false,
    consistentNavigation: true,
    clearInstructions: true,
    minimizeDistractions: false,
    visualNotifications: false,
    captionsPreference: false,
    audioDescriptions: false,
    extendedTime: false,
    extendedTimeMultiplier: 1.0,
    alternativeFormats: false,
    preferredFormats: [],
    assistiveTechnology: [],
    accommodationDocumentation: false,
    dyslexiaSupport: false,
    adhdSupport: false,
    autismSupport: false,
    memorySupport: false,
    processingSupport: false,
    customAccommodations: []
  },
  
  integrations: {
    googleCalendar: {
      enabled: false,
      authenticated: false,
      syncFrequency: 'daily',
      dataTypes: ['events', 'reminders'],
      conflictResolution: 'manual',
      notifications: true,
      errorCount: 0,
      settings: {}
    },
    canvas: {
      enabled: false,
      authenticated: false,
      syncFrequency: 'daily',
      dataTypes: ['courses', 'assignments', 'grades'],
      conflictResolution: 'remote_wins',
      notifications: true,
      errorCount: 0,
      settings: {}
    },
    // ... other integrations with similar default configs
    outlookCalendar: { enabled: false, authenticated: false, syncFrequency: 'daily', dataTypes: [], conflictResolution: 'manual', notifications: true, errorCount: 0, settings: {} },
    appleCalendar: { enabled: false, authenticated: false, syncFrequency: 'daily', dataTypes: [], conflictResolution: 'manual', notifications: true, errorCount: 0, settings: {} },
    blackboard: { enabled: false, authenticated: false, syncFrequency: 'daily', dataTypes: [], conflictResolution: 'remote_wins', notifications: true, errorCount: 0, settings: {} },
    moodle: { enabled: false, authenticated: false, syncFrequency: 'daily', dataTypes: [], conflictResolution: 'remote_wins', notifications: true, errorCount: 0, settings: {} },
    brightspace: { enabled: false, authenticated: false, syncFrequency: 'daily', dataTypes: [], conflictResolution: 'remote_wins', notifications: true, errorCount: 0, settings: {} },
    notion: { enabled: false, authenticated: false, syncFrequency: 'manual', dataTypes: [], conflictResolution: 'manual', notifications: false, errorCount: 0, settings: {} },
    obsidian: { enabled: false, authenticated: false, syncFrequency: 'manual', dataTypes: [], conflictResolution: 'manual', notifications: false, errorCount: 0, settings: {} },
    todoist: { enabled: false, authenticated: false, syncFrequency: 'daily', dataTypes: [], conflictResolution: 'manual', notifications: true, errorCount: 0, settings: {} },
    trello: { enabled: false, authenticated: false, syncFrequency: 'daily', dataTypes: [], conflictResolution: 'manual', notifications: true, errorCount: 0, settings: {} },
    fitbit: { enabled: false, authenticated: false, syncFrequency: 'daily', dataTypes: [], conflictResolution: 'remote_wins', notifications: false, errorCount: 0, settings: {} },
    appleHealth: { enabled: false, authenticated: false, syncFrequency: 'daily', dataTypes: [], conflictResolution: 'remote_wins', notifications: false, errorCount: 0, settings: {} },
    googleFit: { enabled: false, authenticated: false, syncFrequency: 'daily', dataTypes: [], conflictResolution: 'remote_wins', notifications: false, errorCount: 0, settings: {} },
    myFitnessPal: { enabled: false, authenticated: false, syncFrequency: 'daily', dataTypes: [], conflictResolution: 'remote_wins', notifications: false, errorCount: 0, settings: {} },
    discord: { enabled: false, authenticated: false, syncFrequency: 'manual', dataTypes: [], conflictResolution: 'manual', notifications: false, errorCount: 0, settings: {} },
    slack: { enabled: false, authenticated: false, syncFrequency: 'manual', dataTypes: [], conflictResolution: 'manual', notifications: false, errorCount: 0, settings: {} },
    whatsapp: { enabled: false, authenticated: false, syncFrequency: 'manual', dataTypes: [], conflictResolution: 'manual', notifications: false, errorCount: 0, settings: {} },
    googleDrive: { enabled: false, authenticated: false, syncFrequency: 'manual', dataTypes: [], conflictResolution: 'manual', notifications: false, errorCount: 0, settings: {} },
    dropbox: { enabled: false, authenticated: false, syncFrequency: 'manual', dataTypes: [], conflictResolution: 'manual', notifications: false, errorCount: 0, settings: {} },
    oneDrive: { enabled: false, authenticated: false, syncFrequency: 'manual', dataTypes: [], conflictResolution: 'manual', notifications: false, errorCount: 0, settings: {} },
    spotify: { enabled: false, authenticated: false, syncFrequency: 'manual', dataTypes: [], conflictResolution: 'manual', notifications: false, errorCount: 0, settings: {} },
    appleMusic: { enabled: false, authenticated: false, syncFrequency: 'manual', dataTypes: [], conflictResolution: 'manual', notifications: false, errorCount: 0, settings: {} },
    focusApps: { enabled: false, authenticated: false, syncFrequency: 'manual', dataTypes: [], conflictResolution: 'manual', notifications: false, errorCount: 0, settings: {} },
    budgetingApps: { enabled: false, authenticated: false, syncFrequency: 'manual', dataTypes: [], conflictResolution: 'manual', notifications: false, errorCount: 0, settings: {} },
    studentLoanTracking: { enabled: false, authenticated: false, syncFrequency: 'manual', dataTypes: [], conflictResolution: 'manual', notifications: false, errorCount: 0, settings: {} },
    campusTransport: { enabled: false, authenticated: false, syncFrequency: 'daily', dataTypes: [], conflictResolution: 'remote_wins', notifications: true, errorCount: 0, settings: {} },
    publicTransit: { enabled: false, authenticated: false, syncFrequency: 'daily', dataTypes: [], conflictResolution: 'remote_wins', notifications: true, errorCount: 0, settings: {} },
    rideSharing: { enabled: false, authenticated: false, syncFrequency: 'manual', dataTypes: [], conflictResolution: 'manual', notifications: false, errorCount: 0, settings: {} }
  },
  
  // Profile metadata
  profileVersion: '1.0.0',
  lastUpdated: new Date(),
  onboardingCompleted: false,
  customizations: []
};

// Helper functions
function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    'Classes': '🎓',
    'Study': '📚',
    'Assignments': '📝',
    'Exams': '📋',
    'Work': '💼',
    'Research': '🔬',
    'Office Hours': '👨‍🏫',
    'Group Projects': '👥',
    'Exercise': '🏃‍♂️',
    'Meals': '🍽️',
    'Sleep': '😴',
    'Social': '🎉',
    'Personal': '🏠',
    'Commute': '🚗',
    'Breaks': '☕',
    'Extracurricular': '🎭',
    'Health': '🏥',
    'Leisure': '🎮',
    'Learning': '🧠',
    'Free Time': '⏰'
  };
  return iconMap[category] || '📌';
}

function getCategoryDescription(category: string): string {
  const descriptionMap: Record<string, string> = {
    'Classes': 'Lectures, seminars, and lab sessions',
    'Study': 'Individual study and review time',
    'Assignments': 'Homework, projects, and papers',
    'Exams': 'Tests, quizzes, and final exams',
    'Work': 'Part-time job or internship',
    'Research': 'Research activities and lab work',
    'Office Hours': 'Meeting with professors and TAs',
    'Group Projects': 'Collaborative work time',
    'Exercise': 'Gym, sports, and fitness activities',
    'Meals': 'Breakfast, lunch, and dinner',
    'Sleep': 'Sleep and rest time',
    'Social': 'Friends, parties, and social events',
    'Personal': 'Errands, self-care, and family time',
    'Commute': 'Travel time between locations',
    'Breaks': 'Planned rest and relaxation periods',
    'Extracurricular': 'Clubs, volunteering, and activities',
    'Health': 'Medical appointments and wellness',
    'Leisure': 'Entertainment and hobbies',
    'Learning': 'Self-directed learning and MOOCs',
    'Free Time': 'Unscheduled flexible time'
  };
  return descriptionMap[category] || 'General activity';
}

// Validation functions
export const validateUserPreferences = (preferences: Partial<UserPreferences>): string[] => {
  const errors: string[] = [];
  
  // Basic validations
  if (!preferences.startDay) {
    errors.push('Start day is required');
  }
  
  if (!preferences.startTime || !/^\d{2}:\d{2}$/.test(preferences.startTime)) {
    errors.push('Valid start time is required (HH:MM format)');
  }
  
  if (!preferences.bedTime || !/^\d{2}:\d{2}$/.test(preferences.bedTime)) {
    errors.push('Valid bed time is required (HH:MM format)');
  }
  
  if (!preferences.desiredSleepHours || preferences.desiredSleepHours < 4 || preferences.desiredSleepHours > 12) {
    errors.push('Sleep hours must be between 4 and 12');
  }
  
  // Academic preferences validation
  if (preferences.academic) {
    if (!preferences.academic.studentId || preferences.academic.studentId.trim().length === 0) {
      errors.push('Student ID is required');
    }
    
    if (preferences.academic.gpaGoal && (preferences.academic.gpaGoal < 0 || preferences.academic.gpaGoal > 4.0)) {
      errors.push('GPA goal must be between 0.0 and 4.0');
    }
    
    if (preferences.academic.maxCreditsPerSemester && preferences.academic.maxCreditsPerSemester < 1) {
      errors.push('Max credits per semester must be at least 1');
    }
  }
  
  return errors;
};

export const migratePreferences = (oldPreferences: any, version: string): UserPreferences => {
  // Handle migration from older preference formats
  // This would contain logic to migrate from previous versions
  return { ...DEFAULT_STUDENT_PREFERENCES, ...oldPreferences };
};

export const getPreferencesSummary = (preferences: UserPreferences): string => {
  const summaryParts: string[] = [];
  
  summaryParts.push(`${preferences.academic.studyTimePreference} person`);
  summaryParts.push(`${preferences.academic.preferredCourseLoad} course load`);
  
  if (preferences.study.pomodoroPreference) {
    summaryParts.push('uses Pomodoro technique');
  }
  
  if (preferences.wellness.exerciseGoal > 0) {
    summaryParts.push(`${preferences.wellness.exerciseGoal}min daily exercise goal`);
  }
  
  return summaryParts.join(', ');
};