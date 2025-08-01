// src/components/schedule/EnhancedScheduleGrid.tsx
// Enhanced schedule grid component that integrates with existing ScheduleGrid
// Maintains compatibility while adding modern UI and functionality

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Coffee,
  Dumbbell,
  Brain,
  Users,
  MapPin,
  Edit3,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  Target,
  Star,
  Trash2
} from 'lucide-react';

// Activity types with enhanced styling
type ActivityType = 'class' | 'study' | 'assignment' | 'break' | 'exercise' | 'meeting' | 'personal';

interface ActivityTypeConfig {
  icon: React.ComponentType<any>;
  color: string;
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

const ACTIVITY_TYPES: Record<ActivityType, ActivityTypeConfig> = {
  class: { 
    icon: BookOpen, 
    color: '#3b82f6', 
    label: 'Class', 
    bgColor: 'bg-blue-500/20', 
    borderColor: 'border-blue-500/30', 
    textColor: 'text-blue-300' 
  },
  study: { 
    icon: Brain, 
    color: '#8b5cf6', 
    label: 'Study', 
    bgColor: 'bg-purple-500/20', 
    borderColor: 'border-purple-500/30', 
    textColor: 'text-purple-300' 
  },
  assignment: { 
    icon: Target, 
    color: '#f59e0b', 
    label: 'Assignment', 
    bgColor: 'bg-amber-500/20', 
    borderColor: 'border-amber-500/30', 
    textColor: 'text-amber-300' 
  },
  break: { 
    icon: Coffee, 
    color: '#10b981', 
    label: 'Break', 
    bgColor: 'bg-emerald-500/20', 
    borderColor: 'border-emerald-500/30', 
    textColor: 'text-emerald-300' 
  },
  exercise: { 
    icon: Dumbbell, 
    color: '#ef4444', 
    label: 'Exercise', 
    bgColor: 'bg-red-500/20', 
    borderColor: 'border-red-500/30', 
    textColor: 'text-red-300' 
  },
  meeting: { 
    icon: Users, 
    color: '#6366f1', 
    label: 'Meeting', 
    bgColor: 'bg-indigo-500/20', 
    borderColor: 'border-indigo-500/30', 
    textColor: 'text-indigo-300' 
  },
  personal: { 
    icon: Star, 
    color: '#ec4899', 
    label: 'Personal', 
    bgColor: 'bg-pink-500/20', 
    borderColor: 'border-pink-500/30', 
    textColor: 'text-pink-300' 
  }
};

const TIME_SLOTS = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Event {
  id: string;
  title: string;
  type: ActivityType;
  location?: string;
  instructor?: string;
  description?: string;
  duration: number;
}

interface EnhancedScheduleGridProps {
  className?: string;
}

const EnhancedScheduleGrid: React.FC<EnhancedScheduleGridProps> = ({ className = '' }) => {
  const [currentView, setCurrentView] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [editingCell, setEditingCell] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [draggedEvent, setDraggedEvent] = useState<any>(null);
  const [isHologramMode, setIsHologramMode] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{day: string, time: string} | null>(null);
  
  const gridRef = useRef<HTMLDivElement>(null);

  // Helper function to get activity type config safely
  const getActivityTypeConfig = (type: ActivityType): ActivityTypeConfig => {
    return ACTIVITY_TYPES[type] || ACTIVITY_TYPES.personal;
  };

  // Generate sample schedule data
  const generateSampleSchedule = () => {
    const sampleSchedule: Record<string, Record<string, Event | null>> = {};
    
    DAYS.forEach(day => {
      sampleSchedule[day] = {};
      TIME_SLOTS.forEach(time => {
        sampleSchedule[day][time] = null;
      });
    });

    // Add sample events
    sampleSchedule['Monday']['9:00 AM'] = {
      id: 'cs301-mon-9',
      title: 'CS 301 - Data Structures',
      type: 'class',
      location: 'Room 301',
      instructor: 'Dr. Smith',
      duration: 2
    };
    
    sampleSchedule['Wednesday']['9:00 AM'] = {
      id: 'cs301-wed-9',
      title: 'CS 301 - Data Structures',
      type: 'class',
      location: 'Room 301',
      instructor: 'Dr. Smith',
      duration: 2
    };

    sampleSchedule['Tuesday']['11:00 AM'] = {
      id: 'math241-tue-11',
      title: 'MATH 241 - Calculus III',
      type: 'class',
      location: 'Room 205',
      instructor: 'Prof. Johnson',
      duration: 1.5
    };

    sampleSchedule['Monday']['2:00 PM'] = {
      id: 'study-cs-mon-2',
      title: 'CS Assignment Work',
      type: 'study',
      description: 'Binary Search Tree Implementation',
      duration: 2
    };

    sampleSchedule['Monday']['12:00 PM'] = {
      id: 'lunch-mon-12',
      title: 'Lunch Break',
      type: 'break',
      duration: 1
    };

    sampleSchedule['Tuesday']['4:00 PM'] = {
      id: 'gym-tue-4',
      title: 'Workout Session',
      type: 'exercise',
      location: 'Campus Gym',
      duration: 1.5
    };

    return sampleSchedule;
  };

  const [localSchedule, setLocalSchedule] = useState(generateSampleSchedule());

  // Get current time for timeline indicator
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Check if time slot is current
  const isCurrentTimeSlot = (timeSlot: string) => {
    const now = new Date();
    const currentHour = now.getHours();
    const slotHour = parseInt(timeSlot.split(':')[0]);
    const isPM = timeSlot.includes('PM');
    const adjustedSlotHour = isPM && slotHour !== 12 ? slotHour + 12 : 
                            !isPM && slotHour === 12 ? 0 : slotHour;
    
    return Math.abs(currentHour - adjustedSlotHour) < 1;
  };

  // Filter events based on search and type
  const filteredSchedule = Object.keys(localSchedule).reduce((acc: any, day) => {
    acc[day] = {};
    Object.keys(localSchedule[day]).forEach(time => {
      const event = localSchedule[day][time];
      if (event) {
        const matchesSearch = !searchQuery || 
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesFilter = filterType === 'all' || event.type === filterType;
        
        if (matchesSearch && matchesFilter) {
          acc[day][time] = event;
        }
      } else {
        acc[day][time] = null;
      }
    });
    return acc;
  }, {});

  // Detect schedule conflicts
  const getConflicts = () => {
    const conflicts: any[] = [];
    
    DAYS.forEach(day => {
      TIME_SLOTS.forEach((time, index) => {
        const event = localSchedule[day][time];
        if (event && event.duration > 1) {
          const endSlotIndex = index + Math.ceil(event.duration);
          for (let i = index + 1; i < endSlotIndex && i < TIME_SLOTS.length; i++) {
            const conflictEvent = localSchedule[day][TIME_SLOTS[i]];
            if (conflictEvent) {
              conflicts.push({
                day,
                time: TIME_SLOTS[i],
                events: [event, conflictEvent]
              });
            }
          }
        }
      });
    });
    
    return conflicts;
  };

  const conflicts = getConflicts();

  // Handle event creation
  const handleAddEvent = (day?: string, time?: string) => {
    if (day && time) {
      setSelectedCell({ day, time });
    }
    setShowAddModal(true);
  };

  // Handle drag and drop
  const handleDragStart = (event: any, day: string, time: string) => {
    setDraggedEvent({ event, day, time });
  };

  const handleDrop = (targetDay: string, targetTime: string) => {
    if (draggedEvent && (draggedEvent.day !== targetDay || draggedEvent.time !== targetTime)) {
      const newSchedule = { ...localSchedule };
      
      // Remove from old position
      newSchedule[draggedEvent.day][draggedEvent.time] = null;
      
      // Add to new position if it's empty
      if (!newSchedule[targetDay][targetTime]) {
        newSchedule[targetDay][targetTime] = draggedEvent.event;
        setLocalSchedule(newSchedule);
      }
      
      setDraggedEvent(null);
    }
  };

  // Handle event deletion
  const handleDeleteEvent = (day: string, time: string) => {
    const newSchedule = { ...localSchedule };
    newSchedule[day][time] = null;
    setLocalSchedule(newSchedule);
    setEditingCell(null);
  };

  // Handle event creation from modal
  const handleCreateEvent = (eventData: any) => {
    if (selectedCell) {
      const newSchedule = { ...localSchedule };
      const newEvent: Event = {
        id: `${eventData.type}-${selectedCell.day}-${selectedCell.time}-${Date.now()}`,
        title: eventData.title,
        type: eventData.type,
        location: eventData.location,
        description: eventData.description,
        duration: parseFloat(eventData.duration)
      };
      
      newSchedule[selectedCell.day][selectedCell.time] = newEvent;
      setLocalSchedule(newSchedule);
    }
    setShowAddModal(false);
    setSelectedCell(null);
  };

  // Week View Component
  const WeekView = () => (
    <div className="grid grid-cols-8 min-h-[600px] bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Time Column */}
      <div className="bg-slate-800/50 border-r border-slate-700/50">
        <div className="h-12 border-b border-slate-700/50 flex items-center justify-center text-xs font-medium text-slate-400">
          Time
        </div>
        {TIME_SLOTS.map((time) => (
          <motion.div
            key={time}
            className={`h-16 border-b border-slate-700/30 flex items-center justify-center text-xs font-medium ${
              isCurrentTimeSlot(time) ? 'bg-blue-500/20 text-blue-400 font-semibold' : 'text-slate-400'
            }`}
            animate={isCurrentTimeSlot(time) ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {time}
          </motion.div>
        ))}
      </div>

      {/* Days Columns */}
      {DAYS.map((day) => (
        <div key={day} className="border-r border-slate-700/50 last:border-r-0">
          {/* Day Header */}
          <div className="h-12 border-b border-slate-700/50 flex items-center justify-center bg-slate-800/30 text-sm font-semibold text-slate-200">
            <div className="text-center">
              <div>{day.slice(0, 3)}</div>
              <div className="text-xs text-slate-400 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'short' }) === day.slice(0, 3) ? 'Today' : ''}
              </div>
            </div>
          </div>

          {/* Time Slots */}
          {TIME_SLOTS.map((time, timeIndex) => {
            const event = filteredSchedule[day][time];
            const isCurrentTime = isCurrentTimeSlot(time);

            return (
              <motion.div
                key={`${day}-${time}`}
                className={`h-16 border-b border-slate-700/30 relative cursor-pointer group transition-all hover:bg-slate-700/20 ${
                  isCurrentTime ? 'bg-blue-500/10 ring-1 ring-blue-500/20' : ''
                } ${isHologramMode ? 'animate-pulse' : ''}`}
                onClick={() => !event && handleAddEvent(day, time)}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(day, time);
                }}
                onDragOver={(e) => e.preventDefault()}
                whileHover={{ scale: 1.01 }}
              >
                {event && (
                  <motion.div
                    className={`absolute inset-1 rounded-lg p-2 border shadow-lg ${
                      getActivityTypeConfig(event.type).bgColor
                    } ${
                      getActivityTypeConfig(event.type).borderColor
                    }`}
                    style={{
                      height: event.duration > 1 ? `${event.duration * 64 - 4}px` : 'calc(100% - 8px)',
                      zIndex: 10
                    }}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.2 }}
                    draggable
                    onDragStart={() => handleDragStart(event, day, time)}
                  >
                    <div className="flex items-start justify-between h-full">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          {React.createElement(
                            getActivityTypeConfig(event.type).icon, 
                            {
                              className: "w-3 h-3 flex-shrink-0",
                              style: { color: getActivityTypeConfig(event.type).color }
                            }
                          )}
                          <span className={`text-xs font-medium truncate ${
                            getActivityTypeConfig(event.type).textColor
                          }`}>
                            {event.title}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-2 h-2 text-slate-400" />
                            <span className="text-xs text-slate-400 truncate">{event.location}</span>
                          </div>
                        )}
                        {event.instructor && (
                          <div className="text-xs text-slate-400 truncate">{event.instructor}</div>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCell({ event, day, time });
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded ml-1"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Current time indicator */}
                {isCurrentTime && (
                  <motion.div
                    className="absolute left-0 top-1/2 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 z-20 shadow-lg"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                )}

                {/* Add button on hover */}
                {!event && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                  >
                    <div className="p-2 bg-slate-600/20 rounded-lg border border-slate-600/30 shadow-lg">
                      <Plus className="w-4 h-4 text-slate-400" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );

  // Day View Component
  const DayView = () => (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const currentIndex = DAYS.indexOf(selectedDay);
                const prevDay = DAYS[currentIndex - 1] || DAYS[DAYS.length - 1];
                setSelectedDay(prevDay);
              }}
              className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">{selectedDay}</h2>
              <p className="text-sm text-slate-400">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            
            <button
              onClick={() => {
                const currentIndex = DAYS.indexOf(selectedDay);
                const nextDay = DAYS[currentIndex + 1] || DAYS[0];
                setSelectedDay(nextDay);
              }}
              className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="text-sm text-slate-400">
            Current time: <span className="text-blue-400 font-medium">{getCurrentTime()}</span>
          </div>
        </div>

        {/* Day Schedule */}
        <div className="space-y-2">
          {TIME_SLOTS.map((time) => {
            const event = filteredSchedule[selectedDay][time];
            const isCurrentTime = isCurrentTimeSlot(time);

            return (
              <motion.div
                key={time}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all group ${
                  isCurrentTime 
                    ? 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20' 
                    : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50'
                }`}
                whileHover={{ scale: 1.01, y: -1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-20 text-sm font-medium text-slate-400">
                  {time}
                </div>
                
                <div className="flex-1">
                  {event ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          getActivityTypeConfig(event.type).bgColor
                        }`}>
                          {React.createElement(
                            getActivityTypeConfig(event.type).icon, 
                            {
                              className: "w-5 h-5",
                              style: { color: getActivityTypeConfig(event.type).color }
                            }
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">{event.title}</div>
                          {event.location && (
                            <div className="text-sm text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                          {event.instructor && (
                            <div className="text-xs text-slate-400">{event.instructor}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          getActivityTypeConfig(event.type).bgColor
                        } ${
                          getActivityTypeConfig(event.type).textColor
                        }`}>
                          {event.duration}h
                        </span>
                        <button
                          onClick={() => setEditingCell({ event, day: selectedDay, time })}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-400 hover:text-white"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddEvent(selectedDay, time)}
                      className="w-full text-left text-slate-400 hover:text-white transition-colors flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/30"
                    >
                      <Plus className="w-4 h-4" />
                      Add event
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Schedule Matrix</h1>
              <p className="text-slate-400">Manage your time efficiently</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
            <button
              onClick={() => setCurrentView('week')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                currentView === 'week'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setCurrentView('day')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                currentView === 'day'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Day
            </button>
          </div>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-sm focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 text-white"
          >
            <option value="all">All Events</option>
            <option value="class">Classes</option>
            <option value="study">Study</option>
            <option value="assignment">Assignments</option>
            <option value="break">Breaks</option>
            <option value="exercise">Exercise</option>
          </select>

          {/* Hologram Mode */}
          <button
            onClick={() => setIsHologramMode(!isHologramMode)}
            className={`p-2 rounded-lg border transition-all ${
              isHologramMode
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white'
            }`}
            title="Toggle hologram mode"
          >
            {isHologramMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          {/* Add Event */}
          <button
            onClick={() => handleAddEvent()}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg text-white"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Event
          </button>
        </div>
      </motion.div>

      {/* Conflicts Alert */}
      <AnimatePresence>
        {conflicts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="text-amber-300 font-medium">
                  {conflicts.length} schedule conflict{conflicts.length > 1 ? 's' : ''} detected
                </span>
              </div>
              <button className="text-amber-400 hover:text-amber-300 transition-colors">
                View Details
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {currentView === 'week' ? <WeekView /> : <DayView />}
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {[
          {
            icon: BookOpen,
            label: 'Classes This Week',
            value: Object.values(localSchedule).reduce((total: number, day: any) => 
              total + Object.values(day).filter((event: any) => event?.type === 'class').length, 0
            ),
            color: 'blue'
          },
          {
            icon: Brain,
            label: 'Study Sessions',
            value: Object.values(localSchedule).reduce((total: number, day: any) => 
              total + Object.values(day).filter((event: any) => event?.type === 'study').length, 0
            ),
            color: 'purple'
          },
          {
            icon: Target,
            label: 'Assignments Due',
            value: 3, // This would come from your assignment context
            color: 'amber'
          },
          {
            icon: AlertTriangle,
            label: 'Schedule Conflicts',
            value: conflicts.length,
            color: 'red'
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4 hover:bg-slate-900/80 transition-all"
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                stat.color === 'blue' ? 'bg-blue-500/20' :
                stat.color === 'purple' ? 'bg-purple-500/20' :
                stat.color === 'amber' ? 'bg-amber-500/20' :
                'bg-red-500/20'
              }`}>
                <stat.icon className={`w-5 h-5 ${
                  stat.color === 'blue' ? 'text-blue-400' :
                  stat.color === 'purple' ? 'text-purple-400' :
                  stat.color === 'amber' ? 'text-amber-400' :
                  'text-red-400'
                }`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 w-full max-w-md shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Add New Event</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const eventData = {
                  title: formData.get('title') as string,
                  type: formData.get('type') as string,
                  location: formData.get('location') as string,
                  description: formData.get('description') as string,
                  duration: formData.get('duration') as string
                };
                handleCreateEvent(eventData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Event Title
                    </label>
                    <input
                      name="title"
                      type="text"
                      placeholder="Enter event title..."
                      required
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-white placeholder-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Event Type
                      </label>
                      <select 
                        name="type"
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-white"
                      >
                        <option value="class">Class</option>
                        <option value="study">Study Session</option>
                        <option value="assignment">Assignment Work</option>
                        <option value="break">Break</option>
                        <option value="exercise">Exercise</option>
                        <option value="meeting">Meeting</option>
                        <option value="personal">Personal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Duration
                      </label>
                      <select 
                        name="duration"
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-white"
                      >
                        <option value="0.5">30 minutes</option>
                        <option value="1">1 hour</option>
                        <option value="1.5">1.5 hours</option>
                        <option value="2">2 hours</option>
                        <option value="3">3 hours</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Location (Optional)
                    </label>
                    <input
                      name="location"
                      type="text"
                      placeholder="Enter location..."
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-white placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      placeholder="Add notes or description..."
                      rows={3}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-white placeholder-slate-400 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
                    >
                      Add Event
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Event Modal */}
      <AnimatePresence>
        {editingCell && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingCell(null)}
          >
            <motion.div
              className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 w-full max-w-md shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    getActivityTypeConfig(editingCell.event.type).bgColor
                  }`}>
                    {React.createElement(
                      getActivityTypeConfig(editingCell.event.type).icon, 
                      {
                        className: "w-5 h-5",
                        style: { color: getActivityTypeConfig(editingCell.event.type).color }
                      }
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white">Edit Event</h3>
                </div>
                <button
                  onClick={() => setEditingCell(null)}
                  className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Event Title
                  </label>
                  <input
                    type="text"
                    defaultValue={editingCell.event.title}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Day
                    </label>
                    <select 
                      defaultValue={editingCell.day}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-white"
                    >
                      {DAYS.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Time
                    </label>
                    <select 
                      defaultValue={editingCell.time}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-white"
                    >
                      {TIME_SLOTS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {editingCell.event.location && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      defaultValue={editingCell.event.location}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-white"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleDeleteEvent(editingCell.day, editingCell.time)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    onClick={() => setEditingCell(null)}
                    className="flex-1 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Save changes logic - would integrate with your ScheduleContext
                      console.log('Saving event changes...');
                      setEditingCell(null);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Suggestions Panel */}
      <motion.div 
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 rounded-xl p-4 shadow-2xl max-w-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-lg">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-semibold text-white">AI Assistant</div>
              <div className="text-xs text-slate-400">Smart Suggestions</div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="font-medium text-blue-300 mb-1">Optimization Tip</div>
              <div className="text-slate-300">
                You have 2 hours of free time on Tuesday. Consider scheduling your CS assignment work then.
              </div>
            </div>
            
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="font-medium text-amber-300 mb-1">Conflict Alert</div>
              <div className="text-slate-300">
                Math study session overlaps with gym time on Thursday.
              </div>
            </div>
          </div>

          <button className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all text-sm shadow-lg">
            View All Suggestions
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedScheduleGrid;