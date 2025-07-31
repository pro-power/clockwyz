import React, { useState, useEffect, useRef } from 'react';
import { useScheduleContext } from '../context/ScheduleContext';
import '../styles/ScheduleGrid.css';
import DraggableActivity from './DraggableActivity';
import BulkEventAdder from './BulkEventAdder';
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
  // ✅ ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL LOGIC
  
  // Context hooks first
  const { schedule, userPreferences, updateScheduleSlot } = useScheduleContext();
  
  // All state hooks
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
  const [showTaskDetails, setShowTaskDetails] = useState<boolean>(false);
  const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null);
  const [savedTasks, setSavedTasks] = useState<SavedTasksMap>({});
  const [showSaveStatus, setShowSaveStatus] = useState<boolean>(false);
  
  // All refs
  const scheduleContainerRef = useRef<HTMLDivElement>(null);
  const currentTimeSlotRef = useRef<HTMLTableRowElement>(null);
  const timeSlotsContainerRef = useRef<HTMLDivElement>(null);

  // ALL useEffect hooks BEFORE any conditional logic
  
  // Effect 1: Set default day and handle resize events
  useEffect(() => {
    if (!schedule || !schedule.slots || schedule.slots.length === 0) {
      return; // Guard clause inside effect is OK
    }

    const days = Object.keys(schedule.slots[0].activities || {});
    
    if (viewMode === 'day' && !selectedDay && days.length > 0) {
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
        setViewMode('day');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [viewMode, selectedDay, schedule]);

  // Effect 2: Scroll to current time in day view
  useEffect(() => {
    if (viewMode === 'day' && currentTimeSlotRef.current && timeSlotsContainerRef.current) {
      setTimeout(() => {
        currentTimeSlotRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start' 
        });
      }, 300);
    }
  }, [viewMode, selectedDay]);

  // Effect 3: Load saved tasks from localStorage
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

  // NOW conditional logic and early returns AFTER all hooks
  if (!schedule || !schedule.slots || schedule.slots.length === 0) {
    return (
      <div className="schedule-message">
        <div className="sci-fi-loader"></div>
        <p>No schedule available. Please complete the questionnaire first.</p>
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

  // Activity templates for quick assignment
  const activityTemplates: ActivityTemplate[] = [
    { name: 'Study Session', category: 'Academic' },
    { name: 'Exercise', category: 'Health' },
    { name: 'Meal Prep', category: 'Personal' },
    { name: 'Break', category: 'Personal' },
    { name: 'Meeting', category: 'Work' },
    { name: 'Reading', category: 'Academic' },
    { name: 'Project Work', category: 'Academic' },
    { name: 'Commute', category: 'Travel' }
  ];

  // Helper functions
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
        if (scheduleContainerRef.current) {
          scheduleContainerRef.current.classList.remove('schedule-lifting');
        }
        return;
      }

      // Move the activity
      updateScheduleSlot(time, day, draggedActivity.content, draggedActivity.category);
      
      // Clear the original slot
      updateScheduleSlot(draggedActivity.time, draggedActivity.day, '', 'Personal');
      
      // Add visual feedback
      setShowSaveStatus(true);
      setTimeout(() => setShowSaveStatus(false), 2000);
    }
    
    setDraggedActivity(null);
    setDropTarget(null);
    
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

  const handleCellClick = (time: string, day: string, content: string, category: string, e?: React.MouseEvent) => {
    // Don't show details if clicking edit button or if content is empty
    if (e && (e.target as HTMLElement).closest('.edit-button')) return;
    if (!content.trim()) return;
    
    // Create task key for retrieving saved details
    const taskKey = `${day}-${time}`;
    const savedTaskData = savedTasks[taskKey];
    
    setTaskDetails({
      time,
      day,
      content,
      category,
      description: savedTaskData?.description || '',
      checklist: savedTaskData?.checklist || []
    });
    setShowTaskDetails(true);
  };

  const addChecklistItem = () => {
    if (taskDetails) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: '',
        checked: false
      };
      
      setTaskDetails({
        ...taskDetails,
        checklist: [...taskDetails.checklist, newItem]
      });
    }
  };

  const updateChecklistItem = (id: string, text: string) => {
    if (taskDetails) {
      setTaskDetails({
        ...taskDetails,
        checklist: taskDetails.checklist.map(item => 
          item.id === id ? { ...item, text } : item
        )
      });
    }
  };

  const toggleChecklistItem = (id: string) => {
    if (taskDetails) {
      const updatedChecklist = taskDetails.checklist.map(item => {
        return item.id === id ? { ...item, checked: !item.checked } : item;
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
      const taskKey = `${taskDetails.day}-${taskDetails.time}`;
      
      const updatedSavedTasks = {
        ...savedTasks,
        [taskKey]: taskDetails
      };
      
      setSavedTasks(updatedSavedTasks);
      localStorage.setItem('savedTasks', JSON.stringify(updatedSavedTasks));
      
      setShowSaveStatus(true);
      setTimeout(() => setShowSaveStatus(false), 2000);
      
      setShowTaskDetails(false);
      setTaskDetails(null);
    }
  };

  const toggleHologramView = () => {
    setHologramView(!hologramView);
    if (scheduleContainerRef.current) {
      scheduleContainerRef.current.classList.toggle('hologram-mode');
    }
  };

  const isCurrentTimeSlot = (timeStr: string, day: string): boolean => {
    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
    if (day !== today) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    
    const timeMatch = timeStr.match(/(\d+):(\d+)/);
    if (!timeMatch) return false;
    
    const slotHour = parseInt(timeMatch[1]);
    return slotHour === currentHour;
  };

  const formatTime = (timeStr: string): string => {
    const timeMatch = timeStr.match(/(\d+):(\d+)/);
    if (!timeMatch) return timeStr;
    
    const hour = parseInt(timeMatch[1]);
    const minute = timeMatch[2];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    
    return `${displayHour}:${minute} ${ampm}`;
  };

  const getCategoryColor = (category: string): string => {
    if (!userPreferences?.categoryColors) {
      return '#3B82F6'; // Default blue
    }
    
    const colorConfig = userPreferences.categoryColors.find(c => c.category === category);
    return colorConfig ? colorConfig.color : '#3B82F6';
  };

  // Filter days for day view
  const displayDays = viewMode === 'day' ? [selectedDay].filter(Boolean) : days;
  
  // Filter slots for current view
  const displaySlots = schedule.slots || [];

  return (
    <div className={`schedule-container ${hologramView ? 'hologram-mode' : ''}`} ref={scheduleContainerRef}>
      {/* Save Status Indicator */}
      {showSaveStatus && (
        <div className="save-status">
          <Zap size={16} />
          Changes Saved!
        </div>
      )}

      {/* Mobile Header */}
      <div className="mobile-header">
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        <h2>My Schedule</h2>
        <div className="mobile-header-actions">
          <button onClick={toggleHologramView} className="hologram-toggle" title="Toggle hologram view">
            <Hexagon size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <div className="view-mode-selector">
              <button 
                className={viewMode === 'week' ? 'active' : ''}
                onClick={() => toggleViewMode('week')}
              >
                Week View
              </button>
              <button 
                className={viewMode === 'day' ? 'active' : ''}
                onClick={() => toggleViewMode('day')}
              >
                Day View
              </button>
            </div>
            
            {viewMode === 'day' && (
              <div className="day-selector">
                <h4>Select Day:</h4>
                {days.map(day => (
                  <button
                    key={day}
                    className={selectedDay === day ? 'active' : ''}
                    onClick={() => handleDaySelect(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}
            
            <div className="mobile-actions">
              <button onClick={exportSchedule} className="export-btn">
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <div className="schedule-header">
        <div className="header-left">
          <h2>
            <Clock size={24} />
            My Schedule
          </h2>
          
          <div className="view-mode-selector">
            <button 
              className={viewMode === 'week' ? 'active' : ''}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={viewMode === 'day' ? 'active' : ''}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
          </div>

          {viewMode === 'day' && (
            <select 
              value={selectedDay} 
              onChange={(e) => setSelectedDay(e.target.value)}
              className="day-selector"
            >
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          )}
        </div>

        <div className="header-actions">
          <button onClick={toggleHologramView} className="hologram-toggle">
            <Hexagon size={20} />
            {hologramView ? 'Normal' : 'Hologram'}
          </button>
          
          <button onClick={exportSchedule} className="export-btn">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="schedule-grid" ref={timeSlotsContainerRef}>
        <table>
          <thead>
            <tr>
              <th className="time-column">Time</th>
              {displayDays.map(day => (
                <th key={day} className="day-column">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displaySlots.map(slot => {
              const isCurrentTime = showCurrentTimeline && displayDays.some(day => 
                isCurrentTimeSlot(slot.time, day)
              );
              
              return (
                <tr 
                  key={slot.time} 
                  className={isCurrentTime ? 'current-time-slot' : ''}
                  ref={isCurrentTime ? currentTimeSlotRef : null}
                >
                  <td className="time-cell">
                    <div className="time-display">
                      {formatTime(slot.time)}
                    </div>
                  </td>
                  
                  {displayDays.map(day => {
                    const activity = slot.activities[day];
                    const content = activity?.content || '';
                    const category = activity?.category || 'Personal';
                    const isEditing = editingCell?.time === slot.time && editingCell?.day === day;
                    const isHovered = hoveredCell?.time === slot.time && hoveredCell?.day === day;
                    const isDropTarget = dropTarget?.time === slot.time && dropTarget?.day === day;
                    
                    // Check if this task has saved details
                    const taskKey = `${day}-${slot.time}`;
                    const hasSavedDetails = !!savedTasks[taskKey];
                    
                    return (
                      <td 
                        key={`${slot.time}-${day}`}
                        className={`schedule-cell ${isDropTarget ? 'drop-target' : ''} ${isHovered ? 'hovered' : ''} ${content ? 'has-content' : ''}`}
                        onMouseEnter={() => setHoveredCell({ time: slot.time, day })}
                        onMouseLeave={() => setHoveredCell(null)}
                        onDragOver={(e) => handleDragOver(slot.time, day, e)}
                        onDrop={() => handleDrop(slot.time, day)}
                        onClick={(e) => handleCellClick(slot.time, day, content, category, e)}
                      >
                        {isEditing ? (
                          <div className="edit-form">
                            <input
                              type="text"
                              value={tempActivity}
                              onChange={(e) => setTempActivity(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleActivityUpdate();
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                              placeholder="Enter activity..."
                              autoFocus
                            />
                            
                            <select 
                              value={tempCategory} 
                              onChange={(e) => setTempCategory(e.target.value)}
                            >
                              <option value="Academic">Academic</option>
                              <option value="Work">Work</option>
                              <option value="Personal">Personal</option>
                              <option value="Health">Health</option>
                              <option value="Social">Social</option>
                              <option value="Travel">Travel</option>
                            </select>
                            
                            <div className="edit-actions">
                              <button onClick={handleActivityUpdate} className="save-btn">
                                Save
                              </button>
                              <button onClick={handleCancelEdit} className="cancel-btn">
                                Cancel
                              </button>
                              <button 
                                onClick={() => setShowTemplates(!showTemplates)} 
                                className="template-btn"
                                title="Use template"
                              >
                                <Layers size={14} />
                              </button>
                            </div>
                            
                            {showTemplates && (
                              <div className="template-dropdown">
                                {activityTemplates.map((template, index) => (
                                  <button
                                    key={index}
                                    onClick={() => applyTemplate(template)}
                                    className="template-item"
                                  >
                                    <span className="template-name">{template.name}</span>
                                    <span className="template-category">{template.category}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="cell-content">
                            {content && (
                              <DraggableActivity
                                time={slot.time}
                                day={day}
                                content={content}
                                category={category}
                                color={getCategoryColor(category)}
                                isDragging={draggedActivity?.time === slot.time && draggedActivity?.day === day}
                                isDropTarget={isDropTarget}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onDragEnd={() => {
                                  setDraggedActivity(null);
                                  setDropTarget(null);
                                  if (scheduleContainerRef.current) {
                                    scheduleContainerRef.current.classList.remove('schedule-lifting');
                                  }
                                }}
                                onClick={handleCellClick}
                                onMouseEnter={() => setHoveredCell({ time: slot.time, day })}
                                onMouseLeave={() => setHoveredCell(null)}
                                isHovered={isHovered}
                                view={viewMode}
                              />
                            )}
                            
                            <button
                              className="edit-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCellEdit(slot.time, day, content, category);
                              }}
                              title="Edit activity"
                            >
                              {content ? <Edit size={14} /> : <Plus size={14} />}
                            </button>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Task Details Modal */}
      {showTaskDetails && taskDetails && (
        <div className="modal-overlay" onClick={() => setShowTaskDetails(false)}>
          <div className="task-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <MessageSquarePlus size={20} />
                Task Details
              </h3>
              <button 
                onClick={() => setShowTaskDetails(false)}
                className="close-button"
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="task-info">
                <div className="task-time-day">
                  <span className="task-time">{formatTime(taskDetails.time)}</span>
                  <span className="task-day">{taskDetails.day}</span>
                </div>
                <div className="task-title">{taskDetails.content}</div>
                <div className="task-category" style={{color: getCategoryColor(taskDetails.category)}}>
                  {taskDetails.category}
                </div>
              </div>
              
              <div className="task-description">
                <label>Description:</label>
                <textarea
                  value={taskDetails.description}
                  onChange={(e) => setTaskDetails({...taskDetails, description: e.target.value})}
                  placeholder="Add a description for this task..."
                  rows={3}
                />
              </div>
              
              <div className="task-checklist">
                <div className="checklist-header">
                  <label>Checklist:</label>
                  <button onClick={addChecklistItem} className="add-checklist-item">
                    <Plus size={16} />
                    Add Item
                  </button>
                </div>
                
                {taskDetails.checklist.map(item => (
                  <div key={item.id} className="checklist-item">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleChecklistItem(item.id)}
                    />
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateChecklistItem(item.id, e.target.value)}
                      placeholder="Checklist item..."
                    />
                    <button 
                      onClick={() => removeChecklistItem(item.id)}
                      className="remove-item"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => setShowTaskDetails(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={saveTaskDetails} className="save-btn">
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Event Adder */}
      <BulkEventAdder onClose={() => {}} />
    </div>
  );
};

export default ScheduleGrid;