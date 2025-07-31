// src/components/Questionnaire.tsx
// Fixed questionnaire component with proper UserPreferences construction
// Resolves all TypeScript errors and creates valid preference objects

import React, { useState } from 'react';
import { UserPreferences, DEFAULT_CATEGORIES, DEFAULT_COLOR_PALETTE, DEFAULT_STUDENT_PREFERENCES } from '../models/UserPreferencesModel';
import AnimatedQuestion from './AnimatedQuestion';
import ColorPicker from './ColorPicker';
import '../styles/AnimatedQuestion.css';
import '../styles/WorkDaySelector.css';

interface QuestionnaireProps {
  onComplete: (preferences: UserPreferences) => void;
}

interface QuestionStep {
  question: string;
  type: 'select' | 'time' | 'number' | 'boolean' | 'color-picker' | 'work-days';
  field: string;
  options?: string[];
  min?: number;
  max?: number;
}

interface WorkDayConfig {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

// Simplified preferences interface for questionnaire data collection
interface QuestionnairePreferences {
  startDay: string;
  startTime: string;
  desiredSleepHours: number;
  bedTime: string;
  workScheduleConstant: boolean;
  workStartTime: string;
  workEndTime: string;
  workDays: string[];
  categoryColors: Array<{
    category: string;
    color: string;
  }>;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<Partial<QuestionnairePreferences>>({
    startDay: 'Monday',
    startTime: '08:00',
    desiredSleepHours: 8,
    bedTime: '22:00',
    workScheduleConstant: true,
    workStartTime: '09:00',
    workEndTime: '17:00',
    workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    categoryColors: DEFAULT_CATEGORIES.map((category, index) => ({
      category,
      color: DEFAULT_COLOR_PALETTE[index % DEFAULT_COLOR_PALETTE.length]
    }))
  });

  // For improved work day selection
  const [workDayConfigs, setWorkDayConfigs] = useState<{[key: string]: WorkDayConfig}>({
    Monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    Tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    Wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    Thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    Friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    Saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    Sunday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  });

  // Track the selected day for work schedule configuration
  const [selectedWorkDay, setSelectedWorkDay] = useState<string | null>('Monday');

  const steps: QuestionStep[] = [
    {
      question: "Which day would you like your week to start?",
      type: 'select',
      options: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      field: 'startDay'
    },
    {
      question: "What time would you like to start your day?",
      type: 'time',
      field: 'startTime'
    },
    {
      question: "How many hours of sleep do you need?",
      type: 'number',
      field: 'desiredSleepHours',
      min: 4,
      max: 12
    },
    {
      question: "What time do you want to go to bed?",
      type: 'time',
      field: 'bedTime'
    },
    {
      question: "Select your work days and schedule",
      type: 'work-days',
      field: 'workDays'
    },
    {
      question: "Choose colors for your activity categories",
      type: 'color-picker',
      field: 'categoryColors'
    }
  ];

  const handleAnswer = (value: any, field?: string) => {
    const currentField = field || steps[currentStep].field;
    
    // Special handling for workDays
    if (currentField === 'workDays') {
      // This will be handled by the work days selector component
      return;
    }
    
    // Special handling for color picker
    if (currentField === 'categoryColors') {
      setPreferences(prev => ({
        ...prev,
        categoryColors: value
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [currentField]: value
      }));
    }

    // Move to next step (except for work days which has its own continue button)
    if (currentField !== 'workDays' && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep >= steps.length - 1) {
      completeQuestionnaire();
    }
  };

  const handleContinue = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeQuestionnaire();
    }
  };

  const completeQuestionnaire = () => {
    // For work days, we need to convert our detailed config to the simpler format expected by the schedule generator
    const enabledWorkDays = Object.entries(workDayConfigs)
      .filter(([_, config]) => config.enabled)
      .map(([day]) => day);

    // We'll use the first enabled day's times as the common work times (since the original model only supports one start/end time)
    let workStartTime = '09:00';
    let workEndTime = '17:00';
    
    for (const day of enabledWorkDays) {
      if (workDayConfigs[day].enabled) {
        workStartTime = workDayConfigs[day].startTime;
        workEndTime = workDayConfigs[day].endTime;
        break;
      }
    }

    // Create a complete UserPreferences object by merging with defaults
    const completePreferences: UserPreferences = {
      ...DEFAULT_STUDENT_PREFERENCES, // Start with all defaults
      
      // Override with questionnaire data
      startDay: preferences.startDay || 'Monday',
      startTime: preferences.startTime || '08:00',
      desiredSleepHours: preferences.desiredSleepHours || 8,
      bedTime: preferences.bedTime || '22:00',
      workScheduleConstant: true,
      workStartTime: workStartTime,
      workEndTime: workEndTime,
      workDays: enabledWorkDays,
      categoryColors: (preferences.categoryColors || DEFAULT_CATEGORIES.map((category, index) => ({
        category,
        color: DEFAULT_COLOR_PALETTE[index % DEFAULT_COLOR_PALETTE.length]
      }))).map((item, index) => ({
        category: item.category,
        color: item.color,
        icon: undefined,
        description: undefined,
        isDefault: true,
        priority: index
      })),
      
      // Update the academic preferences with correct values
      academic: {
        ...DEFAULT_STUDENT_PREFERENCES.academic,
        preferredCourseLoad: 'moderate' as const, // Fix: use valid enum value
        earlyClassThreshold: '08:00',
        lateClassThreshold: '18:00',
        assignmentBuffer: 2,
        examPrepTime: 7,
        trackGrades: true
      },
      
      // Update study preferences - FIXED: Remove invalid properties
      study: {
        ...DEFAULT_STUDENT_PREFERENCES.study,
        // REMOVED: optimalStudyDuration (doesn't exist in StudyPreferences)
        // REMOVED: breakFrequency (doesn't exist in StudyPreferences)
        // REMOVED: breakDuration (doesn't exist in StudyPreferences)
        // REMOVED: spacedStudyPreference (doesn't exist in StudyPreferences)
        // REMOVED: intensiveStudyPreference (doesn't exist in StudyPreferences)
        
        // Use valid properties from StudyPreferences interface:
        focusSessionLength: 25,
        pomodoroWorkTime: 25,
        pomodoroBreakTime: 5,
        spacedRepetitionUse: true,
        pomodoroPreference: true
      },
      
      // Update wellness preferences - FIXED: Remove invalid properties
      wellness: {
        ...DEFAULT_STUDENT_PREFERENCES.wellness,
        // REMOVED: exerciseTimePreference (doesn't exist - correct name is exerciseTimePreference in the interface)
        // REMOVED: sleepQualityPriority (doesn't exist in WellnessPreferences)
        // REMOVED: stressManagementInterest (doesn't exist in WellnessPreferences)
        // REMOVED: mentalHealthAwareness (doesn't exist in WellnessPreferences)
        
        // Use valid properties:
        exerciseTimePreference: 'morning' as const,
        mindfulnessPractice: true,
        mentalHealthResources: true
      },
      
      // Update social preferences - FIXED: Remove invalid properties
      social: {
        ...DEFAULT_STUDENT_PREFERENCES.social,
        // REMOVED: culturalEventInterest (use correct boolean type)
        // REMOVED: studyGroupPreference (doesn't exist in SocialPreferences)
        // REMOVED: collaborationComfort (doesn't exist in SocialPreferences)
        // REMOVED: networkingInterest (doesn't exist in SocialPreferences)
        
        // Use valid properties:
        culturalEventInterest: true,
        studyGroupParticipation: true,
        networkingImportance: 3
      },
      
      // Update productivity preferences - FIXED: Remove invalid properties
      productivity: {
        ...DEFAULT_STUDENT_PREFERENCES.productivity,
        // REMOVED: automationInterest (use correct boolean type)
        // REMOVED: goalSettingApproach (doesn't exist in ProductivityPreferences)
        // REMOVED: progressTrackingPreference (doesn't exist - correct name is progressTrackingMethod)
        // REMOVED: notificationManagement (use valid enum value)
        // REMOVED: focusOptimization (doesn't exist in ProductivityPreferences)
        
        // Use valid properties:
        automationInterest: true,
        goalSettingFrequency: 'weekly' as const,
        progressTrackingMethod: 'automated' as const,
        notificationManagement: 'moderate' as const
      },
      
      // Update accessibility preferences - FIXED: Remove invalid properties
      accessibility: {
        ...DEFAULT_STUDENT_PREFERENCES.accessibility,
        // REMOVED: accommodationDocumentation (use correct boolean type)
        // REMOVED: screenReader (doesn't exist - correct name is screenReaderCompatible)
        
        // Use valid properties:
        accommodationDocumentation: false,
        screenReaderCompatible: false,
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        keyboardNavigation: false,
        colorBlindFriendly: false,
        customAccommodations: []
      },
      
      // Update integrations - FIXED: Use correct structure
      integrations: {
        ...DEFAULT_STUDENT_PREFERENCES.integrations,
        // REMOVED: lms (doesn't exist as a direct property)
        // The integrations interface has specific named integrations like canvas, blackboard, etc.
        
        // Use existing integration structure from defaults
        canvas: {
          enabled: false,
          authenticated: false,
          syncFrequency: 'daily' as const,
          dataTypes: ['courses', 'assignments'],
          conflictResolution: 'remote_wins' as const,
          notifications: true,
          errorCount: 0,
          settings: {}
        },
        googleDrive: {
          enabled: false,
          authenticated: false,
          syncFrequency: 'manual' as const,
          dataTypes: ['files'],
          conflictResolution: 'manual' as const,
          notifications: false,
          errorCount: 0,
          settings: {}
        }
      },
      
      // Ensure required metadata properties
      profileVersion: '1.0.0',
      lastUpdated: new Date(),
      onboardingCompleted: true,
      customizations: []
    };
    
    onComplete(completePreferences);
  };

  const handleWorkDayToggle = (day: string) => {
    setWorkDayConfigs(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled
      }
    }));
    
    // If toggling the day on, select it
    if (!workDayConfigs[day].enabled) {
      setSelectedWorkDay(day);
    } else if (selectedWorkDay === day) {
      // If toggling off the selected day, find another day that's enabled
      const nextEnabledDay = Object.entries(workDayConfigs)
        .filter(([d, config]) => d !== day && config.enabled)
        .map(([d]) => d)[0] || null;
      setSelectedWorkDay(nextEnabledDay);
    }
  };

  const handleWorkTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setWorkDayConfigs(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const renderCurrentQuestion = () => {
    const step = steps[currentStep];

    switch(step.type) {
      case 'select':
        return (
          <AnimatedQuestion>
            <h2>{step.question}</h2>
            <div className="day-selector-grid">
              {step.options && step.options.map(option => (
                <button 
                  key={option} 
                  onClick={() => handleAnswer(option)}
                  className={preferences[step.field as keyof QuestionnairePreferences] === option ? 'day-button selected' : 'day-button'}
                >
                  {option.substring(0, 3)}
                </button>
              ))}
            </div>
          </AnimatedQuestion>
        );
      
      case 'time':
        return (
          <AnimatedQuestion>
            <h2>{step.question}</h2>
            <div className="time-selector">
              <input 
                type="time" 
                value={preferences[step.field as keyof QuestionnairePreferences] as string || ''}
                onChange={(e) => {
                  setPreferences(prev => ({
                    ...prev,
                    [step.field]: e.target.value
                  }));
                }}
              />
              <button onClick={() => handleAnswer(preferences[step.field as keyof QuestionnairePreferences] || '08:00')}>
                Continue
              </button>
            </div>
          </AnimatedQuestion>
        );
      
      case 'number':
        return (
          <AnimatedQuestion>
            <h2>{step.question}</h2>
            <div className="number-selector">
              <div className="slider-container">
                <input 
                  type="range" 
                  min={step.min} 
                  max={step.max}
                  value={preferences[step.field as keyof QuestionnairePreferences] as number || 8}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setPreferences(prev => ({
                      ...prev,
                      [step.field]: value
                    }));
                  }}
                  className="slider"
                />
                <div className="slider-value">
                  {preferences[step.field as keyof QuestionnairePreferences] as number || 8} hours
                </div>
              </div>
              <button onClick={() => handleAnswer(preferences[step.field as keyof QuestionnairePreferences] || 8)}>
                Continue
              </button>
            </div>
          </AnimatedQuestion>
        );
      
      case 'boolean':
        return (
          <AnimatedQuestion>
            <h2>{step.question}</h2>
            <div className="boolean-selector">
              <button 
                onClick={() => handleAnswer(true)}
                className={preferences[step.field as keyof QuestionnairePreferences] === true ? 'selected' : ''}
              >
                Yes
              </button>
              <button 
                onClick={() => handleAnswer(false)}
                className={preferences[step.field as keyof QuestionnairePreferences] === false ? 'selected' : ''}
              >
                No
              </button>
            </div>
          </AnimatedQuestion>
        );
      
      case 'work-days':
        return (
          <AnimatedQuestion>
            <h2>{step.question}</h2>
            <div className="work-day-container">
              <div className="work-day-grid">
                {Object.entries(workDayConfigs).map(([day, config]) => (
                  <div key={day} className={`work-day-item ${config.enabled ? 'enabled' : 'disabled'}`}>
                    <div className="work-day-header">
                      <input
                        type="checkbox"
                        id={`work-${day}`}
                        checked={config.enabled}
                        onChange={() => handleWorkDayToggle(day)}
                      />
                      <label htmlFor={`work-${day}`}>{day}</label>
                    </div>
                    {config.enabled && (
                      <button
                        className={`day-time-button ${selectedWorkDay === day ? 'selected' : ''}`}
                        onClick={() => setSelectedWorkDay(day)}
                      >
                        {config.startTime} - {config.endTime}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="work-time-selector">
                {selectedWorkDay && workDayConfigs[selectedWorkDay].enabled && (
                  <div className="work-time-config">
                    <h3>Configure {selectedWorkDay}</h3>
                    <div className="time-inputs">
                      <div className="time-input-group">
                        <label>Start Time</label>
                        <input 
                          type="time" 
                          value={workDayConfigs[selectedWorkDay].startTime}
                          onChange={(e) => handleWorkTimeChange(selectedWorkDay, 'startTime', e.target.value)}
                        />
                      </div>
                      <div className="time-input-group">
                        <label>End Time</label>
                        <input 
                          type="time" 
                          value={workDayConfigs[selectedWorkDay].endTime}
                          onChange={(e) => handleWorkTimeChange(selectedWorkDay, 'endTime', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="time-display">
                      <div className="time-display-label">Working Hours:</div>
                      <div className="time-display-value">
                        {workDayConfigs[selectedWorkDay].startTime} - {workDayConfigs[selectedWorkDay].endTime}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <button onClick={handleContinue} className="continue-button">
                Continue
              </button>
            </div>
          </AnimatedQuestion>
        );
      
      case 'color-picker':
        return (
          <AnimatedQuestion>
            <h2>{step.question}</h2>
            <ColorPicker 
              categories={DEFAULT_CATEGORIES}
              defaultColors={DEFAULT_COLOR_PALETTE}
              onComplete={handleAnswer}
            />
          </AnimatedQuestion>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="questionnaire-container">
      <div className="progress-indicator">
        <div className="progress-bar">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
        <div className="progress-text">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>
      {renderCurrentQuestion()}
    </div>
  );
};

export default Questionnaire;