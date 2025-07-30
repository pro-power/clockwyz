import React from 'react';

interface DraggableActivityProps {
  time: string;
  day: string;
  content: string;
  category: string;
  color: string;
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: (time: string, day: string, content: string, category: string) => void;
  onDragOver: (time: string, day: string, e: React.DragEvent) => void;
  onDrop: (time: string, day: string) => void;
  onDragEnd: () => void;
  onClick: (time: string, day: string, content: string, category: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isHovered: boolean;
  view: 'week' | 'day';
}

const DraggableActivity: React.FC<DraggableActivityProps> = ({
  time,
  day,
  content,
  category,
  color,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isHovered,
  view
}) => {
  // Common class names and styles for both week and day views
  const classes = [
    view === 'week' ? 'activity-cell' : 'time-slot-card', 
    isDragging ? 'dragging' : '', 
    isDropTarget ? 'drop-target' : ''
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    onClick(time, day, content, category);
  };

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(time, day, content, category);
    // Add pulse effect on drag start
    const element = e.currentTarget as HTMLElement;
    element.classList.add('pulse-effect');
    setTimeout(() => element.classList.remove('pulse-effect'), 300);
  };

  if (view === 'week') {
    return (
      <td 
        className={classes}
        style={{ 
          backgroundColor: color,
          position: 'relative',
          opacity: category === 'Sleep' ? 0.8 : (isDragging ? 0.5 : 1)
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={handleClick}
        draggable={true}
        onDragStart={handleDragStart}
        onDragOver={(e) => onDragOver(time, day, e)}
        onDrop={() => onDrop(time, day)}
        onDragEnd={onDragEnd}
      >
        <div className="activity-glow"></div>
        <div className="cell-content">
          {content}
          
          {isHovered && !isDragging && (
            <div className="edit-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
          )}
        </div>
      </td>
    );
  } else {
    // Day view
    return (
      <div 
        className={classes}
        style={{ 
          borderLeft: `4px solid ${color}`,
          opacity: category === 'Sleep' ? 0.8 : (isDragging ? 0.5 : 1)
        }}
        onClick={handleClick}
        draggable={true}
        onDragStart={handleDragStart}
        onDragOver={(e) => onDragOver(time, day, e)}
        onDrop={() => onDrop(time, day)}
        onDragEnd={onDragEnd}
      >
        <div className="time-slot-glow"></div>
        <div className="time-slot-time">
          <div className="time-indicator"></div>
          {time}
        </div>
        <div className="time-slot-content">
          <div className="time-slot-activity">{content}</div>
          <div className="category-label" style={{ backgroundColor: color }}>
            <span>{category}</span>
          </div>
        </div>
      </div>
    );
  }
};

export default DraggableActivity;