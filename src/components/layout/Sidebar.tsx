// src/components/layout/Sidebar.tsx
// Navigation sidebar with modern design and student-focused features
// Integrates with existing student context and schedule data

import React from 'react';
import { 
  Calendar, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Settings,
  User,
  Plus,
  Search,
  Bell,
  Target,
  BarChart3,
  GraduationCap,
  X
} from 'lucide-react';
import { Button } from '../../design-system/components/atoms/Button/Button';
import { useTheme, ThemeToggle } from '../../components/layout/ThemeProvider';
import { useScheduleContext } from '../../context/ScheduleContext';
import { useStudent } from '../../context/StudentContext';
import '../../styles/sidebar.css';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onClose: () => void;
}

// Navigation items configuration
const NAVIGATION_ITEMS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: TrendingUp,
    description: 'Dashboard and insights',
    badge: null
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: Calendar,
    description: 'Weekly schedule view',
    badge: null
  },
  {
    id: 'assignments',
    label: 'Assignments',
    icon: BookOpen,
    description: 'Track assignments and projects',
    badge: 'urgent' // Could be dynamic based on due dates
  },
  {
    id: 'courses',
    label: 'Courses',
    icon: GraduationCap,
    description: 'Course management',
    badge: null
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Productivity insights',
    badge: null
  },
  {
    id: 'goals',
    label: 'Goals',
    icon: Target,
    description: 'Academic goals and milestones',
    badge: null
  }
];

const QUICK_ACTIONS = [
  {
    id: 'add-event',
    label: 'Add Event',
    icon: Plus,
    action: 'modal:add-event'
  },
  {
    id: 'search',
    label: 'Search',
    icon: Search,
    action: 'command-palette',
    shortcut: '⌘K'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    action: 'panel:notifications',
    badge: 3 // Dynamic notification count
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onClose
}) => {
  const { isDarkMode } = useTheme();
  const { schedule } = useScheduleContext();
  const { currentStudent, stats } = useStudent();

  // Handle navigation item click
  const handleNavClick = (itemId: string) => {
    onViewChange(itemId);
  };

  // Handle quick action click
  const handleQuickAction = (action: string, itemId: string) => {
    switch (action) {
      case 'modal:add-event':
        // Trigger add event modal
        console.log('Opening add event modal');
        break;
      case 'command-palette':
        // Trigger command palette
        document.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'k',
          metaKey: true
        }));
        break;
      case 'panel:notifications':
        // Open notifications panel
        console.log('Opening notifications panel');
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  // Calculate urgent assignments count
  const urgentCount = React.useMemo(() => {
    // This would integrate with your existing assignment data
    // For now, return a mock count
    return 2;
  }, []);

  // Student profile section
  const renderStudentProfile = () => (
    <div className="sidebar-profile">
      <div className="profile-avatar">
        <User size={20} />
      </div>
      <div className="profile-info">
        <h3 className="profile-name">
          {currentStudent?.personalInfo?.name || 'Student'}
        </h3>
        <p className="profile-detail">
          {currentStudent?.academic?.currentSemester || 'Fall 2024'}
        </p>
        {currentStudent?.personalInfo?.gpa && (
          <p className="profile-gpa">
            GPA: {currentStudent.personalInfo.gpa.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );

  // Navigation items section
  const renderNavigation = () => (
    <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
      <ul className="nav-list">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const badgeCount = item.id === 'assignments' ? urgentCount : null;
          
          return (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${isActive ? 'nav-link--active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                title={item.description}
              >
                <div className="nav-icon">
                  <Icon size={20} />
                </div>
                <div className="nav-content">
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-description">{item.description}</span>
                </div>
                {badgeCount && badgeCount > 0 && (
                  <span className="nav-badge" aria-label={`${badgeCount} urgent items`}>
                    {badgeCount}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  // Quick actions section
  const renderQuickActions = () => (
    <div className="sidebar-actions">
      <h4 className="actions-title">Quick Actions</h4>
      <div className="actions-list">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          const badgeCount = action.id === 'notifications' ? action.badge : null;
          
          return (
            <button
              key={action.id}
              className="action-button"
              onClick={() => handleQuickAction(action.action, action.id)}
              title={action.label}
            >
              <div className="action-icon">
                <Icon size={18} />
                {badgeCount && badgeCount > 0 && (
                  <span className="action-badge" aria-label={`${badgeCount} notifications`}>
                    {badgeCount}
                  </span>
                )}
              </div>
              <span className="action-label">{action.label}</span>
              {action.shortcut && (
                <span className="action-shortcut">{action.shortcut}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Weekly summary section
  const renderWeeklySummary = () => (
    <div className="sidebar-summary">
      <h4 className="summary-title">This Week</h4>
      <div className="summary-stats">
        <div className="stat-item">
          <div className="stat-icon">
            <Clock size={16} />
          </div>
          <div className="stat-content">
            <span className="stat-value">32</span>
            <span className="stat-label">Class Hours</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">
            <BookOpen size={16} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{urgentCount}</span>
            <span className="stat-label">Due Soon</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">
            <Target size={16} />
          </div>
          <div className="stat-content">
            <span className="stat-value">85%</span>
            <span className="stat-label">On Track</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Settings section
  const renderSettings = () => (
    <div className="sidebar-settings">
      <div className="settings-item">
        <ThemeToggle size="sm" showLabel />
      </div>
      <button
        className="settings-button"
        onClick={() => handleNavClick('settings')}
        title="Open settings"
      >
        <Settings size={18} />
        <span>Settings</span>
      </button>
    </div>
  );

  return (
    <div className="sidebar">
      {/* Close button for mobile */}
      <button
        className="sidebar-close"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        <X size={20} />
      </button>

      {/* Sidebar header with logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Calendar size={24} />
          </div>
          <span className="logo-text">StudyFlow</span>
        </div>
      </div>

      {/* Sidebar content */}
      <div className="sidebar-content">
        {/* Student profile */}
        {renderStudentProfile()}

        {/* Main navigation */}
        {renderNavigation()}

        {/* Quick actions */}
        {renderQuickActions()}

        {/* Weekly summary */}
        {renderWeeklySummary()}
      </div>

      {/* Sidebar footer */}
      <div className="sidebar-footer">
        {renderSettings()}
      </div>
    </div>
  );
};

export default Sidebar;