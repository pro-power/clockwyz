// src/models/StudentModel.ts

export interface StudentProfile {
    id: string;
    personalInfo: {
      name: string;
      email: string;
      university: string;
      major: string;
      minor?: string;
      year: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate' | 'phd';
      expectedGraduation: string; // "Fall 2025"
      studentId?: string;
      gpa?: number;
      avatar?: string;
    };
    preferences: {
      studyTimes: TimePreference[];
      breakDuration: number; // minutes
      focusSessionLength: number; // minutes
      studyLocation: StudyLocation[];
      commute: {
        method: 'walk' | 'bike' | 'car' | 'public_transport' | 'mixed';
        averageTime: number; // minutes
        fromLocation?: string;
      };
      notifications: NotificationSettings;
      accessibility: AccessibilitySettings;
    };
    academic: {
      currentSemester: string;
      academicYear: string;
      enrollmentStatus: 'full-time' | 'part-time';
      degreeProgram: string;
      advisor?: {
        name: string;
        email: string;
        officeHours?: string;
        department: string;
      };
    };
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface TimePreference {
    type: 'study' | 'work' | 'personal' | 'sleep';
    dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    startTime: string; // "14:00"
    endTime: string; // "16:00"
    energyLevel: 'low' | 'medium' | 'high';
    preference: 'avoid' | 'neutral' | 'prefer' | 'ideal';
  }
  
  export interface StudyLocation {
    id: string;
    name: string;
    type: 'library' | 'dorm' | 'cafe' | 'study_room' | 'home' | 'outdoor' | 'other';
    address?: string;
    building?: string;
    room?: string;
    amenities: string[]; // ['wifi', 'power_outlets', 'quiet', 'group_friendly']
    capacity?: number;
    availability?: string;
    rating?: number; // 1-5
    notes?: string;
    isDefault: boolean;
  }
  
  export interface NotificationSettings {
    enabled: boolean;
    channels: {
      inApp: boolean;
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    preferences: {
      assignmentReminders: {
        enabled: boolean;
        timeBefore: number[]; // minutes before due date [1440, 360, 60] = 1day, 6hrs, 1hr
      };
      classReminders: {
        enabled: boolean;
        timeBefore: number; // minutes before class
      };
      examReminders: {
        enabled: boolean;
        timeBefore: number[];
      };
      studySessionReminders: {
        enabled: boolean;
        timeBefore: number;
      };
      gradeUpdates: {
        enabled: boolean;
        immediate: boolean;
      };
    };
    quietHours: {
      enabled: boolean;
      startTime: string;
      endTime: string;
      days: string[];
    };
  }
  
  export interface AccessibilitySettings {
    screenReader: boolean;
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
    keyboardNavigation: boolean;
    colorBlindFriendly: boolean;
    accommodations: string[]; // ['extra_time', 'note_taking_assistance', etc.]
  }
  
  export interface StudentStats {
    studentId: string;
    semester: string;
    stats: {
      totalCourses: number;
      totalCredits: number;
      averageGrade: number;
      completedAssignments: number;
      totalAssignments: number;
      studyHoursLogged: number;
      averageStudySessionLength: number;
      onTimeSubmissionRate: number;
      focusScore: number; // 0-100
      productivity: {
        daily: number[];
        weekly: number[];
        trends: ProductivityTrend[];
      };
    };
    generated: Date;
  }
  
  export interface ProductivityTrend {
    period: string; // "2024-W15"
    metric: 'assignments_completed' | 'study_hours' | 'focus_score' | 'on_time_rate';
    value: number;
    change: number; // percentage change from previous period
    trend: 'up' | 'down' | 'stable';
  }
  
  export interface StudentGoal {
    id: string;
    studentId: string;
    type: 'academic' | 'personal' | 'health' | 'skill';
    title: string;
    description: string;
    targetValue: number;
    currentValue: number;
    unit: string; // 'gpa', 'hours', 'assignments', etc.
    deadline?: Date;
    priority: 'low' | 'medium' | 'high';
    status: 'active' | 'completed' | 'paused' | 'abandoned';
    milestones: GoalMilestone[];
    createdAt: Date;
    completedAt?: Date;
  }
  
  export interface GoalMilestone {
    id: string;
    title: string;
    description?: string;
    targetValue: number;
    completed: boolean;
    completedAt?: Date;
    reward?: string;
  }
  
  // Utility types for type safety
  export type StudentYear = StudentProfile['personalInfo']['year'];
  export type NotificationChannel = keyof NotificationSettings['channels'];
  export type StudyLocationType = StudyLocation['type'];
  export type TimePreferenceType = TimePreference['type'];
  export type GoalType = StudentGoal['type'];
  export type GoalStatus = StudentGoal['status'];
  
  // Default values for new students
  export const DEFAULT_STUDENT_PREFERENCES: StudentProfile['preferences'] = {
    studyTimes: [
      {
        type: 'study',
        dayOfWeek: 'monday',
        startTime: '10:00',
        endTime: '12:00',
        energyLevel: 'high',
        preference: 'prefer'
      }
    ],
    breakDuration: 15,
    focusSessionLength: 25,
    studyLocation: [],
    commute: {
      method: 'walk',
      averageTime: 15
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
    accessibility: {
      screenReader: false,
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      keyboardNavigation: false,
      colorBlindFriendly: false,
      accommodations: []
    }
  };
  
  export const DEFAULT_STUDY_LOCATIONS: StudyLocation[] = [
    {
      id: 'default-library',
      name: 'Main Library',
      type: 'library',
      amenities: ['wifi', 'power_outlets', 'quiet'],
      isDefault: true
    },
    {
      id: 'default-home',
      name: 'Home/Dorm',
      type: 'home',
      amenities: ['wifi', 'power_outlets'],
      isDefault: false
    }
  ];
  
  // Validation functions
  export const validateStudentProfile = (profile: Partial<StudentProfile>): string[] => {
    const errors: string[] = [];
    
    if (!profile.personalInfo?.name?.trim()) {
      errors.push('Name is required');
    }
    
    if (!profile.personalInfo?.email?.includes('@')) {
      errors.push('Valid email is required');
    }
    
    if (!profile.personalInfo?.university?.trim()) {
      errors.push('University is required');
    }
    
    if (!profile.personalInfo?.major?.trim()) {
      errors.push('Major is required');
    }
    
    if (profile.personalInfo?.gpa && (profile.personalInfo.gpa < 0 || profile.personalInfo.gpa > 4.0)) {
      errors.push('GPA must be between 0.0 and 4.0');
    }
    
    return errors;
  };
  
  export const isValidTimePreference = (pref: TimePreference): boolean => {
    const startHour = parseInt(pref.startTime.split(':')[0]);
    const endHour = parseInt(pref.endTime.split(':')[0]);
    return startHour >= 0 && startHour <= 23 && endHour >= 0 && endHour <= 23 && startHour < endHour;
  };