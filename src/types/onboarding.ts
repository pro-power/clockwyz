// src/types/onboarding.ts
// TypeScript interfaces for the onboarding flow

export interface QuickPreferences {
    userType: 'student' | 'working-student' | 'professional';
    weekStart: 'sunday' | 'monday' | 'tuesday';
    schedulePattern: 'early' | 'standard' | 'night' | 'custom';
  }
  
  export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    component: React.ComponentType<any>;
    validation?: (data: any) => boolean;
    isComplete: boolean;
  }
  
  export interface UserTypeOption {
    id: string;
    label: string;
    description: string;
    icon: React.ComponentType<any>;
    gradient: string;
    features: string[];
  }
  
  export interface SchedulePatternOption {
    id: string;
    label: string;
    timeRange: string;
    description: string;
    icon: string;
    energyProfile: 'morning' | 'balanced' | 'evening';
    workingHours: {
      start: string;
      end: string;
    };
  }
  
  export interface WeekStartOption {
    id: string;
    label: string;
    description: string;
    popular: boolean;
    culturalContext?: string;
  }
  
  // Template generation interfaces
  export interface ScheduleTemplate {
    name: string;
    userType: QuickPreferences['userType'];
    pattern: QuickPreferences['schedulePattern'];
    timeSlots: TemplateTimeSlot[];
    categories: TemplateCategoryConfig[];
  }
  
  export interface TemplateTimeSlot {
    time: string;
    defaultActivity: string;
    category: string;
    isFlexible: boolean;
    priority: 'high' | 'medium' | 'low';
    energyLevel?: 'high' | 'medium' | 'low';
  }
  
  export interface TemplateCategoryConfig {
    name: string;
    color: string;
    icon: string;
    defaultHours: number;
    isCore: boolean; // Can't be removed
    suggestions: string[];
  }
  
  // AI generation context
  export interface GenerationContext {
    preferences: QuickPreferences;
    timestamp: Date;
    version: string;
    aiModel: string;
    confidence: number;
    optimizations: string[];
  }
  
  export interface GeneratedSchedule {
    context: GenerationContext;
    template: ScheduleTemplate;
    customizations: ScheduleCustomization[];
    nextSteps: string[];
    improvementSuggestions: string[];
  }
  
  export interface ScheduleCustomization {
    type: 'time_adjustment' | 'activity_swap' | 'category_change' | 'priority_shift';
    description: string;
    reasoning: string;
    impact: 'low' | 'medium' | 'high';
    isReversible: boolean;
  }
  
  // Progress tracking
  export interface OnboardingProgress {
    currentStep: number;
    totalSteps: number;
    completedSteps: string[];
    timeSpent: number; // milliseconds
    userChoices: Record<string, any>;
    abandonmentPoints: string[];
  }
  
  export interface OnboardingAnalytics {
    startTime: Date;
    completionTime?: Date;
    duration?: number;
    stepTimes: Record<string, number>;
    choiceDistribution: Record<string, number>;
    conversionRate: number;
  }
  
  // Error handling
  export interface OnboardingError {
    step: string;
    type: 'validation' | 'generation' | 'storage' | 'network';
    message: string;
    recoverable: boolean;
    fallback?: () => void;
  }
  
  export interface OnboardingFallback {
    step: string;
    defaultChoice: any;
    explanation: string;
    userMessage: string;
  }