// src/design-system/tokens/spacing.ts
// Spacing design tokens following 8pt grid system
// Provides consistent spacing, sizing, and layout values

export interface SpacingScale {
    0: string;
    px: string;
    0.5: string;
    1: string;
    1.5: string;
    2: string;
    2.5: string;
    3: string;
    3.5: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
    11: string;
    12: string;
    14: string;
    16: string;
    20: string;
    24: string;
    28: string;
    32: string;
    36: string;
    40: string;
    44: string;
    48: string;
    52: string;
    56: string;
    60: string;
    64: string;
    72: string;
    80: string;
    96: string;
  }
  
  export interface BorderRadius {
    none: string;
    sm: string;
    DEFAULT: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
  }
  
  export interface Shadows {
    sm: string;
    DEFAULT: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    inner: string;
    none: string;
  }
  
  // 8pt grid spacing scale (4px base unit)
  export const spacing: SpacingScale = {
    0: '0px',
    px: '1px',
    0.5: '2px',    // 0.5 * 4px
    1: '4px',      // 1 * 4px
    1.5: '6px',    // 1.5 * 4px
    2: '8px',      // 2 * 4px
    2.5: '10px',   // 2.5 * 4px
    3: '12px',     // 3 * 4px
    3.5: '14px',   // 3.5 * 4px
    4: '16px',     // 4 * 4px
    5: '20px',     // 5 * 4px
    6: '24px',     // 6 * 4px
    7: '28px',     // 7 * 4px
    8: '32px',     // 8 * 4px
    9: '36px',     // 9 * 4px
    10: '40px',    // 10 * 4px
    11: '44px',    // 11 * 4px
    12: '48px',    // 12 * 4px
    14: '56px',    // 14 * 4px
    16: '64px',    // 16 * 4px
    20: '80px',    // 20 * 4px
    24: '96px',    // 24 * 4px
    28: '112px',   // 28 * 4px
    32: '128px',   // 32 * 4px
    36: '144px',   // 36 * 4px
    40: '160px',   // 40 * 4px
    44: '176px',   // 44 * 4px
    48: '192px',   // 48 * 4px
    52: '208px',   // 52 * 4px
    56: '224px',   // 56 * 4px
    60: '240px',   // 60 * 4px
    64: '256px',   // 64 * 4px
    72: '288px',   // 72 * 4px
    80: '320px',   // 80 * 4px
    96: '384px'    // 96 * 4px
  };
  
  // Border radius scale for modern, subtle roundedness
  const borderRadius: BorderRadius = {
    none: '0px',
    sm: '2px',     // Subtle rounding
    DEFAULT: '4px', // Standard buttons, cards
    md: '6px',     // Medium components
    lg: '8px',     // Cards, modals
    xl: '12px',    // Large cards, panels
    '2xl': '16px', // Hero sections
    '3xl': '24px', // Extra large components
    full: '9999px' // Pills, circular elements
  };
  
  // Shadow system for depth and elevation
  const shadows: Shadows = {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000'
  };
  
  // Semantic spacing values for specific use cases
  export interface SemanticSpacing {
    // Component internal spacing
    component: {
      xs: string;    // Tight spacing within components
      sm: string;    // Standard internal spacing
      md: string;    // Comfortable internal spacing
      lg: string;    // Loose internal spacing
    };
    
    // Layout spacing between components
    layout: {
      xs: string;    // Minimal separation
      sm: string;    // Close related items
      md: string;    // Standard section spacing
      lg: string;    // Major section separation
      xl: string;    // Page-level spacing
    };
    
    // Interactive element spacing
    interactive: {
      xs: string;    // Tight button/input spacing
      sm: string;    // Standard interactive spacing
      md: string;    // Comfortable touch targets
      lg: string;    // Spacious interactive areas
    };
    
    // Content spacing
    content: {
      xs: string;    // Tight text spacing
      sm: string;    // Paragraph spacing
      md: string;    // Section spacing
      lg: string;    // Chapter spacing
    };
  }
  
  // Semantic spacing definitions
  const semanticSpacing: SemanticSpacing = {
    component: {
      xs: spacing[1],    // 4px - tight spacing
      sm: spacing[2],    // 8px - standard spacing
      md: spacing[4],    // 16px - comfortable spacing
      lg: spacing[6]     // 24px - loose spacing
    },
    
    layout: {
      xs: spacing[2],    // 8px - minimal separation
      sm: spacing[4],    // 16px - close related items
      md: spacing[8],    // 32px - standard sections
      lg: spacing[12],   // 48px - major sections
      xl: spacing[16]    // 64px - page-level spacing
    },
    
    interactive: {
      xs: spacing[2],    // 8px - tight buttons
      sm: spacing[3],    // 12px - standard buttons
      md: spacing[4],    // 16px - comfortable touch
      lg: spacing[6]     // 24px - spacious areas
    },
    
    content: {
      xs: spacing[1],    // 4px - tight text
      sm: spacing[3],    // 12px - paragraph spacing
      md: spacing[6],    // 24px - section spacing
      lg: spacing[10]    // 40px - chapter spacing
    }
  };
  
  // Component-specific spacing presets
  export interface ComponentSpacing {
    button: {
      padding: {
        sm: string;
        md: string;
        lg: string;
      };
      gap: string;
    };
    
    card: {
      padding: {
        sm: string;
        md: string;
        lg: string;
      };
      gap: string;
    };
    
    input: {
      padding: {
        sm: string;
        md: string;
        lg: string;
      };
    };
    
    modal: {
      padding: string;
      margin: string;
    };
    
    navigation: {
      padding: string;
      itemGap: string;
    };
  }
  
  const componentSpacing: ComponentSpacing = {
    button: {
      padding: {
        sm: `${spacing[2]} ${spacing[3]}`,    // 8px 12px
        md: `${spacing[3]} ${spacing[4]}`,    // 12px 16px
        lg: `${spacing[4]} ${spacing[6]}`     // 16px 24px
      },
      gap: spacing[2] // 8px between icon and text
    },
    
    card: {
      padding: {
        sm: spacing[4],   // 16px
        md: spacing[6],   // 24px
        lg: spacing[8]    // 32px
      },
      gap: spacing[4]     // 16px between card elements
    },
    
    input: {
      padding: {
        sm: `${spacing[2]} ${spacing[3]}`,    // 8px 12px
        md: `${spacing[3]} ${spacing[4]}`,    // 12px 16px
        lg: `${spacing[4]} ${spacing[5]}`     // 16px 20px
      }
    },
    
    modal: {
      padding: spacing[6],  // 24px
      margin: spacing[4]    // 16px
    },
    
    navigation: {
      padding: spacing[4],  // 16px
      itemGap: spacing[1]   // 4px between nav items
    }
  };
  
  // Breakpoint-specific spacing adjustments
  export interface ResponsiveSpacing {
    mobile: {
      container: string;
      section: string;
      component: string;
    };
    tablet: {
      container: string;
      section: string;
      component: string;
    };
    desktop: {
      container: string;
      section: string;
      component: string;
    };
  }
  
  const responsiveSpacing: ResponsiveSpacing = {
    mobile: {
      container: spacing[4],  // 16px container padding
      section: spacing[6],    // 24px section spacing
      component: spacing[3]   // 12px component spacing
    },
    tablet: {
      container: spacing[6],  // 24px container padding
      section: spacing[8],    // 32px section spacing
      component: spacing[4]   // 16px component spacing
    },
    desktop: {
      container: spacing[8],  // 32px container padding
      section: spacing[12],   // 48px section spacing
      component: spacing[6]   // 24px component spacing
    }
  };
  
  // Grid system based on spacing tokens
  export interface GridSystem {
    columns: number;
    gap: {
      sm: string;
      md: string;
      lg: string;
    };
    container: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  }
  
  const gridSystem: GridSystem = {
    columns: 12,
    gap: {
      sm: spacing[4],   // 16px
      md: spacing[6],   // 24px
      lg: spacing[8]    // 32px
    },
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px'
    }
  };
  
  // CSS custom property generators for spacing
  export const generateSpacingCSSProperties = () => {
    const properties: Record<string, string> = {};
    
    // Generate spacing properties
    Object.entries(spacing).forEach(([key, value]) => {
      properties[`--spacing-${key}`] = value;
    });
    
    // Generate border radius properties
    Object.entries(borderRadius).forEach(([key, value]) => {
      const propKey = key === 'DEFAULT' ? 'default' : key;
      properties[`--radius-${propKey}`] = value;
    });
    
    // Generate shadow properties
    Object.entries(shadows).forEach(([key, value]) => {
      const propKey = key === 'DEFAULT' ? 'default' : key;
      properties[`--shadow-${propKey}`] = value;
    });
    
    // Add semantic spacing
    properties['--spacing-component-xs'] = semanticSpacing.component.xs;
    properties['--spacing-component-sm'] = semanticSpacing.component.sm;
    properties['--spacing-component-md'] = semanticSpacing.component.md;
    properties['--spacing-component-lg'] = semanticSpacing.component.lg;
    
    properties['--spacing-layout-xs'] = semanticSpacing.layout.xs;
    properties['--spacing-layout-sm'] = semanticSpacing.layout.sm;
    properties['--spacing-layout-md'] = semanticSpacing.layout.md;
    properties['--spacing-layout-lg'] = semanticSpacing.layout.lg;
    properties['--spacing-layout-xl'] = semanticSpacing.layout.xl;
    
    return properties;
  };
  
  // Utility functions for spacing calculations
  const spacingUtils = {
    // Add two spacing values
    add: (value1: keyof SpacingScale, value2: keyof SpacingScale): string => {
      const px1 = parseInt(spacing[value1]);
      const px2 = parseInt(spacing[value2]);
      return `${px1 + px2}px`;
    },
    
    // Multiply spacing value
    multiply: (value: keyof SpacingScale, multiplier: number): string => {
      const px = parseInt(spacing[value]);
      return `${px * multiplier}px`;
    },
    
    // Get responsive spacing based on breakpoint
    responsive: (breakpoint: keyof ResponsiveSpacing, type: keyof ResponsiveSpacing['mobile']): string => {
      return responsiveSpacing[breakpoint][type];
    },
    
    // Convert spacing token to CSS custom property
    toCSSVar: (value: keyof SpacingScale): string => {
      return `var(--spacing-${value})`;
    }
  };
  
  // Export everything
  export {
    spacing as default,
    borderRadius,
    shadows,
    semanticSpacing,
    componentSpacing,
    responsiveSpacing,
    gridSystem,
    spacingUtils
  };