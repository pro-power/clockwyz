// src/components/layout/Header.tsx
// Top navigation header with search, notifications, and user actions
// Integrates with command palette and student context

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Menu, 
  Bell, 
  Plus, 
  Settings,
  User,
  LogOut,
  ChevronDown,
  Calendar,
  Clock,
  BookOpen
} from 'lucide-react';
import { Button } from '../../design-system/components/atoms/Button/Button';
import { useTheme } from '../../components/layout/ThemeProvider';
import { useStudent } from '../../context/StudentContext';
import '../../styles/header.css';

interface HeaderProps {
  onSidebarToggle: () => void;
  isSidebarOpen: boolean;
  currentView: string;
}

// Quick actions that appear in header
const QUICK_ACTIONS = [
  {
    id: 'add-class',
    label: 'Add Class',
    icon: Calendar,
    action: () => console.log('Add class')
  },
  {
    id: 'add-assignment',
    label: 'Add Assignment', 
    icon: BookOpen,
    action: () => console.log('Add assignment')
  },
  {
    id: 'schedule-study',
    label: 'Schedule Study Time',
    icon: Clock,
    action: () => console.log('Schedule study time')
  }
];

// View titles mapping
const VIEW_TITLES: Record<string, string> = {
  overview: 'Overview',
  schedule: 'Schedule',
  assignments: 'Assignments',
  courses: 'Courses',
  analytics: 'Analytics',
  goals: 'Goals',
  settings: 'Settings'
};

export const Header: React.FC<HeaderProps> = ({
  onSidebarToggle,
  isSidebarOpen,
  currentView
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  
  const { isDarkMode } = useTheme();
  const { currentStudent } = useStudent();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setIsQuickActionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search with Ctrl/Cmd + K (if command palette isn't open)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Trigger command palette instead of search
        document.dispatchEvent(new CustomEvent('open-command-palette'));
      }
      
      // Focus search with /
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      
      // Clear search with Escape
      if (e.key === 'Escape' && isSearchFocused) {
        setSearchQuery('');
        searchRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused]);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // TODO: Implement search functionality
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Perform search
      console.log('Searching for:', searchQuery);
    }
  };

  // Open command palette
  const openCommandPalette = () => {
    document.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  // Get current time greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Render search bar
  const renderSearchBar = () => (
    <div className="header-search">
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className={`search-input-wrapper ${isSearchFocused ? 'search-focused' : ''}`}>
          <Search className="search-icon" size={18} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search or press ⌘K..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="search-input"
            aria-label="Search"
          />
          <button
            type="button"
            className="search-shortcut"
            onClick={openCommandPalette}
            title="Open command palette (⌘K)"
          >
            ⌘K
          </button>
        </div>
      </form>
    </div>
  );

  // Render quick actions dropdown
  const renderQuickActions = () => (
    <div className="header-quick-actions" ref={quickActionsRef}>
      <Button
        variant="secondary"
        leftIcon={<Plus size={16} />}
        onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
        aria-expanded={isQuickActionsOpen}
        aria-haspopup="menu"
      >
        Quick Add
      </Button>
      
      {isQuickActionsOpen && (
        <div className="quick-actions-dropdown" role="menu">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                className="quick-action-item"
                onClick={() => {
                  action.action();
                  setIsQuickActionsOpen(false);
                }}
                role="menuitem"
              >
                <Icon size={16} />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  // Render notifications button
  const renderNotifications = () => (
    <div className="header-notifications">
      <Button
        variant="ghost"
        iconOnly={<Bell size={18} />}
        aria-label="Notifications"
        className="notification-button"
      />
      {/* Notification badge - would be dynamic based on actual notifications */}
      <span className="notification-badge" aria-hidden="true">
        3
      </span>
    </div>
  );

  // Render user menu
  const renderUserMenu = () => (
    <div className="header-user-menu" ref={userMenuRef}>
      <button
        className="user-menu-trigger"
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        aria-expanded={isUserMenuOpen}
        aria-haspopup="menu"
      >
        <div className="user-avatar">
          <User size={18} />
        </div>
        <div className="user-info">
          <span className="user-name">
            {currentStudent?.personalInfo.name || 'Student'}
          </span>
          <span className="user-status">
            {currentStudent?.academic?.currentSemester || 'Fall 2024'}
          </span>
        </div>
        <ChevronDown size={16} className="user-menu-chevron" />
      </button>

      {isUserMenuOpen && (
        <div className="user-menu-dropdown" role="menu">
          <div className="user-menu-header">
            <div className="user-menu-avatar">
              <User size={24} />
            </div>
            <div className="user-menu-info">
              <div className="user-menu-name">
                {currentStudent?.personalInfo?.name}
              </div>
              <div className="user-menu-email">
                {currentStudent?.personalInfo?.email || 'student@university.edu'}
              </div>
            </div>
          </div>
          
          <div className="user-menu-divider" />
          
          <button className="user-menu-item" role="menuitem">
            <User size={16} />
            <span>Profile</span>
          </button>
          
          <button className="user-menu-item" role="menuitem">
            <Settings size={16} />
            <span>Settings</span>
          </button>
          
          <div className="user-menu-divider" />
          
          <button className="user-menu-item user-menu-item--danger" role="menuitem">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );

  // Render page title and breadcrumbs
  const renderPageTitle = () => (
    <div className="header-title">
      <h1 className="page-title">
        {VIEW_TITLES[currentView] || 'StudyFlow'}
      </h1>
      {currentView === 'overview' && (
        <p className="page-greeting">
          {getTimeGreeting()}, {currentStudent?.personalInfo?.name || 'Student'}!
        </p>
      )}
    </div>
  );

  return (
    <header className="app-header" role="banner">
      <div className="header-content">
        {/* Left section */}
        <div className="header-left">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            iconOnly={<Menu size={20} />}
            onClick={onSidebarToggle}
            className="mobile-menu-button"
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-expanded={isSidebarOpen}
          />
          
          {/* Page title */}
          {renderPageTitle()}
        </div>

        {/* Center section - Search */}
        <div className="header-center">
          {renderSearchBar()}
        </div>

        {/* Right section */}
        <div className="header-right">
          {/* Quick actions */}
          {renderQuickActions()}
          
          {/* Notifications */}
          {renderNotifications()}
          
          {/* User menu */}
          {renderUserMenu()}
        </div>
      </div>
    </header>
  );
};

export default Header;