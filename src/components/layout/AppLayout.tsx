// src/components/layout/AppLayout.tsx
// Main application shell with responsive sidebar and header
// Integrates with existing ScheduleContext and provides navigation structure

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useTheme } from '../../components/layout/ThemeProvider';
import '../../styles/layout.css';

// Main content area props
interface AppLayoutProps {
  children: React.ReactNode;
  currentView?: string;
  onViewChange?: (view: string) => void;
}

// Layout context for managing sidebar state
interface LayoutContextType {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
  currentView: string;
  setCurrentView: (view: string) => void;
}

const LayoutContext = React.createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = React.useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within AppLayout');
  }
  return context;
};

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentView = 'overview',
  onViewChange
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [view, setView] = useState(currentView);
  const { isDarkMode } = useTheme();

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-close sidebar on mobile when view changes
      if (mobile && isSidebarOpen) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isSidebarOpen]);

  // Handle view changes
  const handleViewChange = (newView: string) => {
    setView(newView);
    onViewChange?.(newView);
    
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (isMobile && isSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar with Ctrl/Cmd + B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        handleSidebarToggle();
      }
      
      // Close sidebar with Escape
      if (e.key === 'Escape' && isSidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  const layoutContextValue: LayoutContextType = {
    isSidebarOpen,
    setSidebarOpen,
    isMobile,
    currentView: view,
    setCurrentView: handleViewChange
  };

  return (
    <LayoutContext.Provider value={layoutContextValue}>
      <div className={`app-layout ${isDarkMode ? 'dark' : 'light'}`}>
        {/* Mobile overlay */}
        {isMobile && isSidebarOpen && (
          <div 
            className="sidebar-overlay"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`app-sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
          aria-label="Main navigation"
        >
          <Sidebar 
            currentView={view}
            onViewChange={handleViewChange}
            onClose={() => setSidebarOpen(false)}
          />
        </aside>

        {/* Main content area */}
        <div className="app-main">
          {/* Header */}
          <header className="app-header">
            <Header 
              onSidebarToggle={handleSidebarToggle}
              isSidebarOpen={isSidebarOpen}
              currentView={view}
            />
          </header>

          {/* Content */}
          <main className="app-content" role="main">
            <div className="content-container">
              {children}
            </div>
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
};

// Layout utilities for child components
export const LayoutUtils = {
  // Content wrapper with consistent padding
  ContentWrapper: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`content-wrapper ${className}`}>
      {children}
    </div>
  ),

  // Page header component
  PageHeader: ({ 
    title, 
    subtitle, 
    actions,
    breadcrumbs 
  }: { 
    title: string; 
    subtitle?: string; 
    actions?: React.ReactNode;
    breadcrumbs?: Array<{ label: string; href?: string }>;
  }) => (
    <div className="page-header">
      {breadcrumbs && (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol className="breadcrumb-list">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="breadcrumb-item">
                {crumb.href ? (
                  <a href={crumb.href} className="breadcrumb-link">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="breadcrumb-current" aria-current="page">
                    {crumb.label}
                  </span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className="breadcrumb-separator" aria-hidden="true">
                    /
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="page-header-content">
        <div className="page-header-text">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        
        {actions && (
          <div className="page-header-actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  ),

  // Section container with consistent spacing
  Section: ({ 
    title, 
    children, 
    className = '',
    headerActions
  }: { 
    title?: string; 
    children: React.ReactNode; 
    className?: string;
    headerActions?: React.ReactNode;
  }) => (
    <section className={`content-section ${className}`}>
      {title && (
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          {headerActions && (
            <div className="section-actions">
              {headerActions}
            </div>
          )}
        </div>
      )}
      <div className="section-content">
        {children}
      </div>
    </section>
  ),

  // Grid layout for cards/items
  Grid: ({ 
    children, 
    columns = 'auto-fit',
    minWidth = '320px',
    gap = 'var(--spacing-6)',
    className = ''
  }: {
    children: React.ReactNode;
    columns?: string | number;
    minWidth?: string;
    gap?: string;
    className?: string;
  }) => {
    const gridStyle = {
      display: 'grid',
      gridTemplateColumns: typeof columns === 'number' 
        ? `repeat(${columns}, 1fr)` 
        : `repeat(${columns}, minmax(${minWidth}, 1fr))`,
      gap
    };

    return (
      <div className={`content-grid ${className}`} style={gridStyle}>
        {children}
      </div>
    );
  }
};

export default AppLayout;