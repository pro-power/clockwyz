import React, { ReactNode, useEffect, useState } from 'react';
import '../styles/AnimatedQuestion.css'; // Make sure to create this CSS file

interface AnimatedQuestionProps {
  children: ReactNode;
}

const AnimatedQuestion: React.FC<AnimatedQuestionProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={`animated-question ${isVisible ? 'visible' : 'hidden'}`}>
      {children}
    </div>
  );
};

export default AnimatedQuestion;