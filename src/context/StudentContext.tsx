// src/context/StudentContext.tsx

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { StudentProfile, StudentStats, StudentGoal, DEFAULT_STUDENT_PREFERENCES } from '../models/StudentModel';
import { UserPreferences, validateUserPreferences, migratePreferences } from '../models/UserPreferencesModel';

// Context State Interface
export interface StudentContextState {
  // Profile data
  currentStudent: StudentProfile | null;
  preferences: UserPreferences;
  stats: StudentStats | null;
  goals: StudentGoal[];
  
  // UI state
  isLoading: boolean;
  isInitialized: boolean;
  lastSynced: Date | null;
  errors: StudentError[];
  
  // Settings
  autoSave: boolean;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
}

// Action Types
export type StudentAction =
  | { type: 'INITIALIZE_START' }
  | { type: 'INITIALIZE_SUCCESS'; payload: { student: StudentProfile; preferences: UserPreferences } }
  | { type: 'INITIALIZE_ERROR'; payload: { error: string } }
  | { type: 'UPDATE_PROFILE'; payload: Partial<StudentProfile> }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'UPDATE_STATS'; payload: StudentStats }
  | { type: 'ADD_GOAL'; payload: StudentGoal }
  | { type: 'UPDATE_GOAL'; payload: { id: string; updates: Partial<StudentGoal> } }
  | { type: 'DELETE_GOAL'; payload: { id: string } }
  | { type: 'SYNC_START' }
  | { type: 'SYNC_SUCCESS'; payload: { timestamp: Date } }
  | { type: 'SYNC_ERROR'; payload: { error: string } }
  | { type: 'ADD_ERROR'; payload: StudentError }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'TOGGLE_AUTO_SAVE' }
  | { type: 'RESET_PROFILE' };

// Error Interface
export interface StudentError {
  id: string;
  type: 'validation' | 'sync' | 'storage' | 'network';
  message: string;
  timestamp: Date;
  recoverable: boolean;
  context?: any;
}

// Context Actions Interface
export interface StudentContextActions {
  // Profile management
  updateProfile: (updates: Partial<StudentProfile>) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  resetProfile: () => Promise<void>;
  
  // Goal management
  addGoal: (goal: Omit<StudentGoal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<StudentGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  // Stats and analytics
  updateStats: (stats: StudentStats) => void;
  refreshStats: () => Promise<void>;
  
  // Sync and storage
  syncData: () => Promise<void>;
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<void>;
  
  // Error handling
  addError: (error: Omit<StudentError, 'id' | 'timestamp'>) => void;
  clearErrors: () => void;
  
  // Settings
  toggleAutoSave: () => void;
  
  // Validation
  validateCurrentState: () => string[];
}

// Combined Context Type
export type StudentContextType = StudentContextState & StudentContextActions;

// Initial State
const initialState: StudentContextState = {
  currentStudent: null,
  preferences: DEFAULT_STUDENT_PREFERENCES,
  stats: null,
  goals: [],
  isLoading: false,
  isInitialized: false,
  lastSynced: null,
  errors: [],
  autoSave: true,
  syncStatus: 'idle'
};

// Reducer
const studentReducer = (state: StudentContextState, action: StudentAction): StudentContextState => {
  switch (action.type) {
    case 'INITIALIZE_START':
      return {
        ...state,
        isLoading: true,
        errors: []
      };
      
    case 'INITIALIZE_SUCCESS':
      return {
        ...state,
        currentStudent: action.payload.student,
        preferences: action.payload.preferences,
        isLoading: false,
        isInitialized: true,
        lastSynced: new Date()
      };
      
    case 'INITIALIZE_ERROR':
      return {
        ...state,
        isLoading: false,
        errors: [
          ...state.errors,
          {
            id: Date.now().toString(),
            type: 'storage',
            message: action.payload.error,
            timestamp: new Date(),
            recoverable: true
          }
        ]
      };
      
    case 'UPDATE_PROFILE':
      if (!state.currentStudent) return state;
      
      return {
        ...state,
        currentStudent: {
          ...state.currentStudent,
          ...action.payload,
          updatedAt: new Date()
        }
      };
      
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
          lastUpdated: new Date()
        }
      };
      
    case 'UPDATE_STATS':
      return {
        ...state,
        stats: action.payload
      };
      
    case 'ADD_GOAL':
      return {
        ...state,
        goals: [...state.goals, action.payload]
      };
      
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(goal =>
          goal.id === action.payload.id
            ? { ...goal, ...action.payload.updates }
            : goal
        )
      };
      
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(goal => goal.id !== action.payload.id)
      };
      
    case 'SYNC_START':
      return {
        ...state,
        syncStatus: 'syncing'
      };
      
    case 'SYNC_SUCCESS':
      return {
        ...state,
        syncStatus: 'success',
        lastSynced: action.payload.timestamp,
        errors: state.errors.filter(error => error.type !== 'sync')
      };
      
    case 'SYNC_ERROR':
      return {
        ...state,
        syncStatus: 'error',
        errors: [
          ...state.errors,
          {
            id: Date.now().toString(),
            type: 'sync',
            message: action.payload.error,
            timestamp: new Date(),
            recoverable: true
          }
        ]
      };
      
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [
          ...state.errors,
          {
            ...action.payload,
            id: Date.now().toString(),
            timestamp: new Date()
          }
        ]
      };
      
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: []
      };
      
    case 'TOGGLE_AUTO_SAVE':
      return {
        ...state,
        autoSave: !state.autoSave
      };
      
    case 'RESET_PROFILE':
      return {
        ...initialState,
        isInitialized: true
      };
      
    default:
      return state;
  }
};

// Create Context
const StudentContext = createContext<StudentContextType | undefined>(undefined);

// Storage Keys
const STORAGE_KEYS = {
  STUDENT_PROFILE: 'clockwyz_student_profile',
  USER_PREFERENCES: 'clockwyz_user_preferences',
  STUDENT_STATS: 'clockwyz_student_stats',
  STUDENT_GOALS: 'clockwyz_student_goals',
  SETTINGS: 'clockwyz_student_settings'
};

// Provider Component
export const StudentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(studentReducer, initialState);

  // Initialize data from localStorage on mount
  useEffect(() => {
    initializeFromStorage();
  }, []);

  // Auto-save when data changes
  useEffect(() => {
    if (state.isInitialized && state.autoSave) {
      saveToStorage();
    }
  }, [state.currentStudent, state.preferences, state.goals, state.stats, state.isInitialized, state.autoSave]);

  // Initialize from localStorage
  const initializeFromStorage = async () => {
    dispatch({ type: 'INITIALIZE_START' });
    
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEYS.STUDENT_PROFILE);
      const savedPreferences = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      const savedGoals = localStorage.getItem(STORAGE_KEYS.STUDENT_GOALS);
      const savedStats = localStorage.getItem(STORAGE_KEYS.STUDENT_STATS);
      
      let student: StudentProfile | null = null;
      let preferences: UserPreferences = DEFAULT_STUDENT_PREFERENCES;
      
      // Load and validate profile
      if (savedProfile) {
        try {
          student = JSON.parse(savedProfile);
          // Convert date strings back to Date objects
          if (student) {
            student.createdAt = new Date(student.createdAt);
            student.updatedAt = new Date(student.updatedAt);
          }
        } catch (error) {
          console.warn('Failed to parse saved profile:', error);
        }
      }
      
      // Load and validate preferences
      if (savedPreferences) {
        try {
          const parsed = JSON.parse(savedPreferences);
          preferences = migratePreferences(parsed, parsed.profileVersion || '1.0.0');
          preferences.lastUpdated = new Date(preferences.lastUpdated);
        } catch (error) {
          console.warn('Failed to parse saved preferences:', error);
        }
      }
      
      // Load goals
      if (savedGoals) {
        try {
          const goals: StudentGoal[] = JSON.parse(savedGoals);
          goals.forEach(goal => {
            goal.createdAt = new Date(goal.createdAt);
            if (goal.completedAt) {
              goal.completedAt = new Date(goal.completedAt);
            }
          });
          dispatch({ type: 'UPDATE_GOAL', payload: { id: '', updates: {} } }); // This will be handled by bulk update
        } catch (error) {
          console.warn('Failed to parse saved goals:', error);
        }
      }
      
      // Load stats
      if (savedStats) {
        try {
          const stats: StudentStats = JSON.parse(savedStats);
          stats.generated = new Date(stats.generated);
          dispatch({ type: 'UPDATE_STATS', payload: stats });
        } catch (error) {
          console.warn('Failed to parse saved stats:', error);
        }
      }
      
      dispatch({
        type: 'INITIALIZE_SUCCESS',
        payload: { student: student!, preferences }
      });
      
    } catch (error) {
      dispatch({
        type: 'INITIALIZE_ERROR',
        payload: { error: `Failed to initialize: ${error instanceof Error ? error.message : String(error)}` }
      });
    }
  };

  // Save to localStorage
  const saveToStorage = async () => {
    try {
      if (state.currentStudent) {
        localStorage.setItem(STORAGE_KEYS.STUDENT_PROFILE, JSON.stringify(state.currentStudent));
      }
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(state.preferences));
      localStorage.setItem(STORAGE_KEYS.STUDENT_GOALS, JSON.stringify(state.goals));
      if (state.stats) {
        localStorage.setItem(STORAGE_KEYS.STUDENT_STATS, JSON.stringify(state.stats));
      }
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'storage',
          message: `Failed to save data: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true
        }
      });
    }
  };

  // Context Actions Implementation
  const updateProfile = async (updates: Partial<StudentProfile>) => {
    try {
      // Validate updates
      if (state.currentStudent) {
        const validationErrors = validateUserPreferences({ ...state.preferences, ...updates } as any);
        if (validationErrors.length > 0) {
          throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }
      }
      
      dispatch({ type: 'UPDATE_PROFILE', payload: updates });
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'validation',
          message: `Failed to update profile: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true,
          context: updates
        }
      });
      throw error;
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    try {
      // Validate preferences
      const newPreferences = { ...state.preferences, ...updates };
      const validationErrors = validateUserPreferences(newPreferences);
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      
      dispatch({ type: 'UPDATE_PREFERENCES', payload: updates });
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'validation',
          message: `Failed to update preferences: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true,
          context: updates
        }
      });
      throw error;
    }
  };

  const resetProfile = async () => {
    try {
      // Clear localStorage
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      dispatch({ type: 'RESET_PROFILE' });
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'storage',
          message: `Failed to reset profile: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true
        }
      });
      throw error;
    }
  };

  const addGoal = async (goalData: Omit<StudentGoal, 'id' | 'createdAt'>) => {
    try {
      const newGoal: StudentGoal = {
        ...goalData,
        id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date()
      };
      
      dispatch({ type: 'ADD_GOAL', payload: newGoal });
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'validation',
          message: `Failed to add goal: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true,
          context: goalData
        }
      });
      throw error;
    }
  };

  const updateGoal = async (id: string, updates: Partial<StudentGoal>) => {
    try {
      const existingGoal = state.goals.find(g => g.id === id);
      if (!existingGoal) {
        throw new Error('Goal not found');
      }
      
      dispatch({ type: 'UPDATE_GOAL', payload: { id, updates } });
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'validation',
          message: `Failed to update goal: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true,
          context: { id, updates }
        }
      });
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const existingGoal = state.goals.find(g => g.id === id);
      if (!existingGoal) {
        throw new Error('Goal not found');
      }
      
      dispatch({ type: 'DELETE_GOAL', payload: { id } });
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'validation',
          message: `Failed to delete goal: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true,
          context: { id }
        }
      });
      throw error;
    }
  };

  const updateStats = (stats: StudentStats) => {
    dispatch({ type: 'UPDATE_STATS', payload: stats });
  };

  const refreshStats = async () => {
    try {
      // This would typically fetch from an API or calculate from current data
      // For now, we'll generate basic stats
      if (!state.currentStudent) return;
      
      const stats: StudentStats = {
        studentId: state.currentStudent.id,
        semester: state.currentStudent.academic.currentSemester,
        stats: {
          totalCourses: 0, // Would be calculated from actual course data
          totalCredits: 0,
          averageGrade: 0,
          completedAssignments: 0,
          totalAssignments: 0,
          studyHoursLogged: 0,
          averageStudySessionLength: 0,
          onTimeSubmissionRate: 0,
          focusScore: 0,
          productivity: {
            daily: [],
            weekly: [],
            trends: []
          }
        },
        generated: new Date()
      };
      
      updateStats(stats);
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'network',
          message: `Failed to refresh stats: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true
        }
      });
      throw error;
    }
  };

  const syncData = async () => {
    dispatch({ type: 'SYNC_START' });
    
    try {
      // This would typically sync with a backend API
      // For now, we'll just save to localStorage
      await saveToStorage();
      
      dispatch({ type: 'SYNC_SUCCESS', payload: { timestamp: new Date() } });
    } catch (error) {
      dispatch({
        type: 'SYNC_ERROR',
        payload: { error: `Sync failed: ${error instanceof Error ? error.message : String(error)}` }
      });
      throw error;
    }
  };

  const exportData = async (): Promise<string> => {
    try {
      const exportData = {
        profile: state.currentStudent,
        preferences: state.preferences,
        goals: state.goals,
        stats: state.stats,
        exportedAt: new Date(),
        version: '1.0.0'
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'storage',
          message: `Failed to export data: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true
        }
      });
      throw error;
    }
  };

  const importData = async (data: string) => {
    try {
      const importedData = JSON.parse(data);
      
      // Validate imported data structure
      if (!importedData.profile && !importedData.preferences) {
        throw new Error('Invalid import data format');
      }
      
      // Import profile if present
      if (importedData.profile) {
        await updateProfile(importedData.profile);
      }
      
      // Import preferences if present
      if (importedData.preferences) {
        await updatePreferences(importedData.preferences);
      }
      
      // Import goals if present
      if (importedData.goals && Array.isArray(importedData.goals)) {
        // Clear existing goals and add imported ones
        state.goals.forEach(goal => deleteGoal(goal.id));
        for (const goal of importedData.goals) {
          await addGoal(goal);
        }
      }
      
      // Import stats if present
      if (importedData.stats) {
        updateStats(importedData.stats);
      }
      
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'storage',
          message: `Failed to import data: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true,
          context: { dataLength: data.length }
        }
      });
      throw error;
    }
  };

  const addError = (error: Omit<StudentError, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_ERROR', payload: error });
  };

  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  const toggleAutoSave = () => {
    dispatch({ type: 'TOGGLE_AUTO_SAVE' });
  };

  const validateCurrentState = (): string[] => {
    const errors: string[] = [];
    
    if (state.preferences) {
      errors.push(...validateUserPreferences(state.preferences));
    }
    
    // Validate goals
    state.goals.forEach((goal, index) => {
      if (!goal.title?.trim()) {
        errors.push(`Goal ${index + 1}: Title is required`);
      }
      if (goal.deadline && goal.deadline < new Date()) {
        errors.push(`Goal ${index + 1}: Deadline is in the past`);
      }
    });
    
    return errors;
  };

  // Context value
  const contextValue: StudentContextType = {
    // State
    ...state,
    
    // Actions
    updateProfile,
    updatePreferences,
    resetProfile,
    addGoal,
    updateGoal,
    deleteGoal,
    updateStats,
    refreshStats,
    syncData,
    exportData,
    importData,
    addError,
    clearErrors,
    toggleAutoSave,
    validateCurrentState
  };

  return (
    <StudentContext.Provider value={contextValue}>
      {children}
    </StudentContext.Provider>
  );
};

// Custom Hook
export const useStudent = (): StudentContextType => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};

// Selector Hooks for Performance
export const useStudentProfile = () => {
  const { currentStudent } = useStudent();
  return currentStudent;
};

export const useStudentPreferences = () => {
  const { preferences } = useStudent();
  return preferences;
};

export const useStudentStats = () => {
  const { stats } = useStudent();
  return stats;
};

export const useStudentGoals = () => {
  const { goals } = useStudent();
  return goals;
};

export const useStudentErrors = () => {
  const { errors, clearErrors } = useStudent();
  return { errors, clearErrors };
};

// Export types and utilities
export type { StudentContextState, StudentAction, StudentError, StudentContextActions };