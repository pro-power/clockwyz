// src/components/ui/CommandPalette.tsx
// Futuristic command palette with AI-powered suggestions
// Activated with Cmd+K for quick actions and navigation

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  Clock, 
  Plus, 
  BookOpen, 
  Target, 
  Settings, 
  Zap, 
  Bot, 
  ArrowRight,
  Sparkles,
  Command,
  User,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'navigation' | 'actions' | 'ai' | 'schedule' | 'settings';
  keywords: string[];
  action: () => void;
  shortcut?: string;
  isNew?: boolean;
  isPro?: boolean;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string) => void;
  onAddEvent?: () => void;
  onAIOptimize?: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onAddEvent,
  onAIOptimize
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Available commands
  const commands: Command[] = [
    // Navigation
    {
      id: 'nav-overview',
      title: 'Overview Dashboard',
      description: 'View your productivity dashboard',
      icon: TrendingUp,
      category: 'navigation',
      keywords: ['overview', 'dashboard', 'home', 'main'],
      action: () => onNavigate?.('overview')
    },
    {
      id: 'nav-schedule',
      title: 'Schedule Matrix',
      description: 'View and edit your weekly schedule',
      icon: Calendar,
      category: 'navigation',
      keywords: ['schedule', 'calendar', 'week', 'time'],
      action: () => onNavigate?.('schedule')
    },
    {
      id: 'nav-assignments',
      title: 'Assignment Tracker',
      description: 'Manage assignments and deadlines',
      icon: BookOpen,
      category: 'navigation',
      keywords: ['assignments', 'homework', 'tasks', 'deadlines'],
      action: () => onNavigate?.('assignments')
    },
    {
      id: 'nav-analytics',
      title: 'Analytics Dashboard',
      description: 'View productivity insights and metrics',
      icon: BarChart3,
      category: 'navigation',
      keywords: ['analytics', 'insights', 'metrics', 'stats'],
      action: () => onNavigate?.('analytics')
    },
    {
      id: 'nav-goals',
      title: 'Academic Goals',
      description: 'Set and track your objectives',
      icon: Target,
      category: 'navigation',
      keywords: ['goals', 'objectives', 'targets', 'milestones'],
      action: () => onNavigate?.('goals')
    },

    // Quick Actions
    {
      id: 'action-add-event',
      title: 'Add Event',
      description: 'Quickly add a new event to your schedule',
      icon: Plus,
      category: 'actions',
      keywords: ['add', 'create', 'new', 'event', 'schedule'],
      action: () => onAddEvent?.(),
      shortcut: 'Ctrl+N'
    },
    {
      id: 'action-add-assignment',
      title: 'Add Assignment',
      description: 'Create a new assignment with deadline',
      icon: BookOpen,
      category: 'actions',
      keywords: ['assignment', 'homework', 'task', 'deadline'],
      action: () => console.log('Add assignment'),
      isNew: true
    },
    {
      id: 'action-focus-mode',
      title: 'Focus Mode',
      description: 'Enter distraction-free study mode',
      icon: Target,
      category: 'actions',
      keywords: ['focus', 'study', 'concentrate', 'distraction'],
      action: () => console.log('Focus mode'),
      shortcut: 'Ctrl+F'
    },

    // AI Commands
    {
      id: 'ai-optimize',
      title: 'AI Schedule Optimization',
      description: 'Let AI optimize your schedule for maximum productivity',
      icon: Bot,
      category: 'ai',
      keywords: ['ai', 'optimize', 'smart', 'productivity', 'efficiency'],
      action: () => onAIOptimize?.(),
      isPro: true
    },
    {
      id: 'ai-suggestions',
      title: 'Get AI Suggestions',
      description: 'Receive personalized productivity recommendations',
      icon: Sparkles,
      category: 'ai',
      keywords: ['suggestions', 'recommendations', 'ai', 'tips'],
      action: () => console.log('AI suggestions')
    },
    {
      id: 'ai-analyze',
      title: 'Analyze Study Patterns',
      description: 'AI analysis of your learning habits',
      icon: TrendingUp,
      category: 'ai',
      keywords: ['analyze', 'patterns', 'habits', 'learning'],
      action: () => console.log('Analyze patterns'),
      isNew: true
    },

    // Schedule Commands
    {
      id: 'schedule-today',
      title: 'Today\'s Schedule',
      description: 'View what\'s planned for today',
      icon: Clock,
      category: 'schedule',
      keywords: ['today', 'current', 'now', 'daily'],
      action: () => console.log('Today\'s schedule')
    },
    {
      id: 'schedule-export',
      title: 'Export Schedule',
      description: 'Export your schedule to CSV or calendar',
      icon: Calendar,
      category: 'schedule',
      keywords: ['export', 'download', 'csv', 'calendar'],
      action: () => console.log('Export schedule')
    },

    // Settings
    {
      id: 'settings-preferences',
      title: 'Preferences',
      description: 'Customize your Clockwyz experience',
      icon: Settings,
      category: 'settings',
      keywords: ['settings', 'preferences', 'config', 'customize'],
      action: () => console.log('Open preferences')
    },
    {
      id: 'settings-profile',
      title: 'Profile Settings',
      description: 'Update your profile and academic info',
      icon: User,
      category: 'settings',
      keywords: ['profile', 'account', 'personal', 'academic'],
      action: () => console.log('Profile settings')
    }
  ];

  // Filter commands based on query
  const filteredCommands = commands.filter(command => {
    if (!query) return true;
    
    const searchTerms = query.toLowerCase().split(' ');
    const searchableText = [
      command.title,
      command.description,
      ...command.keywords
    ].join(' ').toLowerCase();
    
    return searchTerms.every(term => searchableText.includes(term));
  });

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  // Category display names
  const categoryNames = {
    navigation: 'Navigation',
    actions: 'Quick Actions',
    ai: 'AI Commands',
    schedule: 'Schedule',
    settings: 'Settings'
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setActiveCategory(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-scroll to selected item
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-modal flex items-start justify-center pt-20 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <motion.div 
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Command Palette */}
        <motion.div 
          className="relative w-full max-w-2xl bg-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 rounded-2xl blur-lg" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-slate-700">
              <div className="flex items-center gap-2 text-slate-400">
                <Command className="w-4 h-4" />
                <span className="text-xs font-medium">COMMAND PALETTE</span>
              </div>
              <div className="flex-1" />
              <div className="text-xs text-slate-500">
                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Esc</kbd> to close
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands or type what you want to do..."
                className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-slate-400 text-lg outline-none"
              />
            </div>

            {/* Commands List */}
            <div 
              ref={listRef}
              className="max-h-96 overflow-y-auto p-2"
            >
              {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                <div key={category} className="mb-4 last:mb-0">
                  {/* Category Header */}
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {categoryNames[category as keyof typeof categoryNames]}
                  </div>
                  
                  {/* Category Commands */}
                  {categoryCommands.map((command, index) => {
                    const globalIndex = filteredCommands.findIndex(c => c.id === command.id);
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <motion.button
                        key={command.id}
                        onClick={() => {
                          command.action();
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                          isSelected 
                            ? 'bg-blue-500 bg-opacity-20 border border-blue-500 border-opacity-30' 
                            : 'hover:bg-slate-700 hover:bg-opacity-50'
                        }`}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          command.category === 'ai' ? 'bg-purple-500 bg-opacity-20' :
                          command.category === 'actions' ? 'bg-green-500 bg-opacity-20' :
                          command.category === 'navigation' ? 'bg-blue-500 bg-opacity-20' :
                          command.category === 'schedule' ? 'bg-orange-500 bg-opacity-20' :
                          'bg-slate-500 bg-opacity-20'
                        }`}>
                          <command.icon className={`w-4 h-4 ${
                            command.category === 'ai' ? 'text-purple-400' :
                            command.category === 'actions' ? 'text-green-400' :
                            command.category === 'navigation' ? 'text-blue-400' :
                            command.category === 'schedule' ? 'text-orange-400' :
                            'text-slate-400'
                          }`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white truncate">
                              {command.title}
                            </span>
                            {command.isNew && (
                              <span className="px-2 py-0.5 text-xs bg-green-500 bg-opacity-20 text-green-400 rounded-full">
                                NEW
                              </span>
                            )}
                            {command.isPro && (
                              <span className="px-2 py-0.5 text-xs bg-purple-500 bg-opacity-20 text-purple-400 rounded-full">
                                PRO
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-400 truncate">
                            {command.description}
                          </div>
                        </div>

                        {/* Shortcut or Arrow */}
                        <div className="flex items-center gap-2">
                          {command.shortcut ? (
                            <kbd className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-400">
                              {command.shortcut}
                            </kbd>
                          ) : (
                            <ArrowRight className={`w-4 h-4 transition-opacity ${
                              isSelected ? 'opacity-100' : 'opacity-0'
                            }`} />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ))}

              {/* No Results */}
              {filteredCommands.length === 0 && query && (
                <div className="text-center py-8">
                  <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <div className="text-slate-400 font-medium">No commands found</div>
                  <div className="text-slate-500 text-sm">
                    Try searching for something else
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-700 p-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">↑↓</kbd>
                    <span>navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">↵</kbd>
                    <span>select</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Powered by AI</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommandPalette;