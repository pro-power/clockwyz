// src/design-system/tokens/motion.ts
// Motion design tokens for smooth, purposeful animations
// Based on Motion app's refined animation principles

export interface Duration {
    instant: number;
    fast: number;
    normal: number;
    slow: number;
    slower: number;
  }
  
  export interface Easing {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    // Custom easings for different interaction types
    bounce: string;
    spring: string;
    soft: string;
    sharp: string;
  }
  
  export interface MotionPreset {
    duration: number;
    easing: string;
    fillMode?: string;
    direction?: string;
  }
  
  // Animation durations in milliseconds
  const duration: Duration = {
    instant: 0,      // No animation
    fast: 150,       // Quick interactions (hover, focus)
    normal: 250,     // Standard UI transitions
    slow: 400,       // Deliberate, important changes
    slower: 600      // Page transitions, complex animations
  };
  
  // Easing curves for natural motion
  const easing: Easing = {
    // Standard CSS easings
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    
    // Custom cubic-bezier curves
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',      // Playful bounce
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',     // Spring-like motion
    soft: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',          // Gentle, soft motion
    sharp: 'cubic-bezier(0.4, 0.0, 0.2, 1)'                // Sharp, precise motion
  };
  
  // Motion presets for common interaction patterns
  export interface MotionPresets {
    // Hover interactions
    hover: MotionPreset;
    hoverScale: MotionPreset;
    hoverLift: MotionPreset;
    
    // Focus states
    focus: MotionPreset;
    focusRing: MotionPreset;
    
    // Press/click interactions
    press: MotionPreset;
    pressScale: MotionPreset;
    
    // UI state changes
    fadeIn: MotionPreset;
    fadeOut: MotionPreset;
    slideUp: MotionPreset;
    slideDown: MotionPreset;
    slideLeft: MotionPreset;
    slideRight: MotionPreset;
    
    // Modal and overlay animations
    modalEnter: MotionPreset;
    modalExit: MotionPreset;
    overlayEnter: MotionPreset;
    overlayExit: MotionPreset;
    
    // Loading and progress
    pulse: MotionPreset;
    spin: MotionPreset;
    bounce: MotionPreset;
    
    // Page transitions
    pageEnter: MotionPreset;
    pageExit: MotionPreset;
  }
  
  const motionPresets: MotionPresets = {
    // Hover interactions
    hover: {
      duration: duration.fast,
      easing: easing.soft
    },
    hoverScale: {
      duration: duration.fast,
      easing: easing.spring
    },
    hoverLift: {
      duration: duration.fast,
      easing: easing.easeOut
    },
    
    // Focus states
    focus: {
      duration: duration.fast,
      easing: easing.easeOut
    },
    focusRing: {
      duration: duration.normal,
      easing: easing.soft
    },
    
    // Press/click interactions
    press: {
      duration: duration.fast,
      easing: easing.sharp
    },
    pressScale: {
      duration: duration.fast,
      easing: easing.easeIn
    },
    
    // UI state changes
    fadeIn: {
      duration: duration.normal,
      easing: easing.easeOut,
      fillMode: 'forwards'
    },
    fadeOut: {
      duration: duration.normal,
      easing: easing.easeIn,
      fillMode: 'forwards'
    },
    slideUp: {
      duration: duration.normal,
      easing: easing.easeOut
    },
    slideDown: {
      duration: duration.normal,
      easing: easing.easeOut
    },
    slideLeft: {
      duration: duration.normal,
      easing: easing.easeOut
    },
    slideRight: {
      duration: duration.normal,
      easing: easing.easeOut
    },
    
    // Modal and overlay animations
    modalEnter: {
      duration: duration.slow,
      easing: easing.spring
    },
    modalExit: {
      duration: duration.normal,
      easing: easing.easeIn
    },
    overlayEnter: {
      duration: duration.normal,
      easing: easing.easeOut
    },
    overlayExit: {
      duration: duration.fast,
      easing: easing.easeIn
    },
    
    // Loading and progress
    pulse: {
      duration: 2000,
      easing: easing.easeInOut,
      direction: 'alternate'
    },
    spin: {
      duration: 1000,
      easing: easing.linear
    },
    bounce: {
      duration: duration.slow,
      easing: easing.bounce
    },
    
    // Page transitions
    pageEnter: {
      duration: duration.slower,
      easing: easing.easeOut
    },
    pageExit: {
      duration: duration.slow,
      easing: easing.easeIn
    }
  };
  
  // Framer Motion specific presets
  export interface FramerMotionPresets {
    // Entrance animations
    fadeIn: any;
    slideInUp: any;
    slideInDown: any;
    slideInLeft: any;
    slideInRight: any;
    scaleIn: any;
    
    // Exit animations
    fadeOut: any;
    slideOutUp: any;
    slideOutDown: any;
    slideOutLeft: any;
    slideOutRight: any;
    scaleOut: any;
    
    // Hover animations
    hoverScale: any;
    hoverLift: any;
    hoverGlow: any;
    
    // Tap animations
    tapScale: any;
    tapPress: any;
    
    // Layout animations
    layoutShift: any;
    layoutExpand: any;
    layoutCollapse: any;
  }
  
  const framerMotionPresets: FramerMotionPresets = {
    // Entrance animations
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: duration.normal / 1000, ease: easing.easeOut }
    },
    
    slideInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: duration.normal / 1000, ease: easing.easeOut }
    },
    
    slideInDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: duration.normal / 1000, ease: easing.easeOut }
    },
    
    slideInLeft: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: duration.normal / 1000, ease: easing.easeOut }
    },
    
    slideInRight: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: duration.normal / 1000, ease: easing.easeOut }
    },
    
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: duration.normal / 1000, ease: easing.easeOut }
    },
    
    // Exit animations
    fadeOut: {
      exit: { opacity: 0 },
      transition: { duration: duration.fast / 1000, ease: easing.easeIn }
    },
    
    slideOutUp: {
      exit: { opacity: 0, y: -20 },
      transition: { duration: duration.fast / 1000, ease: easing.easeIn }
    },
    
    slideOutDown: {
      exit: { opacity: 0, y: 20 },
      transition: { duration: duration.fast / 1000, ease: easing.easeIn }
    },
    
    slideOutLeft: {
      exit: { opacity: 0, x: -20 },
      transition: { duration: duration.fast / 1000, ease: easing.easeIn }
    },
    
    slideOutRight: {
      exit: { opacity: 0, x: 20 },
      transition: { duration: duration.fast / 1000, ease: easing.easeIn }
    },
    
    scaleOut: {
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: duration.fast / 1000, ease: easing.easeIn }
    },
    
    // Hover animations
    hoverScale: {
      whileHover: { scale: 1.02 },
      transition: { duration: duration.fast / 1000, ease: easing.easeOut }
    },
    
    hoverLift: {
      whileHover: { y: -2 },
      transition: { duration: duration.fast / 1000, ease: easing.easeOut }
    },
    
    hoverGlow: {
      whileHover: { boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)' },
      transition: { duration: duration.fast / 1000, ease: easing.easeOut }
    },
    
    // Tap animations
    tapScale: {
      whileTap: { scale: 0.98 },
      transition: { duration: duration.fast / 1000, ease: easing.easeIn }
    },
    
    tapPress: {
      whileTap: { scale: 0.95 },
      transition: { duration: duration.instant / 1000, ease: easing.easeIn }
    },
    
    // Layout animations
    layoutShift: {
      layout: true,
      transition: { duration: duration.normal / 1000, ease: easing.easeOut }
    },
    
    layoutExpand: {
      initial: { height: 0, opacity: 0 },
      animate: { height: 'auto', opacity: 1 },
      exit: { height: 0, opacity: 0 },
      transition: { duration: duration.normal / 1000, ease: easing.easeOut }
    },
    
    layoutCollapse: {
      initial: { height: 'auto', opacity: 1 },
      exit: { height: 0, opacity: 0 },
      transition: { duration: duration.fast / 1000, ease: easing.easeIn }
    }
  };
  
  // CSS keyframe animations
  const keyframes = {
    // Fade animations
    fadeIn: {
      name: 'fadeIn',
      keyframes: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `
    },
    
    fadeOut: {
      name: 'fadeOut',
      keyframes: `
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `
    },
    
    // Slide animations
    slideInUp: {
      name: 'slideInUp',
      keyframes: `
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 20px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `
    },
    
    slideOutDown: {
      name: 'slideOutDown',
      keyframes: `
        @keyframes slideOutDown {
          from {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
          to {
            opacity: 0;
            transform: translate3d(0, 20px, 0);
          }
        }
      `
    },
    
    // Scale animations
    scaleIn: {
      name: 'scaleIn',
      keyframes: `
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale3d(0.95, 0.95, 1);
          }
          to {
            opacity: 1;
            transform: scale3d(1, 1, 1);
          }
        }
      `
    },
    
    // Loading animations
    pulse: {
      name: 'pulse',
      keyframes: `
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `
    },
    
    spin: {
      name: 'spin',
      keyframes: `
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `
    },
    
    bounce: {
      name: 'bounce',
      keyframes: `
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
            transform: translate3d(0, 0, 0);
          }
          40%, 43% {
            animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
            transform: translate3d(0, -8px, 0);
          }
          70% {
            animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
            transform: translate3d(0, -4px, 0);
          }
          90% {
            transform: translate3d(0, -1px, 0);
          }
        }
      `
    }
  };
  
  // CSS custom property generators for motion
  export const generateMotionCSSProperties = () => {
    return {
      // Durations
      '--duration-instant': `${duration.instant}ms`,
      '--duration-fast': `${duration.fast}ms`,
      '--duration-normal': `${duration.normal}ms`,
      '--duration-slow': `${duration.slow}ms`,
      '--duration-slower': `${duration.slower}ms`,
      
      // Easings
      '--easing-linear': easing.linear,
      '--easing-ease': easing.ease,
      '--easing-ease-in': easing.easeIn,
      '--easing-ease-out': easing.easeOut,
      '--easing-ease-in-out': easing.easeInOut,
      '--easing-bounce': easing.bounce,
      '--easing-spring': easing.spring,
      '--easing-soft': easing.soft,
      '--easing-sharp': easing.sharp,
      
      // Common transitions
      '--transition-fast': `all ${duration.fast}ms ${easing.soft}`,
      '--transition-normal': `all ${duration.normal}ms ${easing.easeOut}`,
      '--transition-slow': `all ${duration.slow}ms ${easing.easeOut}`,
      
      // Component-specific transitions
      '--transition-hover': `all ${duration.fast}ms ${easing.soft}`,
      '--transition-focus': `all ${duration.fast}ms ${easing.easeOut}`,
      '--transition-press': `all ${duration.fast}ms ${easing.sharp}`,
      '--transition-modal': `all ${duration.slow}ms ${easing.spring}`
    };
  };
  
  // Motion utility functions
  const motionUtils = {
    // Convert duration to CSS value
    duration: (value: keyof Duration): string => {
      return `${duration[value]}ms`;
    },
    
    // Create transition string
    transition: (
      property: string = 'all',
      durationKey: keyof Duration = 'normal',
      easingKey: keyof Easing = 'easeOut'
    ): string => {
      return `${property} ${duration[durationKey]}ms ${easing[easingKey]}`;
    },
    
    // Create CSS custom property reference
    toCSSVar: (property: string): string => {
      return `var(--${property})`;
    },
    
    // Reduce motion for accessibility
    respectsReducedMotion: (animation: string): string => {
      return `
        @media (prefers-reduced-motion: no-preference) {
          ${animation}
        }
      `;
    }
  };
  
  // Export everything
  export {
    duration,
    easing,
    motionPresets,
    framerMotionPresets,
    keyframes,
    motionUtils
  };