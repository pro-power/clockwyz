// src/design-system/tokens/index.ts
// Unified export of all design tokens for the student scheduling app
// Provides centralized access to colors, typography, spacing, and motion tokens

// Import all token modules
import {
    colorTokens,
    lightTheme,
    darkTheme,
    generateCSSCustomProperties,
    type ColorTokens,
    type SemanticColors
  } from './colors';
  
  import {
    typographyScale,
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    generateTypographyCSSProperties,
    type TypographyScale,
    type FontFamily,
    type FontSize,
    type FontWeight,
    type LineHeight,
    type LetterSpacing
  } from './typography';
  
  import {
    spacing,
    borderRadius,
    shadows,
    semanticSpacing,
    componentSpacing,
    responsiveSpacing,
    gridSystem,
    generateSpacingCSSProperties,
    spacingUtils,
    type SpacingScale,
    type BorderRadius,
    type Shadows,
    type SemanticSpacing,
    type ComponentSpacing,
    type ResponsiveSpacing,
    type GridSystem
  } from './spacing';
  
  import {
    duration,
    easing,
    motionPresets,
    framerMotionPresets,
    keyframes,
    generateMotionCSSProperties,
    motionUtils,
    type Duration,
    type Easing,
    type MotionPresets,
    type FramerMotionPresets
  } from './motion';
  
  // Combined design token interface
  export interface DesignTokens {
    colors: ColorTokens;
    typography: TypographyScale;
    spacing: SpacingScale;
    borderRadius: BorderRadius;
    shadows: Shadows;
    motion: {
      duration: Duration;
      easing: Easing;
      presets: MotionPresets;
    };
    semantic: {
      spacing: SemanticSpacing;
      componentSpacing: ComponentSpacing;
      responsiveSpacing: ResponsiveSpacing;
    };
    grid: GridSystem;
  }
  
  // Theme interface combining all design tokens
  export interface Theme {
    name: string;
    colors: SemanticColors;
    tokens: DesignTokens;
  }
  
  // Create the complete design token object
  export const designTokens: DesignTokens = {
    colors: colorTokens,
    typography: typographyScale,
    spacing,
    borderRadius,
    shadows,
    motion: {
      duration,
      easing,
      presets: motionPresets
    },
    semantic: {
      spacing: semanticSpacing,
      componentSpacing,
      responsiveSpacing
    },
    grid: gridSystem
  };
  
  // Create light and dark themes
  export const themes = {
    light: {
      name: 'light',
      colors: lightTheme,
      tokens: designTokens
    } as Theme,
    
    dark: {
      name: 'dark',
      colors: darkTheme,
      tokens: designTokens
    } as Theme
  };
  
  // CSS custom property generation for complete design system
  export const generateAllCSSProperties = (theme: Theme) => {
    return {
      ...generateCSSCustomProperties(theme.colors),
      ...generateTypographyCSSProperties(),
      ...generateSpacingCSSProperties(),
      ...generateMotionCSSProperties()
    };
  };
  
  // Utility functions for working with design tokens
  export const tokenUtils = {
    // Get color value from token path
    getColor: (path: string, theme: Theme = themes.light): string => {
      const keys = path.split('.');
      let value: any = theme.colors;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          console.warn(`Color token path "${path}" not found in theme "${theme.name}"`);
          return '#000000'; // Fallback color
        }
      }
      
      return typeof value === 'string' ? value : '#000000';
    },
    
    // Get spacing value from token
    getSpacing: (token: keyof SpacingScale): string => {
      return spacing[token] || '0px';
    },
    
    // Get typography style
    getTypography: (scale: keyof TypographyScale, size: string): any => {
      const scaleObj = typographyScale[scale] as any;
      return scaleObj?.[size] || typographyScale.body.md;
    },
    
    // Get motion preset
    getMotion: (preset: keyof MotionPresets): any => {
      return motionPresets[preset];
    },
    
    // Create responsive value object
    responsive: (mobile: string, tablet?: string, desktop?: string): Record<string, string> => {
      return {
        base: mobile,
        ...(tablet && { md: tablet }),
        ...(desktop && { lg: desktop })
      };
    },
    
    // Create CSS custom property reference
    cssVar: (property: string): string => {
      return `var(--${property})`;
    },
    
    // Combine multiple tokens into single CSS value
    combine: (...values: string[]): string => {
      return values.join(' ');
    }
  };
  
  // Breakpoint utilities
  export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  };
  
  export const mediaQueries = {
    sm: `@media (min-width: ${breakpoints.sm})`,
    md: `@media (min-width: ${breakpoints.md})`,
    lg: `@media (min-width: ${breakpoints.lg})`,
    xl: `@media (min-width: ${breakpoints.xl})`,
    '2xl': `@media (min-width: ${breakpoints['2xl']})`,
    
    // Max width queries
    maxSm: `@media (max-width: ${breakpoints.sm})`,
    maxMd: `@media (max-width: ${breakpoints.md})`,
    maxLg: `@media (max-width: ${breakpoints.lg})`,
    
    // Accessibility
    reducedMotion: '@media (prefers-reduced-motion: reduce)',
    noReducedMotion: '@media (prefers-reduced-motion: no-preference)',
    highContrast: '@media (prefers-contrast: high)',
    darkMode: '@media (prefers-color-scheme: dark)',
    lightMode: '@media (prefers-color-scheme: light)'
  };
  
  // Component token presets for common UI patterns
  export const componentTokens = {
    button: {
      primary: {
        backgroundColor: tokenUtils.cssVar('color-primary-500'),
        color: tokenUtils.cssVar('color-text-inverse'),
        borderRadius: tokenUtils.cssVar('radius-default'),
        padding: componentSpacing.button.padding.md,
        transition: tokenUtils.cssVar('transition-hover'),
        fontWeight: fontWeight.medium,
        fontSize: fontSize.sm
      },
      
      secondary: {
        backgroundColor: tokenUtils.cssVar('color-surface-default'),
        color: tokenUtils.cssVar('color-text-primary'),
        border: `1px solid ${tokenUtils.cssVar('color-border-default')}`,
        borderRadius: tokenUtils.cssVar('radius-default'),
        padding: componentSpacing.button.padding.md,
        transition: tokenUtils.cssVar('transition-hover'),
        fontWeight: fontWeight.medium,
        fontSize: fontSize.sm
      }
    },
    
    card: {
      default: {
        backgroundColor: tokenUtils.cssVar('color-bg-elevated'),
        borderRadius: tokenUtils.cssVar('radius-lg'),
        padding: componentSpacing.card.padding.md,
        boxShadow: tokenUtils.cssVar('shadow-default'),
        border: `1px solid ${tokenUtils.cssVar('color-border-subtle')}`
      },
      
      elevated: {
        backgroundColor: tokenUtils.cssVar('color-bg-elevated'),
        borderRadius: tokenUtils.cssVar('radius-lg'),
        padding: componentSpacing.card.padding.lg,
        boxShadow: tokenUtils.cssVar('shadow-lg'),
        border: 'none'
      }
    },
    
    input: {
      default: {
        backgroundColor: tokenUtils.cssVar('color-bg-primary'),
        border: `1px solid ${tokenUtils.cssVar('color-border-default')}`,
        borderRadius: tokenUtils.cssVar('radius-default'),
        padding: componentSpacing.input.padding.md,
        fontSize: fontSize.sm,
        color: tokenUtils.cssVar('color-text-primary'),
        transition: tokenUtils.cssVar('transition-focus')
      }
    },
    
    modal: {
      overlay: {
        backgroundColor: tokenUtils.cssVar('color-bg-overlay'),
        backdropFilter: 'blur(4px)'
      },
      
      content: {
        backgroundColor: tokenUtils.cssVar('color-bg-elevated'),
        borderRadius: tokenUtils.cssVar('radius-xl'),
        padding: componentSpacing.modal.padding,
        boxShadow: tokenUtils.cssVar('shadow-2xl'),
        maxWidth: '32rem',
        width: '90%'
      }
    }
  };
  
  // Z-index scale for consistent layering
  export const zIndex = {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  };
  
  // Animation utilities for common patterns
  export const animations = {
    // Entrance animations
    fadeIn: `fadeIn ${duration.normal}ms ${easing.easeOut} forwards`,
    slideInUp: `slideInUp ${duration.normal}ms ${easing.easeOut} forwards`,
    slideInDown: `slideInDown ${duration.normal}ms ${easing.easeOut} forwards`,
    scaleIn: `scaleIn ${duration.normal}ms ${easing.spring} forwards`,
    
    // Exit animations
    fadeOut: `fadeOut ${duration.fast}ms ${easing.easeIn} forwards`,
    slideOutDown: `slideOutDown ${duration.fast}ms ${easing.easeIn} forwards`,
    
    // Loading animations
    pulse: `pulse ${2000}ms ${easing.easeInOut} infinite`,
    spin: `spin ${1000}ms ${easing.linear} infinite`,
    bounce: `bounce ${duration.slow}ms ${easing.bounce} infinite`,
    
    // Hover animations
    hoverLift: `transform ${duration.fast}ms ${easing.easeOut}`,
    hoverScale: `transform ${duration.fast}ms ${easing.spring}`,
    hoverGlow: `box-shadow ${duration.fast}ms ${easing.easeOut}`
  };
  
  // Export individual token modules for direct access
  export {
    // Colors
    colorTokens,
    lightTheme,
    darkTheme,
    
    // Typography
    typographyScale,
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    
    // Spacing
    spacing,
    borderRadius,
    shadows,
    semanticSpacing,
    componentSpacing,
    responsiveSpacing,
    gridSystem,
    spacingUtils,
    
    // Motion
    duration,
    easing,
    motionPresets,
    framerMotionPresets,
    keyframes,
    motionUtils
  };
  
  // Export types
  export type {
    ColorTokens,
    SemanticColors,
    TypographyScale,
    FontFamily,
    FontSize,
    FontWeight,
    LineHeight,
    LetterSpacing,
    SpacingScale,
    BorderRadius,
    Shadows,
    SemanticSpacing,
    ComponentSpacing,
    ResponsiveSpacing,
    GridSystem,
    Duration,
    Easing,
    MotionPresets,
    FramerMotionPresets
  };
  
  // Default export
  export default {
    tokens: designTokens,
    themes,
    utils: tokenUtils,
    components: componentTokens,
    breakpoints,
    mediaQueries,
    zIndex,
    animations
  };