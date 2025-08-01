import React, { useState } from 'react';
import {
  Settings,
  User,
  BookOpen,
  Bot,
  Calendar,
  Cpu,
  ChevronRight,
  Brain,
  Sparkles,
  Star,
  TrendingUp,
  Target,
  Activity,
} from 'lucide-react';
import { QuickPreferences } from '../onboarding/OnboardingFlow';

interface DashboardProps {
  preferences: QuickPreferences;
  onScheduleUpdate?: (schedule: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ preferences }) => {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'week' | 'day'>('week');

  const generateSampleSchedule = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (preferences.weekStart === 'sunday') {
      days.unshift(days.pop()!);
    } else if (preferences.weekStart === 'tuesday') {
      days.push(days.shift()!);
    }

    const timeSlots = [];
    const startHour = preferences.schedulePattern === 'early' ? 6 : preferences.schedulePattern === 'night' ? 10 : 8;

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
          { label: 'Break Intervals', desc: 'Recovery periods' },
        ],
      },
      academic: {
        title: 'Academic Matrix',
        icon: BookOpen,
        gradient: 'from-emerald-500 to-green-500',
        items: [
          { label: 'Class Schedule', desc: 'Import from university' },
          { label: 'Study Blocks', desc: 'Optimized learning' },
          { label: 'Assignment Tracking', desc: 'Deadline management' },
          { label: 'Exam Preparation', desc: 'Strategic planning' },
        ],
      },
      ai: {
        title: 'AI Optimization Engine',
        icon: Bot,
        gradient: 'from-purple-500 to-indigo-500',
        items: [
          { label: 'Smart Scheduling', desc: 'Predictive optimization' },
          { label: 'Conflict Resolution', desc: 'Automatic fixes' },
          { label: 'Energy Mapping', desc: 'Peak performance' },
          { label: 'Pattern Learning', desc: 'Behavioral analysis' },
        ],
      },
    };

    const panel = panels[panelType as keyof typeof panels];
    if (!panel) return null;

    return (
      <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
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
              <button
                key={index}
                className="w-full p-4 bg-slate-700/50 rounded-xl text-left hover:bg-slate-700/80 transition-all group"
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
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Schedule Matrix Active 🚀</h1>
      <p className="text-slate-400 mb-6">
        {preferences.userType === 'student' ? 'Student Protocol' : preferences.userType === 'working-student' ? 'Hybrid Protocol' : 'Professional Protocol'}
        {' • '}{preferences.schedulePattern} Mode
      </p>

      <div className="grid grid-cols-8 gap-2 text-sm">
        <div className="font-medium text-slate-400">Temporal</div>
        {days.map(day => (
          <div key={day} className="font-medium text-slate-400 text-center">
            {day.slice(0, 3)}
          </div>
        ))}
        {timeSlots.map(slot => (
          <React.Fragment key={slot.time}>
            <div className="py-2 text-slate-400 font-mono text-xs">{slot.time}</div>
            {slot.activities.map((activity, idx) => (
              <div
                key={idx}
                className={`py-2 px-2 rounded-lg text-xs text-center transition-all cursor-pointer ${
                  activity === 'Study Block' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                  activity === 'Class' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  activity === 'Project Work' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                  activity === 'Morning Routine' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                  activity === 'Lunch' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                  'bg-slate-600/20 text-slate-400 border border-slate-600/30'
                }`}
              >
                {activity}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {activePanel && (
        <div className="mt-10">
          <CustomizationPanel panelType={activePanel} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
