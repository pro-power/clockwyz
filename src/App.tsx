// App.tsx
import React from 'react';
import { ScheduleProvider, useScheduleContext } from './context/ScheduleContext';
import Questionnaire from './components/Questionnaire';
import ScheduleGrid from './components/ScheduleGrid';
import { UserPreferences } from './models/UserPreferencesModel';
import './styles/App.css';

// Create a wrapper component to access context
const AppContent: React.FC = () => {
  const [isQuestionnaireDone, setIsQuestionnaireDone] = React.useState(false);
  const { updatePreferences } = useScheduleContext();

  const handleQuestionnaireComplete = (preferences: UserPreferences) => {
    // Update the context with preferences (this will also generate a schedule)
    updatePreferences(preferences);
    setIsQuestionnaireDone(true);
  };

  return (
    <div className="app-container">
      <header>
        <h1>My Schedule Planner</h1>
      </header>
      
      <main>
        {!isQuestionnaireDone ? (
          <Questionnaire onComplete={handleQuestionnaireComplete} />
        ) : (
          <ScheduleGrid />
        )}
      </main>
      
      <footer>
        <p>© 2024 Dynamic Schedule Planner</p>
      </footer>
    </div>
  );
};

// Main App component that provides context
const App: React.FC = () => {
  return (
    <ScheduleProvider>
      <AppContent />
    </ScheduleProvider>
  );
};

export default App;