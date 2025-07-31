import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, Plus, Search, Settings, Moon, Sun, Zap, TrendingUp } from 'lucide-react';

// Mock data representing your existing models
const mockStudent = {
  name: 'Alex Chen',
  semester: 'Fall 2024',
  gpa: 3.7
};

const mockCourses = [
  { id: 'cs301', code: 'CS 301', name: 'Data Structures', credits: 3, color: '#3b82f6' },
  { id: 'math241', code: 'MATH 241', name: 'Calculus III', credits: 4, color: '#8b5cf6' },
  { id: 'eng102', code: 'ENG 102', name: 'Technical Writing', credits: 3, color: '#10b981' },
  { id: 'phys201', code: 'PHYS 201', name: 'Physics II', credits: 4, color: '#f59e0b' }
];

const mockAssignments = [
  { id: 1, title: 'Binary Search Tree Implementation', course: 'CS 301', due: '2024-08-05', priority: 'high', progress: 65 },
  { id: 2, title: 'Integration Problem Set', course: 'MATH 241', due: '2024-08-07', priority: 'medium', progress: 30 },
  { id: 3, title: 'Technical Report Draft', course: 'ENG 102', due: '2024-08-10', priority: 'medium', progress: 85 },
  { id: 4, title: 'EM Waves Lab', course: 'PHYS 201', due: '2024-08-12', priority: 'low', progress: 0 }
];

const MotionSchedulePrototype = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [selectedView, setSelectedView] = useState('overview');

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // In real implementation, this would use the ThemeProvider
    document.body.className = isDarkMode ? 'theme-light' : 'theme-dark';
  };

  return (
    <div className={`app ${isDarkMode ? 'theme-dark' : 'theme-light'}`}>
      <style>{`
        /* CSS Custom Properties - normally loaded from globals.css */
        .theme-light {
          --color-bg-primary: #ffffff;
          --color-bg-secondary: #f8fafc;
          --color-bg-elevated: #ffffff;
          --color-text-primary: #0f172a;
          --color-text-secondary: #475569;
          --color-text-tertiary: #94a3b8;
          --color-border-default: #e2e8f0;
          --color-border-subtle: #f1f5f9;
          --color-primary-500: #3b82f6;
          --color-primary-600: #2563eb;
          --color-success: #10b981;
          --color-warning: #f59e0b;
          --color-error: #ef4444;
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          --shadow-default: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
          --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
          --radius-default: 4px;
          --radius-lg: 8px;
          --radius-xl: 12px;
          --spacing-2: 8px;
          --spacing-3: 12px;
          --spacing-4: 16px;
          --spacing-6: 24px;
          --spacing-8: 32px;
        }
        
        .theme-dark {
          --color-bg-primary: #0f172a;
          --color-bg-secondary: #1e293b;
          --color-bg-elevated: #334155;
          --color-text-primary: #f8fafc;
          --color-text-secondary: #cbd5e1;
          --color-text-tertiary: #64748b;
          --color-border-default: #334155;
          --color-border-subtle: #1e293b;
          --color-primary-500: #60a5fa;
          --color-primary-600: #3b82f6;
          --color-success: #10b981;
          --color-warning: #f59e0b;
          --color-error: #ef4444;
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
          --shadow-default: 0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4);
          --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4);
          --radius-default: 4px;
          --radius-lg: 8px;
          --radius-xl: 12px;
          --spacing-2: 8px;
          --spacing-3: 12px;
          --spacing-4: 16px;
          --spacing-6: 24px;
          --spacing-8: 32px;
        }

        /* Global App Styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: var(--color-bg-primary);
          color: var(--color-text-primary);
          transition: all 0.3s ease;
        }
        
        .app {
          min-height: 100vh;
          display: flex;
          background-color: var(--color-bg-primary);
        }

        /* Modern Button Component Styles */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-2);
          padding: var(--spacing-3) var(--spacing-4);
          background-color: var(--color-primary-500);
          color: white;
          border: none;
          border-radius: var(--radius-default);
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-decoration: none;
        }
        
        .btn:hover {
          background-color: var(--color-primary-600);
          transform: translateY(-1px);
          box-shadow: var(--shadow-lg);
        }
        
        .btn--secondary {
          background-color: var(--color-bg-elevated);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border-default);
        }
        
        .btn--secondary:hover {
          background-color: var(--color-bg-secondary);
          border-color: var(--color-border-default);
        }
        
        .btn--ghost {
          background-color: transparent;
          color: var(--color-text-secondary);
        }
        
        .btn--ghost:hover {
          background-color: var(--color-bg-secondary);
          color: var(--color-text-primary);
        }
        
        .btn--sm {
          padding: var(--spacing-2) var(--spacing-3);
          font-size: 13px;
        }

        /* Modern Card Component */
        .card {
          background-color: var(--color-bg-elevated);
          border-radius: var(--radius-lg);
          padding: var(--spacing-6);
          box-shadow: var(--shadow-default);
          border: 1px solid var(--color-border-subtle);
          transition: all 0.25s ease;
        }
        
        .card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-1px);
        }

        /* Sidebar Styles */
        .sidebar {
          width: 280px;
          background-color: var(--color-bg-elevated);
          border-right: 1px solid var(--color-border-subtle);
          padding: var(--spacing-6);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-6);
        }
        
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .sidebar-logo {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-primary-500);
        }
        
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-2);
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
          padding: var(--spacing-3);
          border-radius: var(--radius-default);
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        
        .nav-item:hover,
        .nav-item--active {
          background-color: var(--color-bg-secondary);
          color: var(--color-text-primary);
        }
        
        .nav-item--active {
          background-color: var(--color-primary-500);
          color: white;
        }

        /* Main Content Styles */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .header {
          padding: var(--spacing-6);
          border-bottom: 1px solid var(--color-border-subtle);
          background-color: var(--color-bg-elevated);
          display: flex;
          align-items: center;
          justify-content: between;
          gap: var(--spacing-4);
        }
        
        .search-bar {
          flex: 1;
          max-width: 500px;
          position: relative;
        }
        
        .search-input {
          width: 100%;
          padding: var(--spacing-3) var(--spacing-4);
          padding-left: 40px;
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-default);
          background-color: var(--color-bg-primary);
          color: var(--color-text-primary);
          font-size: 14px;
        }
        
        .search-input:focus {
          outline: none;
          border-color: var(--color-primary-500);
          box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
        }
        
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-tertiary);
        }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
        }

        /* Content Area */
        .content {
          flex: 1;
          padding: var(--spacing-6);
          overflow-y: auto;
        }
        
        .content-header {
          margin-bottom: var(--spacing-6);
        }
        
        .content-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-2);
        }
        
        .content-subtitle {
          color: var(--color-text-secondary);
          font-size: 16px;
        }

        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: var(--spacing-6);
          margin-bottom: var(--spacing-8);
        }

        /* Assignment Card Styles */
        .assignment-card {
          padding: var(--spacing-4);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-subtle);
          background-color: var(--color-bg-elevated);
          transition: all 0.25s ease;
        }
        
        .assignment-card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-1px);
        }
        
        .assignment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-3);
        }
        
        .assignment-title {
          font-weight: 600;
          color: var(--color-text-primary);
          font-size: 16px;
          line-height: 1.4;
        }
        
        .assignment-course {
          color: var(--color-text-tertiary);
          font-size: 13px;
          margin-bottom: var(--spacing-2);
        }
        
        .priority-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .priority-high {
          background-color: #fef2f2;
          color: var(--color-error);
        }
        
        .priority-medium {
          background-color: #fffbeb;
          color: var(--color-warning);
        }
        
        .priority-low {
          background-color: #f0fdf4;
          color: var(--color-success);
        }
        
        .progress-container {
          margin-top: var(--spacing-3);
        }
        
        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--spacing-2);
          font-size: 13px;
        }
        
        .progress-bar {
          width: 100%;
          height: 6px;
          background-color: var(--color-bg-secondary);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background-color: var(--color-primary-500);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        /* Course Overview */
        .course-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--spacing-4);
        }
        
        .course-card {
          padding: var(--spacing-4);
          border-radius: var(--radius-lg);
          background-color: var(--color-bg-elevated);
          border: 1px solid var(--color-border-subtle);
          transition: all 0.25s ease;
        }
        
        .course-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
        
        .course-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
          margin-bottom: var(--spacing-3);
        }
        
        .course-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        .course-code {
          font-weight: 600;
          color: var(--color-text-primary);
        }
        
        .course-name {
          color: var(--color-text-secondary);
          font-size: 14px;
          margin-bottom: var(--spacing-2);
        }
        
        .course-credits {
          color: var(--color-text-tertiary);
          font-size: 13px;
        }

        /* Command Palette */
        .command-palette-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 120px;
        }
        
        .command-palette {
          width: 100%;
          max-width: 600px;
          background-color: var(--color-bg-elevated);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--color-border-subtle);
          overflow: hidden;
        }
        
        .command-input {
          width: 100%;
          padding: var(--spacing-4);
          border: none;
          background: transparent;
          color: var(--color-text-primary);
          font-size: 18px;
          outline: none;
        }
        
        .command-input::placeholder {
          color: var(--color-text-tertiary);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            position: fixed;
            top: 0;
            left: -100%;
            height: 100vh;
            z-index: 1000;
            transition: left 0.3s ease;
          }
          
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          .course-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Loading States */
        .skeleton {
          background: linear-gradient(
            90deg,
            var(--color-bg-secondary) 25%,
            var(--color-border-subtle) 50%,
            var(--color-bg-secondary) 75%
          );
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: var(--radius-default);
        }
        
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">📚 StudyFlow</div>
          <button className="btn btn--ghost btn--sm" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <div className="sidebar-nav">
          <div 
            className={`nav-item ${selectedView === 'overview' ? 'nav-item--active' : ''}`}
            onClick={() => setSelectedView('overview')}
          >
            <TrendingUp size={18} />
            Overview
          </div>
          <div 
            className={`nav-item ${selectedView === 'schedule' ? 'nav-item--active' : ''}`}
            onClick={() => setSelectedView('schedule')}
          >
            <Calendar size={18} />
            Schedule
          </div>
          <div 
            className={`nav-item ${selectedView === 'assignments' ? 'nav-item--active' : ''}`}
            onClick={() => setSelectedView('assignments')}
          >
            <BookOpen size={18} />
            Assignments
          </div>
          <div 
            className={`nav-item ${selectedView === 'courses' ? 'nav-item--active' : ''}`}
            onClick={() => setSelectedView('courses')}
          >
            <Clock size={18} />
            Courses
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div className="card" style={{ padding: '16px' }}>
            <h4 style={{ marginBottom: '8px', fontSize: '14px' }}>
              {mockStudent.name}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              {mockStudent.semester}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
              GPA: {mockStudent.gpa}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="search-bar">
            <div style={{ position: 'relative' }}>
              <Search className="search-icon" size={18} />
              <input 
                className="search-input"
                placeholder="Search or press Cmd+K..."
                onClick={() => setShowCommandPalette(true)}
                readOnly
              />
            </div>
          </div>
          
          <div className="header-actions">
            <button className="btn btn--secondary btn--sm">
              <Plus size={16} />
              Add Event
            </button>
            <button className="btn btn--ghost btn--sm">
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="content">
          {selectedView === 'overview' && (
            <>
              <div className="content-header">
                <h1 className="content-title">Good morning, Alex!</h1>
                <p className="content-subtitle">
                  You have 3 assignments due this week and 2 exams coming up.
                </p>
              </div>

              <div className="dashboard-grid">
                <div className="card">
                  <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>
                    📋 Upcoming Assignments
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {mockAssignments.slice(0, 3).map(assignment => (
                      <div key={assignment.id} className="assignment-card">
                        <div className="assignment-header">
                          <div>
                            <div className="assignment-course">{assignment.course}</div>
                            <div className="assignment-title">{assignment.title}</div>
                          </div>
                          <span className={`priority-badge priority-${assignment.priority}`}>
                            {assignment.priority}
                          </span>
                        </div>
                        <div className="progress-container">
                          <div className="progress-label">
                            <span>Progress</span>
                            <span>{assignment.progress}%</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${assignment.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>
                    📚 This Week's Schedule
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-default)' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>CS 301 - Data Structures</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Today, 9:00 AM</div>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-default)' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>MATH 241 - Calculus III</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Today, 2:00 PM</div>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-default)' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Study Session - Physics</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Tomorrow, 11:00 AM</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedView === 'courses' && (
            <>
              <div className="content-header">
                <h1 className="content-title">Courses</h1>
                <p className="content-subtitle">
                  Fall 2024 • {mockCourses.length} courses • 14 credit hours
                </p>
              </div>

              <div className="course-grid">
                {mockCourses.map(course => (
                  <div key={course.id} className="course-card">
                    <div className="course-header">
                      <div 
                        className="course-color"
                        style={{ backgroundColor: course.color }}
                      />
                      <div className="course-code">{course.code}</div>
                    </div>
                    <div className="course-name">{course.name}</div>
                    <div className="course-credits">{course.credits} credits</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {selectedView === 'assignments' && (
            <>
              <div className="content-header">
                <h1 className="content-title">Assignments</h1>
                <p className="content-subtitle">
                  Track your progress and upcoming deadlines
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {mockAssignments.map(assignment => (
                  <div key={assignment.id} className="assignment-card">
                    <div className="assignment-header">
                      <div>
                        <div className="assignment-course">{assignment.course}</div>
                        <div className="assignment-title">{assignment.title}</div>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                          Due: {assignment.due}
                        </div>
                      </div>
                      <span className={`priority-badge priority-${assignment.priority}`}>
                        {assignment.priority}
                      </span>
                    </div>
                    <div className="progress-container">
                      <div className="progress-label">
                        <span>Progress</span>
                        <span>{assignment.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${assignment.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Command Palette */}
      {showCommandPalette && (
        <div 
          className="command-palette-overlay"
          onClick={() => setShowCommandPalette(false)}
        >
          <div 
            className="command-palette"
            onClick={(e) => e.stopPropagation()}
          >
            <input 
              className="command-input"
              placeholder="Type a command or search..."
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MotionSchedulePrototype;