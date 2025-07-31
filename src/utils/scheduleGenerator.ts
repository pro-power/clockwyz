// utils/scheduleGenerator.ts
import { UserPreferences } from '../models/UserPreferencesModel';
import { ScheduleData } from '../models/ScheduleModel';

// Helper function to get the next day of the week
const getNextDay = (day: string): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentIndex = days.indexOf(day);
  if (currentIndex === -1) return days[0]; // Default to Sunday if invalid day
  return days[(currentIndex + 1) % 7];
};

// Function to parse time from HH:MM to hours as number
const parseTimeToHours = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours + minutes / 60;
};

// Function to format hour number to AM/PM string
const formatHourToAmPm = (hour: number): string => {
  const hourInt = Math.floor(hour);
  const period = hourInt >= 12 ? 'PM' : 'AM';
  const displayHour = hourInt % 12 === 0 ? 12 : hourInt % 12;
  return `${displayHour}:00 ${period}`;
};

// Improved function to generate 24-hour time slots
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  
  // Generate all 24 hours in AM/PM format
  for (let h = 0; h < 24; h++) {
    slots.push(formatHourToAmPm(h));
  }
  
  return slots;
};

// Function to check if a time slot is during work hours
const isWorkHours = (
  timeSlot: string, 
  day: string, 
  workDays: string[], 
  workStartTime: string, 
  workEndTime: string
): boolean => {
  if (!workDays.includes(day)) {
    return false;
  }
  
  // Convert to 24hr for easier comparison
  const getHour = (timeStr: string): number => {
    const isPM = timeStr.includes('PM');
    const [hourStr] = timeStr.split(':');
    let hour = parseInt(hourStr);
    
    if (isPM && hour !== 12) {
      hour += 12;
    } else if (!isPM && hour === 12) {
      hour = 0;
    }
    
    return hour;
  };
  
  const slotHour = getHour(timeSlot);
  const workStartHour = parseTimeToHours(workStartTime);
  const workEndHour = parseTimeToHours(workEndTime);
  
  // Handle overnight work schedules
  if (workEndHour < workStartHour) {
    return slotHour >= workStartHour || slotHour < workEndHour;
  }
  
  return slotHour >= workStartHour && slotHour < workEndHour;
};

// Function to check if a time slot is for sleeping
const isSleepTime = (
  timeSlot: string,
  wakeTime: string,
  bedTime: string
): boolean => {
  const getHour = (timeStr: string): number => {
    const isPM = timeStr.includes('PM');
    const [hourStr] = timeStr.split(':');
    let hour = parseInt(hourStr);
    
    if (isPM && hour !== 12) {
      hour += 12;
    } else if (!isPM && hour === 12) {
      hour = 0;
    }
    
    return hour;
  };
  
  const slotHour = getHour(timeSlot);
  const wakeHour = parseTimeToHours(wakeTime);
  const bedHour = parseTimeToHours(bedTime);
  
  // Handle overnight sleep
  if (bedHour > wakeHour) {
    return slotHour >= bedHour || slotHour < wakeHour;
  }
  
  return slotHour >= bedHour && slotHour < wakeHour;
};

// Function to suggest meal times
const isMealTime = (timeSlot: string): {isMeal: boolean, mealName: string} => {
  const mealTimes = {
    "7:00 AM": "Breakfast",
    "8:00 AM": "Breakfast",
    "12:00 PM": "Lunch",
    "1:00 PM": "Lunch",
    "6:00 PM": "Dinner",
    "7:00 PM": "Dinner"
  };
  
  if (timeSlot in mealTimes) {
    return { isMeal: true, mealName: mealTimes[timeSlot as keyof typeof mealTimes] };
  }
  
  return { isMeal: false, mealName: "" };
};

export const generateSchedule = (preferences: UserPreferences): ScheduleData => {
  try {
    // Validate inputs or use defaults
    const validStartDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].includes(preferences.startDay) 
      ? preferences.startDay 
      : 'Monday';
    
    const validSleepHours = typeof preferences.desiredSleepHours === 'number' && preferences.desiredSleepHours >= 4 && preferences.desiredSleepHours <= 12
      ? preferences.desiredSleepHours
      : 8;

    // Parse and validate times
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const validBedTime = preferences.bedTime && timePattern.test(preferences.bedTime)
      ? preferences.bedTime
      : '22:00';
    
    const validStartTime = preferences.startTime && timePattern.test(preferences.startTime)
      ? preferences.startTime
      : '08:00';
    
    // Calculate wake time based on bed time and desired sleep hours
    const bedTimeHour = parseTimeToHours(validBedTime);
    const wakeTimeHour = (bedTimeHour + validSleepHours) % 24;
    const wakeTimeHourInt = Math.floor(wakeTimeHour);
    const wakeTimeMinInt = Math.round((wakeTimeHour - wakeTimeHourInt) * 60);
    const wakeTime = `${wakeTimeHourInt.toString().padStart(2, '0')}:${wakeTimeMinInt.toString().padStart(2, '0')}`;
    
    // Generate 7 days starting from the selected start day
    const days: string[] = [];
    let currentDay = validStartDay;
    for (let i = 0; i < 7; i++) {
      days.push(currentDay);
      currentDay = getNextDay(currentDay);
    }
    
    // Generate 24-hour time slots
    const timeSlots = generateTimeSlots();
    
    // Rearrange time slots to start from user's preferred start time
    const startTimeIndex = timeSlots.findIndex(time => {
      const timeHour = parseTimeToHours(time.split(':')[0] + ':00');
      const prefStartHour = parseTimeToHours(validStartTime);
      return Math.floor(timeHour) === Math.floor(prefStartHour);
    });
    
    let orderedTimeSlots = timeSlots;
    if (startTimeIndex !== -1) {
      // Reorder slots to start from user's preferred time
      orderedTimeSlots = [
        ...timeSlots.slice(startTimeIndex),
        ...timeSlots.slice(0, startTimeIndex)
      ];
    }
    
    // Generate schedule with proper metadata
    const schedule: ScheduleData = {
      slots: orderedTimeSlots.map(time => {
        const activities: { [key: string]: { content: string, category: string } } = {};
        
        days.forEach(day => {
          const mealCheck = isMealTime(time);
          
          if (isSleepTime(time, wakeTime, validBedTime)) {
            activities[day] = {
              content: 'Sleep',
              category: 'Sleep'
            };
          } else if (isWorkHours(time, day, preferences.workDays, preferences.workStartTime, preferences.workEndTime)) {
            activities[day] = {
              content: 'Work',
              category: 'Work'
            };
          } else if (mealCheck.isMeal) {
            activities[day] = {
              content: mealCheck.mealName,
              category: 'Meals'
            };
          } else {
            activities[day] = {
              content: 'Free Time',
              category: 'Personal'
            };
          }
        });
        
        return {
          time,
          activities
        };
      }),
      metadata: {
        studentId: preferences.academic?.studentId || 'default-student',
        semester: 'Fall 2024',
        academicYear: '2024-2025',
        generatedAt: new Date(),
        version: '1.0.0',
        source: 'ai_generated',
        preferences: preferences,
        statistics: {
          totalActivities: 0,
          totalStudyHours: 0,
          totalClassHours: 0,
          totalWorkHours: 0,
          totalFreeTime: 0,
          averageDailyCommute: 0,
          categoryDistribution: [],
          weeklyWorkload: 0,
          timeUtilization: 0,
          optimalityScore: 0
        },
        conflicts: [],
        suggestions: []
      }
    };
    
    return schedule;
    
  } catch (error) {
    console.error("Error generating schedule:", error);
    
    // Return a minimal valid schedule as fallback
    const fallbackDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const fallbackTimes = ['8:00 AM', '12:00 PM', '4:00 PM', '8:00 PM'];
    
    return {
      slots: fallbackTimes.map((time: string) => {
        const activities: { [key: string]: { content: string, category: string } } = {};
        
        fallbackDays.forEach((day: string) => {
          activities[day] = {
            content: 'Free Time',
            category: 'Personal'
          };
        });
        
        return {
          time,
          activities
        };
      }),
      metadata: {
        studentId: 'fallback-student',
        semester: 'Fall 2024',
        academicYear: '2024-2025',
        generatedAt: new Date(),
        version: '1.0.0',
        source: 'manual',
        preferences: preferences,
        statistics: {
          totalActivities: 0,
          totalStudyHours: 0,
          totalClassHours: 0,
          totalWorkHours: 0,
          totalFreeTime: 0,
          averageDailyCommute: 0,
          categoryDistribution: [],
          weeklyWorkload: 0,
          timeUtilization: 0,
          optimalityScore: 0
        },
        conflicts: [],
        suggestions: []
      }
    };
  }
};