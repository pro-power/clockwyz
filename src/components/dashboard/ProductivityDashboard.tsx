import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  Zap,
  Plus,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Brain,
  Coffee,
  BarChart3,
  Settings,
  Star,
  ArrowUp,
  ArrowDown,
  Activity,
} from 'lucide-react';
import Button from '../ui/Button';

interface DashboardProps {
  preferences?: any;
  onNavigate?: (view: string) => void;
  onOpenCommandPalette?: () => void;
}

const mockData = {
  todaysFocus: [
    { id: 1, title: 'Calculus Problem Set 3', type: 'assignment', urgency: 'high', timeBlocks: 2 },
    { id: 2, title: 'History Essay Research', type: 'study', urgency: 'medium', timeBlocks: 1 },
    { id: 3, title: 'Physics Lab Report', type: 'assignment', urgency: 'low', timeBlocks: 1 },
  ],
  upcomingDeadlines: [
    { id: 1, title: 'CS Project Phase 2', dueDate: '2025-02-03', course: 'Computer Science', priority: 'high' },
    { id: 2, title: 'Biology Lab Report', dueDate: '2025-02-05', course: 'Biology', priority: 'medium' },
    { id: 3, title: 'English Essay Draft', dueDate: '2025-02-07', course: 'English Literature', priority: 'medium' },
  ],
  weeklyStats: {
    studyHours: { current: 24, target: 30, change: 2.5 },
    assignmentsCompleted: { current: 7, total: 10, change: 0 },
    focusScore: { current: 87, change: 5 },
    efficiency: { current: 92, change: -2 },
  },
  aiInsights: [
    'Your most productive hours are 10 AM - 12 PM. Consider scheduling important tasks then.',
    'You tend to take longer breaks on Wednesdays. Plan lighter schedules for that day.',
    'Your focus score improves by 15% when you complete morning routines first.',
  ],
};

const ProductivityDashboard: React.FC<DashboardProps> = ({ preferences, onNavigate, onOpenCommandPalette }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-400 bg-red-500 bg-opacity-20';
      case 'medium': return 'text-yellow-400 bg-yellow-500 bg-opacity-20';
      case 'low': return 'text-green-400 bg-green-500 bg-opacity-20';
      default: return 'text-slate-400 bg-slate-500 bg-opacity-20';
    }
  };

  const getDaysUntil = (dateString: string) => {
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 0) return 'Overdue';
    return `${diffDays} days`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{getGreeting()}, Student! 👋</h1>
              <p className="text-slate-300">{formatDate(currentTime)} • {formatTime(currentTime)}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="md"
                onClick={onOpenCommandPalette}
                leftIcon={<Zap className="w-4 h-4" />}
                className="hidden md:flex"
              >
                Quick Actions
                <kbd className="ml-2 px-2 py-1 bg-slate-700 rounded text-xs">⌘K</kbd>
              </Button>
              <Button
                variant="ai"
                glowEffect
                leftIcon={<Brain className="w-4 h-4" />}
              >
                AI Optimize
              </Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-slate-800 bg-opacity-50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Today's Focus</h2>
                    <p className="text-slate-400 text-sm">Your priority tasks for today</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  onClick={() => onNavigate?.('schedule')}
                >
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {mockData.todaysFocus.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 bg-slate-700 bg-opacity-30 rounded-xl hover:bg-opacity-50 transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                      {task.type === 'assignment' ? (
                        <BookOpen className="w-4 h-4 text-slate-300 group-hover:text-white" />
                      ) : (
                        <Brain className="w-4 h-4 text-slate-300 group-hover:text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">{task.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${getUrgencyColor(task.urgency)}`}>{task.urgency} priority</span>
                        <span className="text-slate-400 text-xs">{task.timeBlocks} time block{task.timeBlocks > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 p-3 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Add new focus item
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {/* Additional widgets (study streak, deadlines, focus score, etc.) */}
          </div>
        </div>
        {/* Additional content grids can follow same pattern */}
      </div>
    </div>
  );
};

export default ProductivityDashboard;
