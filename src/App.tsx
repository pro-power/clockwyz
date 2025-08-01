// src/App.tsx
import React, { useState } from 'react';
import { ScheduleProvider } from './context/ScheduleContext';
import { StudentProvider } from './context/StudentContext';
import { ThemeProvider } from './components/layout/ThemeProvider';
import { AppLayout, LayoutUtils } from './components/layout/AppLayout';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import ProductivityDashboard from './components/dashboard/ProductivityDashboard';
import CommandPalette from './components/ui/CommandPalette';
import EnhancedScheduleGrid from './components/schedule/EnhancedScheduleGrid';
import Questionnaire from './components/Questionnaire';
import { UserPreferences, DEFAULT_STUDENT_PREFERENCES } from './models/UserPreferencesModel';
import { generateSchedule } from './utils/scheduleGenerator';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import './styles/globals.css';

interface QuickPreferences {
  userType: 'student' | 'working-student' | 'professional';
  weekStart: 'sunday' | 'monday' | 'tuesday';
  schedulePattern: 'early' | 'standard' | 'night' | 'custom';
}

interface AppState {
  isOnboardingComplete: boolean;
  showDetailedConfig: boolean;
  showCommandPalette: boolean;
  currentView: string;
  quickPreferences: QuickPreferences | null;
  fullPreferences: UserPreferences | null;
  generatedSchedule: any;
}

const AppContent: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    const savedPrefs = localStorage.getItem('clockwyz-preferences');
    const savedOnboarding = localStorage.getItem('clockwyz-onboarding-complete');
    return {
      isOnboardingComplete: savedOnboarding === 'true',
      showDetailedConfig: false,
      showCommandPalette: false,
      currentView: 'overview',
      quickPreferences: savedPrefs ? JSON.parse(savedPrefs).quick : null,
      fullPreferences: savedPrefs ? JSON.parse(savedPrefs).full : null,
      generatedSchedule: null,
    };
  });

  useKeyboardShortcuts({
    onCommandPalette: () => setAppState(prev => ({ ...prev, showCommandPalette: !prev.showCommandPalette })),
    onQuickAdd: () => console.log('Quick add triggered'),
    onFocusMode: () => console.log('Focus mode triggered'),
    onSearch: () => setAppState(prev => ({ ...prev, showCommandPalette: true })),
    onSettings: () => handleShowDetailedConfig(),
  });

  const handleOnboardingComplete = (quickPrefs: QuickPreferences) => {
    const fullPrefs: UserPreferences = {
      ...DEFAULT_STUDENT_PREFERENCES,
      startDay: quickPrefs.weekStart === 'sunday' ? 'Sunday' : quickPrefs.weekStart === 'tuesday' ? 'Tuesday' : 'Monday',
      startTime: quickPrefs.schedulePattern === 'early' ? '06:00' : quickPrefs.schedulePattern === 'night' ? '10:00' : '08:00',
      workScheduleConstant: quickPrefs.userType !== 'student',
      workStartTime: '09:00',
      workEndTime: quickPrefs.userType === 'professional' ? '18:00' : '17:00',
      workDays: quickPrefs.userType === 'student' ? [] : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      academic: {
        ...DEFAULT_STUDENT_PREFERENCES.academic,
        studentId: `clockwyz-user-${Date.now()}`,
        studyTimePreference: quickPrefs.schedulePattern === 'early' ? 'morning' : quickPrefs.schedulePattern === 'night' ? 'evening' : 'afternoon',
      },
    };

    const schedule = generateSchedule(fullPrefs);

    setAppState({
      ...appState,
      isOnboardingComplete: true,
      quickPreferences: quickPrefs,
      fullPreferences: fullPrefs,
      generatedSchedule: schedule,
    });

    localStorage.setItem('clockwyz-onboarding-complete', 'true');
    localStorage.setItem('clockwyz-preferences', JSON.stringify({ quick: quickPrefs, full: fullPrefs }));
  };

  const handleDetailedPreferencesComplete = (detailedPrefs: UserPreferences) => {
    const updatedPrefs = { ...appState.fullPreferences, ...detailedPrefs };
    const newSchedule = generateSchedule(updatedPrefs);
    setAppState(prev => ({
      ...prev,
      fullPreferences: updatedPrefs,
      generatedSchedule: newSchedule,
      showDetailedConfig: false,
    }));
    localStorage.setItem('clockwyz-preferences', JSON.stringify({
      quick: appState.quickPreferences,
      full: updatedPrefs,
    }));
  };

  const handleViewChange = (view: string) => setAppState(prev => ({ ...prev, currentView: view }));
  const handleShowDetailedConfig = () => setAppState(prev => ({ ...prev, showDetailedConfig: true }));
  const handleScheduleUpdate = (schedule: any) => setAppState(prev => ({ ...prev, generatedSchedule: schedule }));
  const handleCloseCommandPalette = () => setAppState(prev => ({ ...prev, showCommandPalette: false }));

  const renderCurrentView = () => {
    if (!appState.isOnboardingComplete) {
      return <OnboardingFlow onComplete={handleOnboardingComplete} />;
    }

    if (appState.showDetailedConfig) {
      return (
        <LayoutUtils.ContentWrapper>
          <LayoutUtils.PageHeader title="Advanced Configuration" subtitle="Fine-tune your schedule preferences" />
          <Questionnaire onComplete={handleDetailedPreferencesComplete} />
        </LayoutUtils.ContentWrapper>
      );
    }

    switch (appState.currentView) {
      case 'overview':
        return (
          <ProductivityDashboard
            preferences={appState.quickPreferences!}
            onNavigate={handleViewChange}
            onOpenCommandPalette={() => setAppState(prev => ({ ...prev, showCommandPalette: true }))}
          />
        );
        case 'schedule':
          return (
            <LayoutUtils.ContentWrapper>
              <EnhancedScheduleGrid />
            </LayoutUtils.ContentWrapper>
          );
      case 'assignments':
      case 'courses':
      case 'analytics':
      case 'goals':
        const titles: Record<string, string> = {
          assignments: 'Assignment Tracker',
          courses: 'Course Management',
          analytics: 'Analytics Dashboard',
          goals: 'Academic Goals',
        };
        const subtitles: Record<string, string> = {
          assignments: 'Manage your academic workload',
          courses: 'Track your academic progress',
          analytics: 'Insights into your productivity',
          goals: 'Set and track your objectives',
        };
        const buttonText: Record<string, string> = {
          assignments: 'Configure Advanced Settings',
          courses: 'Configure Academic Settings',
          analytics: 'View Detailed Settings',
          goals: 'Configure Goal Settings',
        };
        return (
          <LayoutUtils.ContentWrapper>
            <LayoutUtils.PageHeader title={titles[appState.currentView]} subtitle={subtitles[appState.currentView]} />
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">{titles[appState.currentView]} coming soon...</div>
              <button
                onClick={handleShowDetailedConfig}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                {buttonText[appState.currentView]}
              </button>
            </div>
          </LayoutUtils.ContentWrapper>
        );
      default:
        return (
          <ProductivityDashboard
            preferences={appState.quickPreferences!}
            onNavigate={handleViewChange}
            onOpenCommandPalette={() => setAppState(prev => ({ ...prev, showCommandPalette: true }))}
          />
        );
    }
  };

  return (
    <div className="app">
      {appState.showCommandPalette && <CommandPalette onClose={handleCloseCommandPalette} isOpen={false} />}
      {appState.isOnboardingComplete && !appState.showDetailedConfig ? (
        <AppLayout currentView={appState.currentView} onViewChange={handleViewChange}>
          {renderCurrentView()}
        </AppLayout>
      ) : (
        renderCurrentView()
      )}
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <StudentProvider>
      <ScheduleProvider>
        <AppContent />
      </ScheduleProvider>
    </StudentProvider>
  </ThemeProvider>
);

export default App;
