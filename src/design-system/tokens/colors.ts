// src/design-system/tokens/colors.ts
// Color design tokens for Motion-inspired student scheduling app
// Provides semantic color system with light/dark mode support

export interface ColorPalette {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  }
  
  export interface ColorTokens {
    // Brand colors
    primary: ColorPalette;
    secondary: ColorPalette;
    
    // Semantic colors
    success: ColorPalette;
    warning: ColorPalette;
    error: ColorPalette;
    info: ColorPalette;
    
    // Neutral grays
    neutral: ColorPalette;
    slate: ColorPalette;
    
    // Academic category colors
    academic: {
      classes: string;
      study: string;
      assignments: string;
      exams: string;
      research: string;
      office_hours: string;
    };
    
    // Lifestyle category colors
    lifestyle: {
      work: string;
      exercise: string;
      meals: string;
      social: string;
      personal: string;
      sleep: string;
    };
  }
  
  // Primary blue palette - professional, trustworthy, calm
  export const primary: ColorPalette = {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main brand color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  };
  
  // Secondary purple palette - creativity, premium feel
  export const secondary: ColorPalette = {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764'
  };
  
  // Success green palette - achievements, completed tasks
  export const success: ColorPalette = {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22'
  };
  
  // Warning amber palette - deadlines, attention needed
  export const warning: ColorPalette = {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03'
  };
  
  // Error red palette - overdue, conflicts, critical issues
  export const error: ColorPalette = {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a'
  };
  
  // Info cyan palette - notifications, helpful tips
  export const info: ColorPalette = {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344'
  };
  
  // Neutral gray palette - backgrounds, text, borders
  export const neutral: ColorPalette = {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a'
  };
  
  // Slate palette - cooler grays for UI elements
  export const slate: ColorPalette = {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  };
  
  // Academic category color assignments
  export const academicColors = {
    classes: primary[500],      // Blue - core academic time
    study: secondary[500],      // Purple - focused learning
    assignments: error[500],    // Red - action required
    exams: error[700],         // Dark red - high stakes
    research: info[600],       // Teal - exploration
    office_hours: warning[500] // Amber - guidance opportunity
  };
  
  // Lifestyle category color assignments
  export const lifestyleColors = {
    work: success[600],        // Green - productive time
    exercise: warning[600],    // Orange - energy/health
    meals: success[400],       // Light green - nourishment
    social: secondary[400],    // Light purple - relationships
    personal: neutral[500],    // Gray - self-care
    sleep: slate[600]         // Dark gray - rest
  };
  
  // Semantic color mappings for themes
  export interface SemanticColors {
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
      elevated: string;
      overlay: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
      disabled: string;
    };
    border: {
      default: string;
      subtle: string;
      strong: string;
      focus: string;
    };
    surface: {
      default: string;
      hover: string;
      pressed: string;
      selected: string;
    };
  }
  
  // Light theme semantic colors
  export const lightTheme: SemanticColors = {
    background: {
      primary: neutral[50],
      secondary: neutral[100],
      tertiary: neutral[200],
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)'
    },
    text: {
      primary: slate[900],
      secondary: slate[600],
      tertiary: slate[500],
      inverse: neutral[50],
      disabled: slate[400]
    },
    border: {
      default: slate[200],
      subtle: slate[100],
      strong: slate[300],
      focus: primary[500]
    },
    surface: {
      default: '#ffffff',
      hover: slate[50],
      pressed: slate[100],
      selected: primary[50]
    }
  };
  
  // Dark theme semantic colors
  export const darkTheme: SemanticColors = {
    background: {
      primary: slate[950],
      secondary: slate[900],
      tertiary: slate[800],
      elevated: slate[800],
      overlay: 'rgba(0, 0, 0, 0.7)'
    },
    text: {
      primary: slate[50],
      secondary: slate[300],
      tertiary: slate[400],
      inverse: slate[900],
      disabled: slate[600]
    },
    border: {
      default: slate[700],
      subtle: slate[800],
      strong: slate[600],
      focus: primary[400]
    },
    surface: {
      default: slate[800],
      hover: slate[700],
      pressed: slate[600],
      selected: primary[900]
    }
  };
  
  // Complete color token export
  export const colorTokens: ColorTokens = {
    primary,
    secondary,
    success,
    warning,
    error,
    info,
    neutral,
    slate,
    academic: academicColors,
    lifestyle: lifestyleColors
  };
  
  // CSS custom property generators
  export const generateCSSCustomProperties = (theme: SemanticColors) => {
    return {
      // Background colors
      '--color-bg-primary': theme.background.primary,
      '--color-bg-secondary': theme.background.secondary,
      '--color-bg-tertiary': theme.background.tertiary,
      '--color-bg-elevated': theme.background.elevated,
      '--color-bg-overlay': theme.background.overlay,
      
      // Text colors
      '--color-text-primary': theme.text.primary,
      '--color-text-secondary': theme.text.secondary,
      '--color-text-tertiary': theme.text.tertiary,
      '--color-text-inverse': theme.text.inverse,
      '--color-text-disabled': theme.text.disabled,
      
      // Border colors
      '--color-border-default': theme.border.default,
      '--color-border-subtle': theme.border.subtle,
      '--color-border-strong': theme.border.strong,
      '--color-border-focus': theme.border.focus,
      
      // Surface colors
      '--color-surface-default': theme.surface.default,
      '--color-surface-hover': theme.surface.hover,
      '--color-surface-pressed': theme.surface.pressed,
      '--color-surface-selected': theme.surface.selected,
      
      // Brand colors
      '--color-primary-50': primary[50],
      '--color-primary-500': primary[500],
      '--color-primary-600': primary[600],
      '--color-primary-900': primary[900],
      
      // Semantic colors
      '--color-success': success[500],
      '--color-warning': warning[500],
      '--color-error': error[500],
      '--color-info': info[500]
    };
  };
  
  export default colorTokens;