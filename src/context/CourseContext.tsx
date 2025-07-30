// src/context/CourseContext.tsx

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Course, CourseAnalytics } from '../models/CourseModel';
import { detectCourseConflicts, analyzeCourseWorkload, generateCourseRecommendations, CourseConflict, CourseWorkload, CourseRecommendation } from '../utils/academic/courseUtils';
import { UserPreferences } from '../models/UserPreferencesModel';

// Context State Interface
export interface CourseContextState {
  // Course data
  courses: Course[];
  enrolledCourses: Course[];
  availableCourses: Course[];
  archivedCourses: Course[];
  
  // Analysis data
  conflicts: CourseConflict[];
  workloadAnalysis: CourseWorkload[];
  recommendations: CourseRecommendation[];
  analytics: Record<string, CourseAnalytics>;
  
  // UI state
  isLoading: boolean;
  loadingStates: Record<string, boolean>;
  selectedCourseId: string | null;
  filterOptions: CourseFilterOptions;
  sortOptions: CourseSortOptions;
  
  // Sync state
  lastSynced: Date | null;
  syncInProgress: boolean;
  errors: CourseError[];
}

// Filter and Sort Options
export interface CourseFilterOptions {
  status: Course['status'][];
  departments: string[];
  semesters: string[];
  instructors: string[];
  difficulties: number[];
  creditRange: [number, number];
  searchQuery: string;
}

export interface CourseSortOptions {
  field: 'courseCode' | 'courseName' | 'instructor' | 'creditHours' | 'difficulty' | 'semester';
  direction: 'asc' | 'desc';
}

// Error Interface
export interface CourseError {
  id: string;
  type: 'fetch' | 'validation' | 'conflict' | 'sync' | 'import';
  message: string;
  courseId?: string;
  timestamp: Date;
  recoverable: boolean;
  context?: any;
}

// Action Types
export type CourseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_COURSE_LOADING'; payload: { courseId: string; loading: boolean } }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'UPDATE_COURSE'; payload: { id: string; updates: Partial<Course> } }
  | { type: 'DELETE_COURSE'; payload: string }
  | { type: 'SET_CONFLICTS'; payload: CourseConflict[] }
  | { type: 'SET_WORKLOAD_ANALYSIS'; payload: CourseWorkload[] }
  | { type: 'SET_RECOMMENDATIONS'; payload: CourseRecommendation[] }
  | { type: 'SET_ANALYTICS'; payload: { courseId: string; analytics: CourseAnalytics } }
  | { type: 'SET_SELECTED_COURSE'; payload: string | null }
  | { type: 'UPDATE_FILTERS'; payload: Partial<CourseFilterOptions> }
  | { type: 'UPDATE_SORT'; payload: CourseSortOptions }
  | { type: 'SYNC_START' }
  | { type: 'SYNC_SUCCESS'; payload: { timestamp: Date } }
  | { type: 'SYNC_ERROR'; payload: { error: string } }
  | { type: 'ADD_ERROR'; payload: CourseError }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'CLEAR_ERROR'; payload: string };

// Context Actions Interface
export interface CourseContextActions {
  // Course management
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  duplicateCourse: (id: string) => Promise<string>;
  
  // Course operations
  enrollInCourse: (courseId: string) => Promise<void>;
  dropCourse: (courseId: string) => Promise<void>;
  archiveCourse: (courseId: string) => Promise<void>;
  
  // Analysis and recommendations
  analyzeConflicts: () => Promise<void>;
  analyzeWorkload: () => Promise<void>;
  generateRecommendations: (preferences: UserPreferences) => Promise<void>;
  refreshAnalytics: (courseId: string) => Promise<void>;
  
  // Filtering and sorting
  setFilters: (filters: Partial<CourseFilterOptions>) => void;
  clearFilters: () => void;
  setSorting: (sort: CourseSortOptions) => void;
  setSelectedCourse: (courseId: string | null) => void;
  
  // Data operations
  importCourses: (courses: Course[]) => Promise<void>;
  exportCourses: (courseIds?: string[]) => Promise<Course[]>;
  bulkUpdateCourses: (updates: Array<{ id: string; updates: Partial<Course> }>) => Promise<void>;
  
  // Sync operations
  syncWithLMS: () => Promise<void>;
  refreshCourseData: (courseId: string) => Promise<void>;
  
  // Utility functions
  getCourseById: (id: string) => Course | undefined;
  getCoursesByStatus: (status: Course['status']) => Course[];
  getCoursesBySemester: (semester: string) => Course[];
  getFilteredCourses: () => Course[];
  
  // Error handling
  addError: (error: Omit<CourseError, 'id' | 'timestamp'>) => void;
  clearErrors: () => void;
  clearError: (errorId: string) => void;
}

// Combined Context Type
export type CourseContextType = CourseContextState & CourseContextActions;

// Initial State
const initialState: CourseContextState = {
  courses: [],
  enrolledCourses: [],
  availableCourses: [],
  archivedCourses: [],
  conflicts: [],
  workloadAnalysis: [],
  recommendations: [],
  analytics: {},
  isLoading: false,
  loadingStates: {},
  selectedCourseId: null,
  filterOptions: {
    status: [],
    departments: [],
    semesters: [],
    instructors: [],
    difficulties: [],
    creditRange: [0, 6],
    searchQuery: ''
  },
  sortOptions: {
    field: 'courseCode',
    direction: 'asc'
  },
  lastSynced: null,
  syncInProgress: false,
  errors: []
};

// Reducer
const courseReducer = (state: CourseContextState, action: CourseAction): CourseContextState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_COURSE_LOADING':
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.payload.courseId]: action.payload.loading
        }
      };
      
    case 'SET_COURSES':
      const courses = action.payload;
      return {
        ...state,
        courses,
        enrolledCourses: courses.filter(c => c.status === 'enrolled'),
        availableCourses: courses.filter(c => c.status === 'enrolled' || c.status === 'waitlisted'),
        archivedCourses: courses.filter(c => c.status === 'completed' || c.status === 'dropped')
      };
      
    case 'ADD_COURSE':
      const newCourse = action.payload;
      const updatedCourses = [...state.courses, newCourse];
      return {
        ...state,
        courses: updatedCourses,
        enrolledCourses: newCourse.status === 'enrolled' 
          ? [...state.enrolledCourses, newCourse] 
          : state.enrolledCourses,
        availableCourses: ['enrolled', 'waitlisted'].includes(newCourse.status)
          ? [...state.availableCourses, newCourse]
          : state.availableCourses,
        archivedCourses: ['completed', 'dropped'].includes(newCourse.status)
          ? [...state.archivedCourses, newCourse]
          : state.archivedCourses
      };
      
    case 'UPDATE_COURSE':
      const { id, updates } = action.payload;
      const courseIndex = state.courses.findIndex(c => c.id === id);
      if (courseIndex === -1) return state;
      
      const updatedCourse = { ...state.courses[courseIndex], ...updates, updatedAt: new Date() };
      const coursesAfterUpdate = [
        ...state.courses.slice(0, courseIndex),
        updatedCourse,
        ...state.courses.slice(courseIndex + 1)
      ];
      
      return {
        ...state,
        courses: coursesAfterUpdate,
        enrolledCourses: coursesAfterUpdate.filter(c => c.status === 'enrolled'),
        availableCourses: coursesAfterUpdate.filter(c => c.status === 'enrolled' || c.status === 'waitlisted'),
        archivedCourses: coursesAfterUpdate.filter(c => c.status === 'completed' || c.status === 'dropped')
      };
      
    case 'DELETE_COURSE':
      const courseIdToDelete = action.payload;
      const remainingCourses = state.courses.filter(c => c.id !== courseIdToDelete);
      return {
        ...state,
        courses: remainingCourses,
        enrolledCourses: remainingCourses.filter(c => c.status === 'enrolled'),
        availableCourses: remainingCourses.filter(c => c.status === 'enrolled' || c.status === 'waitlisted'),
        archivedCourses: remainingCourses.filter(c => c.status === 'completed' || c.status === 'dropped'),
        selectedCourseId: state.selectedCourseId === courseIdToDelete ? null : state.selectedCourseId,
        analytics: Object.fromEntries(
          Object.entries(state.analytics).filter(([key]) => key !== courseIdToDelete)
        )
      };
      
    case 'SET_CONFLICTS':
      return { ...state, conflicts: action.payload };
      
    case 'SET_WORKLOAD_ANALYSIS':
      return { ...state, workloadAnalysis: action.payload };
      
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
      
    case 'SET_ANALYTICS':
      return {
        ...state,
        analytics: {
          ...state.analytics,
          [action.payload.courseId]: action.payload.analytics
        }
      };
      
    case 'SET_SELECTED_COURSE':
      return { ...state, selectedCourseId: action.payload };
      
    case 'UPDATE_FILTERS':
      return {
        ...state,
        filterOptions: {
          ...state.filterOptions,
          ...action.payload
        }
      };
      
    case 'UPDATE_SORT':
      return { ...state, sortOptions: action.payload };
      
    case 'SYNC_START':
      return { ...state, syncInProgress: true };
      
    case 'SYNC_SUCCESS':
      return {
        ...state,
        syncInProgress: false,
        lastSynced: action.payload.timestamp,
        errors: state.errors.filter(e => e.type !== 'sync')
      };
      
    case 'SYNC_ERROR':
      return {
        ...state,
        syncInProgress: false,
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
      return { ...state, errors: [] };
      
    case 'CLEAR_ERROR':
      return {
        ...state,
        errors: state.errors.filter(e => e.id !== action.payload)
      };
      
    default:
      return state;
  }
};

// Create Context
const CourseContext = createContext<CourseContextType | undefined>(undefined);

// Storage Key
const STORAGE_KEY = 'clockwyz_courses';

// Provider Component
export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(courseReducer, initialState);

  // Load courses from localStorage on mount
  useEffect(() => {
    loadCoursesFromStorage();
  }, []);

  // Save courses to localStorage when courses change
  useEffect(() => {
    if (state.courses.length > 0) {
      saveCoursesToStorage();
    }
  }, [state.courses]);

  // Auto-analyze conflicts and workload when courses change
  useEffect(() => {
    if (state.enrolledCourses.length > 0) {
      analyzeConflicts();
      analyzeWorkload();
    }
  }, [state.enrolledCourses]);

  // Load courses from localStorage
  const loadCoursesFromStorage = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const savedCourses = localStorage.getItem(STORAGE_KEY);
      if (savedCourses) {
        const courses: Course[] = JSON.parse(savedCourses);
        
        // Convert date strings back to Date objects
        courses.forEach(course => {
          course.createdAt = new Date(course.createdAt);
          course.updatedAt = new Date(course.updatedAt);
          
          // Convert recurrence pattern dates
          course.schedule.forEach(slot => {
            slot.recurrencePattern.startDate = new Date(slot.recurrencePattern.startDate);
            slot.recurrencePattern.endDate = new Date(slot.recurrencePattern.endDate);
            if (slot.recurrencePattern.exceptions) {
              slot.recurrencePattern.exceptions = slot.recurrencePattern.exceptions.map(d => new Date(d));
            }
          });
        });
        
        dispatch({ type: 'SET_COURSES', payload: courses });
      }
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'fetch',
          message: `Failed to load courses: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Save courses to localStorage
  const saveCoursesToStorage = async () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.courses));
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'sync',
          message: `Failed to save courses: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true
        }
      });
    }
  };

  // Action Implementations
  const addCourse = async (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const newCourse: Course = {
        ...courseData,
        id: `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      dispatch({ type: 'ADD_COURSE', payload: newCourse });
      return newCourse.id;
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'validation',
          message: `Failed to add course: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true,
          context: courseData
        }
      });
      throw error;
    }
  };

  const updateCourse = async (id: string, updates: Partial<Course>): Promise<void> => {
    try {
      const course = state.courses.find(c => c.id === id);
      if (!course) {
        throw new Error('Course not found');
      }

      dispatch({ type: 'UPDATE_COURSE', payload: { id, updates } });
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'validation',
          message: `Failed to update course: ${error instanceof Error ? error.message : String(error)}`,
          courseId: id,
          recoverable: true,
          context: updates
        }
      });
      throw error;
    }
  };

  const deleteCourse = async (id: string): Promise<void> => {
    try {
      const course = state.courses.find(c => c.id === id);
      if (!course) {
        throw new Error('Course not found');
      }

      dispatch({ type: 'DELETE_COURSE', payload: id });
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'validation',
          message: `Failed to delete course: ${error instanceof Error ? error.message : String(error)}`,
          courseId: id,
          recoverable: true
        }
      });
      throw error;
    }
  };

  const duplicateCourse = async (id: string): Promise<string> => {
    try {
      const course = state.courses.find(c => c.id === id);
      if (!course) {
        throw new Error('Course not found');
      }

      const duplicatedCourse = {
        ...course,
        courseName: `${course.courseName} (Copy)`,
        section: course.section ? `${course.section}-copy` : undefined
      };

      // Remove id, createdAt, updatedAt to let addCourse generate new ones
      const { id: _, createdAt, updatedAt, ...courseData } = duplicatedCourse;
      
      return await addCourse(courseData);
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'validation',
          message: `Failed to duplicate course: ${error instanceof Error ? error.message : String(error)}`,
          courseId: id,
          recoverable: true
        }
      });
      throw error;
    }
  };

  const enrollInCourse = async (courseId: string): Promise<void> => {
    await updateCourse(courseId, { status: 'enrolled' });
  };

  const dropCourse = async (courseId: string): Promise<void> => {
    await updateCourse(courseId, { status: 'dropped' });
  };

  const archiveCourse = async (courseId: string): Promise<void> => {
    await updateCourse(courseId, { status: 'completed' });
  };

  const analyzeConflicts = async (): Promise<void> => {
    try {
      const conflicts = detectCourseConflicts(state.enrolledCourses);
      dispatch({ type: 'SET_CONFLICTS', payload: conflicts });
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'conflict',
          message: `Failed to analyze conflicts: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true
        }
      });
    }
  };

  const analyzeWorkload = async (): Promise<void> => {
    try {
      const workload = analyzeCourseWorkload(state.enrolledCourses);
      dispatch({ type: 'SET_WORKLOAD_ANALYSIS', payload: workload });
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'conflict',
          message: `Failed to analyze workload: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true
        }
      });
    }
  };

  const generateRecommendations = async (preferences: UserPreferences): Promise<void> => {
    try {
      const recommendations = generateCourseRecommendations(
        state.enrolledCourses,
        state.availableCourses,
        preferences
      );
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'conflict',
          message: `Failed to generate recommendations: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true
        }
      });
    }
  };

  const refreshAnalytics = async (courseId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_COURSE_LOADING', payload: { courseId, loading: true } });
      
      const course = state.courses.find(c => c.id === courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // This would typically fetch from an API
      // For now, we'll generate basic analytics
      const analytics: CourseAnalytics = {
        courseId,
        semester: course.metadata.semester,
        stats: {
          totalClasses: 32, // Typical semester
          attendedClasses: 30,
          attendanceRate: 93.75,
          averageGrade: 85,
          timeSpent: 120, // hours
          assignmentsCompleted: 8,
          assignmentsTotal: 10,
          studyHours: 64,
          difficulty: course.metadata.difficulty,
          satisfaction: 4,
          wouldTakeAgain: true
        },
        insights: [],
        predictions: [],
        recommendations: []
      };

      dispatch({ type: 'SET_ANALYTICS', payload: { courseId, analytics } });
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'fetch',
          message: `Failed to refresh analytics: ${error instanceof Error ? error.message : String(error)}`,
          courseId,
          recoverable: true
        }
      });
    } finally {
      dispatch({ type: 'SET_COURSE_LOADING', payload: { courseId, loading: false } });
    }
  };

  const setFilters = (filters: Partial<CourseFilterOptions>) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: filters });
  };

  const clearFilters = () => {
    dispatch({
      type: 'UPDATE_FILTERS',
      payload: {
        status: [],
        departments: [],
        semesters: [],
        instructors: [],
        difficulties: [],
        creditRange: [0, 6],
        searchQuery: ''
      }
    });
  };

  const setSorting = (sort: CourseSortOptions) => {
    dispatch({ type: 'UPDATE_SORT', payload: sort });
  };

  const setSelectedCourse = (courseId: string | null) => {
    dispatch({ type: 'SET_SELECTED_COURSE', payload: courseId });
  };

  const importCourses = async (courses: Course[]): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Validate and process imported courses
      const validCourses = courses.filter(course => {
        // Basic validation
        return course.courseCode && course.courseName;
      });

      if (validCourses.length === 0) {
        throw new Error('No valid courses found in import data');
      }

      // Add each course
      for (const course of validCourses) {
        const { id, createdAt, updatedAt, ...courseData } = course;
        await addCourse(courseData);
      }

    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'import',
          message: `Failed to import courses: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true,
          context: { courseCount: courses.length }
        }
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const exportCourses = async (courseIds?: string[]): Promise<Course[]> => {
    try {
      let coursesToExport: Course[];
      
      if (courseIds) {
        coursesToExport = state.courses.filter(c => courseIds.includes(c.id));
      } else {
        coursesToExport = state.courses;
      }

      return coursesToExport;
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'sync',
          message: `Failed to export courses: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true
        }
      });
      throw error;
    }
  };

  const bulkUpdateCourses = async (updates: Array<{ id: string; updates: Partial<Course> }>): Promise<void> => {
    try {
      for (const { id, updates: courseUpdates } of updates) {
        await updateCourse(id, courseUpdates);
      }
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'validation',
          message: `Failed to bulk update courses: ${error instanceof Error ? error.message : String(error)}`,
          recoverable: true,
          context: { updateCount: updates.length }
        }
      });
      throw error;
    }
  };

  const syncWithLMS = async (): Promise<void> => {
    dispatch({ type: 'SYNC_START' });
    
    try {
      // This would typically sync with LMS APIs
      // For now, we'll just simulate a sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      dispatch({ type: 'SYNC_SUCCESS', payload: { timestamp: new Date() } });
    } catch (error) {
      dispatch({
        type: 'SYNC_ERROR',
        payload: { error: `LMS sync failed: ${error instanceof Error ? error.message : String(error)}` }
      });
      throw error;
    }
  };

  const refreshCourseData = async (courseId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_COURSE_LOADING', payload: { courseId, loading: true } });
      
      // This would typically fetch updated course data from an API
      // For now, we'll just refresh analytics
      await refreshAnalytics(courseId);
      
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type: 'fetch',
          message: `Failed to refresh course data: ${error instanceof Error ? error.message : String(error)}`,
          courseId,
          recoverable: true
        }
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_COURSE_LOADING', payload: { courseId, loading: false } });
    }
  };

  // Utility functions
  const getCourseById = (id: string): Course | undefined => {
    return state.courses.find(c => c.id === id);
  };

  const getCoursesByStatus = (status: Course['status']): Course[] => {
    return state.courses.filter(c => c.status === status);
  };

  const getCoursesBySemester = (semester: string): Course[] => {
    return state.courses.filter(c => c.metadata.semester === semester);
  };

  const getFilteredCourses = (): Course[] => {
    let filtered = [...state.courses];
    const { filterOptions, sortOptions } = state;

    // Apply status filter
    if (filterOptions.status.length > 0) {
      filtered = filtered.filter(c => filterOptions.status.includes(c.status));
    }

    // Apply department filter
    if (filterOptions.departments.length > 0) {
      filtered = filtered.filter(c => filterOptions.departments.includes(c.metadata.department));
    }

    // Apply semester filter
    if (filterOptions.semesters.length > 0) {
      filtered = filtered.filter(c => filterOptions.semesters.includes(c.metadata.semester));
    }

    // Apply instructor filter
    if (filterOptions.instructors.length > 0) {
      filtered = filtered.filter(c => filterOptions.instructors.includes(c.instructor.name));
    }

    // Apply difficulty filter
    if (filterOptions.difficulties.length > 0) {
      filtered = filtered.filter(c => filterOptions.difficulties.includes(c.metadata.difficulty));
    }

    // Apply credit range filter
    const [minCredits, maxCredits] = filterOptions.creditRange;
    filtered = filtered.filter(c => 
      c.metadata.creditHours >= minCredits && c.metadata.creditHours <= maxCredits
    );

    // Apply search query
    if (filterOptions.searchQuery.trim()) {
      const query = filterOptions.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.courseCode.toLowerCase().includes(query) ||
        c.courseName.toLowerCase().includes(query) ||
        c.instructor.name.toLowerCase().includes(query) ||
        c.metadata.department.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortOptions.field) {
        case 'courseCode':
          aValue = a.courseCode;
          bValue = b.courseCode;
          break;
        case 'courseName':
          aValue = a.courseName;
          bValue = b.courseName;
          break;
        case 'instructor':
          aValue = a.instructor.name;
          bValue = b.instructor.name;
          break;
        case 'creditHours':
          aValue = a.metadata.creditHours;
          bValue = b.metadata.creditHours;
          break;
        case 'difficulty':
          aValue = a.metadata.difficulty;
          bValue = b.metadata.difficulty;
          break;
        case 'semester':
          aValue = a.metadata.semester;
          bValue = b.metadata.semester;
          break;
        default:
          aValue = a.courseCode;
          bValue = b.courseCode;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sortOptions.direction === 'desc' ? -comparison : comparison;
    });

    return filtered;
  };

  const addError = (error: Omit<CourseError, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_ERROR', payload: error });
  };

  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  const clearError = (errorId: string) => {
    dispatch({ type: 'CLEAR_ERROR', payload: errorId });
  };

  // Context value
  const contextValue: CourseContextType = {
    // State
    ...state,
    
    // Actions
    addCourse,
    updateCourse,
    deleteCourse,
    duplicateCourse,
    enrollInCourse,
    dropCourse,
    archiveCourse,
    analyzeConflicts,
    analyzeWorkload,
    generateRecommendations,
    refreshAnalytics,
    setFilters,
    clearFilters,
    setSorting,
    setSelectedCourse,
    importCourses,
    exportCourses,
    bulkUpdateCourses,
    syncWithLMS,
    refreshCourseData,
    getCourseById,
    getCoursesByStatus,
    getCoursesBySemester,
    getFilteredCourses,
    addError,
    clearErrors,
    clearError
  };

  return (
    <CourseContext.Provider value={contextValue}>
      {children}
    </CourseContext.Provider>
  );
};

// Custom Hook
export const useCourses = (): CourseContextType => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};

// Selector Hooks for Performance
export const useEnrolledCourses = () => {
  const { enrolledCourses } = useCourses();
  return enrolledCourses;
};

export const useCourseConflicts = () => {
  const { conflicts } = useCourses();
  return conflicts;
};

export const useCourseRecommendations = () => {
  const { recommendations } = useCourses();
  return recommendations;
};

export const useSelectedCourse = () => {
  const { selectedCourseId, getCourseById } = useCourses();
  return selectedCourseId ? getCourseById(selectedCourseId) : null;
};

export const useCourseAnalytics = (courseId: string) => {
  const { analytics } = useCourses();
  return analytics[courseId];
};

// Export types
export type { CourseContextState, CourseAction, CourseError, CourseFilterOptions, CourseSortOptions };