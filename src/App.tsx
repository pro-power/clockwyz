// src/App.tsx
// Updated main app component integrating new layout system
// Wraps existing functionality with modern UI components

import React, { useState } from 'react';
import { ScheduleProvider } from './context/ScheduleContext';
import { StudentProvider } from './context/StudentContext';
import { ThemeProvider } from './components/layout/ThemeProvider';
import { AppLayout, LayoutUtils } from './components/layout/AppLayout';
import ScheduleGrid from './components/ScheduleGrid';
import Questionnaire from './components/Questionnaire';
import { UserPreferences } from './models/UserPreferencesModel';

// Import global styles
import './styles/globals.css';

const AppContent: React.FC = () => {
  const [isQuestionnaireDone, setIsQuestionnaireDone] = useState(false);
  const [currentView, setCurrentView] = useState('overview');

  const handleQuestionnaireComplete = (preferences: UserPreferences) => {
    // Update preferences and mark questionnaire as complete
    setIsQuestionnaireDone(true);
    console.log('Preferences saved:', preferences);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  // Render different views based on current selection
  const renderCurrentView = () => {
    if (!isQuestionnaireDone) {
      return (
        <LayoutUtils.ContentWrapper>
          <LayoutUtils.PageHeader 
            title="Welcome to StudyFlow"
            subtitle="Let's set up your personalized schedule"
          />
          <Questionnaire onComplete={handleQuestionnaireComplete} />
        </LayoutUtils.ContentWrapper>
      );
    }

    switch (currentView) {
      case 'overview':
        return (
          <LayoutUtils.ContentWrapper>
            <LayoutUtils.PageHeader 
              title="Overview"
              subtitle="Your daily dashboard and insights"
            />
            <LayoutUtils.Section title="Today's Schedule">
              <p>Dashboard content coming soon...</p>
            </LayoutUtils.Section>
            <LayoutUtils.Section title="Upcoming Assignments">
              <p>Assignment overview coming soon...</p>
            </LayoutUtils.Section>
          </LayoutUtils.ContentWrapper>
        );

      case 'schedule':
        return (
          <LayoutUtils.ContentWrapper>
            <LayoutUtils.PageHeader 
              title="Schedule"
              subtitle="Manage your weekly schedule"
            />
            <LayoutUtils.Section>
              <ScheduleGrid />
            </LayoutUtils.Section>
          </LayoutUtils.ContentWrapper>
        );

      case 'assignments':
        return (
          <LayoutUtils.ContentWrapper>
            <LayoutUtils.PageHeader 
              title="Assignments"
              subtitle="Track your assignments and deadlines"
            />
            <LayoutUtils.Section>
              <p>Assignment management interface coming soon...</p>
            </LayoutUtils.Section>
          </LayoutUtils.ContentWrapper>
        );

      case 'courses':
        return (
          <LayoutUtils.ContentWrapper>
            <LayoutUtils.PageHeader 
              title="Courses"
              subtitle="Manage your enrolled courses"
            />
            <LayoutUtils.Section>
              <p>Course management interface coming soon...</p>
            </LayoutUtils.Section>
          </LayoutUtils.ContentWrapper>
        );

      case 'analytics':
        return (
          <LayoutUtils.ContentWrapper>
            <LayoutUtils.PageHeader 
              title="Analytics"
              subtitle="Insights into your productivity and study patterns"
            />
            <LayoutUtils.Section>
              <p>Analytics dashboard coming soon...</p>
            </LayoutUtils.Section>
          </LayoutUtils.ContentWrapper>
        );

      case 'goals':
        return (
          <LayoutUtils.ContentWrapper>
            <LayoutUtils.PageHeader 
              title="Goals"
              subtitle="Track your academic goals and milestones"
            />
            <LayoutUtils.Section>
              <p>Goal tracking interface coming soon...</p>
            </LayoutUtils.Section>
          </LayoutUtils.ContentWrapper>
        );

      case 'settings':
        return (
          <LayoutUtils.ContentWrapper>
            <LayoutUtils.PageHeader 
              title="Settings"
              subtitle="Customize your StudyFlow experience"
            />
            <LayoutUtils.Section>
              <p>Settings interface coming soon...</p>
            </LayoutUtils.Section>
          </LayoutUtils.ContentWrapper>
        );

      default:
        return (
          <LayoutUtils.ContentWrapper>
            <LayoutUtils.PageHeader 
              title="Page Not Found"
              subtitle="The requested page could not be found"
            />
          </LayoutUtils.ContentWrapper>
        );
    }
  };

  return (
    <AppLayout currentView={currentView} onViewChange={handleViewChange}>
      {renderCurrentView()}
    </AppLayout>
  );
};

// Main App component with all providers
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <StudentProvider>
        <ScheduleProvider>
          <AppContent />
        </ScheduleProvider>
      </StudentProvider>
    </ThemeProvider>
  );
};

export default App;