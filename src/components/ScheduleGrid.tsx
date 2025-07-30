import React, { useState, useEffect, useRef } from 'react';
import { useScheduleContext } from '../context/ScheduleContext';
import '../styles/ScheduleGrid.css';
import DraggableActivity from './DraggableActivity';import BulkEventAdder from './BulkEventAdder';
import { Clock, Download, Hexagon, Menu, Edit, Plus, Layers, Zap, MessageSquarePlus } from 'lucide-react';
// Task details interfaces
interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface TaskDetails {
  time: string;
  day: string;
  content: string;
  category: string;
  description: string;
  checklist: ChecklistItem[];
}

// Interface for saved task details
interface SavedTasksMap {
  [key: string]: TaskDetails;
}

// Activity templates for quick assignment
interface ActivityTemplate {
  name: string;
  category: string;
}

const ScheduleGrid: React.FC = () => {
  const { schedule, userPreferences, updateScheduleSlot } = useScheduleContext();
  const [editingCell, setEditingCell] = useState<{time: string, day: string} | null>(null);
  const [tempActivity, setTempActivity] = useState<string>('');
  const [tempCategory, setTempCategory] = useState<string>('Personal');
  const [hoveredCell, setHoveredCell] = useState<{time: string, day: string} | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [showCurrentTimeline, setShowCurrentTimeline] = useState<boolean>(true);
  const [draggedActivity, setDraggedActivity] = useState<{time: string, day: string, content: string, category: string} | null>(null);
  const [dropTarget, setDropTarget] = useState<{time: string, day: string} | null>(null);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [hologramView, setHologramView] = useState<boolean>(false);
  
  // Task details states
  const [showTaskDetails, setShowTaskDetails] = useState<boolean>(false);
  const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null);
  const [savedTasks, setSavedTasks] = useState<SavedTasksMap>({});
  const [showSaveStatus, setShowSaveStatus] = useState<boolean>(false);
  
  const scheduleContainerRef = useRef<HTMLDivElement>(null);
  const currentTimeSlotRef = useRef<HTMLDivElement>(null);
  const timeSlotsContainerRef = useRef<HTMLDivElement>(null);

  const [showBulkEventAdder, setShowBulkEventAdder] = useState(false);
const { isOptimizing } = useScheduleContext(); // Get optimization status from context

  // Activity templates for quick assignment
  const activityTemplates: ActivityTemplate[] = [
    { name: 'Meeting', category: 'Work' },
    { name: 'Exercise', category: 'Exercise' },
    { name: 'Lunch Break', category: 'Meals' },
    { name: 'Study Session', category: 'Study' },
    { name: 'Family Time', category: 'Personal' },
    { name: 'Reading', category: 'Leisure' },
    { name: 'Meditation', category: 'Personal' }
  ];



  // Add more robust error handling
  if (!schedule || !userPreferences) {
    return (
      <div className="schedule-message">
        <div className="sci-fi-loader"></div>
        <p>Please complete the questionnaire to generate your schedule.</p>
      </div>
    );
  }

  // Check if schedule.slots array exists and has at least one item
  if (!schedule.slots || schedule.slots.length === 0) {
    return (
      <div className="schedule-message">
        <div className="sci-fi-loader"></div>
        <p>No schedule slots available. Please try again.</p>
      </div>
    );
  }

  // Get the list of days from the first slot with activities
  const days = Object.keys(schedule.slots[0].activities || {});
  
  // If there are no days, display a message
  if (days.length === 0) {
    return (
      <div className="schedule-message">
        <div className="sci-fi-loader"></div>
        <p>Schedule was generated but contains no days. Please try again.</p>
      </div>
    );
  }

  // Set default day and handle resize events
  useEffect(() => {
    if (viewMode === 'day' && !selectedDay) {
      setSelectedDay(days[0]);
    }

    // Check if today is in the days array
    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
    if (days.includes(today) && !selectedDay) {
      setSelectedDay(today);
    }

    // Handle resize events for responsive adjustments
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === 'week') {
        // Automatically switch to day view on mobile
        setViewMode('day');
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [viewMode, selectedDay, days]);

  // Scroll to current time in day view
  useEffect(() => {
    if (viewMode === 'day' && currentTimeSlotRef.current && timeSlotsContainerRef.current) {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        currentTimeSlotRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start' 
        });
      }, 300);
    }
  }, [viewMode, selectedDay]);

  // Try to load saved tasks from localStorage on initial load
  useEffect(() => {
    try {
      const savedTasksJson = localStorage.getItem('savedTasks');
      if (savedTasksJson) {
        setSavedTasks(JSON.parse(savedTasksJson));
      }
    } catch (error) {
      console.error('Error loading saved tasks:', error);
    }
  }, []);

  const handleCellEdit = (time: string, day: string, currentContent: string, currentCategory: string) => {
    setEditingCell({ time, day });
    setTempActivity(currentContent);
    setTempCategory(currentCategory);
    setShowTemplates(false);
  };

  const handleActivityUpdate = () => {
    if (editingCell && tempActivity.trim()) {
      updateScheduleSlot(
        editingCell.time,
        editingCell.day,
        tempActivity,
        tempCategory
      );
      
      // Add visual feedback for update
      setShowSaveStatus(true);
      setTimeout(() => setShowSaveStatus(false), 2000);
      
      setEditingCell(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setShowTemplates(false);
  };

  const toggleViewMode = (mode: 'week' | 'day') => {
    setViewMode(mode);
    setMobileMenuOpen(false);
  };

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    setViewMode('day');
    setMobileMenuOpen(false);
  };

  const handleDragStart = (time: string, day: string, content: string, category: string) => {
    setDraggedActivity({ time, day, content, category });
    // Add a "lifting" effect to the schedule container
    if (scheduleContainerRef.current) {
      scheduleContainerRef.current.classList.add('schedule-lifting');
    }
  };

  const handleDragOver = (time: string, day: string, e: React.DragEvent) => {
    e.preventDefault();
    setDropTarget({ time, day });
  };

  const handleDrop = (time: string, day: string) => {
    if (draggedActivity) {
      // Don't update if dropped at same position
      if (draggedActivity.time === time && draggedActivity.day === day) {
        setDraggedActivity(null);
        setDropTarget(null);
        // Remove lifting effect
        if (scheduleContainerRef.current) {
          scheduleContainerRef.current.classList.remove('schedule-lifting');
        }
        return;
      }

      // Check if the original activity had saved task details
      const originalTaskKey = `${draggedActivity.day}-${draggedActivity.time}`;
      const hasTaskDetails = savedTasks[originalTaskKey];
      
      // Move activity to new time slot
      updateScheduleSlot(
        time,
        day,
        draggedActivity.content,
        draggedActivity.category
      );

      // If there were saved task details, move them too
      if (hasTaskDetails) {
        const newTaskKey = `${day}-${time}`;
        const updatedSavedTasks = { ...savedTasks };
        
        // Update the key for the task details
        updatedSavedTasks[newTaskKey] = {
          ...hasTaskDetails,
          time,
          day
        };
        
        // Remove the old entry
        delete updatedSavedTasks[originalTaskKey];
        
        // Update saved tasks
        setSavedTasks(updatedSavedTasks);
        localStorage.setItem('savedTasks', JSON.stringify(updatedSavedTasks));
      }

      // Clear original slot (replace with "Free Time")
      updateScheduleSlot(
        draggedActivity.time,
        draggedActivity.day,
        'Free Time',
        'Personal'
      );

      // Visual feedback for successful drop
      setShowSaveStatus(true);
      setTimeout(() => setShowSaveStatus(false), 2000);

      setDraggedActivity(null);
      setDropTarget(null);
      
      // Remove lifting effect
      if (scheduleContainerRef.current) {
        scheduleContainerRef.current.classList.remove('schedule-lifting');
      }
    }
  };

  const handleDragEnd = () => {
    setDraggedActivity(null);
    setDropTarget(null);
    
    // Remove lifting effect
    if (scheduleContainerRef.current) {
      scheduleContainerRef.current.classList.remove('schedule-lifting');
    }
  };

  const applyTemplate = (template: ActivityTemplate) => {
    if (editingCell) {
      setTempActivity(template.name);
      setTempCategory(template.category);
      setShowTemplates(false);
    }
  };

  const exportSchedule = () => {
    if (!schedule) return;

    // Add export animation
    if (scheduleContainerRef.current) {
      scheduleContainerRef.current.classList.add('exporting');
      setTimeout(() => {
        scheduleContainerRef.current?.classList.remove('exporting');
      }, 1000);
    }

    // Convert schedule to CSV format
    const headers = ['Time', ...days];
    const rows = schedule.slots.map(slot => {
      const rowData = [slot.time];
      for (const day of days) {
        rowData.push(slot.activities[day]?.content || '');
      }
      return rowData;
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create file and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'my_schedule.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show task details when cell is clicked (not on edit icon)
  const handleCellClick = (time: string, day: string, content: string, category: string, e?: React.MouseEvent) => {
    // Skip if the click was on the edit button
    if (e) {
      const target = e.target as HTMLElement;
      if (target.closest('.edit-button')) {
        return;
      }
    }
    
    // Create a key for this task
    const taskKey = `${day}-${time}`;
    
    // Check if we have saved details for this task
    let details: TaskDetails;
    if (savedTasks[taskKey]) {
      // Use saved details
      details = savedTasks[taskKey];
    } else {
      // Create new task details
      details = {
        time,
        day,
        content,
        category,
        description: '',
        checklist: [
          { id: crypto.randomUUID(), text: 'Task item', checked: false }
        ]
      };
    }
    
    setTaskDetails(details);
    setShowTaskDetails(true);
  };

  const handleTaskDetailClose = () => {
    setShowTaskDetails(false);
    setTaskDetails(null);
  };

  const updateTaskDescription = (description: string) => {
    if (taskDetails) {
      setTaskDetails({
        ...taskDetails,
        description
      });
    }
  };

  const addChecklistItem = () => {
    if (taskDetails) {
      const newItem = {
        id: crypto.randomUUID(),
        text: '',
        checked: false
      };
      
      setTaskDetails({
        ...taskDetails,
        checklist: [...taskDetails.checklist, newItem]
      });
    }
  };

  const updateChecklistItem = (id: string, field: 'text' | 'checked', value: string | boolean) => {
    if (taskDetails) {
      const updatedChecklist = taskDetails.checklist.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      });
      
      setTaskDetails({
        ...taskDetails,
        checklist: updatedChecklist
      });
    }
  };

  const removeChecklistItem = (id: string) => {
    if (taskDetails) {
      setTaskDetails({
        ...taskDetails,
        checklist: taskDetails.checklist.filter(item => item.id !== id)
      });
    }
  };

  const saveTaskDetails = () => {
    if (taskDetails) {
      // Create a key for this task
      const taskKey = `${taskDetails.day}-${taskDetails.time}`;
      
      // Update the saved tasks
      const updatedSavedTasks = {
        ...savedTasks,
        [taskKey]: taskDetails
      };
      
      // Save to state and localStorage
      setSavedTasks(updatedSavedTasks);
      localStorage.setItem('savedTasks', JSON.stringify(updatedSavedTasks));
      
      // Visual feedback for save
      setShowSaveStatus(true);
      setTimeout(() => setShowSaveStatus(false), 2000);
      
      // Close the modal
      setShowTaskDetails(false);
      setTaskDetails(null);
    }
  };

  // Toggle hologram view effect
  const toggleHologramView = () => {
    setHologramView(!hologramView);
    if (scheduleContainerRef.current) {
      scheduleContainerRef.current.classList.toggle('hologram-mode');
    }
  };

  // Check if a time slot is the current time
  const isCurrentTimeSlot = (timeStr: string, day: string): boolean => {
    // Only highlight current time on current day
    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
    if (day !== today) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    
    // Extract hour from the time string (e.g., "8:00 AM" -> 8)
    const hourMatch = timeStr.match(/(\d+):/);
    if (!hourMatch) return false;
    
    let hour = parseInt(hourMatch[1]);
    const isPM = timeStr.includes('PM');
    
    // Convert to 24-hour format
    if (isPM && hour !== 12) {
      hour += 12;
    } else if (!isPM && hour === 12) {
      hour = 0;
    }
    
    return hour === currentHour;
  };

const { optimizeCurrentSchedule, suggestActivitiesForFreeTime } = useScheduleContext();

const handleOptimizeSchedule = () => {
  optimizeCurrentSchedule();
  // Show feedback toast
  setShowSaveStatus(true);
  setTimeout(() => setShowSaveStatus(false), 2000);
};

const handleSuggestActivities = () => {
  suggestActivitiesForFreeTime();
  // Show feedback toast
  setShowSaveStatus(true);
  setTimeout(() => setShowSaveStatus(false), 2000);
};

const toggleBulkEventAdder = () => {
  setShowBulkEventAdder(!showBulkEventAdder);
};


  // Timeline indicator for day view
  const TimelineIndicator = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timePercentage = ((hours * 60 + minutes) / (24 * 60)) * 100;

    return (
      <div 
        className="timeline-indicator" 
        style={{ top: `${timePercentage}%` }}
      >
        <div className="timeline-dot"></div>
        <div className="timeline-line"></div>
        <div className="timeline-time">{`${hours}:${minutes.toString().padStart(2, '0')}`}</div>
      </div>
    );
  };

  // New redesigned week view
  const renderWeekView = () => (
    <div className="modern-schedule-grid">
      <div className="time-axis">
        <div className="time-axis-header">Time</div>
        {schedule.slots.map(slot => (
          <div key={slot.time} className="time-axis-cell">
            {slot.time}
          </div>
        ))}
      </div>
      
      <div className="days-grid">
        <div className="days-header">
          {days.map(day => (
            <div key={day} className="day-header-cell" onClick={() => handleDaySelect(day)}>
              {day}
            </div>
          ))}
        </div>
        
        <div className="activities-grid">
          {days.map(day => (
            <div key={day} className="day-column">
              {schedule.slots.map(slot => {
                const activity = slot.activities[day];
                if (!activity) return null;
                
                const categoryColor = userPreferences.categoryColors.find(
                  c => c.category === activity.category
                )?.color || '#CCCCCC';
                
                const isHovered = hoveredCell?.time === slot.time && hoveredCell?.day === day;
                const isDragging = draggedActivity?.time === slot.time && draggedActivity?.day === day;
                const isDropTarget = dropTarget?.time === slot.time && dropTarget?.day === day;
                const isCurrent = isCurrentTimeSlot(slot.time, day);
                
                // Check if this task has saved details
                const taskKey = `${day}-${slot.time}`;
                const hasSavedDetails = savedTasks[taskKey] !== undefined;
                
                return (
                  <div
                    key={`${day}-${slot.time}`}
                    className={`activity-block ${isDragging ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''} ${isCurrent ? 'current-time' : ''}`}
                    style={{
                      backgroundColor: activity.category === 'Sleep' ? `${categoryColor}90` : categoryColor,
                      opacity: isDragging ? 0.5 : 1
                    }}
                    onClick={(e) => handleCellClick(slot.time, day, activity.content, activity.category, e)}
                    onMouseEnter={() => setHoveredCell({ time: slot.time, day })}
                    onMouseLeave={() => setHoveredCell(null)}
                    draggable={true}
                    onDragStart={() => handleDragStart(slot.time, day, activity.content, activity.category)}
                    onDragOver={(e) => handleDragOver(slot.time, day, e)}
                    onDrop={() => handleDrop(slot.time, day)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="activity-content">
                      {activity.content}
                      {hasSavedDetails && <span className="details-indicator">•</span>}
                    </div>
                    
                    {isHovered && (
                      <button 
                        className="edit-button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCellEdit(slot.time, day, activity.content, activity.category);
                        }}
                      >
                        <Edit size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Modernized day view
  const renderDayView = () => (
    <div className="day-view-container">
      <div className="day-selector">
        {days.map(day => (
          <button 
            key={day} 
            className={`day-button ${day === selectedDay ? 'selected' : ''}`}
            onClick={() => setSelectedDay(day)}
          >
            {day.substring(0, 3)}
          </button>
        ))}
      </div>
      
      <div className="day-schedule">
        <h2>
          <div className="day-title-icon"></div>
          {selectedDay}'s Timeline
        </h2>
        
        <div className="time-slots-container" ref={timeSlotsContainerRef}>
          <div className="time-slots-timeline">
            {showCurrentTimeline && <TimelineIndicator />}
            
            <div className="time-slots">
              {schedule.slots.map(slot => {
                const activity = slot.activities[selectedDay];
                if (!activity) return null;
                
                const categoryColor = userPreferences.categoryColors.find(
                  c => c.category === activity.category
                )?.color || '#CCCCCC';
                
                const isDragging = draggedActivity?.time === slot.time && draggedActivity?.day === selectedDay;
                const isDropTarget = dropTarget?.time === slot.time && dropTarget?.day === selectedDay;
                const isCurrent = isCurrentTimeSlot(slot.time, selectedDay);
                
                // Check if this task has saved details
                const taskKey = `${selectedDay}-${slot.time}`;
                const hasSavedDetails = savedTasks[taskKey] !== undefined;
                
                return (
                  <div 
                    key={slot.time}
                    className={`modern-time-slot ${isDragging ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''} ${isCurrent ? 'current-time-slot' : ''}`}
                    draggable={true}
                    onDragStart={() => handleDragStart(slot.time, selectedDay, activity.content, activity.category)}
                    onDragOver={(e) => handleDragOver(slot.time, selectedDay, e)}
                    onDrop={() => handleDrop(slot.time, selectedDay)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleCellClick(slot.time, selectedDay, activity.content, activity.category)}
                    ref={isCurrent ? currentTimeSlotRef : null}
                  >
                    <div className="time-slot-glow"></div>
                    
                    <div className="time-slot-time">
                      <div className="time-indicator"></div>
                      {slot.time}
                    </div>
                    
                    <div 
                      className="time-slot-content"
                      style={{ borderLeft: `4px solid ${categoryColor}` }}
                    >
                      <div className="time-slot-activity">
                        {activity.content}
                        {hasSavedDetails && <span className="details-indicator">•</span>}
                      </div>
                      
                      <div className="category-badge" style={{ backgroundColor: categoryColor }}>
                        {activity.category}
                      </div>
                      
                      <button 
                        className="edit-button time-slot-edit" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCellEdit(slot.time, selectedDay, activity.content, activity.category);
                        }}
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      <div className="day-schedule-summary">
        <h3>
          <div className="summary-icon"></div>
          Analytics
        </h3>
        <div className="category-summary">
          {userPreferences.categoryColors.map(cat => {
            // Count activities in this category for the selected day
            const activitiesInCategory = schedule.slots.filter(
              slot => slot.activities[selectedDay]?.category === cat.category
            ).length;
            
            if (activitiesInCategory === 0) return null;
            
            // Calculate percentage for the progress bar
            const percentage = (activitiesInCategory / schedule.slots.length) * 100;
            
            return (
              <div key={cat.category} className="category-summary-item">
                <div className="category-summary-header">
                  <div className="category-color" style={{ backgroundColor: cat.color }}></div>
                  <div className="category-name">{cat.category}</div>
                  <div className="category-count">{activitiesInCategory} slots</div>
                </div>
                <div className="category-progress-container">
                  <div 
                    className="category-progress-bar" 
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: cat.color
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Task details card
  const renderTaskDetailsCard = () => {
    if (!taskDetails) return null;
    
    return (
      <>
        <div className="task-detail-overlay" onClick={handleTaskDetailClose}></div>
        <div className="task-detail-card">
          <div className="scan-line"></div>
          <div className="task-detail-header">
            <h3 className="task-detail-title">{taskDetails.content}</h3>
            <span className="task-time-badge">{taskDetails.time}</span>
            <button className="task-detail-close" onClick={handleTaskDetailClose}>&times;</button>
          </div>
          
          <div className="task-detail-content">
            <div className="task-description">
              <textarea 
                placeholder="Add a description..."
                value={taskDetails.description}
                onChange={(e) => updateTaskDescription(e.target.value)}
              ></textarea>
            </div>
            
            <div className="task-checklist">
              <div className="task-checklist-header">
                <h4 className="task-checklist-title">Checklist</h4>
                <button className="add-item-button" onClick={addChecklistItem}>
                  <Plus size={14} /> Add Item
                </button>
              </div>
              
              {taskDetails.checklist.map(item => (
                <div key={item.id} className="task-checklist-item">
                  <input 
                    type="checkbox" 
                    checked={item.checked} 
                    onChange={(e) => updateChecklistItem(item.id, 'checked', e.target.checked)}
                  />
                  <input 
                    type="text"
                    value={item.text}
                    placeholder="Enter task..."
                    onChange={(e) => updateChecklistItem(item.id, 'text', e.target.value)}
                  />
                  <button 
                    className="remove-item-button" 
                    onClick={() => removeChecklistItem(item.id)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="task-detail-actions">
            <button 
              className="cancel-button" 
              onClick={handleTaskDetailClose}
            >
              Cancel
            </button>
            <button 
              className="update-button" 
              onClick={saveTaskDetails}
            >
              Save
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className={`schedule-container ${hologramView ? 'hologram-mode' : ''}`} ref={scheduleContainerRef}>
      <div className="schedule-header">
        <div className="schedule-title-row">
          <div className="schedule-title">
            <Hexagon className="schedule-title-icon" size={24} />
            <h2>Quantum Timeline Manager</h2>
          </div>
          <div className="schedule-actions">
            <button className="action-button hologram-button" onClick={toggleHologramView}>
              <Layers size={20} /> {hologramView ? 'Normal View' : 'Hologram View'}
            </button>
            <button className="action-button export-button" onClick={exportSchedule}>
              <Download size={20} /> Export
            </button>
            <button 
              className="mobile-menu-button" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
        
        <div className={`view-controls ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="view-toggle">
            <button 
              className={`toggle-button ${viewMode === 'week' ? 'active' : ''}`} 
              onClick={() => toggleViewMode('week')}
            >
              Week Matrix
            </button>
            <button 
              className={`toggle-button ${viewMode === 'day' ? 'active' : ''}`} 
              onClick={() => toggleViewMode('day')}
            >
              Day Focus
            </button>
          </div>
          
          <div className="view-instructions">
            <div className="instruction-item">
              <Edit size={14} className="instruction-icon" /> Click to edit
            </div>
            <div className="instruction-item">
              <Clock size={14} className="instruction-icon" /> Drag to move
            </div>
          </div>
        </div>
      </div>
      
      <div className="schedule-content">
        {viewMode === 'week' ? renderWeekView() : renderDayView()}
      </div>

      {editingCell && (
        <div className="activity-edit-modal">
          <div className="modal-content">
            <div className="modal-scan-line"></div>
            <div className="modal-glow"></div>
            <h3>Modify Temporal Event</h3>
            <div className="form-group">
              <label>Activity</label>
              <input 
                type="text" 
                value={tempActivity}
                placeholder="Activity Designation"
                onChange={(e) => setTempActivity(e.target.value)}
              />
              <button 
                className="templates-button" 
                onClick={() => setShowTemplates(!showTemplates)}
              >
                Presets
              </button>
              
              {showTemplates && (
                <div className="templates-dropdown">
                  {activityTemplates.map((template, index) => (
                    <div 
                      key={index} 
                      className="template-item"
                      onClick={() => applyTemplate(template)}
                    >
                      <span>{template.name}</span>
                      <span className="template-category">{template.category}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={tempCategory}
                onChange={(e) => setTempCategory(e.target.value)}
              >
                {userPreferences.categoryColors.map(cat => (
                  <option key={cat.category} value={cat.category}>
                    {cat.category}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-buttons">
              <button className="update-button" onClick={handleActivityUpdate}>
                <span className="button-glow"></span>
                <span className="button-text">Confirm</span>
              </button>
              <button className="cancel-button" onClick={handleCancelEdit}>Abort</button>
            </div>
          </div>
        </div>
      )}
      
      {showSaveStatus && (
        <div className="save-status visible">
          <div className="status-icon"></div>
          <span>Quantum state saved</span>
        </div>
      )}

      {showTaskDetails && renderTaskDetailsCard()}
    </div>

    
  );
};

export default ScheduleGrid;