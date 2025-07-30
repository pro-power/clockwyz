// utils/scheduleEfficiency.ts
import { UserPreferences } from '../models/UserPreferencesModel';
import { ScheduleData, Activity } from '../models/ScheduleModel';

/**
 * Analyzes the user's preferences and optimizes their schedule
 * based on productivity patterns, energy levels, and time constraints
 */
export const optimizeSchedule = (schedule: ScheduleData, preferences: UserPreferences): ScheduleData => {
  const optimizedSchedule = { ...schedule };
  const slots = [...optimizedSchedule.slots];

  // Apply various optimization strategies
  const optimizedSlots = applyTimeBlockOptimization(slots, preferences);
  const energyAwareSlots = applyEnergyAwareScheduling(optimizedSlots, preferences);
  const balancedSlots = applyWorkLifeBalance(energyAwareSlots, preferences);

  optimizedSchedule.slots = balancedSlots;
  return optimizedSchedule;
};

/**
 * Groups similar activities together for more efficient time blocks
 */
const applyTimeBlockOptimization = (slots: any[], preferences: UserPreferences) => {
  // Clone slots to avoid mutation
  const optimizedSlots = JSON.parse(JSON.stringify(slots));
  const days = Object.keys(optimizedSlots[0].activities);
  
  // Process each day separately
  days.forEach(day => {
    // Skip optimization for non-working days
    if (!preferences.workDays.includes(day)) return;
    
    // Find current work blocks and consolidate them if they're fragmented
    let workBlocks: { start: number, end: number }[] = [];
    let currentBlock: { start: number, end: number } | null = null;
    
    // First pass: identify existing work blocks
    optimizedSlots.forEach((slot, index) => {
      const activity = slot.activities[day];
      
      if (activity?.category === 'Work') {
        if (!currentBlock) {
          currentBlock = { start: index, end: index };
        } else {
          currentBlock.end = index;
        }
      } else if (currentBlock) {
        workBlocks.push({ ...currentBlock });
        currentBlock = null;
      }
    });
    
    // Add the last block if it exists
    if (currentBlock) {
      workBlocks.push({ ...currentBlock });
    }
    
    // If we have multiple small work blocks, try to consolidate them
    if (workBlocks.length > 1) {
      const mainWorkBlock = workBlocks.reduce((longest, current) => {
        return (current.end - current.start) > (longest.end - longest.start) ? current : longest;
      }, workBlocks[0]);
      
      // Move smaller work tasks to free slots near the main work block
      workBlocks.forEach(block => {
        if (block === mainWorkBlock) return;
        
        // Find free slots near the main work block
        const freeSlots = [];
        
        // Look for free slots before and after the main block
        for (let i = Math.max(0, mainWorkBlock.start - 3); i < mainWorkBlock.start; i++) {
          if (optimizedSlots[i].activities[day].content === 'Free Time') {
            freeSlots.push(i);
          }
        }
        
        for (let i = mainWorkBlock.end + 1; i < Math.min(optimizedSlots.length, mainWorkBlock.end + 4); i++) {
          if (optimizedSlots[i].activities[day].content === 'Free Time') {
            freeSlots.push(i);
          }
        }
        
        // Move work tasks to free slots if available
        if (freeSlots.length > 0) {
          for (let i = block.start; i <= block.end; i++) {
            if (freeSlots.length === 0) break;
            
            const targetSlot = freeSlots.shift();
            if (targetSlot !== undefined) {
              // Swap activities
              const workActivity = { ...optimizedSlots[i].activities[day] };
              optimizedSlots[i].activities[day] = { ...optimizedSlots[targetSlot].activities[day] };
              optimizedSlots[targetSlot].activities[day] = workActivity;
            }
          }
        }
      });
    }
  });
  
  return optimizedSlots;
};

/**
 * Schedules high-focus tasks during peak energy hours based on user's profile
 */
const applyEnergyAwareScheduling = (slots: any[], preferences: UserPreferences) => {
  const optimizedSlots = JSON.parse(JSON.stringify(slots));
  const days = Object.keys(optimizedSlots[0].activities);
  
  // Determine user's energy pattern based on wake/sleep times
  const energyProfile = determineEnergyProfile(preferences);
  
  days.forEach(day => {
    // Skip non-working days
    if (!preferences.workDays.includes(day)) return;
    
    // Map slots to approximate energy levels
    const slotEnergyLevels = optimizedSlots.map((slot, index) => {
      const timeMatch = slot.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) return { index, energy: 0.5 }; // Default mid-level
      
      let hour = parseInt(timeMatch[1]);
      const isPM = timeMatch[3].toUpperCase() === 'PM';
      
      // Convert to 24-hour format
      if (isPM && hour !== 12) hour += 12;
      else if (!isPM && hour === 12) hour = 0;
      
      return {
        index,
        energy: getEnergyLevel(hour, energyProfile)
      };
    });
    
    // Sort slots by energy level (highest first)
    slotEnergyLevels.sort((a, b) => b.energy - a.energy);
    
    // Find tasks that require high focus (Work, Study)
    const highFocusTasks = [];
    const lowFocusTasks = [];
    
    optimizedSlots.forEach((slot, index) => {
      const activity = slot.activities[day];
      
      if (['Work', 'Study'].includes(activity.category)) {
        if (activity.content.includes('Meeting') || 
            activity.content.includes('Break') || 
            activity.content.includes('Email')) {
          lowFocusTasks.push(index);
        } else {
          highFocusTasks.push(index);
        }
      }
    });
    
    // Reposition high-focus tasks to high-energy slots where possible
    // without disrupting fixed events like meetings
    for (let i = 0; i < highFocusTasks.length && i < slotEnergyLevels.length; i++) {
      const highFocusIndex = highFocusTasks[i];
      const highEnergyIndex = slotEnergyLevels[i].index;
      
      // Check if high energy slot contains a low-focus or free time activity
      const highEnergyActivity = optimizedSlots[highEnergyIndex].activities[day];
      
      if (highEnergyActivity.content === 'Free Time' || 
          lowFocusTasks.includes(highEnergyIndex)) {
        
        // Swap activities
        const temp = { ...optimizedSlots[highFocusIndex].activities[day] };
        optimizedSlots[highFocusIndex].activities[day] = { ...highEnergyActivity };
        optimizedSlots[highEnergyIndex].activities[day] = temp;
        
        // Update lowFocusTasks array if needed
        if (lowFocusTasks.includes(highEnergyIndex)) {
          const idx = lowFocusTasks.indexOf(highEnergyIndex);
          lowFocusTasks[idx] = highFocusIndex;
        }
      }
    }
  });
  
  return optimizedSlots;
};

/**
 * Ensures work-life balance by adding breaks and personal activities
 */
const applyWorkLifeBalance = (slots: any[], preferences: UserPreferences) => {
  const optimizedSlots = JSON.parse(JSON.stringify(slots));
  const days = Object.keys(optimizedSlots[0].activities);
  
  days.forEach(day => {
    if (!preferences.workDays.includes(day)) return;
    
    // Find work sessions longer than 3 consecutive slots
    let workCount = 0;
    let workStartIndex = -1;
    
    optimizedSlots.forEach((slot, index) => {
      const activity = slot.activities[day];
      
      if (activity.category === 'Work') {
        if (workCount === 0) {
          workStartIndex = index;
        }
        workCount++;
      } else {
        // Insert breaks if we've identified a long work session
        if (workCount >= 3) {
          // Insert a break in the middle of the work session
          const breakIndex = workStartIndex + Math.floor(workCount / 2);
          optimizedSlots[breakIndex].activities[day] = {
            content: 'Short Break',
            category: 'Personal'
          };
        }
        
        workCount = 0;
        workStartIndex = -1;
      }
    });
    
    // Check if the day ends with a long work session
    if (workCount >= 3) {
      const breakIndex = workStartIndex + Math.floor(workCount / 2);
      optimizedSlots[breakIndex].activities[day] = {
        content: 'Short Break',
        category: 'Personal'
      };
    }
    
    // Ensure there's at least one exercise/wellness activity per day
    const hasExercise = optimizedSlots.some(slot => 
      slot.activities[day].category === 'Exercise'
    );
    
    if (!hasExercise) {
      // Find a suitable free time slot in the morning or evening
      const morningSlots = optimizedSlots.slice(0, Math.floor(optimizedSlots.length / 3));
      const eveningSlots = optimizedSlots.slice(Math.floor(optimizedSlots.length * 2 / 3));
      
      // Try morning first, then evening
      let exerciseSlot = morningSlots.findIndex(slot => 
        slot.activities[day].content === 'Free Time'
      );
      
      if (exerciseSlot === -1) {
        const eveningFreeIndex = eveningSlots.findIndex(slot => 
          slot.activities[day].content === 'Free Time'
        );
        if (eveningFreeIndex !== -1) {
          exerciseSlot = Math.floor(optimizedSlots.length * 2 / 3) + eveningFreeIndex;
        }
      }
      
      if (exerciseSlot !== -1) {
        optimizedSlots[exerciseSlot].activities[day] = {
          content: 'Exercise',
          category: 'Exercise'
        };
      }
    }
  });
  
  return optimizedSlots;
};

/**
 * Determine user's energy profile based on sleep patterns
 */
const determineEnergyProfile = (preferences: UserPreferences): 'morning' | 'evening' | 'balanced' => {
  // Extract wake time and bed time
  const wakeTimeMatch = preferences.startTime.match(/(\d+):(\d+)/);
  const bedTimeMatch = preferences.bedTime.match(/(\d+):(\d+)/);
  
  if (!wakeTimeMatch || !bedTimeMatch) {
    return 'balanced'; // Default
  }
  
  const wakeHour = parseInt(wakeTimeMatch[1]);
  const bedHour = parseInt(bedTimeMatch[1]);
  
  // Early risers (before 6 AM) tend to be morning people
  if (wakeHour < 6) {
    return 'morning';
  }
  
  // Late sleepers (after 11 PM) tend to be evening people
  if (bedHour >= 23) {
    return 'evening';
  }
  
  // If wake time is early but not super early, likely morning-leaning
  if (wakeHour < 7) {
    return 'morning';
  }
  
  // If wake time is late, likely evening-leaning
  if (wakeHour > 8) {
    return 'evening';
  }
  
  return 'balanced';
};

/**
 * Get energy level for a specific hour based on energy profile
 */
const getEnergyLevel = (hour: number, profile: 'morning' | 'evening' | 'balanced'): number => {
  // Energy levels from 0.0 to 1.0
  if (profile === 'morning') {
    // Morning people peak in the morning, decline throughout the day
    if (hour >= 6 && hour < 11) return 0.9; // Morning peak
    if (hour >= 11 && hour < 14) return 0.7; // Mid-day still good
    if (hour >= 14 && hour < 17) return 0.5; // Afternoon decline
    if (hour >= 17 && hour < 20) return 0.4; // Evening low
    return 0.2; // Night low
  } else if (profile === 'evening') {
    // Evening people start slow, peak in the afternoon/evening
    if (hour >= 6 && hour < 10) return 0.4; // Morning low
    if (hour >= 10 && hour < 14) return 0.6; // Mid-day rising
    if (hour >= 14 && hour < 19) return 0.9; // Afternoon/evening peak
    if (hour >= 19 && hour < 23) return 0.7; // Evening still good
    return 0.5; // Late night declining
  } else {
    // Balanced people have a mid-day peak with gradual decline on either side
    if (hour >= 7 && hour < 10) return 0.7; // Morning good
    if (hour >= 10 && hour < 14) return 0.9; // Mid-day peak
    if (hour >= 14 && hour < 17) return 0.8; // Afternoon good
    if (hour >= 17 && hour < 20) return 0.6; // Evening moderate
    return 0.4; // Early morning/late night low
  }
};

/**
 * Suggests optimal activities for free time slots based on context
 */
export const suggestActivities = (schedule: ScheduleData, preferences: UserPreferences): ScheduleData => {
  const suggestedSchedule = { ...schedule };
  const slots = [...suggestedSchedule.slots];
  
  // Get all days
  const days = Object.keys(slots[0].activities);
  
  days.forEach(day => {
    // Skip suggestions for non-working days if they have a different pattern
    const isWorkDay = preferences.workDays.includes(day);
    
    // Find all free time slots
    slots.forEach((slot, index) => {
      const activity = slot.activities[day];
      
      if (activity.content === 'Free Time') {
        // Suggest an activity based on context
        const suggestion = suggestActivityForTimeSlot(slot.time, day, isWorkDay, slots, index);
        
        if (suggestion) {
          slots[index].activities[day] = suggestion;
        }
      }
    });
  });
  
  suggestedSchedule.slots = slots;
  return suggestedSchedule;
};

/**
 * Suggests an appropriate activity for a specific free time slot
 */
const suggestActivityForTimeSlot = (
  time: string, 
  day: string, 
  isWorkDay: boolean,
  slots: any[],
  currentIndex: number
): Activity | null => {
  // Parse the time
  const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!timeMatch) return null;
  
  let hour = parseInt(timeMatch[1]);
  const isPM = timeMatch[3].toUpperCase() === 'PM';
  
  // Convert to 24-hour format
  if (isPM && hour !== 12) hour += 12;
  else if (!isPM && hour === 12) hour = 0;
  
  // Check surrounding activities (previous and next)
  const prevActivity = currentIndex > 0 ? slots[currentIndex - 1].activities[day] : null;
  const nextActivity = currentIndex < slots.length - 1 ? slots[currentIndex + 1].activities[day] : null;
  
  // Early morning (before work)
  if (hour >= 5 && hour < 8) {
    if (nextActivity?.category === 'Work') {
      return {
        content: 'Morning Planning',
        category: 'Personal'
      };
    }
    return {
      content: 'Morning Exercise',
      category: 'Exercise'
    };
  }
  
  // Mid-morning
  if (hour >= 8 && hour < 12) {
    if (isWorkDay) {
      return {
        content: 'Focus Work',
        category: 'Work'
      };
    } else {
      return {
        content: 'Learning',
        category: 'Learning'
      };
    }
  }
  
  // Lunch time
  if (hour >= 12 && hour < 14) {
    return {
      content: 'Lunch',
      category: 'Meals'
    };
  }
  
  // Post-lunch slump
  if (hour >= 14 && hour < 16) {
    if (prevActivity?.category === 'Work' && nextActivity?.category === 'Work') {
      return {
        content: 'Short Break',
        category: 'Personal'
      };
    }
    if (isWorkDay) {
      return {
        content: 'Admin Tasks',
        category: 'Work'
      };
    }
    return {
      content: 'Reading',
      category: 'Leisure'
    };
  }
  
  // Late afternoon
  if (hour >= 16 && hour < 18) {
    if (isWorkDay && prevActivity?.category === 'Work') {
      return {
        content: 'Work Wrap-up',
        category: 'Work'
      };
    }
    return {
      content: 'Exercise',
      category: 'Exercise'
    };
  }
  
  // Evening
  if (hour >= 18 && hour < 20) {
    return {
      content: 'Dinner',
      category: 'Meals'
    };
  }
  
  // Late evening
  if (hour >= 20 && hour < 23) {
    return {
      content: 'Relaxation',
      category: 'Leisure'
    };
  }
  
  // Default suggestion
  return {
    content: 'Flexible Time',
    category: 'Personal'
  };
};