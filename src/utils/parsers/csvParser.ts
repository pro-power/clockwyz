// src/utils/parsers/csvParser.ts

import Papa from 'papaparse';
import { Course, RecurringTimeSlot, DayOfWeek } from '../../models/CourseModel';
import { ImportResult, ImportError, ImportWarning } from '../../models/AcademicModel';

export interface CSVParseConfig {
  hasHeader: boolean;
  delimiter: string;
  skipEmptyLines: boolean;
  dynamicTyping: boolean;
  encoding: string;
  universityFormat?: UniversityFormat;
}

export interface UniversityFormat {
  name: string;
  fieldMappings: FieldMapping;
  timeFormat: '12h' | '24h';
  dateFormat: string;
  dayFormat: 'full' | 'abbreviated' | 'single_letter';
  customParsers?: CustomParser[];
}

export interface FieldMapping {
  courseCode: string | number;
  courseName: string | number;
  instructor: string | number;
  section?: string | number;
  crn?: string | number;
  days: string | number;
  startTime: string | number;
  endTime: string | number;
  building?: string | number;
  room?: string | number;
  credits?: string | number;
  startDate?: string | number;
  endDate?: string | number;
  [key: string]: string | number | undefined;
}

export interface CustomParser {
  field: string;
  parser: (value: string, row: any) => any;
  validator?: (value: any) => boolean;
}

export interface ParsedCourseData {
  courses: Partial<Course>[];
  errors: ImportError[];
  warnings: ImportWarning[];
  metadata: ParseMetadata;
}

export interface ParseMetadata {
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  detectedFormat?: string;
  processingTime: number;
  confidence: number; // 0-1 how confident we are in the parsing
}

// Predefined university formats
export const UNIVERSITY_FORMATS: Record<string, UniversityFormat> = {
  'canvas_export': {
    name: 'Canvas LMS Export',
    fieldMappings: {
      courseCode: 'Course Code',
      courseName: 'Course Name',
      instructor: 'Instructor',
      section: 'Section',
      days: 'Days',
      startTime: 'Start Time',
      endTime: 'End Time',
      building: 'Building',
      room: 'Room',
      credits: 'Credits'
    },
    timeFormat: '12h',
    dateFormat: 'MM/DD/YYYY',
    dayFormat: 'abbreviated'
  },
  
  'blackboard_export': {
    name: 'Blackboard Export',
    fieldMappings: {
      courseCode: 'Course ID',
      courseName: 'Course Title',
      instructor: 'Primary Instructor',
      section: 'Section Number',
      days: 'Meeting Days',
      startTime: 'Start Time',
      endTime: 'End Time',
      building: 'Building Code',
      room: 'Room Number',
      credits: 'Credit Hours'
    },
    timeFormat: '24h',
    dateFormat: 'YYYY-MM-DD',
    dayFormat: 'single_letter'
  },
  
  'registrar_standard': {
    name: 'Standard Registrar Format',
    fieldMappings: {
      courseCode: 0, // first column
      courseName: 1,
      instructor: 2,
      section: 3,
      crn: 4,
      days: 5,
      startTime: 6,
      endTime: 7,
      building: 8,
      room: 9,
      credits: 10
    },
    timeFormat: '12h',
    dateFormat: 'MM/DD/YYYY',
    dayFormat: 'abbreviated'
  },
  
  'moodle_export': {
    name: 'Moodle Course Export',
    fieldMappings: {
      courseCode: 'shortname',
      courseName: 'fullname',
      instructor: 'teacher',
      section: 'idnumber',
      days: 'schedule_days',
      startTime: 'schedule_start',
      endTime: 'schedule_end',
      credits: 'credits'
    },
    timeFormat: '24h',
    dateFormat: 'YYYY-MM-DD',
    dayFormat: 'full'
  }
};

// Main CSV parsing function
export const parseScheduleCSV = async (
  file: File | string,
  config: Partial<CSVParseConfig> = {}
): Promise<ParsedCourseData> => {
  const startTime = Date.now();
  
  const defaultConfig: CSVParseConfig = {
    hasHeader: true,
    delimiter: '',
    skipEmptyLines: true,
    dynamicTyping: true,
    encoding: 'UTF-8',
    ...config
  };

  try {
    const csvData = typeof file === 'string' ? file : await readFileAsText(file);
    
    // Auto-detect format if not specified
    if (!defaultConfig.universityFormat) {
      defaultConfig.universityFormat = detectUniversityFormat(csvData);
    }

    const parseResult = Papa.parse(csvData, {
      header: defaultConfig.hasHeader,
      delimiter: defaultConfig.delimiter,
      skipEmptyLines: defaultConfig.skipEmptyLines,
      dynamicTyping: defaultConfig.dynamicTyping,
      delimitersToGuess: [',', '\t', '|', ';'],
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => value.trim(),
      complete: () => {},
      error: (error: any) => {
        throw new Error(`CSV parsing failed: ${error.message}`);
      }
    });

    if (parseResult.errors.length > 0) {
      console.warn('CSV parsing warnings:', parseResult.errors);
    }

    const parsedData = processParsedData(
      parseResult.data,
      defaultConfig.universityFormat!,
      parseResult.meta.fields || []
    );

    const processingTime = Date.now() - startTime;

    return {
      ...parsedData,
      metadata: {
        ...parsedData.metadata,
        processingTime,
        detectedFormat: defaultConfig.universityFormat?.name
      }
    };

  } catch (error) {
    throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Process parsed CSV data into Course objects
const processParsedData = (
  data: any[],
  format: UniversityFormat,
  headers: string[]
): ParsedCourseData => {
  const courses: Partial<Course>[] = [];
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];
  let successfulRows = 0;

  data.forEach((row, index) => {
    try {
      const course = parseRowToCourse(row, format, headers, index);
      
      if (course) {
        // Validate required fields
        const validation = validateCourseData(course, index);
        errors.push(...validation.errors);
        warnings.push(...validation.warnings);
        
        if (validation.errors.length === 0) {
          courses.push(course);
          successfulRows++;
        }
      }
    } catch (error) {
      errors.push({
        row: index + 1,
        field: 'general',
        value: JSON.stringify(row),
        message: `Failed to parse row: ${error instanceof Error ? error.message : String(error)}`,
        suggestion: 'Check data format and required fields'
      });
    }
  });

  const confidence = calculateParsingConfidence(courses, errors, warnings);

  return {
    courses,
    errors,
    warnings,
    metadata: {
      totalRows: data.length,
      successfulRows,
      failedRows: data.length - successfulRows,
      confidence,
      processingTime: 0 // Will be set by caller
    }
  };
};

// Parse individual row to Course object
const parseRowToCourse = (
  row: any,
  format: UniversityFormat,
  headers: string[],
  rowIndex: number
): Partial<Course> | null => {
  const getValue = (mapping: string | number): string => {
    if (typeof mapping === 'string') {
      return row[mapping] || '';
    } else {
      return row[headers[mapping]] || row[mapping] || '';
    }
  };

  // Extract basic course information
  const courseCode = getValue(format.fieldMappings.courseCode)?.toString().trim();
  const courseName = getValue(format.fieldMappings.courseName)?.toString().trim();
  
  if (!courseCode || !courseName) {
    return null; // Skip rows without essential data
  }

  const instructor = getValue(format.fieldMappings.instructor)?.toString().trim() || 'TBA';
  const section = format.fieldMappings.section ? getValue(format.fieldMappings.section)?.toString().trim() : undefined;
  const crn = format.fieldMappings.crn ? getValue(format.fieldMappings.crn)?.toString().trim() : undefined;
  
  // Parse schedule information
  const daysString = getValue(format.fieldMappings.days)?.toString().trim();
  const startTimeString = getValue(format.fieldMappings.startTime)?.toString().trim();
  const endTimeString = getValue(format.fieldMappings.endTime)?.toString().trim();
  
  const schedule = parseScheduleFromStrings(
    daysString,
    startTimeString,
    endTimeString,
    format
  );

  // Parse location information
  const building = format.fieldMappings.building ? getValue(format.fieldMappings.building)?.toString().trim() : '';
  const room = format.fieldMappings.room ? getValue(format.fieldMappings.room)?.toString().trim() : '';
  
  // Parse credits
  const creditsString = format.fieldMappings.credits ? getValue(format.fieldMappings.credits)?.toString() : '3';
  const credits = parseFloat(creditsString) || 3;

  // Apply custom parsers if defined
  const customData: any = {};
  if (format.customParsers) {
    format.customParsers.forEach(parser => {
      try {
        const value = getValue(parser.field as any);
        const parsed = parser.parser(value?.toString() || '', row);
        if (!parser.validator || parser.validator(parsed)) {
          customData[parser.field] = parsed;
        }
      } catch (error) {
        console.warn(`Custom parser failed for field ${parser.field}:`, error);
      }
    });
  }

  const course: Partial<Course> = {
    id: `${courseCode}-${section || '001'}-${Date.now()}`,
    courseCode,
    courseName,
    section,
    crn,
    instructor: {
      name: instructor,
      department: extractDepartmentFromCourseCode(courseCode)
    },
    schedule,
    location: {
      building: building || 'TBA',
      room: room || 'TBA'
    },
    metadata: {
      creditHours: credits,
      difficulty: 3, // Default difficulty
      department: extractDepartmentFromCourseCode(courseCode),
      semester: 'Fall 2024', // This should come from context
      year: new Date().getFullYear(),
      prerequisites: [],
      tags: [extractDepartmentFromCourseCode(courseCode).toLowerCase()]
    },
    status: 'enrolled',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...customData
  };

  return course;
};

// Parse schedule from day/time strings
const parseScheduleFromStrings = (
  daysString: string,
  startTimeString: string,
  endTimeString: string,
  format: UniversityFormat
): RecurringTimeSlot[] => {
  if (!daysString || !startTimeString || !endTimeString) {
    return [];
  }

  const days = parseDays(daysString, format.dayFormat);
  const startTime = parseTime(startTimeString, format.timeFormat);
  const endTime = parseTime(endTimeString, format.timeFormat);

  if (!startTime || !endTime || days.length === 0) {
    return [];
  }

  return days.map(day => ({
    id: `${day}-${startTime}-${endTime}`,
    dayOfWeek: day,
    startTime,
    endTime,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 4 months
      exceptions: []
    },
    sessionType: 'lecture',
    isOnline: false
  }));
};

// Parse days from various formats
const parseDays = (daysString: string, format: 'full' | 'abbreviated' | 'single_letter'): DayOfWeek[] => {
  const dayMappings = {
    full: {
      'monday': 'monday' as DayOfWeek,
      'tuesday': 'tuesday' as DayOfWeek,
      'wednesday': 'wednesday' as DayOfWeek,
      'thursday': 'thursday' as DayOfWeek,
      'friday': 'friday' as DayOfWeek,
      'saturday': 'saturday' as DayOfWeek,
      'sunday': 'sunday' as DayOfWeek
    },
    abbreviated: {
      'mon': 'monday' as DayOfWeek,
      'tue': 'tuesday' as DayOfWeek,
      'wed': 'wednesday' as DayOfWeek,
      'thu': 'thursday' as DayOfWeek,
      'fri': 'friday' as DayOfWeek,
      'sat': 'saturday' as DayOfWeek,
      'sun': 'sunday' as DayOfWeek,
      'mo': 'monday' as DayOfWeek,
      'tu': 'tuesday' as DayOfWeek,
      'we': 'wednesday' as DayOfWeek,
      'th': 'thursday' as DayOfWeek,
      'fr': 'friday' as DayOfWeek,
      'sa': 'saturday' as DayOfWeek,
      'su': 'sunday' as DayOfWeek
    },
    single_letter: {
      'm': 'monday' as DayOfWeek,
      't': 'tuesday' as DayOfWeek,
      'w': 'wednesday' as DayOfWeek,
      'r': 'thursday' as DayOfWeek, // Common convention
      'f': 'friday' as DayOfWeek,
      's': 'saturday' as DayOfWeek,
      'u': 'sunday' as DayOfWeek
    }
  };

  const mapping = dayMappings[format];
  const normalizedDays = daysString.toLowerCase().replace(/[^a-z]/g, '');
  const days: DayOfWeek[] = [];

  if (format === 'single_letter') {
    // Handle patterns like "mwf", "tr", etc.
    for (const char of normalizedDays) {
      if (mapping[char as keyof typeof mapping]) {
        days.push(mapping[char as keyof typeof mapping]);
      }
    }
  } else {
    // Handle comma-separated or space-separated days
    const dayTokens = daysString.toLowerCase().split(/[,\s]+/).filter(Boolean);
    
    for (const token of dayTokens) {
      const cleanToken = token.replace(/[^a-z]/g, '');
      if (mapping[cleanToken as keyof typeof mapping]) {
        days.push(mapping[cleanToken as keyof typeof mapping]);
      }
    }
  }

  return [...new Set(days)]; // Remove duplicates
};

// Parse time from various formats
const parseTime = (timeString: string, format: '12h' | '24h'): string | null => {
  if (!timeString) return null;

  // Clean the time string
  const cleaned = timeString.trim().replace(/\s+/g, ' ');
  
  if (format === '12h') {
    // Handle 12-hour format (e.g., "2:30 PM", "10:00AM")
    const match = cleaned.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
    if (match) {
      const [, hourStr, minStr = '00', period] = match;
      let hour = parseInt(hourStr);
      const minute = parseInt(minStr);
      
      if (period.toUpperCase() === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period.toUpperCase() === 'AM' && hour === 12) {
        hour = 0;
      }
      
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
  } else {
    // Handle 24-hour format (e.g., "14:30", "09:00")
    const match = cleaned.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      const [, hourStr, minStr] = match;
      const hour = parseInt(hourStr);
      const minute = parseInt(minStr);
      
      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      }
    }
  }

  return null;
};

// Detect university format from CSV content
const detectUniversityFormat = (csvContent: string): UniversityFormat => {
  const lines = csvContent.split('\n').slice(0, 5); // Check first 5 lines
  const headerLine = lines[0]?.toLowerCase() || '';
  
  // Check for Canvas indicators
  if (headerLine.includes('course code') || headerLine.includes('course name')) {
    return UNIVERSITY_FORMATS.canvas_export;
  }
  
  // Check for Blackboard indicators
  if (headerLine.includes('course id') || headerLine.includes('primary instructor')) {
    return UNIVERSITY_FORMATS.blackboard_export;
  }
  
  // Check for Moodle indicators
  if (headerLine.includes('shortname') || headerLine.includes('fullname')) {
    return UNIVERSITY_FORMATS.moodle_export;
  }
  
  // Default to registrar standard
  return UNIVERSITY_FORMATS.registrar_standard;
};

// Validate parsed course data
const validateCourseData = (
  course: Partial<Course>,
  rowIndex: number
): { errors: ImportError[]; warnings: ImportWarning[] } => {
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];

  // Required field validation
  if (!course.courseCode?.trim()) {
    errors.push({
      row: rowIndex + 1,
      field: 'courseCode',
      value: course.courseCode || '',
      message: 'Course code is required',
      suggestion: 'Ensure course code column is not empty'
    });
  }

  if (!course.courseName?.trim()) {
    errors.push({
      row: rowIndex + 1,
      field: 'courseName',
      value: course.courseName || '',
      message: 'Course name is required',
      suggestion: 'Ensure course name column is not empty'
    });
  }

  // Schedule validation
  if (!course.schedule || course.schedule.length === 0) {
    warnings.push({
      row: rowIndex + 1,
      field: 'schedule',
      value: 'empty',
      message: 'No schedule information found',
      handled: false
    });
  } else {
    course.schedule.forEach((slot, slotIndex) => {
      if (!slot.startTime || !slot.endTime) {
        errors.push({
          row: rowIndex + 1,
          field: `schedule[${slotIndex}]`,
          value: `${slot.startTime || 'missing'} - ${slot.endTime || 'missing'}`,
          message: 'Invalid time format in schedule',
          suggestion: 'Check time format (HH:MM)'
        });
      }
    });
  }

  // Credit hours validation
  if (course.metadata?.creditHours && (course.metadata.creditHours < 0 || course.metadata.creditHours > 10)) {
    warnings.push({
      row: rowIndex + 1,
      field: 'creditHours',
      value: course.metadata.creditHours.toString(),
      message: 'Unusual credit hours value',
      handled: false
    });
  }

  return { errors, warnings };
};

// Calculate parsing confidence score
const calculateParsingConfidence = (
  courses: Partial<Course>[],
  errors: ImportError[],
  warnings: ImportWarning[]
): number => {
  if (courses.length === 0) return 0;

  const totalItems = courses.length + errors.length;
  const successRate = courses.length / totalItems;
  
  // Penalize for warnings
  const warningPenalty = Math.min(warnings.length * 0.02, 0.3);
  
  // Boost for complete data
  const completenessBoost = courses.reduce((acc, course) => {
    let completeness = 0;
    if (course.courseCode) completeness += 0.2;
    if (course.courseName) completeness += 0.2;
    if (course.instructor?.name) completeness += 0.15;
    if (course.schedule?.length) completeness += 0.25;
    if (course.location?.building && course.location.building !== 'TBA') completeness += 0.1;
    if (course.metadata?.creditHours) completeness += 0.1;
    return acc + completeness;
  }, 0) / courses.length;

  return Math.max(0, Math.min(1, successRate * 0.7 + completenessBoost * 0.3 - warningPenalty));
};

// Helper functions
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

const extractDepartmentFromCourseCode = (courseCode: string): string => {
  const match = courseCode.match(/^([A-Z]+)/);
  return match ? match[1] : 'UNKNOWN';
};

// Export utility functions for testing and external use
export {
  parseDays,
  parseTime,
  detectUniversityFormat,
  validateCourseData,
  calculateParsingConfidence
};