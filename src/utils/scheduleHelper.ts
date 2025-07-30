import { UserPreferences } from '../models/UserPreferencesModel';
import { Schedule, ScheduleSlot, CategoryColor } from '../models/ScheduleModel';

// Generate time slots for the schedule based on the startTime and bedTime
const generateTimeSlots = (startTime: string, bedTime: string): string[] => {
  const timeSlots: string[] = [];
  
  // Convert start and bed times to hours and minutes
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [bedHour, bedMinute] = bedTime.split(':').map(Number);
  
  // Initialize current time to start time
  let currentHour = startHour;
  let currentMinute = startMinute;
  
  // Generate slots until we reach bedTime
  while (
    currentHour < bedHour || 
    (currentHour === bedHour && currentMinute < bedMinute)
  ) {
    // Format current time as HH:MM
    const formattedTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    timeSlots.push(formattedTime);
    
    // Increment by 30 minutes
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute -= 60;
    }
    
    // Handle day wrap
    if (currentHour >= 24) {
      currentHour -= 24;
    }
  }
  
  return timeSlots;
};

// Get the day names based on the starting day
const getDayNames = (startDay: string): string[] => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const startIndex = days.indexOf(startDay);
  
  // Reorder days to start with the specified day
  const reorderedDays = [
    ...days.slice(startIndex),
    ...days.slice(0, startIndex)
  ];
  
  return reorderedDays;
};

// Generate default activities for each time slot based on the time
const generateDefaultActivities = (
  timeSlot: string, 
  days: string[], 
  preferences: UserPreferences
): Record<string, { content: string; category: string }> => {
  const activities: Record<string, { content: string; category: string }> = {};
  
  // Convert time to hour for easy comparison
  const [hour, minute] = timeSlot.split(':').map(Number);
  const timeValue = hour + (minute / 60);
  
  // Default categories based on time of day
  const getMealCategory = () => {
    if (timeValue >= 6 && timeValue < 9) return 'Breakfast';
    if (timeValue >= 11 && timeValue < 14) return 'Lunch';
    if (timeValue >= 18 && timeValue < 20) return 'Dinner';
    return 'Meal';
  };
  
  // Assign default activities for each day
  days.forEach(day => {
    // Morning routine (after wake-up)
    if (timeValue === parseInt(preferences.startTime.split(':')[0])) {
      activities[day] = { 
        content: 'Morning Routine', 
        category: 'Personal' 
      };
    } 
    // Work hours (9 AM to 5 PM on weekdays)
    else if (
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day) &&
      timeValue >= 9 && 
      timeValue < 17
    ) {
      activities[day] = { 
        content: 'Work', 
        category: 'Work' 
      };
    }
    // Meal times
    else if (
      (timeValue >= 7 && timeValue < 8) || 
      (timeValue >= 12 && timeValue < 13) || 
      (timeValue >= 18 && timeValue < 19)
    ) {
      activities[day] = { 
        content: getMealCategory(), 
        category: 'Meal' 
      };
    }
    // Evening routine (before bed)
    else if (timeValue === parseInt(preferences.bedTime.split(':')[0]) - 1) {
      activities[day] = { 
        content: 'Evening Routine', 
        category: 'Personal' 
      };
    }
    // Default empty slots
    else {
      activities[day] = { 
        content: 'Free Time', 
        category: 'Free Time' 
      };
    }

    // Weekend specific activities
    if (['Saturday', 'Sunday'].includes(day)) {
      if (timeValue >= 9 && timeValue < 17) {
        activities[day] = { 
          content: 'Weekend Activity', 
          category: 'Personal' 
        };
      }
    }
  });
  
  return activities;
};

// Main function to generate a schedule based on user preferences
export const generateSchedule = (preferences: UserPreferences): Schedule => {
  const timeSlots = generateTimeSlots(preferences.startTime, preferences.bedTime);
  const days = getDayNames(preferences.startDay);
  
  // Create schedule slots
  const slots: ScheduleSlot[] = timeSlots.map(time => ({
    time,
    activities: generateDefaultActivities(time, days, preferences)
  }));
  
  return {
    slots,
    preferences
  };
};

// Function to update a specific schedule slot
export const updateScheduleSlot = (
  schedule: Schedule,
  time: string,
  day: string,
  content: string,
  category: string
): Schedule => {
  // Create a deep copy of the schedule to avoid mutation
  const updatedSchedule: Schedule = JSON.parse(JSON.stringify(schedule));
  
  // Find the time slot to update
  const slotIndex = updatedSchedule.slots.findIndex(slot => slot.time === time);
  
  if (slotIndex !== -1) {
    // Update the activity for the specified day
    updatedSchedule.slots[slotIndex].activities[day] = {
      content,
      category
    };
  }
  
  return updatedSchedule;
};