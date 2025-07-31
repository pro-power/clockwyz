// src/components/layout/ThemeProvider.tsx
// Theme context provider for dark/light mode switching
// Integrates with design token system and provides smooth transitions

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { themes, generateAllCSSProperties, type Theme } from '../../design-system/tokens';

// Theme context interface
interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (themeName: 'light' | 'dark') => void;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark';
  storageKey?: string;
}

// Local storage key for theme preference
const DEFAULT_STORAGE_KEY = 'student-scheduler-theme';

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  storageKey = DEFAULT_STORAGE_KEY
}) => {
  // Initialize theme state
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    // Check for saved theme preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(storageKey);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return themes[savedTheme];
      }
      
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? themes.dark : themes.light;
    }
    
    return themes[defaultTheme];
  });

  const [isClient, setIsClient] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Apply CSS custom properties when theme changes
  useEffect(() => {
    if (!isClient) return;

    const root = document.documentElement;
    const cssProperties = generateAllCSSProperties(currentTheme);
    
    // Apply all CSS custom properties
    Object.entries(cssProperties).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Add theme class to body for CSS-based theming
    document.body.className = document.body.className
      .replace(/theme-(light|dark)/g, '')
      .trim();
    document.body.classList.add(`theme-${currentTheme.name}`);

    // Save theme preference
    localStorage.setItem(storageKey, currentTheme.name);
  }, [currentTheme, isClient, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    if (!isClient) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a preference
      const savedTheme = localStorage.getItem(storageKey);
      if (!savedTheme) {
        setCurrentTheme(e.matches ? themes.dark : themes.light);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isClient, storageKey]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = currentTheme.name === 'light' ? themes.dark : themes.light;
    setCurrentTheme(newTheme);
  };

  // Set specific theme
  const setTheme = (themeName: 'light' | 'dark') => {
    setCurrentTheme(themes[themeName]);
  };

  // Context value
  const contextValue: ThemeContextType = {
    theme: currentTheme,
    isDarkMode: currentTheme.name === 'dark',
    toggleTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// Theme transition component for smooth switching
interface ThemeTransitionProps {
  children: ReactNode;
  duration?: number;
}

export const ThemeTransition: React.FC<ThemeTransitionProps> = ({
  children,
  duration = 300
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), duration);
    return () => clearTimeout(timer);
  }, [theme, duration]);

  return (
    <div
      className={`theme-transition ${isTransitioning ? 'transitioning' : ''}`}
      style={{
        transition: isTransitioning ? `all ${duration}ms ease-in-out` : 'none'
      }}
    >
      {children}
    </div>
  );
};

// Theme toggle button component
interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
  showLabel = false
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        theme-toggle
        ${sizeClasses[size]}
        ${className}
        flex items-center justify-center
        rounded-lg
        bg-surface-default
        border border-border-default
        text-text-secondary
        hover:text-text-primary
        hover:bg-surface-hover
        transition-colors
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-primary-500
        focus:ring-offset-2
      `}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
      
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {isDarkMode ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};

// CSS-in-JS styles for theme components
export const themeStyles = `
  /* Theme transition styles */
  .theme-transition {
    position: relative;
  }

  .theme-transition.transitioning * {
    transition: 
      background-color 300ms ease-in-out,
      border-color 300ms ease-in-out,
      color 300ms ease-in-out,
      box-shadow 300ms ease-in-out !important;
  }

  /* Prevent flash during theme switching */
  .theme-transition.transitioning::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 9999;
    background: transparent;
  }

  /* Theme-specific styles */
  .theme-light {
    color-scheme: light;
  }

  .theme-dark {
    color-scheme: dark;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .theme-transition,
    .theme-transition * {
      transition: none !important;
    }
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    .theme-toggle {
      border-width: 2px;
    }
  }
`;

// Utility hook for accessing design tokens with current theme
export const useDesignTokens = () => {
  const { theme } = useTheme();
  
  return {
    colors: theme.colors,
    tokens: theme.tokens,
    
    // Utility functions
    getColor: (path: string): string => {
      const keys = path.split('.');
      let value: any = theme.colors;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          console.warn(`Color path "${path}" not found`);
          return '#000000';
        }
      }
      
      return typeof value === 'string' ? value : '#000000';
    },
    
    // CSS variable reference
    cssVar: (property: string): string => `var(--${property})`,
    
    // Responsive breakpoint checking
    isMobile: () => window.innerWidth < 768,
    isTablet: () => window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: () => window.innerWidth >= 1024
  };
};

// Export everything
export default ThemeProvider;