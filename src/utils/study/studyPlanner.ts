// src/utils/study/studyPlanner.ts

import { StudySession, StudySessionType, ExamPreparation, StudyTechnique } from '../../models/StudySessionModel';
import { Course } from '../../models/CourseModel';
import { Assignment } from '../../models/AssignmentModel';
import { UserPreferences } from '../../models/UserPreferencesModel';
import { StudentSchedule } from '../../models/ScheduleModel';

export interface StudyPlan {
  id: string;
  studentId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  goal: StudyGoal;
  sessions: PlannedStudySession[];
  techniques: StudyTechnique[];
  milestones: StudyMilestone[];
  resources: StudyResource[];
  progress: StudyPlanProgress;
  adaptations: StudyAdaptation[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface StudyGoal {
  type: 'exam_preparation' | 'assignment_completion' | 'skill_mastery' | 'course_improvement' | 'general_study';
  targetId?: string; // courseId, assignmentId, examId
  description: string;
  targetGrade?: number;
  targetDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  measurableOutcomes: string[];
}

export interface PlannedStudySession {
  id: string;
  title: string;
  type: StudySessionType;
  scheduledDate: Date;
  duration: number; // minutes
  topics: string[];
  techniques: string[]; // technique IDs
  materials: string[];
  prerequisites: string[]; // previous session IDs
  objectives: string[];
  difficulty: number; // 1-5
  energyRequired: 'low' | 'medium' | 'high';
  focusRequired: 'low' | 'medium' | 'high';
  estimatedEffectiveness: number; // 0-1
  adaptable: boolean;
  backupPlans: BackupPlan[];
}

export interface StudyMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  dependencies: string[]; // session IDs
  criteria: MilestoneCriteria[];
  weight: number; // importance weight
  completed: boolean;
  completedDate?: Date;
  actualResult?: any;
}

export interface MilestoneCriteria {
  type: 'knowledge_check' | 'practice_test' | 'assignment_grade' | 'self_assessment';
  description: string;
  targetValue: number | string;
  actualValue?: number | string;
  met: boolean;
}

export interface StudyResource {
  id: string;
  title: string;
  type: 'textbook' | 'video' | 'article' | 'practice_problems' | 'flashcards' | 'notes' | 'tutorial';
  url?: string;
  file?: File;
  estimatedTime: number; // minutes
  difficulty: number; // 1-5
  effectiveness: number; // 1-5 rating
  topics: string[];
  sessionIds: string[]; // which sessions use this resource
}

export interface StudyPlanProgress {
  overallCompletion: number; // 0-100
  sessionsCompleted: number;
  sessionsTotal: number;
  hoursSpent: number;
  hoursPlanned: number;
  milestonesAchieved: number;
  milestonesTotal: number;
  averageEffectiveness: number; // 1-5
  adaptationCount: number;
  onSchedule: boolean;
  projectedCompletion: Date;
  confidenceLevel: number; // 0-1
}

export interface StudyAdaptation {
  id: string;
  timestamp: Date;
  reason: 'schedule_conflict' | 'performance_below_target' | 'technique_ineffective' | 'external_factor' | 'preference_change';
  description: string;
  changes: AdaptationChange[];
  impact: 'minor' | 'moderate' | 'major';
  effectiveness?: number; // measured after implementation
}

export interface AdaptationChange {
  type: 'session_reschedule' | 'technique_change' | 'duration_adjust' | 'topic_reorder' | 'resource_swap';
  before: any;
  after: any;
  reasoning: string;
}

export interface BackupPlan {
  id: string;
  trigger: 'time_shortage' | 'energy_low' | 'distraction_high' | 'material_unavailable' | 'location_unavailable';
  adjustments: PlanAdjustment[];
  effectiveness: number; // 0-1 estimated effectiveness vs original plan
}

export interface PlanAdjustment {
  type: 'reduce_duration' | 'simplify_content' | 'change_technique' | 'defer_topics' | 'consolidate_sessions';
  parameters: Record<string, any>;
  description: string;
}

// Main study planning function
export const createStudyPlan = (
  goal: StudyGoal,
  availableTime: TimeSlot[],
  preferences: UserPreferences,
  existingSchedule: StudentSchedule,
  courseData?: Course,
  assignmentData?: Assignment
): StudyPlan => {
  const startDate = new Date();
  const endDate = goal.targetDate;
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Analyze available time
  const availableHours = calculateAvailableStudyTime(availableTime, preferences);
  
  // Determine study content and structure
  const studyContent = analyzeStudyContent(goal, courseData, assignmentData);
  
  // Generate study sessions
  const sessions = generateOptimalStudySessions(
    studyContent,
    availableHours,
    totalDays,
    preferences,
    existingSchedule
  );
  
  // Create milestones
  const milestones = createStudyMilestones(goal, sessions, studyContent);
  
  // Select appropriate techniques
  const techniques = selectStudyTechniques(studyContent, preferences, sessions);
  
  // Gather resources
  const resources = identifyStudyResources(studyContent, sessions, courseData);
  
  const studyPlan: StudyPlan = {
    id: `plan-${Date.now()}`,
    studentId: preferences.academic.studentId || 'unknown',
    title: generatePlanTitle(goal),
    description: generatePlanDescription(goal, studyContent),
    startDate,
    endDate,
    goal,
    sessions,
    techniques,
    milestones,
    resources,
    progress: {
      overallCompletion: 0,
      sessionsCompleted: 0,
      sessionsTotal: sessions.length,
      hoursSpent: 0,
      hoursPlanned: sessions.reduce((sum, s) => sum + s.duration, 0) / 60,
      milestonesAchieved: 0,
      milestonesTotal: milestones.length,
      averageEffectiveness: 0,
      adaptationCount: 0,
      onSchedule: true,
      projectedCompletion: endDate,
      confidenceLevel: calculateInitialConfidence(sessions, availableHours, totalDays)
    },
    adaptations: [],
    createdAt: new Date(),
    lastUpdated: new Date()
  };
  
  return studyPlan;
};

// Generate optimal study sessions
const generateOptimalStudySessions = (
  content: StudyContent,
  availableHours: number,
  totalDays: number,
  preferences: UserPreferences,
  schedule: StudentSchedule
): PlannedStudySession[] => {
  const sessions: PlannedStudySession[] = [];
  const dailyStudyTime = Math.min(availableHours / totalDays, preferences.study.maxStudySessionLength / 60);
  
  // Break content into sessions based on complexity and available time
  const sessionDuration = Math.min(
    preferences.study.focusSessionLength,
    dailyStudyTime * 60
  );
  
  content.topics.forEach((topic, index) => {
    const sessionsNeeded = Math.ceil(topic.estimatedTime / sessionDuration);
    
    for (let i = 0; i < sessionsNeeded; i++) {
      const sessionTitle = `${topic.name} - Session ${i + 1}`;
      const sessionDurationActual = Math.min(
        sessionDuration,
        topic.estimatedTime - (i * sessionDuration)
      );
      
      // Schedule session based on topic difficulty and user preferences
      const scheduledDate = calculateOptimalSessionTime(
        index + i,
        topic.difficulty,
        preferences,
        schedule,
        new Date()
      );
      
      sessions.push({
        id: `session-${index}-${i}`,
        title: sessionTitle,
        type: determineSessionType(topic, i, sessionsNeeded),
        scheduledDate,
        duration: sessionDurationActual,
        topics: [topic.name],
        techniques: selectTechniquesForTopic(topic, preferences),
        materials: topic.materials,
        prerequisites: i > 0 ? [`session-${index}-${i-1}`] : [],
        objectives: topic.objectives,
        difficulty: topic.difficulty,
        energyRequired: mapDifficultyToEnergy(topic.difficulty),
        focusRequired: mapDifficultyToFocus(topic.difficulty),
        estimatedEffectiveness: calculateSessionEffectiveness(topic, sessionDurationActual, preferences),
        adaptable: true,
        backupPlans: generateBackupPlans(sessionDurationActual, topic)
      });
    }
  });
  
  // Optimize session order using spaced repetition principles
  return optimizeSessionOrder(sessions, preferences);
};

// Analyze study content based on goal
const analyzeStudyContent = (
  goal: StudyGoal,
  courseData?: Course,
  assignmentData?: Assignment
): StudyContent => {
  const topics: StudyTopic[] = [];
  let totalEstimatedTime = 0;
  
  if (goal.type === 'exam_preparation' && courseData) {
    // Extract topics from course syllabus or materials
    const examTopics = extractExamTopics(courseData, goal);
    topics.push(...examTopics);
  } else if (goal.type === 'assignment_completion' && assignmentData) {
    // Break down assignment into study components
    const assignmentTopics = extractAssignmentTopics(assignmentData);
    topics.push(...assignmentTopics);
  } else if (goal.type === 'course_improvement' && courseData) {
    // Identify weak areas that need reinforcement
    const improvementTopics = identifyImprovementAreas(courseData, goal);
    topics.push(...improvementTopics);
  } else {
    // General study plan
    const generalTopics = createGeneralStudyTopics(goal);
    topics.push(...generalTopics);
  }
  
  totalEstimatedTime = topics.reduce((sum, topic) => sum + topic.estimatedTime, 0);
  
  return {
    topics,
    totalEstimatedTime,
    complexity: calculateContentComplexity(topics),
    prerequisites: extractPrerequisites(topics),
    learningObjectives: extractLearningObjectives(topics)
  };
};

// Calculate available study time
const calculateAvailableStudyTime = (
  timeSlots: TimeSlot[],
  preferences: UserPreferences
): number => {
  let totalMinutes = 0;
  
  timeSlots.forEach(slot => {
    const slotMinutes = slot.endTime - slot.startTime; // Assuming time in minutes
    
    // Apply user preferences for study time
    const efficiency = getStudyEfficiency(slot, preferences);
    totalMinutes += slotMinutes * efficiency;
  });
  
  return totalMinutes / 60; // Convert to hours
};

// Create study milestones
const createStudyMilestones = (
  goal: StudyGoal,
  sessions: PlannedStudySession[],
  content: StudyContent
): StudyMilestone[] => {
  const milestones: StudyMilestone[] = [];
  const totalSessions = sessions.length;
  
  // Create milestones at 25%, 50%, 75%, and 100% completion
  const milestonePercentages = [0.25, 0.5, 0.75, 1.0];
  
  milestonePercentages.forEach((percentage, index) => {
    const sessionIndex = Math.floor(totalSessions * percentage) - 1;
    const targetSession = sessions[sessionIndex];
    
    if (targetSession) {
      milestones.push({
        id: `milestone-${index}`,
        title: getMilestoneTitle(percentage, goal),
        description: getMilestoneDescription(percentage, goal, content),
        targetDate: targetSession.scheduledDate,
        dependencies: sessions.slice(0, sessionIndex + 1).map(s => s.id),
        criteria: createMilestoneCriteria(percentage, goal, content),
        weight: percentage === 1.0 ? 0.4 : 0.2, // Final milestone has higher weight
        completed: false
      });
    }
  });
  
  return milestones;
};

// Select appropriate study techniques
const selectStudyTechniques = (
  content: StudyContent,
  preferences: UserPreferences,
  sessions: PlannedStudySession[]
): StudyTechnique[] => {
  const techniques: StudyTechnique[] = [];
  
  // Add user's preferred techniques
  if (preferences.study.preferredStudyMethods) {
    preferences.study.preferredStudyMethods.forEach(method => {
      if (method.effectiveness >= 3) { // Only include effective techniques
        techniques.push({
          id: `technique-${method.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: method.name,
          type: mapMethodToTechniqueType(method.name),
          description: `User's preferred method: ${method.name}`,
          timeAllocated: 0, // Will be calculated based on session usage
          effectiveness: method.effectiveness,
          suitableFor: method.subjects.includes('all') ? 
            ['review', 'new_material', 'practice'] : 
            [mapSubjectToSessionType(method.subjects[0])],
          materials: [],
          instructions: [`Apply ${method.name} technique as practiced`],
          benefits: [`Familiar technique with ${method.effectiveness}/5 effectiveness`]
        });
      }
    });
  }
  
  // Add content-specific techniques
  const contentTechniques = recommendTechniquesForContent(content);
  techniques.push(...contentTechniques);
  
  // Add spaced repetition if user prefers it
  if (preferences.study.spacedRepetitionUse) {
    techniques.push({
      id: 'spaced-repetition',
      name: 'Spaced Repetition',
      type: 'spaced_repetition',
      description: 'Review material at increasing intervals for better retention',
      timeAllocated: 0,
      effectiveness: 5,
      suitableFor: ['review', 'memorization'],
      materials: [],
      instructions: [
        'Review material today',
        'Review again in 1 day',
        'Review again in 3 days',
        'Review again in 1 week'
      ],
      benefits: ['Maximizes long-term retention', 'Efficient use of study time']
    });
  }
  
  return techniques;
};

// Identify study resources
const identifyStudyResources = (
  content: StudyContent,
  sessions: PlannedStudySession[],
  courseData?: Course
): StudyResource[] => {
  const resources: StudyResource[] = [];
  
  // Add course materials if available
  if (courseData?.resources) {
    courseData.resources.forEach(resource => {
      resources.push({
        id: `course-resource-${resource.id}`,
        title: resource.title,
        type: mapResourceType(resource.type),
        url: resource.url,
        estimatedTime: estimateResourceTime(resource),
        difficulty: 3, // Default difficulty
        effectiveness: 4, // Assume course resources are good
        topics: extractTopicsFromResource(resource),
        sessionIds: findRelevantSessions(resource, sessions)
      });
    });
  }
  
  // Add generated resources based on content
  content.topics.forEach(topic => {
    topic.materials.forEach(material => {
      resources.push({
        id: `topic-resource-${topic.name}-${material}`,
        title: material,
        type: inferResourceType(material),
        estimatedTime: topic.estimatedTime * 0.3, // Assume 30% of topic time for this resource
        difficulty: topic.difficulty,
        effectiveness: 3, // Default effectiveness
        topics: [topic.name],
        sessionIds: sessions.filter(s => s.topics.includes(topic.name)).map(s => s.id)
      });
    });
  });
  
  return resources;
};

// Optimize session order using learning science principles
const optimizeSessionOrder = (
  sessions: PlannedStudySession[],
  preferences: UserPreferences
): PlannedStudySession[] => {
  const optimized = [...sessions];
  
  // Sort by difficulty and interleave hard/easy topics
  if (preferences.study.spacedRepetitionUse) {
    return interleaveSessionsByDifficulty(optimized);
  }
  
  // Sort by dependencies first, then by optimal timing
  optimized.sort((a, b) => {
    // Handle dependencies
    if (a.prerequisites.includes(b.id)) return 1;
    if (b.prerequisites.includes(a.id)) return -1;
    
    // Then by difficulty (easier first for confidence building)
    return a.difficulty - b.difficulty;
  });
  
  return optimized;
};

// Generate backup plans for sessions
const generateBackupPlans = (
  originalDuration: number,
  topic: StudyTopic
): BackupPlan[] => {
  const plans: BackupPlan[] = [];
  
  // Time shortage backup
  plans.push({
    id: 'time-shortage',
    trigger: 'time_shortage',
    adjustments: [
      {
        type: 'reduce_duration',
        parameters: { newDuration: originalDuration * 0.7 },
        description: 'Reduce session to 70% of original duration'
      },
      {
        type: 'simplify_content',
        parameters: { focusOn: 'core_concepts' },
        description: 'Focus only on core concepts'
      }
    ],
    effectiveness: 0.7
  });
  
  // Low energy backup
  plans.push({
    id: 'energy-low',
    trigger: 'energy_low',
    adjustments: [
      {
        type: 'change_technique',
        parameters: { newTechnique: 'passive_review' },
        description: 'Switch to passive review techniques'
      },
      {
        type: 'reduce_duration',
        parameters: { newDuration: originalDuration * 0.5 },
        description: 'Shorten session to match energy level'
      }
    ],
    effectiveness: 0.5
  });
  
  // High distraction backup
  plans.push({
    id: 'distraction-high',
    trigger: 'distraction_high',
    adjustments: [
      {
        type: 'change_technique',
        parameters: { newTechnique: 'active_recall' },
        description: 'Use active recall to maintain focus'
      }
    ],
    effectiveness: 0.8
  });
  
  return plans;
};

// Helper functions and interfaces
interface TimeSlot {
  startTime: number; // minutes from midnight
  endTime: number;
  dayOfWeek: string;
  energyLevel?: 'low' | 'medium' | 'high';
}

interface StudyContent {
  topics: StudyTopic[];
  totalEstimatedTime: number; // minutes
  complexity: number; // 1-5
  prerequisites: string[];
  learningObjectives: string[];
}

interface StudyTopic {
  name: string;
  estimatedTime: number; // minutes
  difficulty: number; // 1-5
  materials: string[];
  objectives: string[];
  prerequisites: string[];
}

// Utility functions
const calculateOptimalSessionTime = (
  sessionIndex: number,
  difficulty: number,
  preferences: UserPreferences,
  schedule: StudentSchedule,
  startDate: Date
): Date => {
  // Distribute sessions over available time, considering user's peak hours
  const daysFromStart = Math.floor(sessionIndex / 2); // Roughly 2 sessions per day max
  const sessionDate = new Date(startDate.getTime() + daysFromStart * 24 * 60 * 60 * 1000);
  
  // Adjust time based on difficulty and user preferences
  const preferredTime = preferences.academic.studyTimePreference;
  let targetHour = 10; // Default 10 AM
  
  switch (preferredTime) {
    case 'morning':
      targetHour = difficulty > 3 ? 9 : 10; // Earlier for harder material
      break;
    case 'afternoon':
      targetHour = 14;
      break;
    case 'evening':
      targetHour = 19;
      break;
    case 'night':
      targetHour = 21;
      break;
    default:
      targetHour = 10;
  }
  
  sessionDate.setHours(targetHour, 0, 0, 0);
  return sessionDate;
};

const determineSessionType = (
  topic: StudyTopic,
  sessionIndex: number,
  totalSessions: number
): StudySessionType => {
  if (sessionIndex === 0) return 'new_material';
  if (sessionIndex === totalSessions - 1) return 'review';
  if (topic.name.toLowerCase().includes('practice')) return 'practice';
  return 'review'; // Valid StudySessionType
};

const mapDifficultyToEnergy = (difficulty: number): 'low' | 'medium' | 'high' => {
  if (difficulty <= 2) return 'low';
  if (difficulty <= 3) return 'medium';
  return 'high';
};

const mapDifficultyToFocus = (difficulty: number): 'low' | 'medium' | 'high' => {
  if (difficulty <= 2) return 'low';
  if (difficulty <= 4) return 'medium';
  return 'high';
};

const calculateSessionEffectiveness = (
  topic: StudyTopic,
  duration: number,
  preferences: UserPreferences
): number => {
  let effectiveness = 0.7; // Base effectiveness
  
  // Adjust for optimal session length
  const optimalDuration = preferences.study.focusSessionLength;
  if (duration <= optimalDuration) {
    effectiveness += 0.2;
  } else {
    effectiveness -= (duration - optimalDuration) / optimalDuration * 0.3;
  }
  
  // Adjust for difficulty match with user capacity
  if (topic.difficulty <= 3) {
    effectiveness += 0.1; // Easier topics are more consistently effective
  }
  
  return Math.min(1.0, Math.max(0.1, effectiveness));
};

const selectTechniquesForTopic = (
  topic: StudyTopic,
  preferences: UserPreferences
): string[] => {
  const techniques: string[] = [];
  
  // Select based on topic characteristics
  if (topic.name.toLowerCase().includes('formula') || topic.name.toLowerCase().includes('equation')) {
    techniques.push('practice_testing', 'repetition');
  } else if (topic.name.toLowerCase().includes('concept')) {
    techniques.push('elaborative_rehearsal', 'mind_mapping');
  } else {
    techniques.push('active_recall', 'summarization');
  }
  
  // Add user's preferred techniques if applicable
  if (preferences.study.pomodoroPreference) {
    techniques.push('pomodoro');
  }
  
  return techniques;
};

const extractExamTopics = (course: Course, goal: StudyGoal): StudyTopic[] => {
  // This would parse syllabus or exam information
  return [
    {
      name: `${course.courseCode} Review - Core Concepts`,
      estimatedTime: 120, // 2 hours
      difficulty: 3,
      materials: ['textbook', 'lecture notes'],
      objectives: ['Review main concepts', 'Identify knowledge gaps'],
      prerequisites: []
    },
    {
      name: `${course.courseCode} Review - Problem Solving`,
      estimatedTime: 180, // 3 hours
      difficulty: 4,
      materials: ['practice problems', 'past exams'],
      objectives: ['Practice problem-solving', 'Build confidence'],
      prerequisites: [`${course.courseCode} Review - Core Concepts`]
    }
  ];
};

const extractAssignmentTopics = (assignment: Assignment): StudyTopic[] => {
  return [
    {
      name: `${assignment.title} - Research Phase`,
      estimatedTime: assignment.progress?.estimatedTimeRemaining || 120,
      difficulty: 3,
      materials: ['assignment requirements', 'research sources'],
      objectives: ['Understand requirements', 'Gather resources'],
      prerequisites: []
    },
    {
      name: `${assignment.title} - Execution Phase`,
      estimatedTime: (assignment.progress?.estimatedTimeRemaining || 120) * 2,
      difficulty: 4,
      materials: ['research materials', 'tools'],
      objectives: ['Complete assignment tasks', 'Meet quality standards'],
      prerequisites: [`${assignment.title} - Research Phase`]
    }
  ];
};

const identifyImprovementAreas = (course: Course, goal: StudyGoal): StudyTopic[] => {
  // This would analyze current performance to identify weak areas
  return [
    {
      name: `${course.courseCode} - Weak Area Review`,
      estimatedTime: 90,
      difficulty: 4,
      materials: ['textbook', 'additional resources'],
      objectives: ['Strengthen understanding', 'Improve performance'],
      prerequisites: []
    }
  ];
};

const createGeneralStudyTopics = (goal: StudyGoal): StudyTopic[] => {
  return [
    {
      name: 'General Study Session',
      estimatedTime: 60,
      difficulty: 3,
      materials: ['study materials'],
      objectives: goal.measurableOutcomes,
      prerequisites: []
    }
  ];
};

const calculateContentComplexity = (topics: StudyTopic[]): number => {
  return topics.reduce((sum, topic) => sum + topic.difficulty, 0) / topics.length;
};

const extractPrerequisites = (topics: StudyTopic[]): string[] => {
  return [...new Set(topics.flatMap(topic => topic.prerequisites))];
};

const extractLearningObjectives = (topics: StudyTopic[]): string[] => {
  return [...new Set(topics.flatMap(topic => topic.objectives))];
};

const getStudyEfficiency = (slot: TimeSlot, preferences: UserPreferences): number => {
  // Calculate efficiency based on user's peak hours and preferences
  let efficiency = 0.8; // Base efficiency
  
  const hour = Math.floor(slot.startTime / 60);
  const peakHours = preferences.productivity?.peakEnergyTimes || ['morning'];
  
  if (peakHours.includes('morning') && hour >= 8 && hour <= 11) {
    efficiency = 1.0;
  } else if (peakHours.includes('afternoon') && hour >= 13 && hour <= 16) {
    efficiency = 1.0;
  } else if (peakHours.includes('evening') && hour >= 18 && hour <= 21) {
    efficiency = 1.0;
  }
  
  return efficiency;
};

const calculateInitialConfidence = (
  sessions: PlannedStudySession[],
  availableHours: number,
  totalDays: number
): number => {
  const requiredHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
  const timeRatio = availableHours / requiredHours;
  
  let confidence = Math.min(1.0, timeRatio);
  
  // Adjust for session complexity
  const averageDifficulty = sessions.reduce((sum, s) => sum + s.difficulty, 0) / sessions.length;
  confidence *= (6 - averageDifficulty) / 5; // Higher difficulty reduces confidence
  
  // Adjust for schedule density
  const sessionsPerDay = sessions.length / totalDays;
  if (sessionsPerDay > 2) {
    confidence *= 0.9; // Reduce confidence for packed schedules
  }
  
  return Math.max(0.1, Math.min(1.0, confidence));
};

// Additional utility functions for mapping and conversion
const mapMethodToTechniqueType = (methodName: string): any => {
  const typeMap: Record<string, any> = {
    'Active Recall': 'active_recall',
    'Spaced Repetition': 'spaced_repetition',
    'Pomodoro Technique': 'pomodoro',
    'Mind Mapping': 'mind_mapping',
    'Cornell Notes': 'cornell_notes',
    'Flashcards': 'flashcards',
    'Practice Testing': 'practice_testing'
  };
  
  return typeMap[methodName] || 'summarization';
};

const mapSubjectToSessionType = (subject: string): StudySessionType => {
  const typeMap: Record<string, StudySessionType> = {
    'math': 'practice',
    'science': 'new_material',
    'history': 'review',
    'language': 'practice'
  };
  
  return typeMap[subject.toLowerCase()] || 'review';
};

const interleaveSessionsByDifficulty = (sessions: PlannedStudySession[]): PlannedStudySession[] => {
  const easy = sessions.filter(s => s.difficulty <= 2);
  const medium = sessions.filter(s => s.difficulty === 3);
  const hard = sessions.filter(s => s.difficulty >= 4);
  
  const interleaved: PlannedStudySession[] = [];
  const maxLength = Math.max(easy.length, medium.length, hard.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (hard[i]) interleaved.push(hard[i]);
    if (easy[i]) interleaved.push(easy[i]);
    if (medium[i]) interleaved.push(medium[i]);
  }
  
  return interleaved;
};

// Helper functions for resource management
const mapResourceType = (type: string): any => {
  const typeMap: Record<string, any> = {
    'link': 'article',
    'file': 'textbook',
    'video': 'video',
    'note': 'notes'
  };
  
  return typeMap[type] || 'article';
};

const estimateResourceTime = (resource: any): number => {
  // Estimate time based on resource type and size
  if (resource.type === 'video') return 30; // Assume 30 min videos
  if (resource.type === 'article') return 15; // Assume 15 min articles
  return 20; // Default
};

const extractTopicsFromResource = (resource: any): string[] => {
  // Extract topics from resource metadata or title
  return resource.tags || [resource.title.split(' ')[0]];
};

const findRelevantSessions = (resource: any, sessions: PlannedStudySession[]): string[] => {
  // Find sessions that could use this resource
  return sessions
    .filter(session => session.topics.some(topic => 
      resource.title.toLowerCase().includes(topic.toLowerCase())
    ))
    .map(session => session.id);
};

const inferResourceType = (material: string): any => {
  if (material.includes('video')) return 'video';
  if (material.includes('book') || material.includes('text')) return 'textbook';
  if (material.includes('problem')) return 'practice_problems';
  if (material.includes('note')) return 'notes';
  return 'article';
};

// Milestone helper functions
const getMilestoneTitle = (percentage: number, goal: StudyGoal): string => {
  const percentText = `${Math.round(percentage * 100)}%`;
  return `${percentText} Progress - ${goal.description}`;
};

const getMilestoneDescription = (percentage: number, goal: StudyGoal, content: StudyContent): string => {
  const completedTopics = Math.floor(content.topics.length * percentage);
  return `Complete ${completedTopics} of ${content.topics.length} study topics`;
};

const createMilestoneCriteria = (percentage: number, goal: StudyGoal, content: StudyContent): MilestoneCriteria[] => {
  return [
    {
      type: 'self_assessment',
      description: `Self-assess understanding at ${Math.round(percentage * 100)}% completion`,
      targetValue: '4/5',
      met: false
    }
  ];
};

const recommendTechniquesForContent = (content: StudyContent): StudyTechnique[] => {
  const techniques: StudyTechnique[] = [];
  
  if (content.complexity >= 4) {
    techniques.push({
      id: 'elaborative-rehearsal',
      name: 'Elaborative Rehearsal',
      type: 'elaborative_rehearsal',
      description: 'Connect new information to existing knowledge',
      timeAllocated: 0,
      effectiveness: 4,
      suitableFor: ['new_material', 'review'],
      materials: [],
      instructions: ['Relate new concepts to what you already know', 'Create mental connections'],
      benefits: ['Deeper understanding', 'Better retention']
    });
  }
  
  return techniques;
};

const generatePlanTitle = (goal: StudyGoal): string => {
  return `Study Plan: ${goal.description}`;
};

const generatePlanDescription = (goal: StudyGoal, content: StudyContent): string => {
  return `${goal.type.replace('_', ' ')} plan with ${content.topics.length} topics, estimated ${Math.round(content.totalEstimatedTime / 60)} hours`;
};

// Export main functions and utilities
export {
  calculateOptimalSessionTime,
  generateOptimalStudySessions,
  analyzeStudyContent,
  createStudyMilestones,
  selectStudyTechniques,
  identifyStudyResources,
  optimizeSessionOrder,
  calculateInitialConfidence
};