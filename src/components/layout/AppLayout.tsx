// src/components/layout/AppLayout.tsx
// Updated main application shell with collapsing sidebar support
// Integrates with existing ScheduleContext and provides navigation structure

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useTheme } from './ThemeProvider';
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
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
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
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [view, setView] = useState(currentView);
  const { isDarkMode } = useTheme();

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile) {
        // On mobile, sidebar is always collapsed when closed
        setSidebarCollapsed(true);
        setSidebarOpen(false);
      } else {
        // On desktop, restore previous state or default to open
        const savedCollapsed = localStorage.getItem('sidebar-collapsed');
        if (savedCollapsed !== null) {
          setSidebarCollapsed(JSON.parse(savedCollapsed));
        }
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(isSidebarCollapsed));
    }
  }, [isSidebarCollapsed, isMobile]);

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
    if (isMobile) {
      setSidebarOpen(!isSidebarOpen);
    } else {
      setSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  // Handle sidebar collapse toggle (desktop only)
  const handleSidebarCollapseToggle = () => {
    if (!isMobile) {
      setSidebarCollapsed(!isSidebarCollapsed);
    }
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
    isSidebarCollapsed,
    setSidebarCollapsed,
    isMobile,
    currentView: view,
    setCurrentView: handleViewChange
  };

  // Calculate main content margin based on sidebar state
  const getMainContentMargin = () => {
    if (isMobile) {
      return '0'; // No margin on mobile
    }
    if (!isSidebarOpen) {
      return '0'; // No margin if sidebar is closed
    }
    return isSidebarCollapsed ? '64px' : '256px'; // Collapsed or expanded width
  };

  return (
    <LayoutContext.Provider value={layoutContextValue}>
      <div 
        className={`min-h-screen transition-all duration-300 ${
          isDarkMode ? 'dark' : 'light'
        }`}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
        }}
      >
        {/* Mobile overlay */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        {(isSidebarOpen || !isMobile) && (
          <Sidebar 
            currentView={view}
            onViewChange={handleViewChange}
            onClose={() => setSidebarOpen(false)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleSidebarCollapseToggle}
          />
        )}

        {/* Main content area */}
        <motion.div 
          className="min-h-screen transition-all duration-300"
          style={{
            marginLeft: getMainContentMargin()
          }}
          animate={{
            marginLeft: getMainContentMargin()
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Header */}
          <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
            <Header 
              onSidebarToggle={handleSidebarToggle}
              isSidebarOpen={isSidebarOpen}
              currentView={view}
            />
          </header>

          {/* Content */}
          <main className="relative" role="main">
            <div className="min-h-[calc(100vh-64px)]">
              {children}
            </div>
          </main>
        </motion.div>
      </div>
    </LayoutContext.Provider>
  );
};

// Enhanced Layout utilities for child components
export const LayoutUtils = {
  // Content wrapper with consistent padding
  ContentWrapper: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  ),

  // Page header component with modern styling
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
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {breadcrumbs && (
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {crumb.href ? (
                  <a 
                    href={crumb.href} 
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-white font-medium" aria-current="page">
                    {crumb.label}
                  </span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className="text-slate-600 mx-2" aria-hidden="true">
                    /
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-400 text-lg">
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
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
    <motion.section 
      className={`bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {title && (
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-semibold text-white">
            {title}
          </h2>
          {headerActions && (
            <div className="flex items-center gap-3">
              {headerActions}
            </div>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </motion.section>
  ),

  // Grid layout for cards/items with modern styling
  Grid: ({ 
    children, 
    columns = 'auto-fit',
    minWidth = '320px',
    gap = '1.5rem',
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
      <div className={`${className}`} style={gridStyle}>
        {children}
      </div>
    );
  }
};

export default AppLayout;