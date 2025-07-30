// src/models/StudySessionModel.ts

export interface StudySession {
    id: string;
    studentId: string;
    courseId?: string;
    assignmentId?: string;
    title: string;
    description?: string;
    type: StudySessionType;
    scheduledStart: Date;
    scheduledEnd: Date;
    actualStart?: Date;
    actualEnd?: Date;
    duration: number; // planned duration in minutes
    actualDuration?: number; // actual duration in minutes
    location: StudyLocation;
    materials: StudyMaterial[];
    objectives: LearningObjective[];
    techniques: StudyTechnique[];
    progress: StudyProgress;
    effectiveness: SessionEffectiveness;
    distractions: Distraction[];
    breaks: StudyBreak[];
    collaborators?: string[]; // student IDs for group study
    status: StudySessionStatus;
    notes: StudyNote[];
    followUpActions: string[];
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export type StudySessionType = 
    | 'review' 
    | 'new_material' 
    | 'practice' 
    | 'exam_prep' 
    | 'assignment_work' 
    | 'group_study' 
    | 'tutoring' 
    | 'research' 
    | 'reading' 
    | 'memorization' 
    | 'problem_solving'
    | 'presentation_prep'
    | 'lab_work'
    | 'writing';
  
  export type StudySessionStatus = 
    | 'scheduled' 
    | 'in_progress' 
    | 'completed' 
    | 'cancelled' 
    | 'missed' 
    | 'rescheduled';
  
  export interface StudyLocation {
    id: string;
    name: string;
    type: 'library' | 'dorm' | 'cafe' | 'study_room' | 'home' | 'outdoor' | 'lab' | 'virtual' | 'other';
    building?: string;
    room?: string;
    address?: string;
    amenities: LocationAmenity[];
    noiseLevel: 'silent' | 'quiet' | 'moderate' | 'noisy';
    crowdedness: 'empty' | 'low' | 'moderate' | 'busy' | 'crowded';
    wifi: boolean;
    powerOutlets: boolean;
    naturalLight: boolean;
    temperature: 'cold' | 'cool' | 'comfortable' | 'warm' | 'hot';
    accessibility: string[];
    bookingRequired: boolean;
    availableHours?: string;
    rating?: number; // 1-5
    notes?: string;
  }
  
  export type LocationAmenity = 
    | 'wifi' 
    | 'power_outlets' 
    | 'whiteboard' 
    | 'projector' 
    | 'computers' 
    | 'printer' 
    | 'food_allowed' 
    | 'group_friendly' 
    | 'private' 
    | 'reservable'
    | 'air_conditioning'
    | 'heating'
    | 'natural_light'
    | 'artificial_light';
  
  export interface StudyMaterial {
    id: string;
    title: string;
    type: MaterialType;
    source?: string; // textbook, lecture, etc.
    chapter?: string;
    pages?: string;
    url?: string;
    file?: File;
    priority: 'low' | 'medium' | 'high' | 'essential';
    timeAllocated: number; // minutes
    timeSpent?: number;
    completed: boolean;
    difficulty: number; // 1-5
    comprehension: number; // 1-5
    notes?: string;
    bookmarks?: MaterialBookmark[];
  }
  
  export type MaterialType = 
    | 'textbook' 
    | 'lecture_notes' 
    | 'slides' 
    | 'article' 
    | 'video' 
    | 'podcast' 
    | 'practice_problems' 
    | 'past_exam' 
    | 'flashcards' 
    | 'summary' 
    | 'outline'
    | 'reference'
    | 'tutorial'
    | 'documentation';
  
  export interface MaterialBookmark {
    id: string;
    page?: number;
    timestamp?: number; // for video/audio
    title: string;
    note?: string;
    importance: 'low' | 'medium' | 'high';
    createdAt: Date;
  }
  
  export interface LearningObjective {
    id: string;
    description: string;
    type: 'understand' | 'remember' | 'apply' | 'analyze' | 'evaluate' | 'create';
    bloomsLevel: 1 | 2 | 3 | 4 | 5 | 6;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedTime: number; // minutes
    actualTime?: number;
    achieved: boolean;
    achievedAt?: Date;
    assessmentMethod: string; // how you'll know it's achieved
    prerequisites: string[];
    relatedConcepts: string[];
    notes?: string;
  }
  
  export interface StudyTechnique {
    id: string;
    name: string;
    type: TechniqueType;
    description: string;
    timeAllocated: number; // minutes
    timeUsed?: number;
    effectiveness: number; // 1-5
    suitableFor: StudySessionType[];
    materials: string[]; // material IDs
    instructions?: string[];
    benefits: string[];
    drawbacks?: string[];
    personalNotes?: string;
  }
  
  export type TechniqueType = 
    | 'active_recall' 
    | 'spaced_repetition' 
    | 'pomodoro' 
    | 'mind_mapping' 
    | 'cornell_notes' 
    | 'flashcards' 
    | 'practice_testing' 
    | 'elaborative_rehearsal' 
    | 'chunking' 
    | 'dual_coding'
    | 'feynman_technique'
    | 'interleaving'
    | 'retrieval_practice'
    | 'summarization'
    | 'question_generation';
  
  export interface StudyProgress {
    overallCompletion: number; // 0-100
    objectivesCompleted: number;
    objectivesTotal: number;
    materialsCompleted: number;
    materialsTotal: number;
    conceptsMastered: string[];
    conceptsStruggling: string[];
    timeOnTask: number; // actual focused time in minutes
    breaks: number;
    distractions: number;
    energyLevel: EnergyLevel;
    focusScore: number; // 1-100
    comprehensionLevel: number; // 1-5
    confidenceLevel: number; // 1-5
    milestones: ProgressMilestone[];
  }
  
  export type EnergyLevel = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  
  export interface ProgressMilestone {
    id: string;
    title: string;
    description: string;
    targetTime: Date;
    achievedTime?: Date;
    achieved: boolean;
    reward?: string;
  }
  
  export interface SessionEffectiveness {
    overallRating: number; // 1-5
    productivityScore: number; // 1-100
    focusRating: number; // 1-5
    comprehensionRating: number; // 1-5
    energyRating: number; // 1-5
    satisfactionRating: number; // 1-5
    goalAchievement: number; // percentage of goals achieved
    timeEfficiency: number; // actual productive time / total time
    factors: EffectivenessFactor[];
    improvements: string[];
    whatWorked: string[];
    whatDidntWork: string[];
    nextTimeStrategy: string[];
  }
  
  export interface EffectivenessFactor {
    factor: string;
    impact: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
    description?: string;
  }
  
  export interface Distraction {
    id: string;
    type: DistractionType;
    description: string;
    timestamp: Date;
    duration: number; // minutes
    source: DistractionSource;
    severity: 'minor' | 'moderate' | 'major' | 'session_ending';
    recoveryTime: number; // minutes to refocus
    preventable: boolean;
    preventionStrategy?: string;
    frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
  }
  
  export type DistractionType = 
    | 'social_media' 
    | 'phone_notification' 
    | 'people' 
    | 'noise' 
    | 'hunger' 
    | 'fatigue' 
    | 'anxiety' 
    | 'mind_wandering' 
    | 'technology_issue'
    | 'environmental'
    | 'physical_discomfort'
    | 'emotional'
    | 'other';
  
  export type DistractionSource = 'internal' | 'external' | 'environmental' | 'technological';
  
  export interface StudyBreak {
    id: string;
    startTime: Date;
    endTime: Date;
    duration: number; // minutes
    type: BreakType;
    activity: string;
    location?: string;
    refreshmentLevel: number; // 1-5 how refreshed you felt after
    notes?: string;
  }
  
  export type BreakType = 
    | 'short' // 5-15 minutes
    | 'medium' // 15-30 minutes
    | 'long' // 30+ minutes
    | 'meal'
    | 'exercise'
    | 'social'
    | 'rest';
  
  export interface StudyNote {
    id: string;
    content: string;
    timestamp: Date;
    type: 'insight' | 'question' | 'confusion' | 'connection' | 'reminder' | 'reflection';
    materialId?: string;
    objectiveId?: string;
    tags: string[];
    importance: 'low' | 'medium' | 'high';
    actionRequired: boolean;
    resolved: boolean;
    relatedNotes: string[]; // other note IDs
  }
  
  // Spaced Repetition System
  export interface SpacedRepetitionCard {
    id: string;
    studentId: string;
    courseId?: string;
    front: string; // question/prompt
    back: string; // answer/explanation
    type: 'basic' | 'cloze' | 'image' | 'audio' | 'reverse';
    difficulty: number; // 1-5
    interval: number; // days until next review
    repetitions: number;
    easeFactor: number; // SM-2 algorithm
    lastReviewed?: Date;
    nextReview: Date;
    lapses: number; // how many times forgotten
    streak: number; // consecutive correct answers
    averageResponseTime: number; // seconds
    tags: string[];
    deck: string;
    createdAt: Date;
    reviews: CardReview[];
  }
  
  export interface CardReview {
    id: string;
    reviewedAt: Date;
    quality: 0 | 1 | 2 | 3 | 4 | 5; // SM-2 quality rating
    responseTime: number; // seconds
    wasCorrect: boolean;
    difficulty: 'again' | 'hard' | 'good' | 'easy';
    notes?: string;
  }
  
  // Exam Preparation
  export interface ExamPreparation {
    id: string;
    studentId: string;
    courseId: string;
    examId: string;
    examDate: Date;
    examType: 'midterm' | 'final' | 'quiz' | 'practical' | 'oral' | 'comprehensive';
    preparationStartDate: Date;
    studyPlan: ExamStudyPlan;
    topics: ExamTopic[];
    practiceTests: PracticeTest[];
    studySessions: string[]; // study session IDs
    resources: ExamResource[];
    progress: ExamProgress;
    strategies: ExamStrategy[];
    anxietyManagement: AnxietyManagement;
    predictions: ExamPrediction;
    actualResult?: ExamResult;
  }
  
  export interface ExamStudyPlan {
    totalStudyHours: number;
    dailyStudyGoal: number; // hours
    weeklyDistribution: WeeklyStudyDistribution;
    phases: StudyPhase[];
    milestones: ExamMilestone[];
    contingencyPlan: string[];
  }
  
  export interface WeeklyStudyDistribution {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  }
  
  export interface StudyPhase {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    focus: string[];
    techniques: TechniqueType[];
    goalCompletion: number; // percentage
    actualCompletion?: number;
  }
  
  export interface ExamMilestone {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    completedDate?: Date;
    criteria: string[];
    importance: 'low' | 'medium' | 'high' | 'critical';
  }
  
  export interface ExamTopic {
    id: string;
    name: string;
    description?: string;
    importance: number; // 1-5
    difficulty: number; // 1-5
    timeAllocated: number; // hours
    timeSpent: number;
    masterLevel: number; // 1-5
    lastStudied?: Date;
    studySessions: string[];
    materials: string[];
    subtopics: string[];
    connections: TopicConnection[];
    notes: string[];
    status: 'not_started' | 'in_progress' | 'mastered' | 'needs_review';
  }
  
  export interface TopicConnection {
    topicId: string;
    connectionType: 'prerequisite' | 'related' | 'builds_on' | 'example_of';
    strength: 'weak' | 'moderate' | 'strong';
    notes?: string;
  }
  
  export interface PracticeTest {
    id: string;
    title: string;
    source: string;
    dateTaken: Date;
    timeLimit: number; // minutes
    actualTime: number;
    score: number;
    maxScore: number;
    percentage: number;
    topicBreakdown: TopicScore[];
    mistakeAnalysis: Mistake[];
    improvements: string[];
    confidenceLevel: number; // 1-5
    difficulty: number; // 1-5
    similarity: number; // 1-5 similarity to actual exam
  }
  
  export interface TopicScore {
    topic: string;
    score: number;
    maxScore: number;
    percentage: number;
    timeSpent: number;
  }
  
  export interface Mistake {
    id: string;
    question: string;
    yourAnswer: string;
    correctAnswer: string;
    explanation: string;
    topic: string;
    mistakeType: MistakeType;
    carelessness: boolean;
    conceptualGap: boolean;
    timeConstraint: boolean;
    remediation: string[];
    resolved: boolean;
  }
  
  export type MistakeType = 
    | 'calculation_error' 
    | 'misread_question' 
    | 'wrong_formula' 
    | 'incomplete_answer' 
    | 'conceptual_misunderstanding' 
    | 'time_management'
    | 'careless_error'
    | 'knowledge_gap';
  
  export interface ExamResource {
    id: string;
    title: string;
    type: 'past_exam' | 'practice_problems' | 'study_guide' | 'summary' | 'video' | 'tutor_session';
    source: string;
    quality: number; // 1-5
    difficulty: number; // 1-5
    timeRequired: number; // minutes
    topics: string[];
    completed: boolean;
    effectiveness: number; // 1-5
    notes: string;
  }
  
  export interface ExamProgress {
    overallPreparation: number; // 0-100
    topicsCompleted: number;
    topicsTotal: number;
    hoursStudied: number;
    hoursPlanned: number;
    practiceTestsCompleted: number;
    averagePracticeScore: number;
    confidenceLevel: number; // 1-5
    readinessScore: number; // 1-100
    weeklyProgress: WeeklyProgress[];
    lastUpdated: Date;
  }
  
  export interface WeeklyProgress {
    week: string; // "2024-W15"
    hoursStudied: number;
    topicsCompleted: number;
    practiceTestScore: number;
    confidenceLevel: number;
  }
  
  export interface ExamStrategy {
    category: 'time_management' | 'question_approach' | 'stress_management' | 'preparation' | 'review';
    strategy: string;
    description: string;
    effectiveness: number; // 1-5
    practiced: boolean;
    notes?: string;
  }
  
  export interface AnxietyManagement {
    level: number; // 1-10
    triggers: string[];
    symptoms: string[];
    techniques: AnxietyTechnique[];
    resources: string[];
    emergencyPlan: string[];
  }
  
  export interface AnxietyTechnique {
    name: string;
    type: 'breathing' | 'visualization' | 'positive_self_talk' | 'progressive_muscle_relaxation' | 'mindfulness';
    effectiveness: number; // 1-5
    duration: number; // minutes
    instructions: string[];
    practiced: boolean;
  }
  
  export interface ExamPrediction {
    predictedScore: number;
    confidence: number; // 0-1
    factors: PredictionFactor[];
    recommendations: string[];
    riskFactors: string[];
    strengths: string[];
    lastUpdated: Date;
  }
  
  export interface PredictionFactor {
    factor: string;
    weight: number;
    impact: 'positive' | 'negative' | 'neutral';
    value: number;
  }
  
  export interface ExamResult {
    score: number;
    maxScore: number;
    percentage: number;
    letterGrade: string;
    rank?: number;
    classAverage?: number;
    feedback: string[];
    surprises: string[];
    lessonsLearned: string[];
    nextTimeStrategy: string[];
  }
  
  // Focus and Productivity
  export interface FocusSession {
    id: string;
    studySessionId: string;
    technique: 'pomodoro' | 'timeboxing' | 'deep_work' | 'ultradian_rhythm' | 'custom';
    plannedDuration: number; // minutes
    actualDuration: number;
    intervals: FocusInterval[];
    distractions: number;
    focusScore: number; // 1-100
    productivity: number; // 1-100
    startTime: Date;
    endTime: Date;
    notes?: string;
  }
  
  export interface FocusInterval {
    id: string;
    type: 'work' | 'break';
    plannedDuration: number;
    actualDuration: number;
    startTime: Date;
    endTime: Date;
    focusLevel: number; // 1-5
    productivity: number; // 1-5
    activities: string[];
    interruptions: number;
  }
  
  // Default configurations and constants
  export const DEFAULT_STUDY_TECHNIQUES: StudyTechnique[] = [
    {
      id: 'active-recall',
      name: 'Active Recall',
      type: 'active_recall',
      description: 'Testing yourself without looking at materials',
      timeAllocated: 25,
      effectiveness: 5,
      suitableFor: ['review', 'new_material', 'exam_prep'],
      materials: [],
      instructions: [
        'Cover your notes',
        'Try to recall key concepts',
        'Write down what you remember',
        'Check against original material'
      ],
      benefits: ['Improves long-term retention', 'Identifies knowledge gaps']
    },
    {
      id: 'spaced-repetition',
      name: 'Spaced Repetition',
      type: 'spaced_repetition',
      description: 'Reviewing material at increasing intervals',
      timeAllocated: 20,
      effectiveness: 5,
      suitableFor: ['review', 'memorization'],
      materials: [],
      instructions: [
        'Review material today',
        'Review again in 1 day',
        'Review again in 3 days',
        'Review again in 1 week'
      ],
      benefits: ['Maximum retention with minimum time', 'Combats forgetting curve']
    }
  ];
  
  export const DEFAULT_BREAK_ACTIVITIES = [
    'Walk outside',
    'Drink water',
    'Stretch',
    'Deep breathing',
    'Listen to music',
    'Chat with friend',
    'Snack',
    'Rest eyes'
  ];
  
  export const BLOOM_TAXONOMY_LEVELS = {
    1: 'Remember',
    2: 'Understand',
    3: 'Apply',
    4: 'Analyze',
    5: 'Evaluate',
    6: 'Create'
  };
  
  // Utility functions
  export const calculateStudyEfficiency = (session: StudySession): number => {
    if (!session.actualDuration || session.actualDuration === 0) return 0;
    
    const plannedTime = session.duration;
    const actualTime = session.actualDuration;
    const focusTime = session.progress.timeOnTask;
    
    const timeEfficiency = Math.min(actualTime / plannedTime, 1.0);
    const focusEfficiency = focusTime / actualTime;
    
    return Math.round((timeEfficiency * 0.3 + focusEfficiency * 0.7) * 100);
  };
  
  export const getOptimalStudyTime = (energyLevel: EnergyLevel, sessionType: StudySessionType): number => {
    const baseTime = {
      'very_low': 15,
      'low': 25,
      'moderate': 45,
      'high': 60,
      'very_high': 90
    }[energyLevel];
    
    const typeMultiplier = {
      'review': 1.0,
      'new_material': 1.2,
      'practice': 0.8,
      'exam_prep': 1.5,
      'assignment_work': 1.3,
      'group_study': 1.1,
      'tutoring': 1.0,
      'research': 1.4,
      'reading': 0.9,
      'memorization': 0.7,
      'problem_solving': 1.3,
      'presentation_prep': 1.1,
      'lab_work': 1.2,
      'writing': 1.4
    }[sessionType];
    
    return Math.round(baseTime * typeMultiplier);
  };
  
  export const calculateSpacedRepetitionInterval = (card: SpacedRepetitionCard, quality: number): number => {
    // SM-2 Algorithm implementation
    let newInterval: number;
    let newEaseFactor = card.easeFactor;
    let newRepetitions = card.repetitions;
    
    if (quality >= 3) {
      if (newRepetitions === 0) {
        newInterval = 1;
      } else if (newRepetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(card.interval * card.easeFactor);
      }
      newRepetitions += 1;
    } else {
      newRepetitions = 0;
      newInterval = 1;
    }
    
    newEaseFactor = newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    if (newEaseFactor < 1.3) {
      newEaseFactor = 1.3;
    }
    
    return Math.max(1, newInterval);
  };
  
  export const validateStudySession = (session: Partial<StudySession>): string[] => {
    const errors: string[] = [];
    
    if (!session.title?.trim()) {
      errors.push('Study session title is required');
    }
    
    if (!session.scheduledStart) {
      errors.push('Start time is required');
    }
    
    if (!session.scheduledEnd) {
      errors.push('End time is required');
    }
    
    if (session.scheduledStart && session.scheduledEnd && session.scheduledStart >= session.scheduledEnd) {
      errors.push('End time must be after start time');
    }
    
    if (!session.duration || session.duration <= 0) {
      errors.push('Duration must be greater than 0');
    }
    
    return errors;
  };