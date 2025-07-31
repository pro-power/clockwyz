// src/components/dashboard/Dashboard.tsx
// Main dashboard with futuristic sci-fi theme
// Shows schedule with contextual customization panels

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  User, 
  BookOpen, 
  Zap, 
  Star, 
  Calendar,
  Clock,
  Bot,
  Cpu,
  ChevronRight,
  Plus,
  TrendingUp,
  Target,
  Activity,
  Brain,
  Sparkles
} from 'lucide-react';
import { QuickPreferences } from '../onboarding/OnboardingFlow';

interface DashboardProps {
  preferences: QuickPreferences;
  onScheduleUpdate?: (schedule: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ preferences, onScheduleUpdate }) => {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'week' | 'day'>('week');

  // Animation variants
  const panelVariants = {
    hidden: { opacity: 0, x: -300 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" as const }
    },
    exit: { 
      opacity: 0, 
      x: -300,
      transition: { duration: 0.3 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" as const }
    },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  // Generate sample schedule based on preferences
  const generateSampleSchedule = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (preferences.weekStart === 'sunday') {
      days.unshift(days.pop()!);
    } else if (preferences.weekStart === 'tuesday') {
      days.push(days.shift()!);
    }

    const timeSlots = [];
    const startHour = preferences.schedulePattern === 'early' ? 6 : 
                     preferences.schedulePattern === 'night' ? 10 : 8;

    for (let hour = startHour; hour < startHour + 12; hour++) {
      const time = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
      const activities = days.map(day => {
        if (hour < startHour + 1) return 'Morning Routine';
        if (hour === startHour + 4) return 'Lunch';
        if (preferences.userType === 'student') {
          if (hour >= startHour + 2 && hour < startHour + 6) {
            return ['Study Block', 'Class', 'Project Work'][Math.floor(Math.random() * 3)];
          }
        }
        return 'Free Time';
      });
      
      timeSlots.push({ time, activities });
    }

    return { days, timeSlots };
  };

  const { days, timeSlots } = generateSampleSchedule();

  const CustomizationPanel = ({ panelType }: { panelType: string }) => {
    const panels = {
      personal: {
        title: 'Personal Configuration',
        icon: User,
        gradient: 'from-blue-500 to-cyan-500',
        items: [
          { label: 'Sleep Optimization', desc: 'Configure rest cycles' },
          { label: 'Meal Scheduling', desc: 'Nutritional timing' },
          { label: 'Work Hours', desc: 'Professional blocks' },
          { label: 'Break Intervals', desc: 'Recovery periods' }
        ]
      },
      academic: {
        title: 'Academic Matrix',
        icon: BookOpen,
        gradient: 'from-emerald-500 to-green-500',
        items: [
          { label: 'Class Schedule', desc: 'Import from university' },
          { label: 'Study Blocks', desc: 'Optimized learning' },
          { label: 'Assignment Tracking', desc: 'Deadline management' },
          { label: 'Exam Preparation', desc: 'Strategic planning' }
        ]
      },
      ai: {
        title: 'AI Optimization Engine',
        icon: Bot,
        gradient: 'from-purple-500 to-indigo-500',
        items: [
          { label: 'Smart Scheduling', desc: 'Predictive optimization' },
          { label: 'Conflict Resolution', desc: 'Automatic fixes' },
          { label: 'Energy Mapping', desc: 'Peak performance' },
          { label: 'Pattern Learning', desc: 'Behavioral analysis' }
        ]
      }
    };

    const panel = panels[panelType as keyof typeof panels];
    if (!panel) return null;

    return (
      <motion.div
        className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Glow effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${panel.gradient} opacity-20 rounded-2xl blur-lg`} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 bg-gradient-to-r ${panel.gradient} rounded-xl flex items-center justify-center`}>
              <panel.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{panel.title}</h3>
              <p className="text-slate-400 text-sm">Advanced configuration</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {panel.items.map((item, index) => (
              <motion.button
                key={index}
                className="w-full p-4 bg-slate-700/50 rounded-xl text-left hover:bg-slate-700/80 transition-all group"
                whileHover={{ x: 4 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                      {item.label}
                    </h4>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Header */}
      <motion.div 
        className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Cpu className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Schedule Matrix Active 🚀
              </h1>
              <p className="text-slate-400">
                {preferences.userType === 'student' ? 'Student Protocol' : 
                 preferences.userType === 'working-student' ? 'Hybrid Protocol' : 
                 'Professional Protocol'} • {preferences.schedulePattern} Mode
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Brain className="w-4 h-4" />
              AI Optimize
            </motion.button>
            
            <motion.button 
              className="bg-slate-700/50 text-slate-300 px-4 py-2 rounded-xl hover:bg-slate-700/80 transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-4 h-4" />
              Settings
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="flex">
        {/* Sidebar - Quick Customization */}
        <motion.div 
          className="w-80 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 p-6 relative z-10"
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Quick Access</h3>
          </div>
          
          <div className="space-y-4">
            {[
              {
                id: 'personal',
                title: 'Personal Config',
                desc: 'Sleep, meals, work hours',
                icon: User,
                gradient: 'from-blue-500 to-cyan-500',
                status: 'Configure'
              },
              {
                id: 'academic',
                title: 'Academic Matrix',
                desc: 'Classes, study blocks, assignments',
                icon: BookOpen,
                gradient: 'from-emerald-500 to-green-500',
                status: 'Import Schedule'
              },
              {
                id: 'ai',
                title: 'AI Engine',
                desc: 'Smart optimization & learning',
                icon: Bot,
                gradient: 'from-purple-500 to-indigo-500',
                status: 'Activate'
              }
            ].map((item, index) => (
              <motion.div
                key={item.id}
                className="p-4 bg-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition-all cursor-pointer group relative overflow-hidden"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
                onClick={() => setActivePanel(activePanel === item.id ? null : item.id)}
              >
                {/* Hover glow */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-20 rounded-xl blur-lg transition-opacity`} />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${item.gradient} rounded-lg flex items-center justify-center`}>
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                  <button className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${item.gradient} text-white font-medium`}>
                    {item.status} →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Tip */}
          <motion.div 
            className="mt-8 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="font-medium text-white">Neural Tip</span>
            </div>
            <p className="text-slate-300 text-sm">
              Try: <span className="text-yellow-400 font-mono">"Schedule 2 hours of calculus study before Friday"</span> to use AI commands!
            </p>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 relative">
          {/* Expanded Panel Overlay */}
          <AnimatePresence>
            {activePanel && (
              <motion.div 
                className="absolute inset-0 z-20 flex"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-96 p-6">
                  <CustomizationPanel panelType={activePanel} />
                </div>
                <div 
                  className="flex-1 bg-black/20 backdrop-blur-sm cursor-pointer"
                  onClick={() => setActivePanel(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Schedule Grid */}
          <motion.div 
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
              {/* Schedule Header */}
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <h2 className="text-lg font-semibold text-white">Temporal Matrix</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className={`px-3 py-1 text-sm rounded-lg font-medium transition-all ${
                        currentView === 'week' 
                          ? 'bg-blue-500 text-white' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }`}
                      onClick={() => setCurrentView('week')}
                    >
                      Week Matrix
                    </button>
                    <button 
                      className={`px-3 py-1 text-sm rounded-lg font-medium transition-all ${
                        currentView === 'day' 
                          ? 'bg-blue-500 text-white' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }`}
                      onClick={() => setCurrentView('day')}
                    >
                      Day Focus
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Schedule Grid */}
              <div className="p-6 overflow-x-auto">
                <div className="grid grid-cols-8 gap-2 text-sm min-w-max">
                  {/* Header */}
                  <div className="font-medium text-slate-400 p-2">Temporal</div>
                  {days.map(day => (
                    <div key={day} className="font-medium text-slate-400 text-center p-2">
                      {day.slice(0, 3)}
                    </div>
                  ))}
                  
                  {/* Schedule Rows */}
                  {timeSlots.map((slot, rowIndex) => (
                    <React.Fragment key={slot.time}>
                      <div className="py-3 px-2 text-slate-400 font-mono text-xs">
                        {slot.time}
                      </div>
                      {slot.activities.map((activity, colIndex) => (
                        <motion.div 
                          key={`${rowIndex}-${colIndex}`}
                          className={`py-3 px-2 rounded-lg text-xs text-center cursor-pointer transition-all hover:scale-105 ${
                            activity === 'Study Block' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            activity === 'Class' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            activity === 'Project Work' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                            activity === 'Morning Routine' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                            activity === 'Lunch' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                            'bg-slate-600/20 text-slate-400 border border-slate-600/30'
                          }`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (rowIndex * 8 + colIndex) * 0.02 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {activity}
                        </motion.div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <motion.div 
              className="grid grid-cols-4 gap-4 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {[
                { label: 'Efficiency', value: '94%', icon: TrendingUp, color: 'text-emerald-400' },
                { label: 'Focus Blocks', value: '8', icon: Target, color: 'text-blue-400' },
                { label: 'Energy Score', value: '87%', icon: Activity, color: 'text-purple-400' },
                { label: 'Optimization', value: 'Active', icon: Brain, color: 'text-orange-400' }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-slate-400 text-sm">{stat.label}</span>
                  </div>
                  <div className={`text-xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;