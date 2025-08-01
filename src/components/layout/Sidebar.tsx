// src/components/layout/Sidebar.tsx
// Updated navigation sidebar with modern collapsing design
// Integrates with existing student context and schedule data

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { useTheme, ThemeToggle } from './ThemeProvider';
import { useScheduleContext } from '../../context/ScheduleContext';
import { useStudent } from '../../context/StudentContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
    badge: 3 // Could be dynamic based on due dates
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
  onClose,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { isDarkMode } = useTheme();
  const { currentStudent } = useStudent();
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle navigation item click
  const handleNavClick = (itemId: string) => {
    onViewChange(itemId);
    if (isMobile) {
      onClose();
    }
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
  const urgentCount = 3; // This would integrate with your existing assignment data

  return (
    <motion.aside
      className={`fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-40 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(71, 85, 105, 0.3)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)'
      }}
    >
      {/* Close button for mobile */}
      {isMobile && (
        <button
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all z-50"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg border border-blue-500/30 shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white">StudyFlow</h1>
                <p className="text-xs text-slate-400">Smart Schedule</p>
              </div>
            </motion.div>
          )}
          
          {!isMobile && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Student Profile */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <User className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="font-medium text-white">
                {currentStudent?.personalInfo?.name || 'Alex Chen'}
              </div>
              <div className="text-xs text-slate-400">Computer Science</div>
              <div className="text-xs text-slate-400">
                GPA: {currentStudent?.personalInfo?.gpa?.toFixed(2) || '3.7'}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1 overflow-y-auto">
        <div className={`space-y-${isCollapsed ? '4' : '2'}`}>
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const badgeCount = item.id === 'assignments' ? urgentCount : item.badge;
            
            return (
              <motion.div 
                key={item.id} 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1 }}
              >
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 rounded-lg transition-all group ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30 shadow-lg' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  } ${isCollapsed ? 'justify-center p-3' : 'p-3'}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className={`flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {!isCollapsed && (
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium truncate">{item.label}</div>
                      <div className="text-xs opacity-70 truncate">{item.description}</div>
                    </div>
                  )}
                  
                  {!isCollapsed && badgeCount && badgeCount > 0 && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30 font-medium flex-shrink-0">
                      {badgeCount}
                    </span>
                  )}

                  {/* Collapsed state badge indicator */}
                  {isCollapsed && badgeCount && badgeCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></div>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        {!isCollapsed && (
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
              Quick Actions
            </h4>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                const badgeCount = action.id === 'notifications' ? action.badge : null;
                
                return (
                  <motion.div key={action.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <button 
                      onClick={() => handleQuickAction(action.action, action.id)}
                      className="w-full flex items-center gap-3 p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all group"
                    >
                      <div className="relative">
                        <Icon className="w-4 h-4" />
                        {badgeCount && badgeCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                      {action.shortcut && (
                        <span className="ml-auto text-xs bg-slate-700/50 px-2 py-1 rounded font-mono">
                          {action.shortcut}
                        </span>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Weekly Summary */}
        {!isCollapsed && (
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
              This Week
            </h4>
            <div className="space-y-3">
              <motion.div 
                className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:bg-slate-800/50 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">32h</div>
                  <div className="text-xs text-slate-400">Class Hours</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:bg-slate-800/50 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Target className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{urgentCount}</div>
                  <div className="text-xs text-slate-400">Due Soon</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:bg-slate-800/50 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">87%</div>
                  <div className="text-xs text-slate-400">On Track</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-slate-700/50">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <button 
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
              currentView === 'settings' 
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30 shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'Settings' : undefined}
          >
            <Settings className="w-5 h-5" />
            {!isCollapsed && (
              <motion.span 
                className="font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Settings
              </motion.span>
            )}
          </button>
        </motion.div>
        
        {!isCollapsed && (
          <motion.div 
            className="mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ThemeToggle size="sm" showLabel />
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;