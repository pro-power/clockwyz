// src/utils/validation/fileValidation.ts

export interface FileValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    metadata: FileMetadata;
    recommendations: string[];
    securityScore: number; // 0-100
  }
  
  export interface ValidationError {
    code: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    field?: string;
    suggestion?: string;
    recoverable: boolean;
  }
  
  export interface ValidationWarning {
    code: string;
    message: string;
    impact: 'minor' | 'moderate' | 'significant';
    suggestion?: string;
  }
  
  export interface FileMetadata {
    fileName: string;
    fileSize: number;
    fileType: string;
    mimeType: string;
    lastModified: Date;
    encoding?: string;
    structure: FileStructure;
    content: ContentAnalysis;
    university?: UniversityDetection;
  }
  
  export interface FileStructure {
    format: 'csv' | 'pdf' | 'xlsx' | 'xls' | 'ics' | 'json' | 'txt' | 'unknown';
    hasHeader: boolean;
    rowCount?: number;
    columnCount?: number;
    pageCount?: number;
    sheets?: SheetInfo[];
    delimiter?: string;
    encoding: string;
    corrupted: boolean;
  }
  
  export interface ContentAnalysis {
    isEmpty: boolean;
    hasScheduleData: boolean;
    hasCourseData: boolean;
    hasTimeData: boolean;
    hasInstructorData: boolean;
    confidence: number; // 0-1 how confident we are this is a schedule file
    patterns: DetectedPattern[];
    sampleData: any[];
  }
  
  export interface DetectedPattern {
    type: 'course_code' | 'time_format' | 'day_format' | 'instructor_name' | 'location' | 'credit_hours';
    pattern: string;
    examples: string[];
    confidence: number;
    count: number;
  }
  
  export interface UniversityDetection {
    name?: string;
    confidence: number;
    indicators: string[];
    suggestedFormat?: string;
  }
  
  export interface SheetInfo {
    name: string;
    rowCount: number;
    columnCount: number;
    hasData: boolean;
    likelyScheduleSheet: boolean;
  }
  
  // File size limits (in bytes)
  const FILE_SIZE_LIMITS = {
    csv: 50 * 1024 * 1024,    // 50MB
    pdf: 100 * 1024 * 1024,   // 100MB
    xlsx: 25 * 1024 * 1024,   // 25MB
    xls: 25 * 1024 * 1024,    // 25MB
    ics: 10 * 1024 * 1024,    // 10MB
    json: 10 * 1024 * 1024,   // 10MB
    txt: 10 * 1024 * 1024     // 10MB
  };
  
  // Allowed MIME types
  const ALLOWED_MIME_TYPES = [
    'text/csv',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-excel', // xls
    'text/calendar', // ics
    'application/json',
    'text/plain',
    'application/octet-stream' // Sometimes browsers don't detect MIME correctly
  ];
  
  // Dangerous file patterns to reject
  const DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /<iframe\b/gi,
    /<object\b/gi,
    /<embed\b/gi,
    /data:text\/html/gi,
    /\.exe\b/gi,
    /\.scr\b/gi,
    /\.bat\b/gi,
    /\.cmd\b/gi
  ];
  
  // University detection patterns
  const UNIVERSITY_PATTERNS = {
    'canvas': [
      /canvas\.instructure\.com/i,
      /course\s+code/i,
      /course\s+name/i,
      /sis\s+id/i
    ],
    'blackboard': [
      /blackboard\.com/i,
      /course\s+id/i,
      /primary\s+instructor/i,
      /bb\s+learn/i
    ],
    'moodle': [
      /moodle/i,
      /shortname/i,
      /fullname/i,
      /idnumber/i
    ],
    'brightspace': [
      /brightspace/i,
      /desire2learn/i,
      /d2l/i
    ],
    'banner': [
      /ellucian/i,
      /banner/i,
      /crn/i,
      /course\s+reference\s+number/i
    ]
  };
  
  // Main validation function
  export const validateFile = async (file: File): Promise<FileValidationResult> => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: string[] = [];
  
    // Basic file validation
    const basicValidation = validateBasicFileProperties(file);
    errors.push(...basicValidation.errors);
    warnings.push(...basicValidation.warnings);
  
    // Security validation
    const securityValidation = await validateFileSecurity(file);
    errors.push(...securityValidation.errors);
    warnings.push(...securityValidation.warnings);
  
    // Content structure validation
    const structureValidation = await validateFileStructure(file);
    errors.push(...structureValidation.errors);
    warnings.push(...structureValidation.warnings);
  
    // Content analysis
    const contentAnalysis = await analyzeFileContent(file);
    warnings.push(...contentAnalysis.warnings);
  
    // Generate recommendations
    recommendations.push(...generateRecommendations(file, contentAnalysis, errors, warnings));
  
    // Calculate security score
    const securityScore = calculateSecurityScore(errors, warnings, securityValidation.securityFlags);
  
    const metadata: FileMetadata = {
      fileName: file.name,
      fileSize: file.size,
      fileType: getFileExtension(file.name),
      mimeType: file.type,
      lastModified: new Date(file.lastModified),
      structure: structureValidation.structure,
      content: contentAnalysis.content,
      university: contentAnalysis.university
    };
  
    return {
      isValid: errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
      errors,
      warnings,
      metadata,
      recommendations,
      securityScore
    };
  };
  
  // Basic file property validation
  const validateBasicFileProperties = (file: File): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
  
    // File name validation
    if (!file.name || file.name.trim().length === 0) {
      errors.push({
        code: 'INVALID_FILENAME',
        message: 'File name is empty or invalid',
        severity: 'high',
        suggestion: 'Ensure the file has a valid name',
        recoverable: false
      });
    }
  
    // File extension validation
    const extension = getFileExtension(file.name).toLowerCase();
    if (!['csv', 'pdf', 'xlsx', 'xls', 'ics', 'json', 'txt'].includes(extension)) {
      errors.push({
        code: 'UNSUPPORTED_FILE_TYPE',
        message: `File type .${extension} is not supported`,
        severity: 'critical',
        suggestion: 'Please upload a CSV, PDF, Excel, ICS, JSON, or text file',
        recoverable: false
      });
    }
  
    // File size validation
    const maxSize = FILE_SIZE_LIMITS[extension as keyof typeof FILE_SIZE_LIMITS] || FILE_SIZE_LIMITS.txt;
    if (file.size > maxSize) {
      errors.push({
        code: 'FILE_TOO_LARGE',
        message: `File size (${formatFileSize(file.size)}) exceeds limit (${formatFileSize(maxSize)})`,
        severity: 'high',
        suggestion: 'Try compressing the file or removing unnecessary data',
        recoverable: false
      });
    }
  
    if (file.size === 0) {
      errors.push({
        code: 'EMPTY_FILE',
        message: 'File appears to be empty',
        severity: 'critical',
        suggestion: 'Upload a file with content',
        recoverable: false
      });
    }
  
    // MIME type validation
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      warnings.push({
        code: 'UNEXPECTED_MIME_TYPE',
        message: `Unexpected MIME type: ${file.type}`,
        impact: 'minor',
        suggestion: 'File may still be valid, but MIME type is unusual'
      });
    }
  
    // File name security check
    if (containsSuspiciousFileNamePattern(file.name)) {
      errors.push({
        code: 'SUSPICIOUS_FILENAME',
        message: 'File name contains suspicious patterns',
        severity: 'high',
        suggestion: 'Rename the file with a simple, descriptive name',
        recoverable: true
      });
    }
  
    return { errors, warnings };
  };
  
  // Security validation
  const validateFileSecurity = async (file: File): Promise<{
    errors: ValidationError[];
    warnings: ValidationWarning[];
    securityFlags: string[];
  }> => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const securityFlags: string[] = [];
  
    try {
      // Read file content for security analysis
      const content = await readFileAsText(file);
      
      // Check for dangerous patterns
      for (const pattern of DANGEROUS_PATTERNS) {
        if (pattern.test(content)) {
          errors.push({
            code: 'MALICIOUS_CONTENT',
            message: 'File contains potentially malicious content',
            severity: 'critical',
            suggestion: 'Do not upload files with executable code or scripts',
            recoverable: false
          });
          securityFlags.push('malicious_content');
          break;
        }
      }
  
      // Check for excessive special characters (potential encoding attack)
      const specialCharRatio = (content.match(/[^\w\s\-.,;:!?()]/g) || []).length / content.length;
      if (specialCharRatio > 0.1) {
        warnings.push({
          code: 'HIGH_SPECIAL_CHAR_RATIO',
          message: 'File contains unusually high ratio of special characters',
          impact: 'moderate',
          suggestion: 'Verify file encoding and content integrity'
        });
        securityFlags.push('unusual_encoding');
      }
  
      // Check for binary content in text files
      if (['csv', 'txt', 'json', 'ics'].includes(getFileExtension(file.name))) {
        const binaryRatio = (content.match(/[\x00-\x08\x0E-\x1F\x7F-\xFF]/g) || []).length / content.length;
        if (binaryRatio > 0.01) {
          warnings.push({
            code: 'BINARY_IN_TEXT_FILE',
            message: 'Text file contains binary data',
            impact: 'moderate',
            suggestion: 'File may be corrupted or incorrectly formatted'
          });
          securityFlags.push('binary_content');
        }
      }
  
    } catch (error) {
      warnings.push({
        code: 'SECURITY_SCAN_FAILED',
        message: 'Could not complete security scan',
        impact: 'moderate',
        suggestion: 'Manual review recommended'
      });
      securityFlags.push('scan_failed');
    }
  
    return { errors, warnings, securityFlags };
  };
  
  // File structure validation
  const validateFileStructure = async (file: File): Promise<{
    errors: ValidationError[];
    warnings: ValidationWarning[];
    structure: FileStructure;
  }> => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const extension = getFileExtension(file.name).toLowerCase();
  
    let structure: FileStructure = {
      format: extension as any,
      hasHeader: false,
      encoding: 'utf-8',
      corrupted: false
    };
  
    try {
      switch (extension) {
        case 'csv':
          structure = await validateCSVStructure(file);
          break;
        case 'pdf':
          structure = await validatePDFStructure(file);
          break;
        case 'xlsx':
        case 'xls':
          structure = await validateExcelStructure(file);
          break;
        case 'ics':
          structure = await validateICSStructure(file);
          break;
        case 'json':
          structure = await validateJSONStructure(file);
          break;
        case 'txt':
          structure = await validateTextStructure(file);
          break;
        default:
          structure.format = 'unknown';
      }
  
      // Validate structure completeness
      if (structure.corrupted) {
        errors.push({
          code: 'CORRUPTED_FILE',
          message: 'File appears to be corrupted or unreadable',
          severity: 'critical',
          suggestion: 'Try re-downloading or re-exporting the file',
          recoverable: false
        });
      }
  
      if (structure.rowCount === 0 && ['csv', 'xlsx', 'xls'].includes(extension)) {
        warnings.push({
          code: 'NO_DATA_ROWS',
          message: 'File contains no data rows',
          impact: 'significant',
          suggestion: 'Ensure the file contains actual schedule data'
        });
      }
  
    } catch (error) {
      errors.push({
        code: 'STRUCTURE_VALIDATION_FAILED',
        message: `Failed to validate file structure: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'high',
        suggestion: 'File may be corrupted or in an unexpected format',
        recoverable: true
      });
      structure.corrupted = true;
    }
  
    return { errors, warnings, structure };
  };
  
  // Content analysis
  const analyzeFileContent = async (file: File): Promise<{
    content: ContentAnalysis;
    university?: UniversityDetection;
    warnings: ValidationWarning[];
  }> => {
    const warnings: ValidationWarning[] = [];
    let content: ContentAnalysis = {
      isEmpty: false,
      hasScheduleData: false,
      hasCourseData: false,
      hasTimeData: false,
      hasInstructorData: false,
      confidence: 0,
      patterns: [],
      sampleData: []
    };
  
    let university: UniversityDetection | undefined;
  
    try {
      const fileContent = await readFileAsText(file);
      
      if (!fileContent || fileContent.trim().length === 0) {
        content.isEmpty = true;
        return { content, warnings };
      }
  
      // Detect patterns
      content.patterns = detectContentPatterns(fileContent);
      
      // Analyze content for schedule-related data
      content.hasScheduleData = hasScheduleIndicators(fileContent);
      content.hasCourseData = hasCourseIndicators(fileContent);
      content.hasTimeData = hasTimeIndicators(fileContent);
      content.hasInstructorData = hasInstructorIndicators(fileContent);
  
      // Calculate confidence score
      content.confidence = calculateContentConfidence(content);
  
      // Detect university system
      university = detectUniversitySystem(fileContent);
  
      // Extract sample data
      content.sampleData = extractSampleData(fileContent, getFileExtension(file.name));
  
      // Generate content warnings
      if (content.confidence < 0.3) {
        warnings.push({
          code: 'LOW_CONFIDENCE_SCHEDULE',
          message: 'File does not appear to contain schedule data',
          impact: 'significant',
          suggestion: 'Verify this is the correct schedule file'
        });
      }
  
      if (!content.hasTimeData && content.hasScheduleData) {
        warnings.push({
          code: 'MISSING_TIME_DATA',
          message: 'Schedule data found but no time information detected',
          impact: 'moderate',
          suggestion: 'Check if time data is in a different format'
        });
      }
  
    } catch (error) {
      warnings.push({
        code: 'CONTENT_ANALYSIS_FAILED',
        message: 'Failed to analyze file content',
        impact: 'moderate',
        suggestion: 'File may be in an unexpected format'
      });
    }
  
    return { content, university, warnings };
  };
  
  // Utility functions for specific file types
  const validateCSVStructure = async (file: File): Promise<FileStructure> => {
    const content = await readFileAsText(file);
    const lines = content.split('\n').filter(line => line.trim());
    
    // Detect delimiter
    const delimiters = [',', ';', '\t', '|'];
    let bestDelimiter = ',';
    let maxColumns = 0;
    
    for (const delimiter of delimiters) {
      const columns = lines[0]?.split(delimiter).length || 0;
      if (columns > maxColumns) {
        maxColumns = columns;
        bestDelimiter = delimiter;
      }
    }
  
    // Check if first row looks like a header
    const firstRow = lines[0]?.split(bestDelimiter) || [];
    const hasHeader = firstRow.some(cell => 
      /^[a-zA-Z\s]+$/.test(cell.trim()) && cell.trim().length > 2
    );
  
    return {
      format: 'csv',
      hasHeader,
      rowCount: hasHeader ? lines.length - 1 : lines.length,
      columnCount: maxColumns,
      delimiter: bestDelimiter,
      encoding: 'utf-8',
      corrupted: lines.length === 0 || maxColumns === 0
    };
  };
  
  const validatePDFStructure = async (file: File): Promise<FileStructure> => {
    // Basic PDF validation - would need PDF.js for full analysis
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Check PDF header
    const pdfHeader = String.fromCharCode(...bytes.slice(0, 4));
    const isPDF = pdfHeader === '%PDF';
    
    return {
      format: 'pdf',
      hasHeader: false,
      pageCount: isPDF ? 1 : 0, // Would need proper PDF parsing for actual count
      encoding: 'binary',
      corrupted: !isPDF
    };
  };
  
  const validateExcelStructure = async (file: File): Promise<FileStructure> => {
    // Basic Excel validation - would need SheetJS for full analysis
    const extension = getFileExtension(file.name).toLowerCase();
    
    return {
      format: extension as any,
      hasHeader: true, // Assume Excel files have headers
      sheets: [{ name: 'Sheet1', rowCount: 0, columnCount: 0, hasData: true, likelyScheduleSheet: true }],
      encoding: 'binary',
      corrupted: false
    };
  };
  
  const validateICSStructure = async (file: File): Promise<FileStructure> => {
    const content = await readFileAsText(file);
    const lines = content.split('\n');
    
    const hasBegin = lines.some(line => line.trim().startsWith('BEGIN:VCALENDAR'));
    const hasEnd = lines.some(line => line.trim().startsWith('END:VCALENDAR'));
    const eventCount = lines.filter(line => line.trim().startsWith('BEGIN:VEVENT')).length;
    
    return {
      format: 'ics',
      hasHeader: hasBegin,
      rowCount: eventCount,
      encoding: 'utf-8',
      corrupted: !hasBegin || !hasEnd
    };
  };
  
  const validateJSONStructure = async (file: File): Promise<FileStructure> => {
    const content = await readFileAsText(file);
    
    try {
      const parsed = JSON.parse(content);
      const isArray = Array.isArray(parsed);
      const rowCount = isArray ? parsed.length : (parsed ? 1 : 0);
      
      return {
        format: 'json',
        hasHeader: false,
        rowCount,
        encoding: 'utf-8',
        corrupted: false
      };
    } catch (error) {
      return {
        format: 'json',
        hasHeader: false,
        rowCount: 0,
        encoding: 'utf-8',
        corrupted: true
      };
    }
  };
  
  const validateTextStructure = async (file: File): Promise<FileStructure> => {
    const content = await readFileAsText(file);
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      format: 'txt',
      hasHeader: false,
      rowCount: lines.length,
      encoding: 'utf-8',
      corrupted: false
    };
  };
  
  // Pattern detection functions
  const detectContentPatterns = (content: string): DetectedPattern[] => {
    const patterns: DetectedPattern[] = [];
    
    // Course code pattern
    const courseCodeMatches = [...content.matchAll(/\b([A-Z]{2,4})\s*(\d{3,4}[A-Z]?)\b/g)];
    if (courseCodeMatches.length > 0) {
      patterns.push({
        type: 'course_code',
        pattern: 'DEPT NNN[L]',
        examples: courseCodeMatches.slice(0, 3).map(m => m[0]),
        confidence: Math.min(1, courseCodeMatches.length / 5),
        count: courseCodeMatches.length
      });
    }
  
    // Time format pattern
    const timeMatches = [...content.matchAll(/\b(\d{1,2}):(\d{2})\s*(AM|PM)\b/gi)];
    if (timeMatches.length > 0) {
      patterns.push({
        type: 'time_format',
        pattern: 'HH:MM AM/PM',
        examples: timeMatches.slice(0, 3).map(m => m[0]),
        confidence: Math.min(1, timeMatches.length / 10),
        count: timeMatches.length
      });
    }
  
    // Day format pattern
    const dayMatches = [...content.matchAll(/\b(MON|TUE|WED|THU|FRI|SAT|SUN|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY|M|T|W|R|F|S|U)\b/gi)];
    if (dayMatches.length > 0) {
      patterns.push({
        type: 'day_format',
        pattern: 'Day abbreviations',
        examples: [...new Set(dayMatches.slice(0, 5).map(m => m[0]))],
        confidence: Math.min(1, dayMatches.length / 20),
        count: dayMatches.length
      });
    }
  
    return patterns;
  };
  
  const hasScheduleIndicators = (content: string): boolean => {
    const indicators = [
      /schedule/i,
      /class/i,
      /course/i,
      /section/i,
      /semester/i,
      /\b(MON|TUE|WED|THU|FRI)\b/i,
      /\d{1,2}:\d{2}\s*(AM|PM)/i
    ];
    
    return indicators.some(pattern => pattern.test(content));
  };
  
  const hasCourseIndicators = (content: string): boolean => {
    const indicators = [
      /\b[A-Z]{2,4}\s*\d{3,4}\b/,
      /course\s*(code|number|id)/i,
      /subject/i,
      /department/i
    ];
    
    return indicators.some(pattern => pattern.test(content));
  };
  
  const hasTimeIndicators = (content: string): boolean => {
    const indicators = [
      /\d{1,2}:\d{2}\s*(AM|PM)/i,
      /\d{1,2}:\d{2}/,
      /time/i,
      /start/i,
      /end/i
    ];
    
    return indicators.some(pattern => pattern.test(content));
  };
  
  const hasInstructorIndicators = (content: string): boolean => {
    const indicators = [
      /instructor/i,
      /professor/i,
      /teacher/i,
      /prof\./i,
      /dr\./i
    ];
    
    return indicators.some(pattern => pattern.test(content));
  };
  
  const calculateContentConfidence = (content: ContentAnalysis): number => {
    let score = 0;
    
    if (content.hasScheduleData) score += 0.3;
    if (content.hasCourseData) score += 0.3;
    if (content.hasTimeData) score += 0.2;
    if (content.hasInstructorData) score += 0.1;
    
    // Boost based on pattern confidence
    const patternConfidence = content.patterns.reduce((sum, p) => sum + p.confidence, 0) / (content.patterns.length || 1);
    score += patternConfidence * 0.1;
    
    return Math.min(1, score);
  };
  
  const detectUniversitySystem = (content: string): UniversityDetection | undefined => {
    for (const [system, patterns] of Object.entries(UNIVERSITY_PATTERNS)) {
      const matches = patterns.filter(pattern => pattern.test(content));
      if (matches.length > 0) {
        return {
          name: system,
          confidence: matches.length / patterns.length,
          indicators: matches.map(m => m.source),
          suggestedFormat: system
        };
      }
    }
    
    return undefined;
  };
  
  const extractSampleData = (content: string, extension: string): any[] => {
    const lines = content.split('\n').slice(0, 5); // First 5 lines
    
    if (extension === 'csv') {
      return lines.map(line => line.split(',').slice(0, 10)); // First 10 columns
    } else if (extension === 'json') {
      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed.slice(0, 3) : [parsed];
      } catch {
        return [];
      }
    }
    
    return lines;
  };
  
  // Utility helper functions
  const getFileExtension = (fileName: string): string => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };
  
  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };
  
  const containsSuspiciousFileNamePattern = (fileName: string): boolean => {
    const suspiciousPatterns = [
      /\.(exe|scr|bat|cmd|com|pif|vbs|js)$/i,
      /[<>:"|?*]/,
      /^\./,
      /\s+$/,
      /\0/
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(fileName));
  };
  
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };
  
  const calculateSecurityScore = (
    errors: ValidationError[],
    warnings: ValidationWarning[],
    securityFlags: string[]
  ): number => {
    let score = 100;
    
    // Deduct for errors
    errors.forEach(error => {
      switch (error.severity) {
        case 'critical': score -= 50; break;
        case 'high': score -= 25; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });
    
    // Deduct for warnings
    warnings.forEach(warning => {
      switch (warning.impact) {
        case 'significant': score -= 15; break;
        case 'moderate': score -= 10; break;
        case 'minor': score -= 5; break;
      }
    });
    
    // Deduct for security flags
    score -= securityFlags.length * 10;
    
    return Math.max(0, score);
  };
  
  const generateRecommendations = (
    file: File,
    contentAnalysis: { content: ContentAnalysis; university?: UniversityDetection },
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): string[] => {
    const recommendations: string[] = [];
    
    // File format recommendations
    if (contentAnalysis.content.confidence < 0.5) {
      recommendations.push('Consider using a CSV export from your student information system for better compatibility');
    }
    
    // University-specific recommendations
    if (contentAnalysis.university) {
      recommendations.push(`Detected ${contentAnalysis.university.name} format - using optimized parser`);
    }
    
    // Size optimization
    if (file.size > 10 * 1024 * 1024) { // 10MB
      recommendations.push('Large file detected - consider removing unnecessary columns or splitting into multiple files');
    }
    
    // Content improvement
    if (!contentAnalysis.content.hasTimeData) {
      recommendations.push('Include time information (start/end times) for better schedule integration');
    }
    
    if (!contentAnalysis.content.hasInstructorData) {
      recommendations.push('Include instructor information if available for complete course details');
    }
    
    // Error-based recommendations
    if (errors.some(e => e.code === 'UNSUPPORTED_FILE_TYPE')) {
      recommendations.push('Export your schedule as CSV, Excel, or PDF for best results');
    }
    
    return recommendations;
  };
  
  // Export validation functions - REMOVED DUPLICATE validateFile EXPORT
  export {
    validateBasicFileProperties,
    validateFileSecurity,
    validateFileStructure,
    analyzeFileContent,
    detectContentPatterns,
    calculateContentConfidence,
    detectUniversitySystem,
    getFileExtension,
    formatFileSize,
    readFileAsText
  };