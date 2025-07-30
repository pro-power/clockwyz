import React, { useState } from 'react';
import { useScheduleContext } from '../context/ScheduleContext';
import '../styles/BulkEventAdder.css';
import { Zap, X, Calendar, AlertCircle } from 'lucide-react';

interface EventData {
  day: string;
  time: string;
  content: string;
  category: string;
}

const BulkEventAdder: React.FC<{onClose: () => void}> = ({ onClose }) => {
  const { updateScheduleSlot, userPreferences } = useScheduleContext();
  const [textInput, setTextInput] = useState<string>('');
  const [parsedEvents, setParsedEvents] = useState<EventData[]>([]);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Examples for different formats
  const examples = [
    "Monday 9:00 AM: Team Meeting (Work)",
    "Tuesday and Thursday at 5:30 PM: Gym workout (Exercise)",
    "Friday 12:00 PM: Lunch with Alex (Social)",
    "Everyday at 8:00 AM: Morning routine (Personal)"
  ];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
    // Clear previous results when input changes
    setParsedEvents([]);
    setParsingError(null);
    setSuccessMessage(null);
  };

  const parseEvents = () => {
    if (!textInput.trim()) {
      setParsingError("Please enter some text to parse.");
      return;
    }

    setIsProcessing(true);
    setParsingError(null);
    setParsedEvents([]);

    try {
      // Split input by new lines
      const lines = textInput.split('\n').filter(line => line.trim().length > 0);
      const events: EventData[] = [];
      const errors: string[] = [];

      lines.forEach((line, index) => {
        // Try to match common patterns
        // Format: Day(s) Time: Description (Category)
        // Or: Day(s) at Time: Description (Category)
        
        const dayTimePattern = /^(.*?)(?:\s+at)?\s+(\d{1,2}:\d{2}\s*(?:AM|PM))\s*:\s*(.+?)(?:\s+\((.+?)\))?$/i;
        const match = line.match(dayTimePattern);
        
        if (match) {
          const [, daysPart, timePart, contentPart, categoryPart] = match;
          
          // Process days (can be multiple)
          let days: string[] = [];
          
          if (daysPart.toLowerCase().includes('everyday') || daysPart.toLowerCase().includes('every day')) {
            days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          } else if (daysPart.toLowerCase().includes('weekdays')) {
            days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
          } else if (daysPart.toLowerCase().includes('weekends')) {
            days = ['Saturday', 'Sunday'];
          } else {
            // Check for comma or "and" separated days
            const daysList = daysPart.split(/(?:,|\s+and\s+)/);
            
            daysList.forEach(day => {
              const cleanDay = day.trim();
              const fullDay = getFullDayName(cleanDay);
              if (fullDay) {
                days.push(fullDay);
              }
            });
          }
          
          if (days.length === 0) {
            errors.push(`Line ${index + 1}: Could not identify days in "${daysPart}"`);
            return;
          }
          
          // Process time
          const normalizedTime = normalizeTime(timePart);
          if (!normalizedTime) {
            errors.push(`Line ${index + 1}: Invalid time format "${timePart}"`);
            return;
          }
          
          // Process content and category
          const content = contentPart.trim();
          
          // Use the category from parentheses or try to infer one
          let category = categoryPart ? categoryPart.trim() : inferCategory(content);
          
          // Validate category exists in user preferences
          if (!userPreferences?.categoryColors.some(c => c.category === category)) {
            // Default to Personal if category doesn't exist
            category = 'Personal';
          }
          
          // Create an event for each day
          days.forEach(day => {
            events.push({
              day,
              time: normalizedTime,
              content,
              category
            });
          });
        } else {
          errors.push(`Line ${index + 1}: Could not parse "${line}"`);
        }
      });

      if (errors.length > 0) {
        setParsingError(`Some lines could not be parsed:\n${errors.join('\n')}`);
      }

      setParsedEvents(events);
    } catch (error) {
      setParsingError(`Error parsing events: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyEvents = () => {
    if (parsedEvents.length === 0) {
      setParsingError("No valid events to add.");
      return;
    }

    setIsProcessing(true);

    try {
      // Apply each event to the schedule
      parsedEvents.forEach(event => {
        updateScheduleSlot(event.time, event.day, event.content, event.category);
      });

      setSuccessMessage(`Successfully added ${parsedEvents.length} events to your schedule.`);
      // Clear the input after successful application
      setTextInput('');
      setParsedEvents([]);
    } catch (error) {
      setParsingError(`Error applying events: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to get the full day name from abbreviations or partial names
  const getFullDayName = (dayInput: string): string | null => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const input = dayInput.toLowerCase();
    
    // Check for exact match (case insensitive)
    const exactMatch = days.find(day => day.toLowerCase() === input);
    if (exactMatch) return exactMatch;
    
    // Check for abbreviations (mon, tue, etc.)
    const abbrMatch = days.find(day => day.toLowerCase().substring(0, 3) === input.substring(0, 3));
    if (abbrMatch) return abbrMatch;
    
    return null;
  };

  // Helper to normalize time format
  const normalizeTime = (timeInput: string): string | null => {
    // Already in the correct format (e.g., "9:00 AM")
    if (/^\d{1,2}:\d{2}\s*(?:AM|PM)$/i.test(timeInput)) {
      return timeInput.toUpperCase().replace(/\s+/, ' ');
    }
    
    // Try to parse other formats
    const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/;
    const match = timeInput.match(timeRegex);
    
    if (match) {
      const [, hours, minutes = '00', meridiem] = match;
      
      // If meridiem is provided, use it
      if (meridiem) {
        return `${hours}:${minutes} ${meridiem.toUpperCase()}`;
      }
      
      // If no meridiem, assume based on 24-hour convention
      const hourNum = parseInt(hours);
      if (hourNum >= 0 && hourNum < 12) {
        return `${hourNum}:${minutes} AM`;
      } else if (hourNum >= 12 && hourNum <= 23) {
        return `${hourNum === 12 ? 12 : hourNum - 12}:${minutes} PM`;
      }
    }
    
    return null;
  };

  // Helper to infer category from content
  const inferCategory = (content: string): string => {
    const contentLower = content.toLowerCase();
    
    // Check for common work-related terms
    if (contentLower.includes('meeting') || 
        contentLower.includes('work') || 
        contentLower.includes('project') || 
        contentLower.includes('deadline') || 
        contentLower.includes('client')) {
      return 'Work';
    }
    
    // Check for exercise-related terms
    if (contentLower.includes('gym') || 
        contentLower.includes('workout') || 
        contentLower.includes('exercise') || 
        contentLower.includes('run') || 
        contentLower.includes('fitness')) {
      return 'Exercise';
    }
    
    // Check for meal-related terms
    if (contentLower.includes('breakfast') || 
        contentLower.includes('lunch') || 
        contentLower.includes('dinner') || 
        contentLower.includes('meal') || 
        contentLower.includes('eat')) {
      return 'Meals';
    }
    
    // Check for social-related terms
    if (contentLower.includes('friend') || 
        contentLower.includes('family') || 
        contentLower.includes('party') || 
        contentLower.includes('social') || 
        contentLower.includes('date')) {
      return 'Social';
    }
    
    // Check for study-related terms
    if (contentLower.includes('study') || 
        contentLower.includes('learn') || 
        contentLower.includes('class') || 
        contentLower.includes('course') || 
        contentLower.includes('homework')) {
      return 'Study';
    }
    
    // Default to Personal
    return 'Personal';
  };

  return (
    <div className="bulk-event-adder-overlay">
      <div className="bulk-event-adder-modal">
        <div className="bulk-event-adder-header">
          <h2><Calendar className="header-icon" size={20} /> Quantum Bulk Event Generator</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="bulk-event-adder-content">
          <div className="input-section">
            <label htmlFor="event-text">Enter events in natural language</label>
            <textarea 
              id="event-text"
              value={textInput}
              onChange={handleTextChange}
              placeholder="Enter events, one per line. Example: Monday 9:00 AM: Team Meeting (Work)"
              rows={8}
            />
            
            <div className="input-examples">
              <h4>Example formats:</h4>
              <ul>
                {examples.map((example, index) => (
                  <li key={index}>{example}</li>
                ))}
              </ul>
            </div>
            
            <div className="action-buttons">
              <button 
                className="parse-button"
                onClick={parseEvents}
                disabled={isProcessing || !textInput.trim()}
              >
                <Zap size={16} /> Parse Events
              </button>
              
              <button 
                className="apply-button"
                onClick={applyEvents}
                disabled={isProcessing || parsedEvents.length === 0}
              >
                Apply to Schedule
              </button>
            </div>
          </div>
          
          {isProcessing && (
            <div className="processing-indicator">
              <div className="quantum-loader"></div>
              <p>Processing quantum data streams...</p>
            </div>
          )}
          
          {parsingError && (
            <div className="error-message">
              <AlertCircle size={16} />
              <pre>{parsingError}</pre>
            </div>
          )}
          
          {successMessage && (
            <div className="success-message">
              <p>{successMessage}</p>
            </div>
          )}
          
          {parsedEvents.length > 0 && (
            <div className="parsed-events">
              <h3>Detected Events ({parsedEvents.length})</h3>
              <div className="events-list">
                {parsedEvents.map((event, index) => (
                  <div key={index} className="event-item">
                    <div className="event-day">{event.day}</div>
                    <div className="event-time">{event.time}</div>
                    <div className="event-content">{event.content}</div>
                    <div 
                      className="event-category"
                      style={{ 
                        backgroundColor: userPreferences?.categoryColors.find(c => c.category === event.category)?.color || '#CCCCCC' 
                      }}
                    >
                      {event.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkEventAdder;