// src/design-system/tokens/framer-easings.ts
// Framer Motion compatible easing definitions

export const framerEasings = {
    // Standard easings (Framer Motion compatible)
    linear: [0, 0, 1, 1],
    ease: [0.25, 0.1, 0.25, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],
    
    // Custom easings
    bounce: [0.68, -0.55, 0.265, 1.55],
    spring: [0.175, 0.885, 0.32, 1.275],
    soft: [0.25, 0.46, 0.45, 0.94],
    sharp: [0.4, 0.0, 0.2, 1],
  };
  
  export const framerDurations = {
    instant: 0,
    fast: 0.15,      // Convert from ms to seconds
    normal: 0.25,
    slow: 0.4,
    slower: 0.6
  };