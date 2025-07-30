// Export utility functions
export {
  hasScheduleContent,
  convertTo24Hour,
  parseDaysFromPDF,
  extractTableData,
  parsePatternBasedCourses
}; 

import { Course } from '../../models/CourseModel';
import { ImportResult, ImportError, ImportWarning } from '../../models/AcademicModel';
import { parseScheduleCSV } from './csvParser';

// Note: This implementation requires PDF.js for PDF parsing and Tesseract.js for OCR
// These should be installed as dependencies: npm install pdfjs-dist tesseract.js

export interface PDFParseConfig {
  ocrEnabled: boolean;
  ocrLanguage: string;
  confidenceThreshold: number; // 0-100, minimum OCR confidence
  pageRange?: {
    start: number;
    end: number;
  };
  textExtractionMode: 'embedded' | 'ocr' | 'hybrid';
  preprocessImage?: boolean;
  scaleFactor?: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
  words: OCRWord[];
  lines: OCRLine[];
  paragraphs: OCRParagraph[];
}

export interface OCRWord {
  text: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface OCRLine {
  text: string;
  confidence: number;
  words: OCRWord[];
  bbox: BoundingBox;
}

export interface OCRParagraph {
  text: string;
  confidence: number;
  lines: OCRLine[];
  bbox: BoundingBox;
}

export interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface ParsedPDFData {
  courses: Partial<Course>[];
  errors: ImportError[];
  warnings: ImportWarning[];
  metadata: PDFParseMetadata;
  extractedText: string;
  ocrResults?: OCRResult[];
}

export interface PDFParseMetadata {
  totalPages: number;
  processedPages: number;
  extractionMethod: 'embedded' | 'ocr' | 'hybrid';
  averageConfidence?: number;
  processingTime: number;
  fileSize: number;
  pdfInfo?: PDFInfo;
}

export interface PDFInfo {
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}

// Schedule patterns commonly found in university PDFs
export const SCHEDULE_PATTERNS = {
  courseCode: /\b([A-Z]{2,4}\s*\d{3,4}[A-Z]?)\b/g,
  courseTitle: /([A-Z][A-Za-z\s&,-]{10,60})/g,
  instructor: /(?:Instructor|Prof|Dr|Teacher):\s*([A-Za-z\s,.-]{3,40})/gi,
  time: /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[-–—]\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/gi,
  days: /\b(M|T|W|R|F|S|U|Mon|Tue|Wed|Thu|Fri|Sat|Sun|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)(?:[,\s]*(?:M|T|W|R|F|S|U|Mon|Tue|Wed|Thu|Fri|Sat|Sun|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday))*\b/gi,
  location: /(?:Room|Rm|Building|Bldg):\s*([A-Za-z0-9\s-]{2,20})/gi,
  credits: /(\d(?:\.\d)?)\s*(?:credits?|units?|hrs?)/gi,
  crn: /(?:CRN|Course\s*Registration\s*Number):\s*(\d{4,6})/gi,
  section: /(?:Section|Sec):\s*([A-Za-z0-9]{1,5})/gi,
  headerRow: /(?:Course|Class|Subject|Code|Name|Title|Instructor|Time|Days|Location|Credits|CRN)/gi
};

// Table detection patterns
export const TABLE_PATTERNS = {
  tableRow: /^([A-Z]{2,4}\s*\d{3,4}[A-Z]?)\s+(.{10,60})\s+([A-Za-z\s,.-]{3,40})\s+([MWF|TR|MTWRF]{1,7})\s+(\d{1,2}:\d{2}(?:AM|PM))\s*[-–—]\s*(\d{1,2}:\d{2}(?:AM|PM))\s+([A-Za-z0-9\s-]{2,20})\s*(\d(?:\.\d)?)?/gm,
  columnSeparators: /\s{3,}|\t+|\|/g
};

export const parseSchedulePDF = async (
  file: File,
  config: Partial<PDFParseConfig> = {}
): Promise<ParsedPDFData> => {
  const startTime = Date.now();
  
  const defaultConfig: PDFParseConfig = {
    ocrEnabled: true,
    ocrLanguage: 'eng',
    confidenceThreshold: 60,
    textExtractionMode: 'hybrid',
    preprocessImage: true,
    scaleFactor: 2.0,
    ...config
  };

  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('PDF parsing is only supported in browser environment');
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileSize = arrayBuffer.byteLength;

    let extractedText = '';
    let ocrResults: OCRResult[] = [];
    let pdfInfo: PDFInfo | undefined;
    let totalPages = 0;
    let processedPages = 0;
    let extractionMethod: 'embedded' | 'ocr' | 'hybrid' = 'embedded';

    // Try embedded text extraction first
    if (defaultConfig.textExtractionMode === 'embedded' || defaultConfig.textExtractionMode === 'hybrid') {
      try {
        const embeddedResult = await extractEmbeddedText(arrayBuffer, defaultConfig);
        extractedText = embeddedResult.text;
        pdfInfo = embeddedResult.info;
        totalPages = embeddedResult.totalPages;
        processedPages = embeddedResult.processedPages;
        
        // If we got good text, we might not need OCR
        if (extractedText.length > 100 && hasScheduleContent(extractedText)) {
          extractionMethod = 'embedded';
        }
      } catch (error) {
        console.warn('Embedded text extraction failed:', error);
      }
    }

    // Use OCR if enabled and needed
    if (defaultConfig.ocrEnabled && 
        (defaultConfig.textExtractionMode === 'ocr' || 
         (defaultConfig.textExtractionMode === 'hybrid' && extractedText.length < 100))) {
      
      try {
        const ocrResult = await performOCR(arrayBuffer, defaultConfig);
        
        if (defaultConfig.textExtractionMode === 'ocr' || extractedText.length < 100) {
          extractedText = ocrResult.text;
          extractionMethod = 'ocr';
        } else {
          // Hybrid mode: combine both results
          extractedText = `${extractedText}\n\n--- OCR SUPPLEMENT ---\n${ocrResult.text}`;
          extractionMethod = 'hybrid';
        }
        
        ocrResults = [ocrResult];
      } catch (error) {
        console.warn('OCR extraction failed:', error);
        if (extractedText.length === 0) {
          throw new Error('Both embedded text extraction and OCR failed');
        }
      }
    }

    // Parse the extracted text for course information
    const parsedData = await parseTextForCourses(extractedText, file.name);
    
    const processingTime = Date.now() - startTime;
    const averageConfidence = ocrResults.length > 0 ? 
      ocrResults.reduce((sum, result) => sum + result.confidence, 0) / ocrResults.length : 
      undefined;

    return {
      ...parsedData,
      extractedText,
      ocrResults,
      metadata: {
        totalPages,
        processedPages,
        extractionMethod,
        averageConfidence,
        processingTime,
        fileSize,
        pdfInfo
      }
    };

  } catch (error) {
    throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Extract embedded text from PDF
const extractEmbeddedText = async (
  arrayBuffer: ArrayBuffer,
  config: PDFParseConfig
): Promise<{ text: string; info: PDFInfo; totalPages: number; processedPages: number }> => {
  // Dynamic import to avoid issues in environments where PDF.js isn't available
  const pdfjsLib = await import('pdfjs-dist');
  
  // Set up PDF.js worker
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  
  let fullText = '';
  let processedPages = 0;
  
  const startPage = config.pageRange?.start || 1;
  const endPage = config.pageRange?.end || totalPages;
  
  // Extract text from each page
  for (let pageNum = startPage; pageNum <= Math.min(endPage, totalPages); pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .filter((item: any) => item.str && item.str.trim())
        .map((item: any) => item.str)
        .join(' ');
      
      if (pageText.trim()) {
        fullText += `\n--- PAGE ${pageNum} ---\n${pageText}\n`;
        processedPages++;
      }
    } catch (error) {
      console.warn(`Failed to extract text from page ${pageNum}:`, error);
    }
  }

  // Extract PDF metadata
  const metadata = await pdf.getMetadata();
  const info: PDFInfo = {
    title: (metadata.info as any)?.Title,
    author: (metadata.info as any)?.Author,
    creator: (metadata.info as any)?.Creator,
    producer: (metadata.info as any)?.Producer,
    creationDate: (metadata.info as any)?.CreationDate ? new Date((metadata.info as any).CreationDate) : undefined,
    modificationDate: (metadata.info as any)?.ModDate ? new Date((metadata.info as any).ModDate) : undefined
  };

  return {
    text: fullText.trim(),
    info,
    totalPages,
    processedPages
  };
};

// Perform OCR on PDF pages
const performOCR = async (
  arrayBuffer: ArrayBuffer,
  config: PDFParseConfig
): Promise<OCRResult> => {
  // Dynamic imports for OCR dependencies
  const [pdfjsLib, Tesseract] = await Promise.all([
    import('pdfjs-dist'),
    import('tesseract.js')
  ]);

  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  
  const startPage = config.pageRange?.start || 1;
  const endPage = config.pageRange?.end || Math.min(totalPages, 3); // Limit OCR to first 3 pages by default
  
  let combinedText = '';
  const allWords: OCRWord[] = [];
  const allLines: OCRLine[] = [];
  const allParagraphs: OCRParagraph[] = [];
  let totalConfidence = 0;
  let confidenceCount = 0;

  for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: config.scaleFactor || 2.0 });
      
      // Create canvas to render PDF page
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      }).promise;

      // Convert canvas to image data for OCR
      const imageData = canvas.toDataURL('image/png');
      
      // Perform OCR on the rendered page
      const ocrResult = await Tesseract.recognize(imageData, config.ocrLanguage, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress Page ${pageNum}: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      if (ocrResult.data.confidence >= config.confidenceThreshold) {
        combinedText += `\n--- PAGE ${pageNum} (OCR) ---\n${ocrResult.data.text}\n`;
        
        // Collect OCR details - use type assertion since Tesseract types may be incomplete
        const ocrData = ocrResult.data as any;
        
        ocrData.words?.forEach((word: any) => {
          if (word.confidence >= config.confidenceThreshold) {
            allWords.push({
              text: word.text,
              confidence: word.confidence,
              bbox: word.bbox
            });
          }
        });

        ocrData.lines?.forEach((line: any) => {
          if (line.confidence >= config.confidenceThreshold) {
            allLines.push({
              text: line.text,
              confidence: line.confidence,
              words: line.words?.filter((w: any) => w.confidence >= config.confidenceThreshold)
                .map((w: any) => ({ text: w.text, confidence: w.confidence, bbox: w.bbox })) || [],
              bbox: line.bbox
            });
          }
        });

        ocrData.paragraphs?.forEach((paragraph: any) => {
          if (paragraph.confidence >= config.confidenceThreshold) {
            allParagraphs.push({
              text: paragraph.text,
              confidence: paragraph.confidence,
              lines: paragraph.lines?.filter((l: any) => l.confidence >= config.confidenceThreshold)
                .map((l: any) => ({
                  text: l.text,
                  confidence: l.confidence,
                  words: l.words?.filter((w: any) => w.confidence >= config.confidenceThreshold)
                    .map((w: any) => ({ text: w.text, confidence: w.confidence, bbox: w.bbox })) || [],
                  bbox: l.bbox
                })) || [],
              bbox: paragraph.bbox
            });
          }
        });

        totalConfidence += ocrResult.data.confidence;
        confidenceCount++;
      }
    } catch (error) {
      console.warn(`OCR failed for page ${pageNum}:`, error);
    }
  }

  const averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;

  return {
    text: combinedText.trim(),
    confidence: averageConfidence,
    words: allWords,
    lines: allLines,
    paragraphs: allParagraphs
  };
};

// Parse extracted text for course information
const parseTextForCourses = async (text: string, filename: string): Promise<{
  courses: Partial<Course>[];
  errors: ImportError[];
  warnings: ImportWarning[];
}> => {
  const courses: Partial<Course>[] = [];
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];

  try {
    // First, try to detect if this is a structured table format
    const tableData = extractTableData(text);
    if (tableData.length > 0) {
      return await parseTableData(tableData, filename);
    }

    // Otherwise, use pattern-based extraction
    return parsePatternBasedCourses(text, filename);
    
  } catch (error) {
    errors.push({
      row: 1,
      field: 'general',
      value: 'entire document',
      message: `Failed to parse PDF content: ${error instanceof Error ? error.message : String(error)}`,
      suggestion: 'Try OCR mode or check if PDF contains readable text'
    });
    
    return { courses, errors, warnings };
  }
};

// Extract table data from text
const extractTableData = (text: string): string[][] => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const tableRows: string[][] = [];
  
  let isInTable = false;
  let headerDetected = false;

  for (const line of lines) {
    // Detect table header
    if (SCHEDULE_PATTERNS.headerRow.test(line)) {
      isInTable = true;
      headerDetected = true;
      // Split header by multiple spaces or tabs
      const headers = line.split(TABLE_PATTERNS.columnSeparators).filter(Boolean);
      if (headers.length >= 4) { // Minimum columns for a useful schedule table
        tableRows.push(headers);
      }
      continue;
    }

    if (isInTable) {
      // Try to match table row pattern
      const rowMatch = line.match(TABLE_PATTERNS.tableRow);
      if (rowMatch) {
        tableRows.push(rowMatch.slice(1)); // Remove full match, keep groups
      } else if (line.includes('\t') || /\s{3,}/.test(line)) {
        // Split by tabs or multiple spaces
        const columns = line.split(TABLE_PATTERNS.columnSeparators).filter(Boolean);
        if (columns.length >= 4) {
          tableRows.push(columns);
        }
      } else if (headerDetected && line.length < 10) {
        // End of table detected
        break;
      }
    }
  }

  return tableRows;
};

// Parse table data into courses
const parseTableData = async (tableData: string[][], filename: string): Promise<{
  courses: Partial<Course>[];
  errors: ImportError[];
  warnings: ImportWarning[];
}> => {
  if (tableData.length === 0) {
    return { courses: [], errors: [], warnings: [] };
  }

  // Convert table data to CSV format and use existing CSV parser
  const csvData = tableData.map(row => 
    row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  // Use CSV parser with detected format
  try {
    const result = await parseScheduleCSV(csvData, {
      hasHeader: true,
      universityFormat: {
        name: 'PDF Table Extract',
        fieldMappings: detectTableMappings(tableData[0]),
        timeFormat: '12h',
        dateFormat: 'MM/DD/YYYY',
        dayFormat: 'abbreviated'
      }
    });
    
    return {
      courses: result.courses,
      errors: result.errors,
      warnings: result.warnings
    };
  } catch (error) {
    return {
      courses: [],
      errors: [{
        row: 1,
        field: 'table_parsing',
        value: 'table data',
        message: `Failed to parse table data: ${error instanceof Error ? error.message : String(error)}`
      }],
      warnings: []
    };
  }
};

// Detect field mappings from table headers
const detectTableMappings = (headers: string[]): any => {
  const mappings: any = {};
  
  headers.forEach((header, index) => {
    const normalized = header.toLowerCase().trim();
    
    if (normalized.includes('course') && (normalized.includes('code') || normalized.includes('number'))) {
      mappings.courseCode = index;
    } else if (normalized.includes('course') && (normalized.includes('name') || normalized.includes('title'))) {
      mappings.courseName = index;
    } else if (normalized.includes('instructor') || normalized.includes('teacher') || normalized.includes('prof')) {
      mappings.instructor = index;
    } else if (normalized.includes('section') || normalized.includes('sec')) {
      mappings.section = index;
    } else if (normalized.includes('days') || normalized.includes('day')) {
      mappings.days = index;
    } else if (normalized.includes('time') || normalized.includes('schedule')) {
      if (!mappings.startTime) {
        mappings.startTime = index;
      } else {
        mappings.endTime = index;
      }
    } else if (normalized.includes('start')) {
      mappings.startTime = index;
    } else if (normalized.includes('end')) {
      mappings.endTime = index;
    } else if (normalized.includes('location') || normalized.includes('room') || normalized.includes('building')) {
      mappings.building = index;
    } else if (normalized.includes('credit') || normalized.includes('unit')) {
      mappings.credits = index;
    } else if (normalized.includes('crn')) {
      mappings.crn = index;
    }
  });
  
  return mappings;
};

// Parse courses using pattern matching
const parsePatternBasedCourses = (text: string, filename: string): {
  courses: Partial<Course>[];
  errors: ImportError[];
  warnings: ImportWarning[];
} => {
  const courses: Partial<Course>[] = [];
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];

  // Extract all course codes first
  const courseCodeMatches = [...text.matchAll(SCHEDULE_PATTERNS.courseCode)];
  
  if (courseCodeMatches.length === 0) {
    warnings.push({
      row: 1,
      field: 'courseCode',
      value: 'none found',
      message: 'No course codes detected in PDF',
      handled: false
    });
    return { courses, errors, warnings };
  }

  // For each course code, try to extract associated information
  courseCodeMatches.forEach((match, index) => {
    try {
      const courseCode = match[1].trim();
      const matchIndex = match.index || 0;
      
      // Extract text around the course code (context window)
      const contextStart = Math.max(0, matchIndex - 500);
      const contextEnd = Math.min(text.length, matchIndex + 500);
      const context = text.substring(contextStart, contextEnd);
      
      const course = extractCourseFromContext(courseCode, context, index);
      
      if (course) {
        courses.push(course);
      }
    } catch (error) {
      errors.push({
        row: index + 1,
        field: 'courseCode',
        value: match[1],
        message: `Failed to parse course: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  });

  return { courses, errors, warnings };
};

// Extract course information from context around course code
const extractCourseFromContext = (
  courseCode: string,
  context: string,
  index: number
): Partial<Course> | null => {
  // Extract course name (usually follows course code)
  const titleMatch = context.match(SCHEDULE_PATTERNS.courseTitle);
  const courseName = titleMatch ? titleMatch[1].trim() : `Course ${courseCode}`;

  // Extract instructor
  const instructorMatch = context.match(SCHEDULE_PATTERNS.instructor);
  const instructor = instructorMatch ? instructorMatch[1].trim() : 'TBA';

  // Extract time range
  const timeMatch = context.match(SCHEDULE_PATTERNS.time);
  let startTime = '';
  let endTime = '';
  if (timeMatch) {
    startTime = convertTo24Hour(timeMatch[1].trim());
    endTime = convertTo24Hour(timeMatch[2].trim());
  }

  // Extract days
  const daysMatch = context.match(SCHEDULE_PATTERNS.days);
  const daysString = daysMatch ? daysMatch[0].trim() : '';

  // Extract location
  const locationMatch = context.match(SCHEDULE_PATTERNS.location);
  const location = locationMatch ? locationMatch[1].trim() : 'TBA';

  // Extract credits
  const creditsMatch = context.match(SCHEDULE_PATTERNS.credits);
  const credits = creditsMatch ? parseFloat(creditsMatch[1]) : 3;

  // Extract CRN
  const crnMatch = context.match(SCHEDULE_PATTERNS.crn);
  const crn = crnMatch ? crnMatch[1].trim() : undefined;

  // Extract section
  const sectionMatch = context.match(SCHEDULE_PATTERNS.section);
  const section = sectionMatch ? sectionMatch[1].trim() : undefined;

  // Only create course if we have essential information
  if (!courseCode || !courseName) {
    return null;
  }

  return {
    id: `${courseCode}-${section || '001'}-${Date.now()}-${index}`,
    courseCode,
    courseName,
    section,
    crn,
    instructor: {
      name: instructor,
      department: extractDepartmentFromCourseCode(courseCode)
    },
    schedule: startTime && endTime && daysString ? [{
      id: `${courseCode}-schedule`,
      dayOfWeek: parseDaysFromPDF(daysString)[0] || 'monday',
      startTime,
      endTime,
      recurrencePattern: {
        type: 'weekly',
        interval: 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        exceptions: []
      },
      sessionType: 'lecture',
      isOnline: false
    }] : [],
    location: {
      building: location.split(/\s+/)[0] || 'TBA',
      room: location.split(/\s+/).slice(1).join(' ') || 'TBA'
    },
    metadata: {
      creditHours: credits,
      difficulty: 3,
      department: extractDepartmentFromCourseCode(courseCode),
      semester: 'Fall 2024',
      year: new Date().getFullYear(),
      prerequisites: [],
      tags: [extractDepartmentFromCourseCode(courseCode).toLowerCase()],
      workload: 'moderate', // Added missing property
      level: credits >= 5000 ? 'graduate' : 'undergraduate' // Fixed to use correct level values
    },
    status: 'enrolled',
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Helper functions
const hasScheduleContent = (text: string): boolean => {
  const indicators = [
    /course/i,
    /class/i,
    /schedule/i,
    /instructor/i,
    /credit/i,
    /semester/i,
    /\b[A-Z]{2,4}\s*\d{3,4}\b/, // course codes
    /\d{1,2}:\d{2}\s*(?:AM|PM)/i // times
  ];
  
  return indicators.some(pattern => pattern.test(text));
};

const convertTo24Hour = (time12h: string): string => {
  const match = time12h.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return time12h;
  
  const [, hourStr, minute, period] = match;
  let hour = parseInt(hourStr);
  
  if (period.toUpperCase() === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period.toUpperCase() === 'AM' && hour === 12) {
    hour = 0;
  }
  
  return `${hour.toString().padStart(2, '0')}:${minute}`;
};

const parseDaysFromPDF = (daysString: string): ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[] => {
  const dayMap: Record<string, 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'> = {
    'M': 'monday', 'Mon': 'monday', 'Monday': 'monday',
    'T': 'tuesday', 'Tue': 'tuesday', 'Tuesday': 'tuesday',
    'W': 'wednesday', 'Wed': 'wednesday', 'Wednesday': 'wednesday',
    'R': 'thursday', 'Thu': 'thursday', 'Thursday': 'thursday',
    'F': 'friday', 'Fri': 'friday', 'Friday': 'friday',
    'S': 'saturday', 'Sat': 'saturday', 'Saturday': 'saturday',
    'U': 'sunday', 'Sun': 'sunday', 'Sunday': 'sunday'
  };
  
  const days: Set<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'> = new Set();
  
  // Try single letters first (MWF, TR pattern)
  for (const char of daysString.toUpperCase()) {
    if (dayMap[char]) {
      days.add(dayMap[char]);
    }
  }
  
  // Try full/abbreviated day names
  const tokens = daysString.split(/[,\s]+/);
  for (const token of tokens) {
    const cleanToken = token.replace(/[^A-Za-z]/g, '');
    if (dayMap[cleanToken]) {
      days.add(dayMap[cleanToken]);
    }
  }
  
  return Array.from(days);
};

const extractDepartmentFromCourseCode = (courseCode: string): string => {
  const match = courseCode.match(/^([A-Z]+)/);
  return match ? match[1] : 'UNKNOWN';
};

//