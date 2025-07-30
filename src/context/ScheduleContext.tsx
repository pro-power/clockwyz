// ScheduleContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserPreferences } from '../models/UserPreferencesModel';
import { generateSchedule } from '../utils/scheduleGenerator';
import { ScheduleData } from '../models/ScheduleModel';
import { optimizeSchedule, suggestActivities } from '../utils/scheduleEfficiency';

interface ScheduleContextType {
  schedule: ScheduleData | null;
  userPreferences: UserPreferences | null;
  updatePreferences: (preferences: UserPreferences) => void;
  updateScheduleSlot: (time: string, day: string, content: string, category: string) => void;
  optimizeCurrentSchedule: () => void;
  suggestActivitiesForFreeTime: () => void;
  bulkUpdateEvents: (events: Array<{time: string, day: string, content: string, category: string}>) => void;
  isOptimizing: boolean;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const useScheduleContext = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useScheduleContext must be used within a ScheduleProvider');
  }
  return context;
};

interface ScheduleProviderProps {
  children: ReactNode;
}

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({ children }) => {
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  const updatePreferences = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    
    // Generate a new schedule based on preferences
    const newSchedule = generateSchedule(preferences);
    setSchedule(newSchedule);
  };

  const updateScheduleSlot = (time: string, day: string, content: string, category: string) => {
    if (!schedule) return;

    const updatedSchedule = { ...schedule };
    const slotIndex = updatedSchedule.slots.findIndex(slot => slot.time === time);
    
    if (slotIndex !== -1) {
      updatedSchedule.slots[slotIndex].activities[day] = {
        content,
        category
      };
      setSchedule(updatedSchedule);
    }
  };

  // Bulk update multiple events at once
  const bulkUpdateEvents = (events: Array<{time: string, day: string, content: string, category: string}>) => {
    if (!schedule) return;

    const updatedSchedule = { ...schedule };
    
    events.forEach(event => {
      const slotIndex = updatedSchedule.slots.findIndex(slot => slot.time === event.time);
      
      if (slotIndex !== -1) {
        updatedSchedule.slots[slotIndex].activities[event.day] = {
          content: event.content,
          category: event.category
        };
      }
    });
    
    setSchedule(updatedSchedule);
  };

  // Apply optimization algorithms to the current schedule
  const optimizeCurrentSchedule = () => {
    if (!schedule || !userPreferences) return;
    
    setIsOptimizing(true);
    
    // Use a timeout to allow UI to update and show the optimizing state
    setTimeout(() => {
      try {
        const optimizedSchedule = optimizeSchedule(schedule, userPreferences);
        setSchedule(optimizedSchedule);
      } catch (error) {
        console.error('Error optimizing schedule:', error);
      } finally {
        setIsOptimizing(false);
      }
    }, 100);
  };

  // Suggest activities for free time slots
  const suggestActivitiesForFreeTime = () => {
    if (!schedule || !userPreferences) return;
    
    setIsOptimizing(true);
    
    setTimeout(() => {
      try {
        const suggestedSchedule = suggestActivities(schedule, userPreferences);
        setSchedule(suggestedSchedule);
      } catch (error) {
        console.error('Error suggesting activities:', error);
      } finally {
        setIsOptimizing(false);
      }
    }, 100);
  };

  const value = {
    schedule,
    userPreferences,
    updatePreferences,
    updateScheduleSlot,
    optimizeCurrentSchedule,
    suggestActivitiesForFreeTime,
    bulkUpdateEvents,
    isOptimizing
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};