// src/design-system/tokens/typography.ts
// Typography design tokens for consistent text hierarchy
// Motion-inspired typography with focus on readability and hierarchy

export interface FontFamily {
    sans: string[];
    mono: string[];
    display: string[];
  }
  
  export interface FontSize {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
    '7xl': string;
    '8xl': string;
    '9xl': string;
  }
  
  export interface FontWeight {
    thin: number;
    extralight: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  }
  
  export interface LineHeight {
    none: number;
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  }
  
  export interface LetterSpacing {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  }
  
  // Font families optimized for student interface
  const fontFamily: FontFamily = {
    // Primary sans-serif stack - Inter for UI and body text
    sans: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ],
    
    // Monospace stack - JetBrains Mono for code and data
    mono: [
      '"JetBrains Mono"',
      '"SF Mono"',
      'Monaco',
      'Inconsolata',
      '"Liberation Mono"',
      '"Courier New"',
      'monospace'
    ],
    
    // Display font stack - Inter for headings with tighter spacing
    display: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif'
    ]
  };
  
  // Font size scale following minor third (1.2) ratio
  const fontSize: FontSize = {
    xs: '0.75rem',    // 12px - small labels, captions
    sm: '0.875rem',   // 14px - body text, secondary info
    base: '1rem',     // 16px - primary body text
    lg: '1.125rem',   // 18px - large body text, subheadings
    xl: '1.25rem',    // 20px - section headings
    '2xl': '1.5rem',  // 24px - page headings
    '3xl': '1.875rem', // 30px - large headings
    '4xl': '2.25rem', // 36px - display headings
    '5xl': '3rem',    // 48px - hero headings
    '6xl': '3.75rem', // 60px - large displays
    '7xl': '4.5rem',  // 72px - extra large
    '8xl': '6rem',    // 96px - super large
    '9xl': '8rem'     // 128px - massive displays
  };
  
  // Font weights for hierarchy and emphasis
  const fontWeight: FontWeight = {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,    // Default body text
    medium: 500,    // Emphasized text, buttons
    semibold: 600,  // Section headings, important labels
    bold: 700,      // Primary headings
    extrabold: 800,
    black: 900
  };
  
  // Line height for optimal readability
  const lineHeight: LineHeight = {
    none: 1,        // Tight headings
    tight: 1.25,    // Large headings
    snug: 1.375,    // Medium headings
    normal: 1.5,    // Body text (default)
    relaxed: 1.625, // Comfortable reading
    loose: 2        // Spaced out text
  };
  
  // Letter spacing for different contexts
  const letterSpacing: LetterSpacing = {
    tighter: '-0.05em',  // Tight headings
    tight: '-0.025em',   // Normal headings
    normal: '0em',       // Default
    wide: '0.025em',     // Slightly spaced
    wider: '0.05em',     // Buttons, labels
    widest: '0.1em'      // All caps, acronyms
  };
  
  // Typography scale definitions for semantic usage
  export interface TypographyScale {
    // Display text - Hero sections, landing pages
    display: {
      '2xl': TypographyStyle;
      xl: TypographyStyle;
      lg: TypographyStyle;
      md: TypographyStyle;
      sm: TypographyStyle;
    };
    
    // Headings - Section titles, page headers
    heading: {
      '6xl': TypographyStyle;
      '5xl': TypographyStyle;
      '4xl': TypographyStyle;
      '3xl': TypographyStyle;
      '2xl': TypographyStyle;
      xl: TypographyStyle;
      lg: TypographyStyle;
      md: TypographyStyle;
      sm: TypographyStyle;
      xs: TypographyStyle;
    };
    
    // Body text - Paragraphs, descriptions
    body: {
      '2xl': TypographyStyle;
      xl: TypographyStyle;
      lg: TypographyStyle;
      md: TypographyStyle;
      sm: TypographyStyle;
      xs: TypographyStyle;
    };
    
    // Labels - Form labels, captions
    label: {
      lg: TypographyStyle;
      md: TypographyStyle;
      sm: TypographyStyle;
      xs: TypographyStyle;
    };
    
    // Code - Monospace text
    code: {
      lg: TypographyStyle;
      md: TypographyStyle;
      sm: TypographyStyle;
      xs: TypographyStyle;
    };
  }
  
  export interface TypographyStyle {
    fontSize: string;
    lineHeight: number;
    fontWeight: number;
    letterSpacing?: string;
    fontFamily?: string[];
  }
  
  // Complete typography scale
  export const typographyScale: TypographyScale = {
    display: {
      '2xl': {
        fontSize: fontSize['5xl'],
        lineHeight: lineHeight.none,
        fontWeight: fontWeight.bold,
        letterSpacing: letterSpacing.tight,
        fontFamily: fontFamily.display
      },
      xl: {
        fontSize: fontSize['4xl'],
        lineHeight: lineHeight.none,
        fontWeight: fontWeight.bold,
        letterSpacing: letterSpacing.tight
      },
      lg: {
        fontSize: fontSize['3xl'],
        lineHeight: lineHeight.tight,
        fontWeight: fontWeight.bold,
        letterSpacing: letterSpacing.tight
      },
      md: {
        fontSize: fontSize['2xl'],
        lineHeight: lineHeight.tight,
        fontWeight: fontWeight.semibold
      },
      sm: {
        fontSize: fontSize.xl,
        lineHeight: lineHeight.tight,
        fontWeight: fontWeight.semibold
      }
    },
    
    heading: {
      '6xl': {
        fontSize: fontSize['6xl'],
        lineHeight: lineHeight.none,
        fontWeight: fontWeight.bold,
        letterSpacing: letterSpacing.tight
      },
      '5xl': {
        fontSize: fontSize['5xl'],
        lineHeight: lineHeight.none,
        fontWeight: fontWeight.bold,
        letterSpacing: letterSpacing.tight
      },
      '4xl': {
        fontSize: fontSize['4xl'],
        lineHeight: lineHeight.tight,
        fontWeight: fontWeight.bold,
        letterSpacing: letterSpacing.tight
      },
      '3xl': {
        fontSize: fontSize['3xl'],
        lineHeight: lineHeight.tight,
        fontWeight: fontWeight.bold
      },
      '2xl': {
        fontSize: fontSize['2xl'],
        lineHeight: lineHeight.tight,
        fontWeight: fontWeight.semibold
      },
      xl: {
        fontSize: fontSize.xl,
        lineHeight: lineHeight.tight,
        fontWeight: fontWeight.semibold
      },
      lg: {
        fontSize: fontSize.lg,
        lineHeight: lineHeight.snug,
        fontWeight: fontWeight.semibold
      },
      md: {
        fontSize: fontSize.base,
        lineHeight: lineHeight.snug,
        fontWeight: fontWeight.semibold
      },
      sm: {
        fontSize: fontSize.sm,
        lineHeight: lineHeight.snug,
        fontWeight: fontWeight.semibold
      },
      xs: {
        fontSize: fontSize.xs,
        lineHeight: lineHeight.snug,
        fontWeight: fontWeight.semibold
      }
    },
    
    body: {
      '2xl': {
        fontSize: fontSize['2xl'],
        lineHeight: lineHeight.relaxed,
        fontWeight: fontWeight.normal
      },
      xl: {
        fontSize: fontSize.xl,
        lineHeight: lineHeight.relaxed,
        fontWeight: fontWeight.normal
      },
      lg: {
        fontSize: fontSize.lg,
        lineHeight: lineHeight.relaxed,
        fontWeight: fontWeight.normal
      },
      md: {
        fontSize: fontSize.base,
        lineHeight: lineHeight.normal,
        fontWeight: fontWeight.normal
      },
      sm: {
        fontSize: fontSize.sm,
        lineHeight: lineHeight.normal,
        fontWeight: fontWeight.normal
      },
      xs: {
        fontSize: fontSize.xs,
        lineHeight: lineHeight.normal,
        fontWeight: fontWeight.normal
      }
    },
    
    label: {
      lg: {
        fontSize: fontSize.base,
        lineHeight: lineHeight.normal,
        fontWeight: fontWeight.medium,
        letterSpacing: letterSpacing.wide
      },
      md: {
        fontSize: fontSize.sm,
        lineHeight: lineHeight.normal,
        fontWeight: fontWeight.medium,
        letterSpacing: letterSpacing.wide
      },
      sm: {
        fontSize: fontSize.xs,
        lineHeight: lineHeight.normal,
        fontWeight: fontWeight.medium,
        letterSpacing: letterSpacing.wide
      },
      xs: {
        fontSize: fontSize.xs,
        lineHeight: lineHeight.tight,
        fontWeight: fontWeight.medium,
        letterSpacing: letterSpacing.wider
      }
    },
    
    code: {
      lg: {
        fontSize: fontSize.base,
        lineHeight: lineHeight.normal,
        fontWeight: fontWeight.normal,
        fontFamily: fontFamily.mono
      },
      md: {
        fontSize: fontSize.sm,
        lineHeight: lineHeight.normal,
        fontWeight: fontWeight.normal,
        fontFamily: fontFamily.mono
      },
      sm: {
        fontSize: fontSize.xs,
        lineHeight: lineHeight.normal,
        fontWeight: fontWeight.normal,
        fontFamily: fontFamily.mono
      },
      xs: {
        fontSize: fontSize.xs,
        lineHeight: lineHeight.tight,
        fontWeight: fontWeight.normal,
        fontFamily: fontFamily.mono
      }
    }
  };
  
  // CSS custom property generators for typography
  export const generateTypographyCSSProperties = () => {
    return {
      // Font families
      '--font-sans': fontFamily.sans.join(', '),
      '--font-mono': fontFamily.mono.join(', '),
      '--font-display': fontFamily.display.join(', '),
      
      // Font sizes
      '--text-xs': fontSize.xs,
      '--text-sm': fontSize.sm,
      '--text-base': fontSize.base,
      '--text-lg': fontSize.lg,
      '--text-xl': fontSize.xl,
      '--text-2xl': fontSize['2xl'],
      '--text-3xl': fontSize['3xl'],
      '--text-4xl': fontSize['4xl'],
      
      // Font weights
      '--font-normal': fontWeight.normal.toString(),
      '--font-medium': fontWeight.medium.toString(),
      '--font-semibold': fontWeight.semibold.toString(),
      '--font-bold': fontWeight.bold.toString(),
      
      // Line heights
      '--leading-tight': lineHeight.tight.toString(),
      '--leading-normal': lineHeight.normal.toString(),
      '--leading-relaxed': lineHeight.relaxed.toString(),
      
      // Letter spacing
      '--tracking-tight': letterSpacing.tight,
      '--tracking-normal': letterSpacing.normal,
      '--tracking-wide': letterSpacing.wide
    };
  };
  
  // Export everything
  export {
    typographyScale as default,
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing
  };